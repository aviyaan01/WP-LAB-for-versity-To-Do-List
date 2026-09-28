# Web Programming Laboratory Project Report
# Project Title: Interactive To-Do List with Task Alarm & Audio Reminder System

---

## 1. Project Overview & Abstract

This project is a modern, responsive, client-side web application developed for the **Web Programming Lab**. The application serves as a daily productivity tool that allows users to manage daily tasks while setting customized, individual alarm reminders for any task.

Unlike traditional to-do lists, this system incorporates a real-time polling engine and native audio synthesis using the browser's built-in **Web Audio API**. When the scheduled time for a task arrives, the application triggers a classic mobile-style repeating beep alarm for 10 seconds and displays an interactive modal reminder with an instant "Stop Alarm" option.

### Technology Stack:
- **Markup:** Semantic HTML5
- **Styling:** Tailwind CSS (Utility-first framework via CDN) + Vanilla CSS3 (Custom animations & micro-interactions)
- **Logic:** Vanilla JavaScript (Modern ES6+)
- **Audio Processing:** Browser Native Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`)
- **Data Persistence:** Browser LocalStorage API

---

## 2. Key Features

1. **Full CRUD Task Management:**
   - **Create:** Add new tasks seamlessly through the text input or by pressing the `Enter` key.
   - **Read & Render:** Automatically populates saved tasks on load.
   - **Update:** Mark tasks as completed using custom styled checkboxes with strikethrough styling and soft visual feedback.
   - **Delete:** Remove tasks individually or bulk-clear completed tasks.

2. **Per-Task Alarm Scheduling:**
   - Every individual task card contains its own dedicated time input field (`<input type="time">`) paired with a bell indicator (`🔔`).
   - Users can choose to assign an alarm time to specific tasks or leave them as regular tasks.
   - Alarms can be adjusted or cleared at any time via a dedicated clear button (`×`).

3. **10-Second Digital Mobile Alarm Sound:**
   - Generates an authentic digital watch / mobile alarm dual-beep pattern using native browser synthesis.
   - Zero external audio files (`.mp3` / `.wav`) are required, completely eliminating 404 errors, loading latency, or cross-origin restrictions.
   - Plays automatically for 10 seconds with automatic timeout termination.

4. **Emergency "Stop Alarm" Modal Dialog:**
   - When an alarm is triggered, a high-priority backdrop modal pops up displaying the exact task name.
   - Contains a prominent **"Stop Alarm"** button allowing the user to silence the sound and dismiss the modal immediately.

5. **Client-Side Data Persistence:**
   - Complete state is synchronized with `localStorage`. All tasks, completion statuses, and alarm schedules persist across browser reloads or restarts.

6. **Interactive Dashboard Statistics & Live Date:**
   - Dynamically calculates completed vs. remaining tasks (e.g., `2 / 5 done`).
   - Automatically renders today's formatted weekday and date (e.g., `Monday, Sep 28`).

---

## 3. System Architecture & File Structure

```text
WP-LAB-for-versity-To-Do-List/
├── index.html               # Semantic HTML layout, modals, and Tailwind structure
├── style.css                # Custom animations, transitions, and scrollbar styling
├── app.js                   # State management, alarm engine, and audio synthesis
├── PROJECT_DOCUMENTATION.md # Academic documentation & presentation guide
└── README.md                # Project setup and overview
```

---

## 4. Technical Implementation Details

### A. User Interface (`index.html` & `style.css`)
- **Semantic Components:** The layout is structured using `<header>`, `<main>`, `<section>`, and `<form>` for accessibility standards.
- **Glassmorphic Pastel Theme:** Features soft purple and slate gradients, backdrop blur filters (`backdrop-blur-xl`), and rounded card surfaces (`rounded-3xl`, `rounded-2xl`).
- **Modal Dialog:** An `#alarm-modal` overlay positioned with fixed coordinates (`fixed inset-0`) and translucent backdrop (`bg-slate-900/50 backdrop-blur-sm`).

### B. State Management & Data Structure (`app.js`)
Each task is represented as a structured JavaScript object inside an array named `tasks`:

```javascript
const newTask = {
  id: Date.now(),           // Unique timestamp identifier
  text: taskText,           // Task title string
  time: "",                 // 24-hour time string ("HH:MM") or empty
  alarmTriggered: false,    // Boolean flag to prevent duplicate ringing
  completed: false          // Boolean completion flag
};
```

Data is serialized to JSON and stored under the key `"pastel_tasks"` in browser `localStorage`.

### C. Alarm Polling Engine (`setInterval`)
A background polling routine runs continuously every 1,000 milliseconds (1 second):

```javascript
function checkAlarms() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;

  let stateChanged = false;

  tasks.forEach((task) => {
    // Condition: Task has time set, is not completed, alarm hasn't fired, and time matches
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

setInterval(checkAlarms, 1000);
```

### D. Audio Synthesis via Web Audio API
Rather than relying on remote audio files, the app synthesizes a digital alarm directly in the browser:

```javascript
function startMobileAlarmSound() {
  stopMobileAlarmSound();

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  alarmAudioContext = new AudioContext();

  const playDoubleBeep = () => {
    if (!alarmAudioContext || alarmAudioContext.state === "closed") return;
    const now = alarmAudioContext.currentTime;

    const makeBeep = (startTime, duration, freq) => {
      const osc = alarmAudioContext.createOscillator();
      const gain = alarmAudioContext.createGain();

      osc.type = "square"; // Produces classic digital tone
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + duration - 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(alarmAudioContext.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Dual-beep rhythm (1040 Hz)
    makeBeep(now, 0.085, 1040);
    makeBeep(now + 0.14, 0.085, 1040);
  };

  playDoubleBeep();
  alarmIntervalId = setInterval(playDoubleBeep, 650); // Repeat every 650ms

  // Auto-stop after exactly 10 seconds
  alarmTimeoutId = setTimeout(() => {
    stopMobileAlarmSound();
  }, 10000);
}
```

### E. Manual Alarm Dismissal
```javascript
function dismissAlarm() {
  stopMobileAlarmSound();            // Immediately stops sound & clears timers
  alarmModal.classList.add("hidden"); // Closes visual popup
}
```

---

## 5. System Workflow Diagram

```
[ User Input: Task Name ]
           │
           ▼
[ Click "+ Add" Button ] ──► Creates Task Object ──► Saves to LocalStorage & Renders UI
                                                           │
                                                           ▼
[ Set Alarm Time per Task ] ◄──────────────────────────────┘
           │
           ▼ (Every 1 Second)
[ setInterval Polling Engine Checks: currentTime === task.time ]
           │
     ┌─────┴─────────────────────────────────┐
     ▼                                       ▼
  [ NO MATCH ]                          [ MATCH FOUND ]
     │                                       │
  (Wait)                                     ├─► Set `task.alarmTriggered = true`
                                             ├─► Launch Web Audio Beep (Square Wave @ 1040Hz)
                                             ├─► Display Alarm Modal Popup
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
              [ User Clicks "Stop Alarm" ]                [ 10 Seconds Elapse ]
                       │                                           │
                       └──────────────► Stop Sound ◄───────────────┘
```

---

## 6. Viva Examination & Presentation Q&A Guide

### Q1: Why did you use `setInterval` for the alarm instead of `setTimeout`?
> **Answer:**  
> "`setInterval` runs a continuous polling loop every second. In a to-do application, users can dynamically add tasks, edit existing alarms, complete tasks, or refresh the page at any given moment. `setInterval` provides a unified engine that checks all active tasks against the current system time dynamically without needing to calculate complex future millisecond offsets for multiple simultaneous tasks."

### Q2: What is the purpose of the `task.alarmTriggered` property?
> **Answer:**  
> "A single minute spans 60 seconds (e.g., `09:30:00` to `09:30:59`). Because our polling engine evaluates the condition every 1,000 milliseconds, without the `alarmTriggered` flag, the alarm would trigger 60 separate times during that one minute. Setting `task.alarmTriggered = true` guarantees the alarm executes exactly once per scheduled occurrence."

### Q3: Why is Web Audio API preferred over standard `<audio>` elements or `.mp3` files?
> **Answer:**  
> "Web Audio API generates audio programmatically in real time using software oscillators (`AudioContext`). This offers three key advantages:  
> 1. **Zero External Dependencies:** No external MP3 files need to be hosted or loaded.  
> 2. **No Network Latency or 404s:** Works completely offline without CORS or loading errors.  
> 3. **Precision Control:** We can start, pitch-shift, modulate, and stop the sound instantaneously down to the millisecond."

### Q4: How does data persistence work when the user refreshes or closes the browser?
> **Answer:**  
> "We utilize the browser's `Window.localStorage` API. Whenever a task is created, toggled, deleted, or assigned an alarm, the `saveAndRender()` function is invoked. It serializes the in-memory `tasks` array into a JSON string via `JSON.stringify(tasks)` and stores it. When the script loads, `JSON.parse(localStorage.getItem('pastel_tasks'))` parses the stored string back into our array."

### Q5: How do you prevent Cross-Site Scripting (XSS) when displaying user input?
> **Answer:**  
> "We implemented an `escapeHtml(text)` utility function that injects user-provided strings into a temporary DOM element's `.textContent` property and returns its sanitized `.innerHTML`. This converts sensitive characters such as `<`, `>`, and `&` into safe HTML character entities."

---

## 7. Conclusion

This project successfully fulfills all practical and theoretical requirements of modern client-side web programming. It demonstrates foundational concepts including DOM manipulation, event-driven programming, asynchronous JavaScript, modern CSS architecture, persistent browser storage, and hardware-accelerated audio synthesis.
