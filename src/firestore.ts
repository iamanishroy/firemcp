import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firestore Client SDK Initialization
 * 
 * We use the Firebase Client SDK (not Admin SDK) for security reasons:
 * The Client SDK respects Firestore Security Rules, ensuring that AI agents
 * can only access data they're explicitly permitted to. This prevents unauthorized
 * access to sensitive resources, even if the AI behaves unexpectedly.
 * 
 * With Admin SDK, the AI would have unrestricted access to all Firestore data,
 * which could be a significant security risk in production environments.
 * 
 * Required environment variables:
 * - FIREBASE_API_KEY: Your Firebase API key
 * - FIREBASE_PROJECT_ID: Your Firebase project ID
 * - FIREBASE_USER_EMAIL: User's email for authentication
 * - FIREBASE_USER_PASSWORD: User's password for authentication
 * 
 * Optional environment variables:
 * - FIREBASE_AUTH_DOMAIN: Auth domain (defaults to {projectId}.firebaseapp.com)
 * - FIREBASE_STORAGE_BUCKET: Storage bucket (defaults to {projectId}.appspot.com)
 * - FIREBASE_APP_ID: App ID
 */

async function initializeFirestore() {
  const apiKey = process.env.FIREBASE_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const userEmail = process.env.FIREBASE_USER_EMAIL;
  const userPassword = process.env.FIREBASE_USER_PASSWORD;

  if (!apiKey || !projectId) {
    throw new Error(
      "Firebase configuration missing. Required environment variables:\n" +
      "  - FIREBASE_API_KEY\n" +
      "  - FIREBASE_PROJECT_ID\n" +
      "  - FIREBASE_USER_EMAIL\n" +
      "  - FIREBASE_USER_PASSWORD"
    );
  }

  if (!userEmail || !userPassword) {
    throw new Error(
      "Firebase user credentials missing. Required environment variables:\n" +
      "  - FIREBASE_USER_EMAIL\n" +
      "  - FIREBASE_USER_PASSWORD"
    );
  }

  const firebaseConfig = {
    apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    appId: process.env.FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    await signInWithEmailAndPassword(auth, userEmail, userPassword);
  } catch (error) {
    throw new Error(
      `Firebase authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
      "Please check your FIREBASE_USER_EMAIL and FIREBASE_USER_PASSWORD"
    );
  }

  return db;
}

export const firestorePromise = initializeFirestore();

export async function getFirestoreInstance(): Promise<Firestore> {
  return await firestorePromise;
}