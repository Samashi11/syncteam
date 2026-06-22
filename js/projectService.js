import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
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

export async function createProject(data) {
  try {
    const userRef = doc(db, "users", data.userId); // 🔥 FIX: reference

    const docRef = await addDoc(collection(db, "projects"), {
      name: data.name,
      course: data.course,

      deadline: data.deadline ? new Date(data.deadline) : null,

      createdBy: userRef, // 🔥 FIX: reference
      createdByName: data.userName,

      createdAt: serverTimestamp(),
    });

    console.log("✅ Project created:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("❌ Error create project:", err);
    throw err;
  }
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
