// Select DOM elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Load tasks from local storage on startup
document.addEventListener('DOMContentLoaded', loadTasks);

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
taskList.addEventListener('click', handleTaskAction);
themeToggle.addEventListener('click', toggleTheme);

// --- Functions ---

/**
 * Adds a new task to the list and saves it to local storage.
 */
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    // Create task object
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    // Render task to UI
    renderTask(task);

    // Save to local storage
    saveTaskToStorage(task);

    // Clear input
    taskInput.value = '';
}

/**
 * Renders a single task element to the DOM.
 * @param {Object} task - The task object containing id, text, and completed status.
 */
function renderTask(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
        <span class="task-content">${escapeHtml(task.text)}</span>
        <div class="task-actions">
            <button class="btn-complete" aria-label="Complete Task">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn-delete" aria-label="Delete Task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    taskList.appendChild(li);
}

/**
 * Handles click events on the task list (delegation for complete/delete).
 * @param {Event} e - The click event.
 */
function handleTaskAction(e) {
    const item = e.target;
    const taskItem = item.closest('.task-item');
    
    if (!taskItem) return;

    const taskId = parseInt(taskItem.dataset.id);

    // Check if Complete button was clicked
    if (item.closest('.btn-complete')) {
        taskItem.classList.toggle('completed');
        updateTaskStatus(taskId);
    }

    // Check if Delete button was clicked
    if (item.closest('.btn-delete')) {
        taskItem.style.opacity = '0';
        setTimeout(() => {
            taskItem.remove();
            deleteTaskFromStorage(taskId);
        }, 300); // Wait for animation
    }
}

/**
 * Toggles between Dark and Light mode.
 */
function toggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';

    if (isDark) {
        body.removeAttribute('data-theme');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

// --- Local Storage Helpers ---

function saveTaskToStorage(task) {
    const tasks = getTasksFromStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromStorage() {
    return localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
}

function loadTasks() {
    // Load Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    // Load Tasks
    const tasks = getTasksFromStorage();
    tasks.forEach(task => renderTask(task));
}

function updateTaskStatus(id) {
    const tasks = getTasksFromStorage();
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function deleteTaskFromStorage(id) {
    let tasks = getTasksFromStorage();
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Basic XSS prevention for rendering user input.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
