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
import { listenAuth } from "./auth.js";

listenAuth((data) => {
  if (!data) {
    // belum login → tendang
    window.location.href = "/login.html";
    return;
  }

  console.log("User:", data.userData);

  // simpan global
  window.currentUser = data.user;
  window.currentUserData = data.userData;
});

// format action biar manusiawi
function formatAction(action) {
  if (action === "create_task") return "membuat task";
  if (action === "update_status") return "mengupdate status";
  if (action === "complete_task") return "menyelesaikan task";
  return action;
}

async function getUserName(userRef) {
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data().nama : "Unknown";
}

async function getTaskTitle(taskRef) {
  try {
    const snap = await getDoc(taskRef);
    return snap.exists() ? snap.data().title : "Unknown Task";
  } catch (err) {
    console.error("Task error:", err);
    return "Error Task";
  }
}

async function loadLogs() {
  const container = document.getElementById("logList");

  // ❗ penting: pastikan element ada (karena beda halaman)
  if (!container) return;

  const snapshot = await getDocs(collection(db, "activity_logs"));

  container.innerHTML = "";

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    const userName = data.userName || "Unknown User";
    const taskTitle = data.taskTitle || "Unknown Task";

    const time = data.timestamp
      ? data.timestamp.toDate().toLocaleTimeString()
      : "no time";
    console.log(data);
    container.innerHTML += `
    <div class="group relative flex items-start gap-6 p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 nebula-glow">
      
      <div class="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center border border-secondary/20">
        <span class="material-symbols-outlined text-secondary">history</span>
      </div>

      <div class="flex-1">
        <div class="flex justify-between items-start mb-1">
          <p class="text-on-surface font-medium">
            <span class="text-primary-fixed-dim">${userName}</span>
            ${formatAction(data.action)}
            <span class="px-2 py-0.5 rounded bg-surface-container-highest text-secondary text-xs ml-2">
              ${taskTitle}
            </span>
          </p>

          <span class="text-[0.6875rem] text-on-surface-variant font-label">
            ${time}
          </span>
        </div>
      </div>
    </div>
  `;
  }
}

// auto jalan
loadLogs();

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
