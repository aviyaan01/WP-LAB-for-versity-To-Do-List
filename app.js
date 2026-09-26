// DOM Elements
const todoForm = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const statsText = document.getElementById("stats-text");
const remainingCount = document.getElementById("remaining-count");
const footerActions = document.getElementById("footer-actions");
const clearCompletedBtn = document.getElementById("clear-completed-btn");
const errorMessage = document.getElementById("error-message");
const currentDateEl = document.getElementById("current-date");

// App State
let tasks = JSON.parse(localStorage.getItem("pastel_tasks")) || [];

// Save tasks to LocalStorage and update the UI
function saveAndRender() {
  localStorage.setItem("pastel_tasks", JSON.stringify(tasks));
  renderTasks();
}

// Render task list
function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.classList.remove("hidden");
    footerActions.classList.add("hidden");
  } else {
    emptyState.classList.add("hidden");
    footerActions.classList.remove("hidden");
  }

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    
    li.className = `task-animate-in bg-white/90 hover:bg-white rounded-2xl p-3.5 sm:p-4 border border-purple-100/70 shadow-soft-card hover:shadow-soft-hover transition-all duration-200 flex items-center justify-between gap-3 ${
      task.completed ? "bg-slate-50/70 opacity-80" : ""
    }`;

    li.innerHTML = `
      <div class="flex items-center gap-3 flex-grow min-w-0">
        <input 
          type="checkbox" 
          class="pastel-checkbox flex-shrink-0"
          ${task.completed ? "checked" : ""} 
          aria-label="Mark task as complete"
        >
        <span class="task-title text-sm sm:text-base font-medium truncate select-none ${
          task.completed ? "line-through text-slate-400" : "text-slate-700"
        }">
          ${escapeHtml(task.text)}
        </span>
      </div>

      <button 
        type="button" 
        class="delete-btn flex-shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-150 cursor-pointer" 
        title="Delete task"
        aria-label="Delete task"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    `;

    const checkbox = li.querySelector(".pastel-checkbox");
    checkbox.addEventListener("change", () => toggleTask(index));

    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => deleteTask(index));

    taskList.appendChild(li);
  });

  updateStats();
}

// Add new task
function addTask(e) {
  e.preventDefault();

  const taskText = taskInput.value.trim();

  if (taskText === "") {
    errorMessage.classList.remove("hidden");
    taskInput.focus();
    return;
  }

  errorMessage.classList.add("hidden");

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false
  };

  tasks.unshift(newTask);
  taskInput.value = "";
  taskInput.focus();

  saveAndRender();
}

// Toggle completed status
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveAndRender();
}

// Clear all completed tasks
function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveAndRender();
}

// Update task counters
function updateStats() {
  const total = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;
  const remaining = total - completedCount;

  statsText.textContent = `${completedCount} / ${total} done`;
  remainingCount.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
}

// Escape HTML for XSS prevention
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Display formatted date
function displayCurrentDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date();
  currentDateEl.textContent = today.toLocaleDateString("en-US", options);
}

// Event Listeners
todoForm.addEventListener("submit", addTask);

taskInput.addEventListener("input", () => {
  if (!errorMessage.classList.contains("hidden")) {
    errorMessage.classList.add("hidden");
  }
});

clearCompletedBtn.addEventListener("click", clearCompleted);

// Initialize
displayCurrentDate();
renderTasks();
