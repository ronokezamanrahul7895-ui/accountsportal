import { db, collection, getDocs, query, where } from "./firebase-config.js";

export const $ = (id) => document.getElementById(id);
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const msg = (el, text, ok = true) => { el.textContent = text; el.style.color = ok ? "#1b7a2b" : "#a3271f"; };

export async function loadYears() {
  const s = await getDocs(collection(db, "academicYears"));
  return s.docs.map((d) => d.data()).sort((a, b) => b.year.localeCompare(a.year));
}
export async function loadClasses(year) {
  const s = await getDocs(query(collection(db, "classes"), where("year", "==", year)));
  return s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name, "bn", { numeric: true }));
}
export const fillSelect = (sel, items, val, label, empty = "-- নির্বাচন করুন --") =>
  (sel.innerHTML = `<option value="">${empty}</option>` + items.map((i) => `<option value="${esc(val(i))}">${esc(label(i))}</option>`).join(""));
export async function loadStudents() {
  const s = await getDocs(collection(db, "students"));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
