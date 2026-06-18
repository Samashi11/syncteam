import { doc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db } from "./firebase.js";

export async function getUserData(uid) {
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error("User tidak ditemukan di DB");
    }

    const data = snap.data();

    return {
      id: snap.id,
      nama: data.nama || "No Name",
      role: data.role || "Member",
      ...data, // fallback kalau ada field lain
    };
  } catch (err) {
    console.error("ERROR GET USER:", err);
    throw err;
  }
}
