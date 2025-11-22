import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "http";
import server from "./src/server.js";

const PORT = parseInt(process.env.PORT || '3003');

async function startStdioServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function startHttpStreamableServer() {
  const httpServer = createServer(async (req, res) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);

    // Only handle /mcp endpoint
    if (url.pathname !== "/mcp") {
      res.writeHead(404);
      res.end("Not Found - Use /mcp endpoint");
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405);
      res.end("Method Not Allowed");
      return;
    }

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    res.on('close', () => {
      transport.close();
    });

    await server.connect(transport);

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    await transport.handleRequest(req, res, JSON.parse(Buffer.concat(chunks).toString()));
  });

  httpServer.listen(PORT, () => {
    console.log(`🔥 FireMCP Server (HTTP Streamable) on http://localhost:${PORT}/mcp`);
  });
}

async function startSSEServer() {
  const sseTransports: Record<string, SSEServerTransport> = {};

  const httpServer = createServer(async (req, res) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);

    // SSE connection endpoint
    if (url.pathname === "/sse" && req.method === "GET") {
      const transport = new SSEServerTransport("/messages", res);
      sseTransports[transport.sessionId] = transport;

      res.on('close', () => {
        delete sseTransports[transport.sessionId];
      });

      await server.connect(transport);
      return;
    }

    // SSE message endpoint
    if (url.pathname === "/messages" && req.method === "POST") {
      const sessionId = url.searchParams.get('sessionId');
      const transport = sseTransports[sessionId || ''];

      if (!transport) {
        res.writeHead(400);
        res.end("Invalid session");
        return;
      }

      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      await transport.handlePostMessage(req, res, JSON.parse(Buffer.concat(chunks).toString()));
      return;
    }

    res.writeHead(404);
    res.end();
  });

  httpServer.listen(PORT, () => {
    console.log(`🔥 FireMCP Server (SSE) on http://localhost:${PORT}/sse`);
  });
}

async function main() {
  const mode = process.env.MCP_TRANSPORT;

  if (mode === 'stdio' || !process.stdin.isTTY) {
    await startStdioServer();
  } else if (mode === 'sse') {
    await startSSEServer();
  } else {
    await startHttpStreamableServer();
  }
}

main().catch(error => {
  console.error("Error starting server:", error);
  process.exit(1);
});