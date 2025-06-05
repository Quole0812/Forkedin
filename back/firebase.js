// back/firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./permissions");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();

export default {db, auth, admin};