import { requireAccounts } from "./auth-guard.js"; import { renderLayout } from "./layout.js";
import { db, doc, writeBatch, getDocs, collection, query, where, serverTimestamp } from "./firebase-config.js";
import { logAudit } from "./audit.js";
import { $, esc, msg, loadYears, loadClasses, loadStudents, fillSelect } from "./data.js";
const user = await requireAccounts(); renderLayout("enrollment.html", user);

let pending = [];
async function loadPending() {
  const year = $("yearSel").value; if (!year) return;
  const [all, enr] = await Promise.all([loadStudents(), getDocs(query(collection(db, "enrollments"), where("year", "==", year)))]);
  const enrolled = new Set(enr.docs.map((d) => d.data().studentId));
  pending = all.filter((s) => !enrolled.has(s.id)).sort((a, b) => String(a.roll).localeCompare(String(b.roll), "bn", { numeric: true }));
  draw();
}
function draw() {
  const q = $("q").value.trim().toLowerCase();
  const list = pending.filter((s) => !q || `${s.name} ${s.roll}`.toLowerCase().includes(q));
  $("body").innerHTML = list.map((s) => `<tr><td><input type="checkbox" value="${esc(s.id)}" /></td>
    <td>${esc(s.roll)}</td><td>${esc(s.name)}</td><td>${esc(s.className || "-")}</td></tr>`).join("") ||
    `<tr><td colspan="4" class="placeholder-note">কেউ নেই।</td></tr>`;
}
fillSelect($("yearSel"), await loadYears(), (y) => y.year, (y) => y.year);
$("yearSel").onchange = async () => { fillSelect($("classSel"), await loadClasses($("yearSel").value), (c) => c.id, (c) => c.name); loadPending(); };
$("q").oninput = draw;
$("addBtn").onclick = async () => {
  const year = $("yearSel").value, classId = $("classSel").value;
  const ids = [...$("body").querySelectorAll("input:checked")].map((i) => i.value);
  if (!classId || !ids.length) return msg($("m"), "ক্লাস ও স্টুডেন্ট নির্বাচন করুন।", false);
  const className = $("classSel").selectedOptions[0].textContent;
  try {
    const b = writeBatch(db);
    ids.forEach((id) => {
      b.set(doc(db, "enrollments", `${id}_${year}`), { studentId: id, year, classId, className, enrolledAt: serverTimestamp(), enrolledBy: user.id });
      b.update(doc(db, "students", id), { className, year });
    });
    await b.commit(); await logAudit(user, "enroll_students", "classes", classId, { year, count: ids.length, ids }); msg($("m"), `${ids.length} জন স্টুডেন্ট যোগ হয়েছে।`); loadPending();
  } catch (err) { msg($("m"), "ব্যর্থ: " + err.message, false); }
};
