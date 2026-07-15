const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const itemsLeft = document.getElementById("items-left");
const filters = document.querySelectorAll(".filter");
const clearCompletedBtn = document.getElementById("clear-completed");

let todos = [
    { id: createId(), text: "Review DOM selection methods", completed: false },
    { id: createId(), text: "Practice event delegation", completed: true },
    { id: createId(), text: "Polish README and screenshots", completed: false }
];
let currentFilter = "all";
let editingId = null;
let originalEditText = "";

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTodoElement(todo) {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;
    item.dataset.id = todo.id;

    const toggle = document.createElement("button");
    toggle.className = "toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", todo.completed ? "Mark task active" : "Mark task complete");

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    text.title = "Double-click to edit";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete ${todo.text}`);
    deleteButton.textContent = "x";

    item.append(toggle, text, deleteButton);
    return item;
}

function getVisibleTodos() {
    if (currentFilter === "active") {
        return todos.filter((todo) => !todo.completed);
    }

    if (currentFilter === "completed") {
        return todos.filter((todo) => todo.completed);
    }

    return todos;
}

function renderTodos() {
    todoList.innerHTML = "";
    getVisibleTodos().forEach((todo) => {
        todoList.appendChild(createTodoElement(todo));
    });
    updateStats();
}

function addTodo(text) {
    const trimmedText = text.trim();

    if (!trimmedText) {
        input.focus();
        return;
    }

    todos = [
        ...todos,
        {
            id: createId(),
            text: trimmedText,
            completed: false
        }
    ];

    input.value = "";
    renderTodos();
}

function toggleTodo(id) {
    todos = todos.map((todo) => (
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    renderTodos();
}

function updateStats() {
    const activeCount = todos.filter((todo) => !todo.completed).length;
    const itemWord = activeCount === 1 ? "item" : "items";
    itemsLeft.textContent = `${activeCount} ${itemWord} left`;
    clearCompletedBtn.disabled = !todos.some((todo) => todo.completed);
}

function filterTodos(filter) {
    currentFilter = filter;
    filters.forEach((button) => {
        button.classList.toggle("active", button.dataset.filter === filter);
    });
    renderTodos();
}

function startEditing(item, id) {
    const todo = todos.find((task) => task.id === id);

    if (!todo) {
        return;
    }

    editingId = id;
    originalEditText = todo.text;

    const inputField = document.createElement("input");
    inputField.className = "edit-input";
    inputField.type = "text";
    inputField.value = todo.text;
    inputField.setAttribute("aria-label", "Edit task");

    item.querySelector(".todo-text").replaceWith(inputField);
    inputField.focus();
    inputField.select();
}

function saveEdit(value) {
    const updatedText = value.trim();

    if (!editingId) {
        return;
    }

    if (updatedText) {
        todos = todos.map((todo) => (
            todo.id === editingId ? { ...todo, text: updatedText } : todo
        ));
    }

    editingId = null;
    originalEditText = "";
    renderTodos();
}

function cancelEdit() {
    if (!editingId) {
        return;
    }

    todos = todos.map((todo) => (
        todo.id === editingId ? { ...todo, text: originalEditText } : todo
    ));
    editingId = null;
    originalEditText = "";
    renderTodos();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTodo(input.value);
});

todoList.addEventListener("click", (event) => {
    const item = event.target.closest(".todo-item");

    if (!item) {
        return;
    }

    const { id } = item.dataset;

    if (event.target.classList.contains("delete-btn")) {
        if (editingId) {
            cancelEdit();
        }

        deleteTodo(id);
        return;
    }

    if (editingId) {
        return;
    }

    if (event.target.classList.contains("toggle") || event.target.classList.contains("todo-text")) {
        toggleTodo(id);
    }
});

todoList.addEventListener("dblclick", (event) => {
    const item = event.target.closest(".todo-item");

    if (!item || !event.target.classList.contains("todo-text")) {
        return;
    }

    startEditing(item, item.dataset.id);
});

todoList.addEventListener("keydown", (event) => {
    if (!event.target.classList.contains("edit-input")) {
        return;
    }

    if (event.key === "Enter") {
        saveEdit(event.target.value);
    }

    if (event.key === "Escape") {
        cancelEdit();
    }
});

todoList.addEventListener("focusout", (event) => {
    if (event.target.classList.contains("edit-input")) {
        saveEdit(event.target.value);
    }
});

filters.forEach((button) => {
    button.addEventListener("click", () => filterTodos(button.dataset.filter));
});

clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter((todo) => !todo.completed);
    renderTodos();
});

renderTodos();
