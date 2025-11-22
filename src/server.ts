import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDocument, inputSchema as getDocSchema, outputSchema as getDocOutput } from "./tools/getDocument";
import { setDocument, inputSchema as setDocSchema, outputSchema as setDocOutput } from "./tools/setDocument";
import { deleteDocument, inputSchema as delDocSchema, outputSchema as delDocOutput } from "./tools/deleteDocument";
import { addDocument, inputSchema as addDocSchema, outputSchema as addDocOutput } from "./tools/addDocument";
import { queryCollection, inputSchema as queryColSchema, outputSchema as queryColOutput } from "./tools/queryCollection";

// Create MCP server
const server = new McpServer({
  name: "firestore-mcp",
  version: "0.1.0"
});

// Register tools
server.registerTool(
  'get_document',
  {
    title: 'Get Document',
    description: 'Retrieve a document from Firestore by its path',
    inputSchema: getDocSchema,
    outputSchema: getDocOutput
  },
  getDocument
);

server.registerTool(
  'set_document',
  {
    title: 'Set Document',
    description: 'Create or overwrite a document in Firestore',
    inputSchema: setDocSchema,
    outputSchema: setDocOutput
  },
  setDocument
);

server.registerTool(
  'delete_document',
  {
    title: 'Delete Document',
    description: 'Delete a document from Firestore',
    inputSchema: delDocSchema,
    outputSchema: delDocOutput
  },
  deleteDocument
);

server.registerTool(
  'add_document',
  {
    title: 'Add Document',
    description: 'Add a new document to a collection',
    inputSchema: addDocSchema,
    outputSchema: addDocOutput
  },
  addDocument
);

server.registerTool(
  'query_collection',
  {
    title: 'Query Collection',
    description: 'Query a Firestore collection with filters',
    inputSchema: queryColSchema,
    outputSchema: queryColOutput
  },
  queryCollection
);


export default server;