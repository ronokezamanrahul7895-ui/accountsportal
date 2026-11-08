import { requireAccounts } from "./auth-guard.js"; import { renderLayout } from "./layout.js";
import { db, doc, setDoc, getDocs, collection, serverTimestamp } from "./firebase-config.js";
import { logAudit } from "./audit.js";
import { $, esc, msg, loadYears, fillSelect } from "./data.js";
const user = await requireAccounts(); renderLayout("classes.html", user);

async function refresh() {
  const years = await loadYears();
  fillSelect($("yearSel"), years, (y) => y.year, (y) => y.year);
  const cs = (await getDocs(collection(db, "classes"))).docs.map((d) => d.data())
    .sort((a, b) => b.year.localeCompare(a.year) || a.name.localeCompare(b.name, "bn", { numeric: true }));
  $("body").innerHTML = cs.map((c) => `<tr><td>${esc(c.year)}</td><td>${esc(c.name)}</td></tr>`).join("") ||
    `<tr><td colspan="2" class="placeholder-note">কোনো ক্লাস নেই।</td></tr>`;
}
$("yearForm").onsubmit = async (e) => {
  e.preventDefault(); const y = $("yearInput").value.trim();
  await setDoc(doc(db, "academicYears", y), { year: y, createdAt: serverTimestamp(), createdBy: user.id });
  await logAudit(user, "create_academic_year", "academicYears", y);
  $("yearInput").value = ""; refresh();
};
$("classForm").onsubmit = async (e) => {
  e.preventDefault(); const year = $("yearSel").value, name = $("className").value.trim();
  const id = `${year}_${name.replace(/[\/\s]+/g, "-")}`;
  await setDoc(doc(db, "classes", id), { year, name, createdAt: serverTimestamp(), createdBy: user.id });
  await logAudit(user, "create_class", "classes", id, { year, name });
  $("className").value = ""; msg($("m"), "ক্লাস তৈরি হয়েছে।"); refresh();
};
refresh();
