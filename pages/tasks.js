import { listenAuth } from "../js/auth.js";
import { getUserData } from "../js/userService.js";
import { getTasksByProject } from "../js/taskService.js";
import { getTaskById } from "../js/taskService.js";
import { getProjects } from "../js/projectService.js";
import {
  doc,
  addDoc,
  collection,
  Timestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { db } from "../js/firebase.js";

let currentUser = null;
let currentUserData = null;
let currentTaskId = null;
let currentTask = null;

// ambil project dari localStorage
const projectId = localStorage.getItem("currentProjectId");
console.log("📦 Current Project ID:", projectId);

// validasi project
if (!projectId) {
  alert("Tidak ada project dipilih");
  window.location.href = "projects.html";
}

// tombol create task
const createBtn = document.getElementById("createTaskBtn");
if (createBtn) {
  createBtn.addEventListener("click", () => {
    window.location.href = "actionTask.html";
  });
}

// =========================
// AUTH FLOW
// =========================
listenAuth(async (user) => {
  if (!user) {
    window.location.href = "/pages/auth/login.html";
    return;
  }

  currentUser = user;
  currentUserData = await getUserData(user.uid);

  try {
    const userData = await getUserData(user.uid);
    currentUser = user;
    currentUserData = userData;
    const projects = await getProjects();

    console.log("USER:", user);
    console.log("USER DATA:", userData);
    console.log("PROJECTS:", projects);

    // set UI user
    const userNameEl = document.getElementById("userName");
    const userRoleEl = document.getElementById("userRole");

    if (userNameEl) userNameEl.textContent = userData.nama ?? "-";
    if (userRoleEl) userRoleEl.textContent = userData.role ?? "-";

    // role check
    if (userData.role !== "Leader") {
      const newProjectBtn = document.getElementById("newProjectBtn");
      const createTaskBtn = document.getElementById("createTaskBtn");

      if (newProjectBtn) newProjectBtn.style.display = "none";
      if (createTaskBtn) createTaskBtn.style.display = "none";
    }
  } catch (err) {
    console.error("❌ Gagal ambil data user:", err);
  }

  document.getElementById("newProjectBtn")?.addEventListener("click", () => {
    window.location.href = "/pages/createProject.html";
  });
  // load tasks
  await loadTasks(projectId);
});

// =========================
// LOAD TASKS
// =========================
async function loadTasks(projectId) {
  try {
    const tasks = await getTasksByProject(projectId);

    console.log("📊 Total Task Found:", tasks.length);

    renderTasks(tasks);
  } catch (err) {
    console.error("❌ loadTasks error:", err);
  }
}

// =========================
// RENDER TASKS
// =========================
function renderTasks(tasks) {
  const todoList = document.getElementById("todoList");
  const progressList = document.getElementById("progressList");
  const doneList = document.getElementById("doneList");

  if (!todoList || !progressList || !doneList) return;

  todoList.innerHTML = "";
  progressList.innerHTML = "";
  doneList.innerHTML = "";

  function formatDeadline(deadline) {
    if (!deadline) return "No deadline";

    let dueDate;

    // 🔥 handle Firestore Timestamp
    if (deadline.seconds) {
      dueDate = new Date(deadline.seconds * 1000);
    } else {
      dueDate = new Date(deadline);
    }

    // 🔥 kalau tidak ada jam → set ke 00:00
    if (
      dueDate.getHours() === 0 &&
      dueDate.getMinutes() === 0 &&
      dueDate.getSeconds() === 0
    ) {
      // sudah default → biarkan
    }

    const now = new Date();

    const diffMs = dueDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    // 🔥 kondisi output
    if (diffMs < 0) {
      return "Overdue";
    } else if (diffDays > 0) {
      return `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
    } else if (diffHours > 0) {
      return `Due in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    } else {
      return "Due today";
    }
  }

  tasks.forEach((task) => {
    // dummy fallback (biar aman kalau field belum ada di database)
    const priority = task.priority ?? "Medium";
    const description = task.description ?? "No description available";
    // const due = task.deadline ?? "No deadline";
    const due = formatDeadline(task.deadline);

    const card = `
    <article
      class="bg-surface-container-low p-6 rounded-xl nebula-shadow border border-outline-variant/10 hover:bg-surface-container group transition-all duration-300 cursor-pointer" onclick="openTask('${task.id}')"
    >
      <div class="flex justify-between items-start mb-4">
        <span
          class="px-2 py-0.5 bg-surface-container-high text-[10px] text-tertiary font-bold rounded uppercase tracking-tighter"
        >
          ${priority} Priority
        </span>

        <span
          class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer"
        >
          more_horiz
        </span>
      </div>

      <h4
        class="text-on-surface font-headline font-semibold mb-2 group-hover:text-primary transition-colors"
      >
        ${task.title}
      </h4>

      <p
        class="text-on-surface-variant text-sm font-light mb-6 line-clamp-2"
      >
        ${description}
      </p>

      <div class="flex justify-between items-center">
        <div class="flex -space-x-2">
          <!-- dummy avatar -->
          <img
            class="w-7 h-7 rounded-full border border-surface-container-low"
            src="https://i.pravatar.cc/40?img=1"
          />
          <img
            class="w-7 h-7 rounded-full border border-surface-container-low"
            src="https://i.pravatar.cc/40?img=2"
          />
        </div>

        <div
          class="flex items-center gap-1.5 text-on-surface-variant font-label text-[11px]"
        >
          <span class="material-symbols-outlined text-[14px]">
            calendar_today
          </span>
          <span>${due}</span>
        </div>
      </div>
    </article>
  `;

    if (task.status === "todo") {
      todoList.innerHTML += card;
    } else if (task.status === "inprogress") {
      progressList.innerHTML += card;
    } else if (task.status === "done") {
      doneList.innerHTML += card;
    }
  });
}

// UPDATE TASK

window.openTask = async function (id) {
  try {
    const task = await getTaskById(id);

    const isAssigned =
      task.assignedTo?.id === currentUser.uid ||
      task.assignedTo?.path?.includes(currentUser.uid);

    const isLeader = currentUserData.role === "Leader";

    if (!isAssigned && !isLeader) {
      alert("Tidak punya akses ke task ini");
      return;
    }

    currentTaskId = id;
    currentTask = task; // 🔥 SIMPAN DI SINI

    document.getElementById("editTitle").value = task.title;
    document.getElementById("editStatus").value = task.status;

    document.getElementById("taskModal").classList.remove("hidden");
  } catch (err) {
    console.error("❌ openTask error:", err);
  }
};

async function loadTaskDetail(id) {
  const task = await getTaskById(id);

  document.getElementById("editTitle").value = task.title;
  document.getElementById("editStatus").value = task.status;
}

window.updateTask = async function () {
  try {
    const newStatus = document.getElementById("editStatus").value;

    await updateDoc(doc(db, "tasks", currentTaskId), {
      status: newStatus,
    });

    // 🔥 activity log
    await addDoc(collection(db, "activity_logs"), {
      action: "update_task",
      taskId: currentTaskId,
      title: currentTask.title, // ✅ FIX
      projectId: projectId,
      userId: currentUser.uid,
      userName: currentUserData.nama,
      timestamp: Timestamp.now(),
    });

    alert("Task updated ✅");

    document.getElementById("taskModal").classList.add("hidden");

    await loadTasks(projectId);
  } catch (err) {
    console.error(err);
    alert("Update gagal");
  }
};
