# 🌸 Pastel To-Do List Application

A modern, clean, and aesthetically pleasing To-Do List web application built with **HTML5**, **Tailwind CSS**, and **Vanilla JavaScript**. Designed with a soft pastel color palette, rounded cards, subtle shadows, and beginner-friendly, well-commented code.

---

## 🎨 Features & Design Highlights

- **Soft Pastel Aesthetics**: Gentle lavender, purple, and slate palette with soft diffused drop shadows and rounded corners (`rounded-3xl` container, `rounded-2xl` task cards).
- **Task Management**:
  - Add tasks via the input field and button (or by pressing **Enter**).
  - Mark tasks as completed using custom styled checkboxes (triggers strikethrough styling and soft mute).
  - Delete individual tasks with a sleek trash icon button.
  - "Clear completed" option to quickly clean up finished tasks.
- **Dynamic Stats & Date**:
  - Shows today's formatted date automatically (e.g., *Saturday, Sep 26*).
  - Live progress counter badge showing how many tasks are done (e.g., `2 / 5 done`).
  - Friendly empty state illustration when no tasks are present.
- **Persistent Storage**:
  - Uses browser `localStorage` so tasks remain saved even if the browser is closed or refreshed.

---

## 📁 File Structure

```text
To Do list/
├── index.html   # Main HTML structure with Tailwind CDN & semantic layout
├── style.css    # Custom CSS for smooth animations, custom scrollbar & checkboxes
├── app.js       # Simple, well-commented Vanilla JavaScript logic
└── README.md    # Project documentation and teacher explanation guide
```

---

## 🧑‍🏫 Teacher Explanation Guide (How to Explain Your Code)

If your teacher asks you to explain how your code works, here is a simple step-by-step breakdown:

### 1. HTML (`index.html`)
- **Semantic Structure**: Uses `<header>`, `<main>`, `<section>`, and `<form>` for clean, accessible web markup.
- **Tailwind CSS**: Loaded via CDN to style inputs, buttons, colors, and responsive layouts without writing hundreds of lines of raw CSS.
- **Fonts**: Imports Google's **Plus Jakarta Sans** for a modern, sleek typographic hierarchy.

---

### 2. JavaScript (`app.js`)
The JavaScript code is divided into 5 clear sections:

#### **Section 1: DOM Elements (`document.getElementById`)**
We store references to our HTML tags inside JavaScript variables so we can read from them or update them later.
- `taskInput`: Reads whatever the user types.
- `taskList`: The `<ul>` container where we dynamically inject our `<li>` items.
- `statsText`: Updates the counter.

#### **Section 2: State Management & Local Storage**
- We store all tasks in a JavaScript array called `tasks`.
- Each task is an **object**: `{ id: 1695758000, text: "Study JS", completed: false }`.
- `localStorage.getItem("pastel_tasks")`: Retrieves saved tasks on page load.
- `JSON.parse()`: Converts the saved JSON string back into a JavaScript array.

#### **Section 3: Core Functions**
- **`addTask(e)`**:
  - `e.preventDefault()` prevents the page from refreshing when the form is submitted.
  - `.trim()` removes accidental spaces from the beginning and end of the text.
  - Validates that the input is not empty before adding.
  - Uses `tasks.unshift(newTask)` to place the latest task at the top of the list.
  - Calls `saveAndRender()` to update storage and redraw the UI.
- **`renderTasks()`**:
  - Clears `taskList.innerHTML = ""` to prevent duplicate items.
  - Checks if the array is empty (`tasks.length === 0`) to show or hide the empty state message.
  - Loops over `tasks` with `.forEach()` and creates an `<li>` element for each item.
  - Attaches `addEventListener` to the checkbox and delete button for each task.
- **`toggleTask(index)`**:
  - Flips `task.completed` between `true` and `false`.
- **`deleteTask(index)`**:
  - Uses `tasks.splice(index, 1)` to remove the item at that position.
- **`updateStats()`**:
  - Calculates completed vs total tasks using `array.filter()`.

#### **Section 4: Event Listeners**
- `todoForm.addEventListener("submit", addTask)`: Listens for clicking the "Add" button OR pressing the Enter key inside the form.

---

## 💡 Quick Q&A for Viva / Presentation

**Q1: Why did you use `e.preventDefault()` in `addTask`?**  
> *"When a form is submitted in HTML, the browser's default behavior is to reload the page. `e.preventDefault()` stops that reload so our single-page application remains responsive and keeps our data."*

**Q2: How does the checkbox create a strikethrough effect?**  
> *"When the checkbox is clicked, we toggle the task's `completed` boolean property. In `renderTasks()`, if `task.completed` is true, we apply Tailwind's `line-through` and `text-slate-400` classes to the task text."*

**Q3: How does the delete button know which task to delete?**  
> *"When rendering each task inside `.forEach((task, index) => ...)`, we pass the task's `index` into `deleteTask(index)`. The function then calls `tasks.splice(index, 1)` to remove that exact item from the array."*

**Q4: How do tasks stay saved when you refresh?**  
> *"We use browser `localStorage`. Every time a task is added, checked, or deleted, we call `saveAndRender()`, which converts the array to a string using `JSON.stringify()` and saves it. When the page reloads, `JSON.parse()` reads it back into memory."*

---

## 🚀 How to Run the App

1. Simply double-click `index.html` to open it in any web browser (Chrome, Edge, Brave, Firefox, etc.).
2. No complex server or installations required!
