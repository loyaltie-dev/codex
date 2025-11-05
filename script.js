// Simple To-Do list with localStorage persistence and filters

const STORAGE_KEY = 'simple_todo_tasks_v1';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = [];
let filter = 'all'; // all | active | completed

// --- storage ---
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  tasks = raw ? JSON.parse(raw) : [];
}

// --- task operations ---
function addTask(text) {
  const task = {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false
  };
  tasks.unshift(task); // newest first
  saveTasks();
  render();
}

function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) t.completed = !t.completed;
  saveTasks();
  render();
}

function updateTaskText(id, newText) {
  const t = tasks.find(t => t.id === id);
  if (t) t.text = newText.trim();
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

// --- rendering ---
function render() {
  // filter tasks
  const visible = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  // update list DOM
  taskList.innerHTML = '';
  visible.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task' + (t.completed ? ' completed' : '');
    li.dataset.id = t.id;

    const chk = document.createElement('button');
    chk.className = 'checkbox';
    chk.setAttribute('aria-pressed', String(!!t.completed));
    chk.title = t.completed ? 'Mark as active' : 'Mark as completed';
    chk.innerHTML = t.completed ? '&#10003;' : '';

    const label = document.createElement('div');
    label.className = 'label';
    label.contentEditable = true;
    label.spellcheck = false;
    label.textContent = t.text;
    label.title = 'Double-click or edit text to change';

    // prevent creating blank items when editing
    label.addEventListener('blur', () => {
      const newText = label.textContent || '';
      if (newText.trim() === '') {
        // If emptied, remove the task
        removeTask(t.id);
      } else {
        updateTaskText(t.id, newText);
      }
    });

    // pressing Enter while editing blurs instead of inserting newline
    label.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        label.blur();
      }
    });

    const del = document.createElement('button');
    del.className = 'delete';
    del.title = 'Delete';
    del.textContent = '✕';

    li.appendChild(chk);
    li.appendChild(label);
    li.appendChild(del);
    taskList.appendChild(li);
  });

  // update items left
  const left = tasks.filter(t => !t.completed).length;
  itemsLeft.textContent = `${left} item${left !== 1 ? 's' : ''} left`;
}

// --- events ---
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value;
  if (text.trim() === '') return;
  addTask(text);
  taskInput.value = '';
  taskInput.focus();
});

// event delegation for list (toggle/delete)
taskList.addEventListener('click', (e) => {
  const li = e.target.closest('li.task');
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.classList.contains('checkbox')) {
    toggleTask(id);
  } else if (e.target.classList.contains('delete')) {
    removeTask(id);
  }
});

// filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

// initialize
loadTasks();
render();