import { listenAuth } from "../js/auth.js";
import { getUserData } from "../js/userService.js";
import { createProject } from "../js/projectService.js";

const form = document.getElementById("createProjectForm");

let currentUser = null;
let currentUserData = null;

// =========================
// AUTH
// =========================
listenAuth(async (user) => {
  if (!user) {
    window.location.href = "/pages/auth/login.html";
    return;
  }

  currentUser = user;
  currentUserData = await getUserData(user.uid);

  if (currentUserData.role !== "Leader") {
    alert("Hanya Leader yang bisa membuat project");
    window.location.href = "projects.html";
  }
});

// =========================
// SUBMIT
// =========================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("projectName").value.trim();
  const course = document.getElementById("projectCourse").value.trim();
  const deadline = document.getElementById("projectDeadline").value;

  console.log({
    name,
    course,
    deadline,
    uid: currentUser.uid,
    user: currentUserData,
  });

  if (!name || !course) {
    alert("Nama dan Mata Kuliah wajib diisi");
    return;
  }

  try {
    await createProject({
      name,
      course,
      deadline, // 🔥 string → nanti diubah jadi Date di service
      userId: currentUser.uid,
      userName: currentUserData.nama,
    });

    alert("✅ Project berhasil dibuat");
    window.location.href = "projects.html";
  } catch (err) {
    console.error(err);
    alert("❌ Gagal membuat project");
  }
});
