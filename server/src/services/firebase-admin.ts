import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK using a Base64-encoded service account.
 * This avoids multiline JSON in environment variables (which breaks in
 * many CI/CD and container environments).
 */
function initializeFirebase(): admin.app.App {
  const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!base64ServiceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is required');
  }
  if (!databaseURL) {
    throw new Error('FIREBASE_DATABASE_URL environment variable is required');
  }

  const serviceAccount = JSON.parse(
    Buffer.from(base64ServiceAccount, 'base64').toString('utf-8')
  );

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });
}

let app: admin.app.App;

try {
  app = initializeFirebase();
} catch (error) {
  // In test environments, Firebase may already be initialized
  app = admin.app();
}

/** Firebase Realtime Database instance */
export const db = admin.database();

/** Firebase Auth instance for verifying tokens */
export const auth = admin.auth();

export default app;
