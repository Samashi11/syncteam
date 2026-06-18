import { getProjects } from "../js/projectService.js";
import { getActivityLogs } from "../js/activityService.js";



document.addEventListener("DOMContentLoaded", async () => {
  await loadActivityLogs();

  const container = document.getElementById("projectPreview");

  if (!container) return;

  const projects = await getProjects();
  renderProjectPreview(projects);
});

async function loadActivityLogs() {
  const container = document.getElementById("activityLogList");

  console.log("dashboard loaded");
  console.log(
    "activity container:",
    document.getElementById("activityLogList"),
  );
  console.log("logs from firestore:", await getActivityLogs());

  if (!container) {
    console.error("activityLogList tidak ditemukan di HTML");
    return;
  }

  const logs = await getActivityLogs();

  console.log("LOGS:", logs); // 🔥 DEBUG PENTING

  container.innerHTML = "";

  logs.forEach((log) => {
    container.innerHTML += `
      <div class="flex gap-4 relative">

        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center z-10">
          <span class="material-symbols-outlined text-sm text-primary">
          edit
          </span>
        </div>

        <div>
          <p class="text-sm text-on-surface">
            <span class="font-semibold">${log.userName}</span>
            ${log.action}
            <span class="text-primary">${log.title}</span>
          </p>

          <p class="text-[10px] text-on-surface-variant">
            ${log.timestamp?.toDate?.().toLocaleString("id-ID") ?? "-"}
          </p>
        </div>

      </div>
    `;
  });
}

function renderProjectPreview(projects) {
  const container = document.getElementById("projectPreview");

  container.innerHTML = "";

  projects.slice(0, 3).forEach((p) => {
    container.innerHTML += `
      <div class="bg-surface-container-low p-4 rounded-xl mb-3">
        <h4 class="text-sm font-bold text-on-surface">${p.name}</h4>
        <p class="text-xs text-on-surface-variant">${p.course}</p>
      </div>
    `;
  });
}
