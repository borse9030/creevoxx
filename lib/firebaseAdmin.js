import admin from "firebase-admin";

// Singleton Firebase Admin instance — safe to call multiple times.
let initialized = false;

function getFirebaseAdmin() {
  if (initialized) return admin;

  // FIREBASE_SERVICE_ACCOUNT_JSON must be set in Vercel environment variables.
  // Go to: Firebase Console → Project Settings → Service Accounts → Generate new private key
  // Then paste the entire JSON string as the value of FIREBASE_SERVICE_ACCOUNT_JSON in Vercel.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.warn(
      "[FirebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON not set. " +
      "Token verification will fail. See setup instructions."
    );
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    initialized = true;
    return admin;
  } catch (err) {
    console.error("[FirebaseAdmin] Failed to initialize:", err.message);
    return null;
  }
}

/**
 * Verifies a Firebase ID token from the Authorization header.
 *
 * @param {Request} request - The Next.js request object
 * @returns {Promise<{valid: boolean, uid?: string, reason?: string}>}
 */
export async function verifyFirebaseToken(request) {
  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return { valid: false, reason: "Missing Bearer token" };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return { valid: false, reason: "Empty token" };
  }

  const firebaseAdmin = getFirebaseAdmin();
  if (!firebaseAdmin) {
    // Firebase Admin not configured — fall back to shared secret check
    return { valid: false, reason: "Firebase Admin not configured" };
  }

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    return { valid: true, uid: decoded.uid };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}
