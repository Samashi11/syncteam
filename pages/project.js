import { listenAuth } from "../js/auth.js";
import { getProjects } from "../js/projectService.js";
import { getUserData } from "../js/userService.js";

const container = document.getElementById("projectList");

listenAuth(async (user) => {
  if (!user) {
    window.location.href = "/pages/auth/login.html";
    return;
  }

  const userData = await getUserData(user.uid);

  console.log("UID:", user.uid);
  console.log("USER DATA:", userData);

  if (!userData) {
    console.error("User data tidak ditemukan");
    return;
  }

  if (userData.role !== "Leader") {
    document.getElementById("newProjectBtn").style.display = "none";
    document.getElementById("newProjectBtns").style.display = "none";
  }

  const projects = await getProjects();
  renderProjects(projects);
});

function renderProjects(projects) {
  container.innerHTML = "";

  projects.forEach((project) => {
    container.innerHTML += `
    <div
            class="glass-panel nebula-glow rounded-2xl p-6 card-hover transition-all duration-300 border border-outline-variant/10 flex flex-col h-[340px] group"
          >
            <div class="flex justify-between items-start mb-6">
              <div class="flex flex-col gap-1">
                <span
                  class="text-[10px] font-bold text-primary tracking-widest uppercase"
                  >${project.name}</span
                >
                <h3 class="text-xl font-headline font-semibold text-on-surface">
                  ${project.course}
                </h3>
              </div>
              <button
                class="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span class="material-symbols-outlined">more_vert</span>
              </button>
            </div>
            <div class="flex-grow">
              <div
                class="flex items-center justify-between text-xs text-on-surface-variant mb-2"
              >
                <span>Completion</span>
                <span class="text-on-surface font-medium">74%</span>
              </div>
              <div
                class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mb-6"
              >
                <div
                  class="h-full bg-gradient-to-r from-primary to-primary-container w-[74%] rounded-full relative"
                >
                  <div
                    class="absolute top-0 right-0 h-full w-4 bg-white/20 blur-sm"
                  ></div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="flex flex-col">
                  <span
                    class="text-[10px] text-on-surface-variant uppercase tracking-wider"
                    >LEADER</span
                  >
                  <span class="text-sm font-medium text-on-surface"
                    >${project.createdByName}</span
                  >
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-[10px] text-on-surface-variant uppercase tracking-wider"
                    >DEADLINE</span
                  >
                  <span class="text-sm font-medium text-on-surface"
                    >${project.deadline}</span
                  >
                </div>
              </div>
            </div>
            <div
              class="flex items-center justify-between pt-6 border-t border-outline-variant/10"
            >
              <div class="flex -space-x-2">
                <div
                  class="w-8 h-8 rounded-full border border-background bg-surface-container-highest overflow-hidden"
                >
                  <img
                    alt="Assignee"
                    class="w-full h-full object-cover"
                    data-alt="Portrait of a female developer in a high-tech environment with soft ambient purple lighting. She appears focused and professional, representing a key project contributor in a modern workspace."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEdyRkNtx61javVzQlusDbiRaAfjugwm1JKeq2jGIqOMi4mUfFZloZP_37GaBeT-naLJuiUTP34Ql5iHzjwf70xUVYUBOUKxCkh9wkvrxYFJSt0LxawK_7-YhncGhtBU-jPz30ACv2quumU3ukGhIXFnaqYLyYveF-LtcAWb012eEwidJt6uCp8Kp8xgZyuGzLq00Hm63YDFkflnpdTopeysIOjl-dx0RyO2y-RbOjTHJl13wkxmZe3lF_sEb0NlQ3sdHzZ3R5kao"
                  />
                </div>
                <div
                  class="w-8 h-8 rounded-full border border-background bg-surface-container-highest overflow-hidden"
                >
                  <img
                    alt="Assignee"
                    class="w-full h-full object-cover"
                    data-alt="Close-up of a creative director in a minimalist studio. Subtle blue highlights emphasize the contours of the face. Clean, professional look with a tech-focused atmosphere."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqeLVllwVvv3ZpkQbBMXEgGrFleJ-417U7pF6hDN3WzfUlgXF8FJCZWWhWqJXxb6CDGTcLjPbq9dJCKLBUQb5ZKjGCBx9PQSM7vptoQfMrYybWvgU5NeoPWJE3piFijzgfGgTs8HzwnYpH0_IcvOzgNhCA4MGZ55MmBAVlDsgN7hR5dp2-PRf4k2CMRjJFnPAnyjMWigI_6pEc-4D0bQDOMvyD-SJ7q04_oFaBK7QHStWRfmJjb_g90Yj21BI7ljXrJgVfoOm3yk8"
                  />
                </div>
                <div
                  class="w-8 h-8 rounded-full border border-background bg-surface-container-highest flex items-center justify-center text-[10px] text-on-surface-variant font-bold"
                >
                  +3
                </div>
              </div>
              <button
                class="px-4 py-2 rounded-lg bg-surface-container text-xs font-semibold text-primary-fixed-dim hover:bg-primary-container hover:text-white transition-all group-hover:scale-105" onclick="selectProject('${project.id}')"
              >
                Enter Project
              </button>
            </div>
          </div>
      
    `;
  });
}

window.selectProject = function (id) {
  localStorage.setItem("currentProjectId", id);
  window.location.href = "tasks.html";
};
