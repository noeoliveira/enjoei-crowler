// Import the functions you need from the SDKs you need
import { initializeApp, cert } from "firebase-admin/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const serviceAccount = require("./credentials.json");

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});
