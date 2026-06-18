import { db, auth } from "./firebase.js";
import {
  addDoc,
  collection,
  Timestamp,
  doc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function createProject(name, course, deadline) {
  const user = auth.currentUser;

  if (!user) throw new Error("Belum login");

  const projectRef = await addDoc(collection(db, "projects"), {
    name,
    course,
    deadline: Timestamp.fromDate(new Date(deadline)),
    createdBy: doc(db, "users", user.uid),
    createdByName: user.email, // atau ambil dari users collection
    createdAt: Timestamp.now(),
  });

  return projectRef.id;
}
