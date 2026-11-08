/* Writes to auditLogs (same collection the Admin Dashboard reads on its
   Audit Logs page). firestore.rules lets the 'accounts' role create logs
   only with actorId == its own uid. */
import { db, collection, setDoc, doc } from "./firebase-config.js";
export async function logAudit(user, action, targetType, targetId, details = {}) {
  try {
    await setDoc(doc(collection(db, "auditLogs")), { action, actorId: user.id, actorName: user.name || "",
      actorRole: "accounts", targetType, targetId, details, at: new Date().toISOString() });
  } catch (e) { console.error("audit log failed:", e); }
}
