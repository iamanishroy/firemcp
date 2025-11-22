# FireMCP 🔥

A **Model Context Protocol (MCP)** server for **Firestore**, enabling AI agents and LLMs to interact with Firestore databases securely through multiple transport protocols.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- **Multiple Transport Protocols**: Support for stdio, HTTP Streamable, and Server-Sent Events (SSE)
- **Secure by Design**: Uses Firebase Client SDK with Firestore Security Rules instead of Admin SDK
- **Complete CRUD Operations**: Get, set, add, delete, and query Firestore documents
- **Type-Safe**: Built with TypeScript and Zod schemas
- **MCP Compatible**: Works with any MCP-compatible client (Claude Desktop, etc.)
- **Fast Runtime**: Powered by Bun for optimal performance

## 🔒 Security Philosophy

FireMCP uses the **Firebase Client SDK** instead of the Admin SDK for a critical security reason:

> **The Client SDK respects Firestore Security Rules**, ensuring that AI agents can only access data they're explicitly permitted to. This prevents unauthorized access to sensitive resources, even if the AI behaves unexpectedly.

With the Admin SDK, an AI would have unrestricted access to all Firestore data, which could be a significant security risk in production environments.

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- A Firebase project with Firestore enabled
- Firebase Authentication configured with at least one user

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/iamanishroy/firemcp.git
cd firemcp
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:

```env
# Required
FIREBASE_API_KEY=your-api-key-here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_USER_EMAIL=user@example.com
FIREBASE_USER_PASSWORD=your-password-here

# Optional
PORT=3003
```

> **Note**: You can find these values in your [Firebase Console](https://console.firebase.google.com/) under Project Settings.

### 4. Run the Server

Choose your preferred transport protocol:

```bash
# stdio (default - for MCP clients like Claude Desktop)
bun run stdio

# HTTP Streamable
bun run http

# Server-Sent Events (SSE)
bun run sse
```

## 🔧 Available Tools

FireMCP provides five Firestore operations as MCP tools:

### 1. `get_document`
Retrieve a document from Firestore by its path.

**Input:**
```json
{
  "path": "users/userId"
}
```

**Output:**
```json
{
  "exists": true,
  "data": { "name": "John Doe", "email": "john@example.com" }
}
```

### 2. `set_document`
Create or overwrite a document in Firestore.

**Input:**
```json
{
  "path": "users/userId",
  "data": { "name": "Jane Doe", "email": "jane@example.com" },
  "merge": false
}
```

**Output:**
```json
{
  "success": true
}
```

### 3. `add_document`
Add a new document to a collection with an auto-generated ID.

**Input:**
```json
{
  "collection": "users",
  "data": { "name": "Bob Smith", "email": "bob@example.com" }
}
```

**Output:**
```json
{
  "id": "auto-generated-id"
}
```

### 4. `delete_document`
Delete a document from Firestore.

**Input:**
```json
{
  "path": "users/userId"
}
```

**Output:**
```json
{
  "success": true
}
```

### 5. `query_collection`
Query a Firestore collection with filters and limits.

**Input:**
```json
{
  "collection": "users",
  "filters": [["age", ">", 18], ["active", "==", true]],
  "limit": 10
}
```

**Output:**
```json
{
  "documents": [
    { "id": "doc1", "name": "Alice", "age": 25, "active": true },
    { "id": "doc2", "name": "Bob", "age": 30, "active": true }
  ]
}
```

## 🔌 Integration with MCP Clients

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "firestore": {
      "command": "bun",
      "args": ["run", "/path/to/firemcp/index.ts"],
      "env": {
        "FIREBASE_API_KEY": "your-api-key",
        "FIREBASE_PROJECT_ID": "your-project-id",
        "FIREBASE_USER_EMAIL": "user@example.com",
        "FIREBASE_USER_PASSWORD": "your-password"
      }
    }
  }
}
```

### MCP Inspector

For debugging and testing:

```bash
bun run inspect
```

## 🏗️ Project Structure

```
firemcp/
├── src/
│   ├── firestore.ts          # Firestore initialization and authentication
│   ├── server.ts              # MCP server setup and tool registration
│   └── tools/                 # Individual tool implementations
│       ├── getDocument.ts
│       ├── setDocument.ts
│       ├── addDocument.ts
│       ├── deleteDocument.ts
│       └── queryCollection.ts
├── index.ts                   # Entry point with transport selection
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🛠️ Development

### Scripts

- `bun run start` - Start with default transport (stdio)
- `bun run dev` - Same as start
- `bun run http` - Start with HTTP Streamable transport
- `bun run sse` - Start with SSE transport
- `bun run stdio` - Start with stdio transport
- `bun run inspect` - Launch MCP Inspector for debugging
- `bun run kill` - Kill any process running on port 3003

### Adding New Tools

1. Create a new file in `src/tools/`
2. Define input/output schemas using Zod
3. Implement the tool function
4. Register the tool in `src/server.ts`

Example:

```typescript
import { z } from "zod";
import { getFirestoreInstance } from "../firestore.js";

const inputSchemaObject = z.object({
  // Define your input schema
});

const outputSchemaObject = z.object({
  // Define your output schema
});

export const inputSchema = inputSchemaObject.shape;
export const outputSchema = outputSchemaObject.shape;

export const myTool = async (input: z.infer<typeof inputSchemaObject>) => {
  const db = await getFirestoreInstance();
  // Implement your tool logic
  
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result) }],
    structuredContent: result
  };
};
```

## 🔐 Firestore Security Rules

Since FireMCP uses the Client SDK, you **must** configure Firestore Security Rules. Example rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read public collections
    match /public/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Powered by [Firebase](https://firebase.google.com/)
- Runtime by [Bun](https://bun.sh)

## 📧 Support

If you have any questions or run into issues, please [open an issue](https://github.com/iamanishroy/firemcp/issues) on GitHub.

---

**Made with ❤️ for the AI community**
