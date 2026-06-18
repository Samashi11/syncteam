import { listenAuth } from "../js/auth.js";
import { db } from "../js/firebase.js";
import { getUserData } from "../js/userService.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// =========================
// INIT
// =========================
const projectId = localStorage.getItem("currentProjectId");

if (!projectId) {
  alert("Tidak ada project dipilih");
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

  const userData = await getUserData(user.uid);

  if (userData.role !== "Leader") {
    document.getElementById("newProjectBtn")?.classList.add("hidden");
  }

  await loadContribution();
});

// =========================
// MAIN LOAD
// =========================
async function loadContribution() {
  try {
    const q = query(
      collection(db, "activity_logs"),
      where("projectId", "==", projectId),
    );

    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("📊 Logs Contribution:", logs);

    const members = await extractMembers(logs);

    const participation = calculateParticipation(logs, members);
    const contributions = calculateContribution(logs);
    const inactiveUsers = getInactiveUsers(logs, members);
    const velocity = getActivityPerHour(logs);

    renderParticipation(participation);
    renderContributions(contributions);
    renderInactive(inactiveUsers);
    renderVelocity(velocity);
  } catch (err) {
    console.error("❌ Contribution Error:", err);
  }
}

// =========================
// EXTRACT MEMBERS
// =========================
async function extractMembers(logs) {
  const map = {};

  for (const log of logs) {
    if (!log.userId) continue;

    const id = log.userId.id || log.userId;

    if (!map[id]) {
      const userData = await getUserData(id);

      map[id] = {
        id,
        name: log.userName || userData?.nama || "User",
        role: userData?.role || "Member",
      };
    }
  }

  return Object.values(map);
}

// =========================
// CALCULATIONS
// =========================
function isToday(timestamp) {
  const date = timestamp?.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  const today = new Date();

  return date.toDateString() === today.toDateString();
}

// 🔥 PARTICIPATION
function calculateParticipation(logs, members) {
  const active = new Set();

  logs.forEach((log) => {
    if (isToday(log.timestamp)) {
      active.add(log.userId);
    }
  });

  return members.length === 0
    ? 0
    : Math.round((active.size / members.length) * 100);
}

// 🔥 CONTRIBUTION SCORE (WITH WEIGHT)
function calculateContribution(logs) {
  const weight = {
    create_task: 2,
    complete_task: 3,
    update_task: 1,
  };

  const counter = {};

  logs.forEach((log) => {
    const id = log.userId?.id || log.userId;
    if (!id) return;

    if (!counter[id]) {
      counter[id] = {
        id,
        name: log.userName || "User",
        score: 0,
      };
    }

    const w = weight[log.action] || 1;
    counter[id].score += w;
  });

  const total = Object.values(counter).reduce((sum, u) => sum + u.score, 0);

  return Object.values(counter)
    .map((u) => ({
      ...u,
      percent: total === 0 ? 0 : Math.round((u.score / total) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);
}

// 🔥 INACTIVE USERS
function getInactiveUsers(logs, members) {
  const lastActive = {};

  logs.forEach((log) => {
    const id = log.userId?.id || log.userId;
    const time = log.timestamp?.seconds * 1000;

    if (!id || !time) return;

    if (!lastActive[id] || time > lastActive[id]) {
      lastActive[id] = time;
    }
  });

  const now = Date.now();

  return members.filter((user) => {
    const last = lastActive[user.id];
    if (!last) return true;

    const days = (now - last) / (1000 * 60 * 60 * 24);
    return days >= 3;
  });
}

// 🔥 VELOCITY
function getActivityPerHour(logs) {
  const hours = Array(24).fill(0);

  logs.forEach((log) => {
    const date = log.timestamp?.seconds
      ? new Date(log.timestamp.seconds * 1000)
      : new Date(log.timestamp);

    const hour = date.getHours();
    hours[hour]++;
  });

  return hours;
}

// =========================
// RENDER
// =========================

// 🎯 PARTICIPATION DONUT
function renderParticipation(percent) {
  const circle = document.querySelector("svg circle:nth-child(2)");
  const text = document.querySelector(".text-4xl");

  if (!circle || !text) return;

  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (percent / 100) * circumference;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = offset;

  text.textContent = percent + "%";
}

// 🎯 CONTRIBUTION LIST
function renderContributions(users) {
  const container = document.querySelector(".space-y-8");
  if (!container) return;

  container.innerHTML = "";

  users.slice(0, 5).forEach((user, index) => {
    const badge =
      index === 0
        ? `<span class="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Top</span>`
        : "";

    container.innerHTML += `
      <div class="space-y-2">
        <div class="flex justify-between items-end">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              ${user.name.charAt(0)}
            </div>
            <span class="font-medium text-on-surface">${user.name}</span>
            ${badge}
          </div>
          <span class="text-primary font-headline font-bold">${user.percent}%</span>
        </div>
        <div class="h-1.5 w-full bg-surface-container-high rounded-full">
          <div class="h-full bg-primary rounded-full" style="width:${user.percent}%"></div>
        </div>
      </div>
    `;
  });
}

// 🎯 INACTIVE USERS
function renderInactive(users) {
  const container = document.querySelector(".border-l-4 .space-y-6");
  if (!container) return;

  container.innerHTML = "";

  if (users.length === 0) {
    container.innerHTML = `<p class="text-sm text-on-surface-variant">Semua aktif 🚀</p>`;
    return;
  }

  users.forEach((user) => {
    container.innerHTML += `
      <div class="flex items-center justify-between p-4 bg-error/5 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center text-xs font-bold text-error">
            ${user.name.charAt(0)}
          </div>
          <span class="text-sm">${user.name}</span>
        </div>
        <span class="text-xs text-error">Inactive</span>
      </div>
    `;
  });
}

// 🎯 VELOCITY CHART
function renderVelocity(data) {
  const container = document.querySelector(".h-48.w-full.flex");
  if (!container) return;

  container.innerHTML = "";

  const max = Math.max(...data, 1);

  data.forEach((val, i) => {
    const height = (val / max) * 100;

    container.innerHTML += `
      <div class="flex-1 bg-surface-container-high rounded-t-sm"
           style="height:${height}%"></div>
    `;
  });
}
