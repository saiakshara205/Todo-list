document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const totalTasksSpan = document.getElementById('total-tasks');
    const completedTasksSpan = document.getElementById('completed-tasks');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const notification = document.getElementById('notification');
    
    // State
    let tasks = [];
    let currentFilter = 'all';
    
    // Initialize the app
    init();
    
    function init() {
        loadTasks();
        renderTasks();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Add task
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
        
        // Filter tasks
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
        
        // Clear completed tasks
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    }
    
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskCount();
    }
    
    function addTask() {
        const taskText = taskInput.value.trim();
        
        if (taskText === '') {
            showNotification('Please enter a task', 'error');
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
        showNotification('Task added successfully', 'success');
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = filterTasks();
        
        if (filteredTasks.length === 0) {
            showEmptyState();
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    
    function filterTasks() {
        switch (currentFilter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return [...tasks];
        }
    }
    
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            <div class="task-actions">
                <button class="task-btn edit" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        const checkbox = taskElement.querySelector('.task-checkbox');
        const taskText = taskElement.querySelector('.task-text');
        const editBtn = taskElement.querySelector('.edit');
        const deleteBtn = taskElement.querySelector('.delete');
        
        // Toggle task completion
        checkbox.addEventListener('change', function() {
            task.completed = this.checked;
            taskText.classList.toggle('completed', this.checked);
            saveTasks();
            showNotification(`Task marked as ${task.completed ? 'completed' : 'active'}`, 'success');
        });
        
        // Edit task
        editBtn.addEventListener('click', function() {
            const newText = prompt('Edit your task:', task.text);
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                taskText.textContent = task.text;
                saveTasks();
                showNotification('Task updated successfully', 'success');
            }
        });
        
        // Delete task
        deleteBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
                showNotification('Task deleted', 'success');
            }
        });
        
        return taskElement;
    }
    
    function showEmptyState() {
        let message = '';
        
        switch (currentFilter) {
            case 'active':
                message = 'No active tasks. Add some tasks!';
                break;
            case 'completed':
                message = 'No completed tasks yet. Keep working!';
                break;
            default:
                message = 'Your to-do list is empty. Add your first task!';
        }
        
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>${message}</p>
            </div>
        `;
    }
    
    function clearCompletedTasks() {
        if (!tasks.some(task => task.completed)) {
            showNotification('No completed tasks to clear', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            showNotification('Completed tasks cleared', 'success');
        }
    }
    
    function updateTaskCount() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        
        totalTasksSpan.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
        completedTasksSpan.textContent = `${completed} completed`;
    }
    
    function showNotification(message, type = 'info') {
        notification.textContent = message;
        notification.className = 'notification show';
        notification.classList.add(type);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.className = 'notification hidden';
                notification.classList.remove(type);
            }, 300);
        }, 3000);
    }
});