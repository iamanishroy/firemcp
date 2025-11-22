import { getFirestoreInstance } from "../firestore.js";
import { doc, setDoc } from "firebase/firestore";
import { z } from "zod";

const inputSchemaObject = z.object({
    path: z.string().describe("The path to the Firestore document (e.g., 'users/userId')"),
    data: z.record(z.any()).describe("The data to set in the document"),
    merge: z.boolean().optional().describe("Whether to merge the data with existing document data")
});

const outputSchemaObject = z.object({
    success: z.boolean()
});

export const inputSchema = inputSchemaObject.shape;
export const outputSchema = outputSchemaObject.shape;

type SetDocumentInput = z.infer<typeof inputSchemaObject>;
type SetDocumentOutput = z.infer<typeof outputSchemaObject>;

export const setDocument = async ({ path, data, merge }: SetDocumentInput) => {
    const db = await getFirestoreInstance();
    const docRef = doc(db, path);
    await setDoc(docRef, data, { merge });

    const structuredContent: SetDocumentOutput = {
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
