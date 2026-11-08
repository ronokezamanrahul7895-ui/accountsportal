import { auth, db, signInWithEmailAndPassword, signOut, doc, getDoc } from "./firebase-config.js";
const err = document.getElementById("loginError");
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); err.style.display = "none";
  try {
    const c = await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
    if (!(await getDoc(doc(db, "accounts", c.user.uid))).exists()) {
      await signOut(auth); err.textContent = "এই অ্যাকাউন্টের Accounts প্রোফাইল নেই।"; err.style.display = "block"; return;
    }
    location.href = "classes.html";
  } catch { err.textContent = "ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে।"; err.style.display = "block"; }
});
