// back/firebase.js
import admin from "firebase-admin";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('./permissions.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();

export default {db, auth, admin};