// back/firebase.js
import admin from "firebase-admin";
import fs from 'fs';
const serviceAccount = JSON.parse(fs.readFileSync(new URL('./permissions.json', import.meta.url)));



if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const adminInstance = admin;

export default {db, auth, admin:admin};