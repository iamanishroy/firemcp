import { getFirestoreInstance } from "../firestore.js";
import { doc, getDoc } from "firebase/firestore";
import { z } from "zod";

// Define schemas as z.object for type inference
const inputSchemaObject = z.object({
  path: z.string().describe("The path to the Firestore document (e.g., 'users/userId')")
});

const outputSchemaObject = z.object({
  exists: z.boolean(),
  data: z.any().optional()
});

// Export raw shapes for MCP SDK
export const inputSchema = inputSchemaObject.shape;
export const outputSchema = outputSchemaObject.shape;

// Infer types from schemas
type GetDocumentInput = z.infer<typeof inputSchemaObject>;
type GetDocumentOutput = z.infer<typeof outputSchemaObject>;

export const getDocument = async ({ path }: GetDocumentInput) => {
  const db = await getFirestoreInstance();
  const docRef = doc(db, path);
  const snapshot = await getDoc(docRef);

  const structuredContent: GetDocumentOutput = {
    exists: snapshot.exists(),
    data: snapshot.exists() ? snapshot.data() : undefined
  };

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(structuredContent, null, 2)
      }
    ],
    structuredContent
  };
};