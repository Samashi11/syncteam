// js/taskService.js
import {
  collection,
  getDocs,
  getDoc,
  query,
  doc,
  where,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db } from "./firebase.js";

async function createTask(title, userId, userName) {
  try {
    const userRef = doc(db, "users", userId);

    // 1. Create Task
    const taskRef = await addDoc(collection(db, "tasks"), {
      title,
      status: "todo", // standard
      assignedTo: userRef,
      deadline: Timestamp.fromDate(new Date()),
      createdAt: Timestamp.now(),
    });

    // 2. Create Activity Log
    await addDoc(collection(db, "activity_logs"), {
      userRef: userRef,
      taskRef: taskRef,
      action: "create_task",
      timestamp: Timestamp.now(),
    });

    console.log("Task berhasil dibuat:", taskRef.id);
  } catch (error) {
    console.error("Error createTask:", error);
  }
}

// VER 1
export async function getTaskStats(uid) {
  const userRef = doc(db, "users", uid); // 🔥 ini kunci
  console.log("USER REF:", userRef.path);

  const q = query(collection(db, "tasks"));
  const snap = await getDocs(q);

  snap.forEach((doc) => {
    const data = doc.data();

    console.log("TASK ID:", doc.id);
    console.log("assignedTo RAW:", data.assignedTo);
    console.log("assignedTo PATH:", data.assignedTo?.path);
  });

  let total = 0;
  let completed = 0;
  let pending = 0;

  snap.forEach((doc) => {
    console.log("RAW DATA:", doc.data());
    total++;

    const data = doc.data();
    console.log("TASK REF:", data.assignedTo?.path);
    // 🔥 normalize status
    const status = data.status?.toLowerCase().replace(/\s/g, "");

    if (status === "todo" || status === "pending") pending++;
    else if (status === "done") completed++;
  });

  return { total, completed, pending };
}

// VER 2
// export async function getTaskStats(uid) {
//   const userRef = doc(db, "users", uid);
//   console.log("USER REF:", userRef.path);

//   const all = await getDocs(collection(db, "tasks"));

//   all.forEach((docSnap) => {
//     const data = docSnap.data();
//     console.log("TASK REF:", data.assignedTo?.path);
//   });

//   const q = query(collection(db, "tasks"), where("assignedTo", "==", userRef));

//   const snap = await getDocs(q);

//   console.log("MATCHED:", snap.size);

//   return { total: snap.size, completed: 0, pending: 0 };
// }

export async function getTasksByProject(projectId) {
  if (!projectId) throw new Error("projectId kosong");

  const q = query(collection(db, "tasks"), where("projectId", "==", projectId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title || "-",
      status: (data.status || "todo").toLowerCase().trim(),
      assignedTo: data.assignedTo || null,
      deadline: data.deadline || null,
      raw: data,
    };
  });
}

// =========================
// GET TASK BY ID
// =========================
export async function getTaskById(taskId) {
  try {
    const ref = doc(db, "tasks", taskId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn("Task tidak ditemukan");
      return null;
    }

    return {
      id: snap.id,
      ...snap.data(),
    };
  } catch (err) {
    console.error("❌ getTaskById error:", err);
    throw err;
  }
}
