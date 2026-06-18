import { db } from "./firebase.js";s
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

async function createTask(title, userId) {
  try {
    const userRef = doc(db, "users", userId);

    await addDoc(collection(db, "tasks"), {
      title,
      status: "todo",
      assignedTo: userRef,
      assignedToName: userName,
      deadline: Timestamp.fromDate(new Date()),
    });

    await addDoc(collection(db, "activity_logs"), {
      userId: userRef,
      userName: userName,
      taskId: taskRef,
      taskTitle: title,
      action: "create_task",
      timestamp: Timestamp.now(),
    });

    console.log("Task berhasil dibuat");
  } catch (error) {
    console.error("Error createTask:", error);
  }
}

async function updateTask(taskId, userId, newStatus) {
  await updateDoc(doc(db, "tasks", taskId), {
    status: newStatus,
  });

  // 🔥 Activity Log
  let actionType = "update_status";

  if (newStatus === "done") {
    actionType = "complete_task";
  }

  await addDoc(collection(db, "activity_logs"), {
    userId: userRef,
    userName: userName,
    taskId: taskRef,
    taskTitle: title,
    action: actionType,
    timestamp: Timestamp.now(),
  });
}
