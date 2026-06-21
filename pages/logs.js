import { listenAuth } from "../js/auth.js";
import { db } from "../js/firebase.js";
import { getUserData } from "../js/userService.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const projectId = localStorage.getItem("currentProjectId");

// =========================
// VALIDASI PROJECT
// =========================
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

  await loadLogs();
});

// =========================
// FORMAT ACTION (AMBIL DARI app.js)
// =========================
function formatAction(action) {
  if (action === "create_task") return "membuat task";
  if (action === "update_task") return "mengupdate task";
  if (action === "update_status") return "mengupdate status";
  if (action === "complete_task") return "menyelesaikan task";
  return action;
}

// =========================
// FORMAT TIME
// =========================
function formatTime(timestamp) {
  if (!timestamp) return "-";

  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =========================
// LOAD LOGS (PER PROJECT)
// =========================
async function loadLogs() {
  try {
    const q = query(
      collection(db, "activity_logs"),
      where("projectId", "==", projectId),
      orderBy("timestamp", "desc"),
    );

    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("📜 Logs:", logs);

    // =========================
    // 🔥 PROCESS DATA
    // =========================

    const todayLogs = logs.filter((log) => isToday(log.timestamp));

    const totalToday = todayLogs.length;

    const completedCount = todayLogs.filter(
      (l) => l.action === "complete_task",
    ).length;

    const createdCount = todayLogs.filter(
      (l) => l.action === "create_task",
    ).length;

    const topUsers = await getTopUsers(logs);

    // =========================
    // 🔥 RENDER
    // =========================
    renderLogs(logs);
    renderTopUsers(topUsers);
    updateStats(totalToday, completedCount, createdCount);
  } catch (err) {
    console.error("❌ loadLogs error:", err);
  }
}

function getDateLabel(timestamp) {
  if (!timestamp) return "Unknown";

  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function groupLogs(logs) {
  const grouped = {};

  logs.forEach((log) => {
    const label = getDateLabel(log.timestamp);

    if (!grouped[label]) {
      grouped[label] = [];
    }

    grouped[label].push(log);
  });

  return grouped;
}

// =========================
// RENDER LOGS
// =========================
function renderLogs(logs) {
  const container = document.getElementById("logList");
  if (!container) return;

  container.innerHTML = "";

  if (logs.length === 0) {
    container.innerHTML = `
      <p class="text-on-surface-variant text-sm">
        Belum ada aktivitas...
      </p>
    `;
    return;
  }

  const groupedLogs = groupLogs(logs);

  Object.keys(groupedLogs).forEach((dateLabel) => {
    const logsPerDate = groupedLogs[dateLabel];

    // 🔥 HEADER DATE
    container.innerHTML += `
      <div class="mt-6">
        <h3 class="text-primary-fixed-dim font-headline text-lg mb-4">
          ${dateLabel}
        </h3>
        <div class="flex flex-col gap-6">
          ${logsPerDate.map((log) => renderLogItem(log)).join("")}
        </div>
      </div>
    `;
  });
}

function renderLogItem(log) {
  const userName = log.userName || "Unknown User";
  const taskTitle = log.title || log.taskTitle || "Unknown Task";

  return `
    <div class="group relative flex items-start gap-6 p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 nebula-glow">
      
      <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
        ${userName.charAt(0)}
      </div>

      <div class="flex-1">
        <div class="flex justify-between items-start mb-1">
          
          <p class="text-on-surface font-medium">
            <span class="text-primary-fixed-dim">${userName}</span>
            ${formatAction(log.action)}
            
            <span class="px-2 py-0.5 rounded bg-surface-container-highest text-secondary text-xs ml-2">
              ${taskTitle}
            </span>
          </p>

          <span class="text-[0.6875rem] text-on-surface-variant font-label">
            ${formatTime(log.timestamp)}
          </span>

        </div>
      </div>

    </div>
  `;
}

function isToday(timestamp) {
  if (!timestamp) return false;

  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function updateStats(total, completed, created) {
  const totalEl = document.getElementById("totalToday");
  const completedEl = document.getElementById("completedToday");
  const createdEl = document.getElementById("createdToday");

  if (totalEl) totalEl.textContent = total;
  if (completedEl) completedEl.textContent = completed;
  if (createdEl) createdEl.textContent = created;
}

async function getTopUsers(logs) {
  const counter = {};

  logs.forEach((log) => {
    if (!log.userId) return;

    const id = log.userId || log.uid;

    if (!id) return;

    if (!counter[id]) {
      counter[id] = {
        count: 0,
        name: log.userName || "User",
      };
    }
    console.log("USER DEBUG:", logs);
    counter[id].count++;
  });

  // convert ke array
  const users = Object.entries(counter).map(([id, data]) => ({
    id,
    ...data,
  }));

  // sort desc
  users.sort((a, b) => b.count - a.count);

  // 🔥 ambil top 3 NON leader
  const result = [];

  for (const user of users) {
    const userData = await getUserData(user.id);

    if (userData?.role !== "Leader") {
      result.push({
        ...user,
        role: userData?.role,
      });
    }

    if (result.length === 3) break;
  }

  return result;
}

function renderTopUsers(users) {
  const container = document.getElementById("topUsersList");
  if (!container) return;

  container.innerHTML = "";

  if (users.length === 0) {
    container.innerHTML = `<p class="text-xs text-on-surface-variant">Belum ada aktivitas user</p>`;
    return;
  }

  users.forEach((user, index) => {
    const badge =
      index === 0
        ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Top Contributor</span>`
        : "";

    container.innerHTML += `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            ${user.name.charAt(0)}
          </div>
          <span class="text-sm text-on-surface">${user.name}</span>
        </div>
        ${badge}
      </div>
    `;
  });
}
