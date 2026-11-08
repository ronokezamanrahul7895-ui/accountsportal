import { auth, db, onAuthStateChanged, doc, getDoc, signOut } from "./firebase-config.js";

/* Resolves to accounts/{uid} data; bounces to login.html otherwise. */
export function requireAccounts() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) { location.href = "login.html"; return; }
      const snap = await getDoc(doc(db, "accounts", user.uid));
      if (!snap.exists()) {
        alert("এই ইউজারের accounts/{uid} প্রোফাইল নেই। অ্যাডমিনের সাথে যোগাযোগ করুন।");
        await signOut(auth); location.href = "login.html"; return;
      }
      resolve({ id: user.uid, ...snap.data() });
    });
  });
}
