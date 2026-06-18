import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db } from "./firebase.js";

function formatDate(timestamp) {
  if (!timestamp) return "-";

  return timestamp.toDate().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function getActivityLogs() {
  const q = query(
    collection(db, "activity_logs"),
    orderBy("timestamp", "desc"),
    limit(3),
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
