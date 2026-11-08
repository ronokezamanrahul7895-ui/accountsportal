import { requireAccounts } from "./auth-guard.js"; import { renderLayout } from "./layout.js";
import { db, doc, writeBatch, createStudentAuthUser, serverTimestamp } from "./firebase-config.js";
import { logAudit } from "./audit.js";
import { $, msg, loadYears, loadClasses, fillSelect } from "./data.js";
const user = await requireAccounts(); renderLayout("admission.html", user);

fillSelect($("yearSel"), await loadYears(), (y) => y.year, (y) => y.year);
$("yearSel").onchange = async () => fillSelect($("classSel"), await loadClasses($("yearSel").value), (c) => c.id, (c) => c.name);

$("f").onsubmit = async (e) => {
  e.preventDefault(); $("btn").disabled = true; msg($("m"), "প্রক্রিয়া চলছে...");
  try {
    const year = $("yearSel").value, classId = $("classSel").value;
    const className = $("classSel").selectedOptions[0].textContent;
    const uid = await createStudentAuthUser($("email").value.trim(), $("pw").value);
    const b = writeBatch(db);
    b.set(doc(db, "students", uid), {
      name: $("name").value.trim(), roll: $("roll").value.trim(), phone: $("phone").value.trim(),
      guardianPhone: $("guardianPhone").value.trim(), email: $("email").value.trim(),
      className, year, admittedAt: serverTimestamp(), admittedBy: user.id
    });
    b.set(doc(db, "enrollments", `${uid}_${year}`), { studentId: uid, year, classId, className, enrolledAt: serverTimestamp(), enrolledBy: user.id });
    await b.commit();
    await logAudit(user, "admit_student", "students", uid, { year, classId, email: $("email").value.trim() });
    msg($("m"), "ভর্তি সম্পন্ন হয়েছে। স্টুডেন্টকে ইমেইল ও পাসওয়ার্ড জানিয়ে দিন।"); $("f").reset();
  } catch (err) {
    msg($("m"), "ব্যর্থ: " + (err.code === "auth/email-already-in-use" ? "এই ইমেইল আগে থেকেই আছে।" : err.message), false);
  }
  $("btn").disabled = false;
};
