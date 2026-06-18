import { db } from "./firebase.js";
import {
  getDocs,
  getDoc,
  doc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

async function getContribution(userId) {
  // const logs = await getDocs(collection(db, "activity_logs"));
  const q = query(
    collection(db, "activity_logs"),
    where("userId", "==", userId),
  );

  const logs = await getDocs(q);

  let score = 0;

  logs.forEach((doc) => {
    const data = doc.data();
    if (data.userId === userId) {
      if (data.action === "complete_task") score += 2;
      if (data.action === "update_status") score += 1;
    }
  });

  return score;
}
