// back/firebase.js
import admin from "firebase-admin";
import serviceAccount from "./permissions.json" with { type: "json" };


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
export const adminInstance = admin;

export default {db, auth, admin:admin};