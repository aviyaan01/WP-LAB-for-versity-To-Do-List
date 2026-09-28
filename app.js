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
const alarmModal = document.getElementById("alarm-modal");
const alarmTaskName = document.getElementById("alarm-task-name");
const alarmStatusBadge = document.getElementById("alarm-status-badge");
const dismissAlarmBtn = document.getElementById("dismiss-alarm-btn");

// App State (Tasks loaded from LocalStorage)
let tasks = JSON.parse(localStorage.getItem("pastel_tasks")) || [];

// Save tasks to LocalStorage and update the UI
function saveAndRender() {
  localStorage.setItem("pastel_tasks", JSON.stringify(tasks));
  renderTasks();
}

// Convert 24hr format ("14:30") to 12hr format with AM/PM ("2:30 PM")
function formatTime12Hour(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${m} ${ampm}`;
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
    
    li.className = `task-animate-in bg-white/90 hover:bg-white rounded-2xl p-3 sm:p-3.5 border border-purple-100/70 shadow-soft-card hover:shadow-soft-hover transition-all duration-200 flex items-center justify-between gap-2.5 ${
      task.completed ? "bg-slate-50/70 opacity-80" : ""
    }`;

    li.innerHTML = `
      <!-- Left: Checkbox & Task Text -->
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

      <!-- Right: Per-task Alarm Time Input & Delete Button -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <!-- Alarm Setting Container -->
        <div 
          class="flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
            task.time 
              ? (task.alarmTriggered 
                  ? 'bg-slate-100 border-slate-200 text-slate-400' 
                  : 'bg-purple-50/90 border-purple-200 text-purple-700 shadow-xs') 
              : 'bg-slate-50 hover:bg-purple-50/40 border-slate-200/80 text-slate-400 hover:text-purple-600'
          }" 
          title="${task.time ? (task.alarmTriggered ? 'Alarm rang for this task' : 'Alarm set at ' + formatTime12Hour(task.time)) : 'Click to set alarm time for this task'}"
        >
          <!-- Bell Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0 ${task.time && !task.alarmTriggered ? 'text-purple-600 animate-pulse' : 'text-slate-400'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>

          <!-- Per-task Time Input -->
          <input 
            type="time" 
            value="${task.time || ''}" 
            class="task-time-picker bg-transparent border-none outline-none cursor-pointer ${
              task.time 
                ? (task.alarmTriggered ? 'text-slate-400' : 'text-purple-700 font-semibold') 
                : 'text-slate-400'
            }"
            aria-label="Alarm time for ${escapeHtml(task.text)}"
          >

          <!-- Clear Alarm Button (only shown if time is set) -->
          ${task.time ? `
            <button 
              type="button" 
              class="clear-alarm-btn text-slate-400 hover:text-rose-500 ml-0.5 text-xs font-bold leading-none p-0.5 transition-colors cursor-pointer" 
              title="Remove alarm"
            >
              &times;
            </button>
          ` : ''}
        </div>

        <!-- Delete Task Button -->
        <button 
          type="button" 
          class="delete-btn flex-shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-150 cursor-pointer" 
          title="Delete task"
          aria-label="Delete task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2.032 2.032 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `;

    // 1. Task complete toggle listener
    const checkbox = li.querySelector(".pastel-checkbox");
    checkbox.addEventListener("change", () => toggleTask(index));

    // 2. Per-task alarm time change listener
    const timePicker = li.querySelector(".task-time-picker");
    timePicker.addEventListener("change", (e) => {
      updateTaskAlarm(index, e.target.value);
    });

    // 3. Clear alarm button listener
    const clearAlarmBtn = li.querySelector(".clear-alarm-btn");
    if (clearAlarmBtn) {
      clearAlarmBtn.addEventListener("click", () => {
        updateTaskAlarm(index, "");
      });
    }

    // 4. Delete task listener
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
    time: "",              // User sets alarm per task!
    alarmTriggered: false, // Prevents repeat alert
    completed: false
  };

  tasks.unshift(newTask);
  taskInput.value = "";
  taskInput.focus();

  saveAndRender();
}

// Update or remove alarm for a specific task
function updateTaskAlarm(index, newTime) {
  tasks[index].time = newTime;
  tasks[index].alarmTriggered = false; // Reset trigger so new time can ring
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

// ==========================================
// 🔔 Mobile Alarm Sound & Control (10 Seconds)
// ==========================================

let alarmAudioContext = null;
let alarmIntervalId = null;
let alarmTimeoutId = null;

// মোবাইলের মতো বিপ-বিপ (Beep-Beep) অ্যালার্ম বাজানো (১০ সেকেন্ড)
function startMobileAlarmSound() {
  // আগে থেকে কোনো সাউন্ড চলতে থাকলে বন্ধ করা
  stopMobileAlarmSound();

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    alarmAudioContext = new AudioContext();

    // প্রতি রাউন্ডে মোবাইলের মতো দুটি কুইক ডিজিটাল বিপ তৈরি করা
    const playDoubleBeep = () => {
      if (!alarmAudioContext || alarmAudioContext.state === "closed") return;

      const now = alarmAudioContext.currentTime;

      const makeBeep = (startTime, duration, freq) => {
        const osc = alarmAudioContext.createOscillator();
        const gain = alarmAudioContext.createGain();

        // Square ওয়েভফর্ম মোবাইলের ক্লাসিক অ্যালার্মের মতো ক্রিস্প বিপ সাউন্ড দেয়
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + duration - 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(alarmAudioContext.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // বিপ... বিপ... (1040Hz এ ৮৫ মিলি-সেকেন্ড করে দুটি সাউন্ড)
      makeBeep(now, 0.085, 1040);
      makeBeep(now + 0.14, 0.085, 1040);
    };

    // প্রথমবার সঙ্গে সঙ্গে বাজবে
    playDoubleBeep();

    // প্রতি ৬৫০ মিলি-সেকেন্ড পর পর বিপ-বিপ রিপিট হবে
    alarmIntervalId = setInterval(playDoubleBeep, 650);

    // ১০ সেকেন্ড (১০০০০ মিলি-সেকেন্ড) পর নিজে থেকেই সাউন্ড বন্ধ হয়ে যাবে
    alarmTimeoutId = setTimeout(() => {
      stopMobileAlarmSound();
      if (alarmStatusBadge) {
        alarmStatusBadge.textContent = "Alarm Time Ended (Stopped)";
      }
    }, 10000);

  } catch (err) {
    console.warn("Audio play issue:", err);
  }
}

// অ্যালার্ম সাউন্ড সম্পূর্ণ বন্ধ করার ফাংশন
function stopMobileAlarmSound() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (alarmTimeoutId) {
    clearTimeout(alarmTimeoutId);
    alarmTimeoutId = null;
  }
  if (alarmAudioContext) {
    try {
      alarmAudioContext.close();
    } catch (e) {}
    alarmAudioContext = null;
  }
}

// নির্দিষ্ট টাস্কের অ্যালার্ম ট্রিগার করা
function triggerAlarm(task) {
  if (alarmStatusBadge) {
    alarmStatusBadge.textContent = "Alarm Ringing (10s)";
  }
  startMobileAlarmSound();

  // কাস্টম মডাল পপআপ প্রদর্শন
  alarmTaskName.textContent = `Time for: "${task.text}"`;
  alarmModal.classList.remove("hidden");
}

// অ্যালার্ম বন্ধ করার বাটন ফাংশন (ক্লিক করলে সাউন্ড ও পপআপ বন্ধ হবে)
function dismissAlarm() {
  stopMobileAlarmSound();            // সাউন্ড সাথে সাথে অফ হবে
  alarmModal.classList.add("hidden"); // পপআপ বন্ধ হবে
}

// প্রতি ১ সেকেন্ড পর পর সব টাস্কের সময় চেক করা
function checkAlarms() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;

  let stateChanged = false;

  tasks.forEach((task) => {
    // শর্ত: টাস্কে সময় সেট করা আছে, টাস্ক সম্পন্ন হয়নি, অ্যালার্ম আগে বাজেনি, এবং সময় মিলে গেছে
    if (task.time && !task.completed && !task.alarmTriggered && task.time === currentTime) {
      task.alarmTriggered = true;
      stateChanged = true;
      triggerAlarm(task);
    }
  });

  if (stateChanged) {
    saveAndRender();
  }
}

// ==========================================
// Event Listeners & Initialization
// ==========================================
todoForm.addEventListener("submit", addTask);

taskInput.addEventListener("input", () => {
  if (!errorMessage.classList.contains("hidden")) {
    errorMessage.classList.add("hidden");
  }
});

clearCompletedBtn.addEventListener("click", clearCompleted);
dismissAlarmBtn.addEventListener("click", dismissAlarm);

// Initialize
displayCurrentDate();
renderTasks();

// প্রতি ১ সেকেন্ড (১০০০ মিলি-সেকেন্ড) পর পর checkAlarms কল করা হচ্ছে
setInterval(checkAlarms, 1000);
