// back/firebase.js
// const admin = require("firebase-admin");
// const serviceAccount = require("./permissions");

import admin from "firebase-admin";
// import serviceAccount from "./permissions.json";
import serviceAccount from "./permissions.json" assert { type: "json" };


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
// module.exports = db;
export default db;