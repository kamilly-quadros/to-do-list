// Select DOM elements
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskPriority = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const filters = {
    all: document.getElementById('filter-all'),
    completed: document.getElementById('filter-completed'),
    incomplete: document.getElementById('filter-incomplete'),
};

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let activeFilter = 'all';

function setPriorityOptions() {
    const selectedTexts = texts[userLanguage];
    const prioritySelect = document.getElementById('task-priority');
    prioritySelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = selectedTexts.chooseAPriority;
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.classList.add('default-option');
    prioritySelect.appendChild(defaultOption);
    const priorities = ['low', 'medium', 'high'];
    priorities.forEach(priority => {
        const option = document.createElement('option');
        option.value = priority;
        option.textContent = selectedTexts[priority];
        prioritySelect.appendChild(option);
    });
}
// Detect the user's language
function detectLanguage() {
    const language = navigator.language || navigator.userLanguage; // Get browser language
    return language.startsWith('pt') ? 'pt' : 'en'; // Return 'pt' for Portuguese or 'en' for English
}
// Set texts based on language
function setLanguageTexts() {
    const selectedTexts = texts[userLanguage];
    document.querySelector('h1').textContent = selectedTexts.title;
    taskTitle.placeholder = selectedTexts.placeholderTitle;
    taskDescription.placeholder = selectedTexts.placeholderDescription;
    document.querySelector('button[type="submit"]').textContent = selectedTexts.addButton;
    filters.all.textContent = selectedTexts.filterAll;
    filters.completed.textContent = selectedTexts.filterCompleted;
    filters.incomplete.textContent = selectedTexts.filterIncomplete;
    setPriorityOptions();
}
// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
// Update filter button states
function updateFilterButtons() {
    Object.values(filters).forEach(button => button.classList.remove('active'));
    filters[activeFilter].classList.add('active');
}
// Render tasks
function renderTasks(filter = 'all') {
    activeFilter = filter;
    updateFilterButtons();
    taskList.innerHTML = '';
    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'incomplete') return !task.completed;
        return true;
    });
    const selectedTexts = texts[userLanguage];
    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = task.isEditing ? `
            <input class="edit-input" type="text" value="${task.title}" placeholder="${selectedTexts.placeholderTitle}" onkeyup="handleEditKeyUp(event, ${index}, 'title')">
            <textarea class="edit-input" placeholder="${selectedTexts.placeholderDescription}" onkeyup="handleEditKeyUp(event, ${index}, 'description')">${task.description}</textarea>
            <div class="edit-options">
                <label>${selectedTexts.priority}:</label>
                <select class="edit-input" onchange="handleEditChange(${index}, 'priority', this.value)">
                    <option value="" ${task.priority === '' ? 'selected' : ''} disabled>${selectedTexts.chooseAPriority}</option>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>${selectedTexts.low}</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>${selectedTexts.medium}</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>${selectedTexts.high}</option>
                </select>
                <button onclick="saveEdit(${index})">Save</button>
                <button onclick="cancelEdit(${index})">Cancel</button>
            </div>
        ` : `
            <div class="task-details">
                <div><input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleComplete(${index})"><strong>${task.title}</strong></div>
                <div><label>${task.description}</label></div>
                <div class="task-meta">
                    <span>${selectedTexts.priority}: ${selectedTexts[task.priority] || selectedTexts.chooseAPriority}</span>
                    <div class="actions">
                        <img src="./assets/pencil.png" onclick="editTask(${index})"/>
                        <img src="./assets/bin.png" onclick="deleteTask(${index})"/>
                    </div>
                </div>
            </div>
        `;
        taskList.appendChild(li);
    });
}
// Add task
function addTask(event) {
    event.preventDefault();
    if (taskPriority.value === '') {
        alert(texts[userLanguage].chooseAPriority);
        return;
    }
    const newTask = {
        title: taskTitle.value,
        description: taskDescription.value,
        priority: taskPriority.value,
        completed: false,
        isEditing: false,
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks(activeFilter);
    taskForm.reset();
    setPriorityOptions();
}
// Toggle task completion
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks(activeFilter);
}
// Edit task
function editTask(index) {
    tasks[index].isEditing = true;
    renderTasks(activeFilter);
}
// Save edited task
function saveEdit(index) {
    const li = taskList.children[index];
    const editInputs = li.querySelectorAll('.edit-input');
    tasks[index].title = editInputs[0].value;
    tasks[index].description = editInputs[1].value;
    tasks[index].priority = editInputs[2].value;
    tasks[index].isEditing = false;
    saveTasks();
    renderTasks(activeFilter);
}
// Cancel editing task
function cancelEdit(index) {
    tasks[index].isEditing = false;
    renderTasks(activeFilter);
}
// Handle keyup during editing
function handleEditKeyUp(event, index, field) {
    if (event.key === 'Enter') {
        saveEdit(index);
    }
}
// Handle change during editing
function handleEditChange(index, field, value) {
    tasks[index][field] = value;
}
// Delete task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(activeFilter);
}

// Event listeners
taskForm.addEventListener('submit', addTask);
Object.entries(filters).forEach(([filter, button]) => {
    button.addEventListener('click', () => renderTasks(filter));
});

// Detect and apply language
const userLanguage = detectLanguage();
setLanguageTexts();

// Initial render
renderTasks();
