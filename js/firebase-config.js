/* Accounts Portal — same Firebase project (annsms) as the other portals. */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNFcGBqeTCgMFFwHP7Em6NHym8SAxKTjg",
  authDomain: "annsms.firebaseapp.com",
  projectId: "annsms",
  storageBucket: "annsms.firebasestorage.app",
  messagingSenderId: "536095253963",
  appId: "1:536095253963:web:4480afca40aea36935824e",
  measurementId: "G-F1MHT5GCJ6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* Second app instance: creates student Auth users WITHOUT logging the
   accounts officer out (Spark plan, no Cloud Functions needed). */
function createStudentAuthUser(email, password) {
  const sec = getApps().find((a) => a.name === "secondary") || initializeApp(firebaseConfig, "secondary");
  const secAuth = getAuth(sec);
  return createUserWithEmailAndPassword(secAuth, email, password).then(async (c) => { await signOut(secAuth); return c.user.uid; });
}

export { auth, db, onAuthStateChanged, signInWithEmailAndPassword, signOut, createStudentAuthUser,
  doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, serverTimestamp };
