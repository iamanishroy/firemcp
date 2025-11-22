import { getFirestoreInstance } from "../firestore.js";
import { doc, deleteDoc } from "firebase/firestore";
import { z } from "zod";

const inputSchemaObject = z.object({
    path: z.string().describe("The path to the Firestore document to delete (e.g., 'users/userId')")
});

const outputSchemaObject = z.object({
    success: z.boolean()
});

export const inputSchema = inputSchemaObject.shape;
export const outputSchema = outputSchemaObject.shape;

type DeleteDocumentInput = z.infer<typeof inputSchemaObject>;
type DeleteDocumentOutput = z.infer<typeof outputSchemaObject>;

export const deleteDocument = async ({ path }: DeleteDocumentInput) => {
    const db = await getFirestoreInstance();
    const docRef = doc(db, path);
    await deleteDoc(docRef);

    const structuredContent: DeleteDocumentOutput = {
        success: true
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
