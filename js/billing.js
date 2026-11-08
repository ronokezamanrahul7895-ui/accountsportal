/* Invoices live in billing/{studentId}_{invoiceId} (the existing billing
   rule already scopes student reads by the docId prefix). Records are never
   deleted — cancelled invoices get status "VOID" + a reason. */
import { requireAccounts } from "./auth-guard.js"; import { renderLayout } from "./layout.js";
import { db, doc, setDoc, updateDoc, getDocs, collection, query, where, serverTimestamp } from "./firebase-config.js";
import { logAudit } from "./audit.js";
import { $, esc, msg, loadStudents } from "./data.js";
const user = await requireAccounts(); renderLayout("billing.html", user);

const students = await loadStudents(); let cur = null;
function drawList() {
  const q = $("q").value.trim().toLowerCase();
  $("list").innerHTML = students.filter((s) => !q || `${s.name} ${s.roll}`.toLowerCase().includes(q)).slice(0, 50)
    .map((s) => `<tr><td>${esc(s.roll)}</td><td>${esc(s.name)}</td><td>${esc(s.className || "-")}</td>
    <td><button class="btn btn-secondary" data-id="${esc(s.id)}">বিল দেখুন</button></td></tr>`).join("");
}
$("q").oninput = drawList; drawList();
$("list").onclick = (e) => { const id = e.target.dataset.id; if (id) { cur = students.find((s) => s.id === id); $("detail").style.display = ""; $("who").textContent = `${cur.name} (রোল ${cur.roll})`; loadInv(); } };

let invs = [];
async function loadInv() {
  const s = await getDocs(query(collection(db, "billing"), where("studentId", "==", cur.id)));
  invs = s.docs.map((d) => ({ _id: d.id, ...d.data() })).filter((i) => i.kind === "INVOICE")
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  $("invBody").innerHTML = invs.map((i) => {
    const due = i.amount - (i.paid || 0);
    return `<tr><td>${esc(i.title)}</td><td>${i.amount}</td><td>${i.paid || 0}</td><td>${due}</td><td>${esc(i.status)}</td>
    <td>${i.status === "VOID" ? "" : `${due > 0 ? `<button class="btn btn-primary" data-pay="${esc(i._id)}">জমা</button> ` : ""}<button class="btn btn-secondary" data-void="${esc(i._id)}">বাতিল</button>`}</td></tr>`;
  }).join("") || `<tr><td colspan="6" class="placeholder-note">কোনো ইনভয়েস নেই।</td></tr>`;
}
$("inv").onsubmit = async (e) => {
  e.preventDefault();
  const id = `${cur.id}_${Date.now()}`;
  await setDoc(doc(db, "billing", id), { kind: "INVOICE", studentId: cur.id, title: $("title").value.trim(), amount: Number($("amount").value),
    paid: 0, payments: [], status: "UNPAID", year: cur.year || "", createdAt: serverTimestamp(), createdBy: user.id });
  await logAudit(user, "create_invoice", "billing", id, { studentId: cur.id, amount: Number($("amount").value) });
  $("inv").reset(); msg($("m"), "ইনভয়েস তৈরি হয়েছে।"); loadInv();
};
$("invBody").onclick = async (e) => {
  const i = invs.find((x) => x._id === (e.target.dataset.pay || e.target.dataset.void)); if (!i) return;
  if (e.target.dataset.pay) {
    const amt = Number(prompt(`জমার পরিমাণ (বকেয়া ${i.amount - i.paid}):`));
    if (!amt || amt <= 0 || amt > i.amount - i.paid) return msg($("m"), "অবৈধ পরিমাণ।", false);
    await logAudit(user, "record_payment", "billing", i._id, { amount: amt });
    const paid = i.paid + amt;
    await updateDoc(doc(db, "billing", i._id), { paid, status: paid >= i.amount ? "PAID" : "PARTIAL",
      payments: [...i.payments, { amount: amt, at: Date.now(), by: user.id, byName: user.name || "" }] });
  } else {
    const reason = prompt("বাতিলের কারণ:"); if (!reason) return;
    await logAudit(user, "void_invoice", "billing", i._id, { reason });
    await updateDoc(doc(db, "billing", i._id), { status: "VOID", voidReason: reason, voidBy: user.id });
  }
  loadInv();
};
