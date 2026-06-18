import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

function formatDate(timestamp) {
  if (!timestamp) return "-";

  return timestamp.toDate().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function getProjects() {
  const snapshot = await getDocs(collection(db, "projects"));

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      name: data.name ?? "-",
      course: data.course ?? "-",
      createdByName: data.createdByName ?? "Unknown",
      createdAt: formatDate(data.createdAt),
      deadline: formatDate(data.deadline),
    };
  });
}
