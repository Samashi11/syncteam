import { listenAuth } from "../js/auth.js";
import { db, auth } from "../js/firebase.js";
import { getUserData } from "../js/userService.js";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// =========================
// STATE
// =========================
let selectedUser = null;
let currentUserData = null;

// =========================
// INIT
// =========================
const projectId = localStorage.getItem("currentProjectId");

if (!projectId) {
  alert("Pilih project dulu!");
  window.location.href = "projects.html";
}

// =========================
// AUTH
// =========================
listenAuth(async (user) => {
  if (!user) {
    window.location.href = "/pages/auth/login.html";
    return;
  }

  currentUserData = await getUserData(user.uid);

  console.log("✅ User login:", user.uid);
  console.log("👤 User data:", currentUserData);

  await loadUsers();
  initForm();
});

// =========================
// LOAD USERS (MEMBER)
// =========================
async function loadUsers() {
  const container = document.getElementById("userList");

  const q = query(collection(db, "users"), where("role", "==", "member"));
  const snapshot = await getDocs(q);

  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const userId = docSnap.id;

    container.innerHTML += `
      <button 
        class="assign-btn flex items-center gap-2 p-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 hover:bg-surface-container-highest"
        type="button"
        data-user="${userId}"
      >
        <span class="text-xs font-medium text-on-surface">
          ${data.nama}
        </span>
      </button>
    `;
  });

  attachUserClick();
}

// =========================
// SELECT USER
// =========================
function attachUserClick() {
  document.querySelectorAll(".assign-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedUser = btn.dataset.user;

      document.querySelectorAll(".assign-btn").forEach((b) => {
        b.classList.remove("border-primary", "bg-primary/5");
      });

      btn.classList.add("border-primary", "bg-primary/5");

      console.log("👤 Selected User:", selectedUser);
    });
  });
}

// =========================
// INIT FORM
// =========================
function initForm() {
  const form = document.getElementById("taskForm");

  form.addEventListener("submit", handleSubmit);
}

// =========================
// SUBMIT TASK
// =========================
async function handleSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value;
  const deadlineInput = document.getElementById("taskDeadline").value;
  const status = document.getElementById("taskStatus").value;

  if (!title) {
    alert("Judul task wajib diisi");
    return;
  }

  if (!selectedUser) {
    alert("Pilih anggota dulu bro");
    return;
  }

  // 🔥 HANDLE DEADLINE (auto 00:00 kalau kosong jam)
  let deadlineDate = null;

  if (deadlineInput) {
    deadlineDate = new Date(deadlineInput + "T00:00:00");
  }

  try {
    const taskRef = await addDoc(collection(db, "tasks"), {
      title,
      status,
      projectId,
      assignedTo: doc(db, "users", selectedUser),
      deadline: deadlineDate ? Timestamp.fromDate(deadlineDate) : null,
      createdAt: Timestamp.now(),
      createdBy: doc(db, "users", auth.currentUser.uid),
    });

    // activity log
    await addDoc(collection(db, "activity_logs"), {
      action: "create_task",
      projectId: projectId,
      taskId: taskRef.id,
      title: title,
      userId: auth.currentUser.uid, // ✅ STRING
      userName: currentUserData.nama ?? "Unknown", // ✅ FIX
      timestamp: Timestamp.now(),
    });

    alert("✅ Task berhasil dibuat");

    // redirect biar UX enak
    window.location.href = "tasks.html";
  } catch (err) {
    console.error("❌ Error create task:", err);
    alert("Terjadi kesalahan");
  }
}
