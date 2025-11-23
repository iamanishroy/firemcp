import {
  collection,
  query,
  where,
  limit as firestoreLimit,
  getDocs,
  type Firestore,
} from "firebase/firestore";
import { z } from "zod";

const inputSchemaObject = z.object({
  collection: z.string().describe("The Firestore collection to query"),
  filters: z
    .array(
      z.object({
        field: z.string(),
        operator: z.string(),
        value: z.any(),
      })
    )
    .optional()
    .describe("Array of filter objects with field, operator, and value"),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of documents to return"),
});

const outputSchemaObject = z.object({
  documents: z.array(z.record(z.any())),
  error: z.string().optional(),
});

export const inputSchema = inputSchemaObject.shape;
export const outputSchema = outputSchemaObject.shape;

type QueryCollectionInput = z.infer<typeof inputSchemaObject>;
type QueryCollectionOutput = z.infer<typeof outputSchemaObject>;

export const queryCollection = async (
  db: Firestore,
  { collection: collectionPath, filters = [], limit }: QueryCollectionInput
) => {
  // Apply filters
  // Note: In Modular SDK, we build query using query() function, not chaining off collection() directly for everything
  // Re-implementing using query() composition
  const constraints = [];

  for (const { field, operator, value } of filters) {
    constraints.push(where(field, operator as any, value));
  }

  if (limit) {
    constraints.push(firestoreLimit(limit));
  }

  const finalQuery = query(collection(db, collectionPath), ...constraints);
  const snap = await getDocs(finalQuery);

  const docs: any[] = [];
  snap.forEach((doc) => {
    docs.push({ id: doc.id, ...doc.data() });
  });

  const result = { documents: docs };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
    structuredContent: result,
  };
};
