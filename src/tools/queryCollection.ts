import { getFirestoreInstance } from "../firestore.js";
import { collection, query, where, limit as firestoreLimit, getDocs } from "firebase/firestore";
import { z } from "zod";

const inputSchemaObject = z.object({
    collection: z.string().describe("The Firestore collection to query"),
    filters: z.array(z.tuple([z.string(), z.string(), z.any()])).optional().describe("Array of filters: [field, operator, value]"),
    limit: z.number().optional().describe("Maximum number of documents to return")
});

const outputSchemaObject = z.object({
    documents: z.array(z.record(z.any())),
    error: z.string().optional()
});

export const inputSchema = inputSchemaObject.shape;
export const outputSchema = outputSchemaObject.shape;

type QueryCollectionInput = z.infer<typeof inputSchemaObject>;
type QueryCollectionOutput = z.infer<typeof outputSchemaObject>;

export const queryCollection = async ({ collection: collectionPath, filters = [], limit }: QueryCollectionInput) => {
    const db = await getFirestoreInstance();
    let q = collection(db, collectionPath) as any; // Type assertion to allow chaining

    // Apply filters
    // Note: In Modular SDK, we build query using query() function, not chaining off collection() directly for everything
    // Re-implementing using query() composition
    const constraints = [];

    for (const [field, op, value] of filters) {
        constraints.push(where(field, op as any, value));
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
                type: 'text' as const,
                text: JSON.stringify(result, null, 2)
            }
        ],
        structuredContent: result
    };
};
