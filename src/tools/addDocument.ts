import { getFirestoreInstance } from "../firestore.js";
import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";

const inputSchemaObject = z.object({
    collection: z.string().describe("The path to the Firestore collection (e.g., 'users')"),
    data: z.record(z.any()).describe("The data to add to the new document")
});

const outputSchemaObject = z.object({
    id: z.string()
});

export const inputSchema = inputSchemaObject.shape;
export const outputSchema = outputSchemaObject.shape;

type AddDocumentInput = z.infer<typeof inputSchemaObject>;
type AddDocumentOutput = z.infer<typeof outputSchemaObject>;

export const addDocument = async ({ collection: collectionPath, data }: AddDocumentInput) => {
    const db = await getFirestoreInstance();
    const colRef = collection(db, collectionPath);
    const docRef = await addDoc(colRef, data);

    const structuredContent: AddDocumentOutput = {
        id: docRef.id
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
