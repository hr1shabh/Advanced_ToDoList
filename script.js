
let todoItems = [];

function searchItem() {
  const searchTerm = document.getElementById("searchItem").value.trim().toLowerCase();

  const filteredItems = todoItems.filter(item => {
    if (item.title.toLowerCase() === searchTerm) {
      return true;
    }
    if (item.title.toLowerCase().includes(searchTerm)) {
      return true;
    }
    const keywords = searchTerm.split(" ");
    if (keywords.every(keyword => item.title.toLowerCase().includes(keyword))) {
      return true;
    }
    if (item.tags.some(tag => tag.toLowerCase() === searchTerm)) {
      return true;
    }
    return false;
  });

  renderTodoList(filteredItems);
}

document.getElementById("searchItem").addEventListener("keyup", searchItem);

function sortTodoList() {
  const sortBy = document.getElementById("sort").value;

  if (sortBy === "due-date") {
    todoItems.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortBy === "priority") {
    todoItems.sort((a, b) => {
      const priorityOrder = { low: 3, medium: 2, high: 1 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  } else {
    return;
  }

  renderTodoList();
}

function applyFilters() {
  const dueDateFilterValue = document.getElementById("dueDateFilter").value.trim();
  const categoryFilterValue = document.getElementById("categoryFilter").value;
  const priorityFilterValue = document.getElementById("priorityFilter").value;
  const taskStatusFilterValue = document.getElementById("taskStatusFilter").value;

  const filters = {
    dueDate: dueDateFilterValue === "" ? null : new Date(dueDateFilterValue),
    category: categoryFilterValue === "all" ? null : categoryFilterValue,
    priority: priorityFilterValue === "none" ? null : priorityFilterValue,
    taskStatus: taskStatusFilterValue === "all" ? null : taskStatusFilterValue,
  };

  const filteredItems = todoItems.filter(item => {
    const dueDateMatch = filters.dueDate === null || new Date(item.dueDate) <= filters.dueDate;

    const categoryMatch = filters.category === null || item.category === filters.category;

    const priorityMatch = filters.priority === null || item.priority === filters.priority;

    const today = new Date();
    const taskStatusMatch =
      filters.taskStatus === null ||
      (filters.taskStatus === "marked-done" && item.done) ||
      (filters.taskStatus === "marked-undone" && !item.done) ||
      (filters.taskStatus === "missing" && !item.done && isMissing(item.dueDate, today));
    
    function isMissing(dueDateTime, currentDateTime) {
      if (dueDateTime < currentDateTime) {
        return true; 
      } else if (dueDateTime.toDateString() === currentDateTime.toDateString()) {
        const dueTime = dueDateTime.getHours() * 60 + dueDateTime.getMinutes();
        const currentTime = currentDateTime.getHours() * 60 + currentDateTime.getMinutes();
        return dueTime < currentTime;
      } else {
        return false; 
      }
    }
    
    return dueDateMatch && categoryMatch && priorityMatch && taskStatusMatch;
  });

  renderTodoList(filteredItems); 
}

function addItem() {
  const todoTitle = document.getElementById("todoTitle").value.trim();
  const todoDescription = document.getElementById("todoDescription").value.trim();
  const dueDate = new Date(document.getElementById("dueDate").value); // Convert to Date object
  const category = document.getElementById("category").value;
  const priority = document.getElementById("priority").value;
  const tags = document.getElementById("tags").value.trim();

  if (todoTitle === "" || dueDate === "" || category === "" || priority === "") {
    alert("Please fill in all required fields.");
    return;
  }

  const newTodoItem = {
    title: todoTitle,
    description: todoDescription,
    dueDate: dueDate, 
    category: category,
    priority: priority,
    createdDate: new Date(),
    updateDate: new Date(),
    tags: tags.split(",").map(tag => tag.trim()),
  };

  todoItems.push(newTodoItem);
  saveTodoList();
  renderTodoList();

  document.getElementById("todoTitle").value = "";
  document.getElementById("todoDescription").value = "";
  document.getElementById("dueDate").value = "";
  document.getElementById("category").value = "";
  document.getElementById("priority").value = "";
  document.getElementById("tags").value = "";
}

function deleteItem(index) {
  todoItems.splice(index, 1);
  saveTodoList();
  renderTodoList();
}

function editItem(index) {
  const listItem = document.getElementById(`item-${index}`);
  if (!listItem) return; // Check if the list item exists
  const todoTitle = listItem.querySelector(".todo-title");
  const todoDescription = listItem.querySelector(".todo-description");
  const dueDate = listItem.querySelector(".due-date");
  const category = listItem.querySelector(".category");
  const priority = listItem.querySelector(".priority");
  const tags = listItem.querySelector(".tags");
  const editButton = listItem.querySelector(".edit-button");
  const saveButton = listItem.querySelector(".save-button");

  todoTitle.disabled = false;
  todoDescription.disabled = false;
  dueDate.disabled = false; 
  category.disabled = false;
  priority.disabled = false;
  tags.disabled = false;

  editButton.style.display = "none";
  saveButton.style.display = "inline-block";
}

function saveItem(index) {
  const listItem = document.getElementById(`item-${index}`);
  if (!listItem) return; // Check if the list item exists
  const todoTitle = listItem.querySelector(".todo-title");
  const todoDescription = listItem.querySelector(".todo-description");
  const dueDate = listItem.querySelector(".due-date");
  const category = listItem.querySelector(".category");
  const priority = listItem.querySelector(".priority");
  const tags = listItem.querySelector(".tags");
  const editButton = listItem.querySelector(".edit-button");
  const saveButton = listItem.querySelector(".save-button");

  todoItems[index].title = todoTitle.value.trim();
  todoItems[index].description = todoDescription.value.trim();
  todoItems[index].dueDate = new Date(dueDate.value); // Use the Date object for dueDate
  todoItems[index].category = category.value;
  todoItems[index].priority = priority.value;
  todoItems[index].tags = tags.value.trim().split(",").map(tag => tag.trim());
  todoItems[index].updateDate = new Date();

  todoTitle.disabled = true;
  todoDescription.disabled = true;
  dueDate.disabled = true; 
  category.disabled = true;
  priority.disabled = true;
  tags.disabled = true;

  saveButton.style.display = "none";
  editButton.style.display = "inline-block";

  saveTodoList();
  renderTodoList();
}


function markAsDoneOrUndone(index) {
  const listItem = document.getElementById(`item-${index}`);
  if (!listItem) return;
  const markAsDoneButton = listItem.querySelector(".mark-as-done-button");

  todoItems[index].done = !todoItems[index].done;

  markAsDoneButton.textContent = todoItems[index].done ? "Mark as Undone" : "Mark as Done";
  markAsDoneButton.classList.toggle("mark-as-done", todoItems[index].done);
  markAsDoneButton.classList.toggle("mark-as-undone", !todoItems[index].done);

  saveTodoList();
  renderTodoList();
}

function renderTodoList(filteredItems = null) {
  const todoListContainer = document.getElementById("todoList");
  todoListContainer.innerHTML = "";

  const itemsToRender = filteredItems ? filteredItems : todoItems;

  itemsToRender.forEach((item, index) => {
    const li = document.createElement("li");
    li.id = `item-${index}`;
    li.setAttribute("draggable", "true");
    li.innerHTML = `
      Title: <input class="todo-title" type="text" value="${item.title}" disabled><br>
      Description: <input class="todo-description" type="text" value="${item.description}" disabled><br>
      Due Date: <input class="due-date" type="datetime-local" value="${getFormattedDateTime(item.dueDate)}" disabled><br>
      Category: <select class="category" disabled>
          <option value="work" ${item.category === 'work' ? 'selected' : ''}>Work</option>
          <option value="study" ${item.category === 'study' ? 'selected' : ''}>Study</option>
          <option value="business" ${item.category === 'business' ? 'selected' : ''}>Business</option>
          <option value="home" ${item.category === 'home' ? 'selected' : ''}>Home</option>
          <option value="personal" ${item.category === 'personal' ? 'selected' : ''}>Personal</option>
          <option value="hobby" ${item.category === 'hobby' ? 'selected' : ''}>Hobby</option>
        </select><br>
      Priority: <select class="priority" disabled>
          <option value="low" ${item.priority === 'low' ? 'selected' : ''}>Low</option>
          <option value="medium" ${item.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="high" ${item.priority === 'high' ? 'selected' : ''}>High</option>
        </select><br>
      Tags: <input class="tags" type="text" value="${item.tags.join(", ")}" disabled><br>
      <div class="btn">
      <button class="edit-button" onclick="editItem(${index})">Edit</button>
      <button class="save-button" style="display: none;" onclick="saveItem(${index})">Save</button>
      <button class="delete-button" onclick="deleteItem(${index})">Delete</button> <!-- Delete button -->
      <button class="mark-as-done-button" onclick="markAsDoneOrUndone(${index})">${item.done ? "Mark as Undone" : "Mark as Done"}</button>
      <div/>
    `;

    todoListContainer.appendChild(li);
  });

}
function getFormattedDateTime(dateTime) {
  const year = dateTime.getFullYear();
  const month = `${dateTime.getMonth() + 1}`.padStart(2, "0");
  const day = `${dateTime.getDate()}`.padStart(2, "0");
  const hours = `${dateTime.getHours()}`.padStart(2, "0");
  const minutes = `${dateTime.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


let draggedIndex = null; 

function handleDragStart(event) {
  draggedIndex = parseInt(event.target.id.split("-")[1]);
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  const targetIndex = parseInt(event.target.id.split("-")[1]);
  if (draggedIndex !== null && targetIndex !== draggedIndex) {
    const draggedItem = todoItems[draggedIndex];
    todoItems.splice(draggedIndex, 1);
    todoItems.splice(targetIndex, 0, draggedItem);
    saveTodoList();
    renderTodoList();
  }
}

const todoListContainer = document.getElementById("todoList");
todoListContainer.addEventListener("dragstart", handleDragStart);
todoListContainer.addEventListener("dragover", handleDragOver);
todoListContainer.addEventListener("drop", handleDrop);




function saveTodoList() {
  localStorage.setItem("todoList", JSON.stringify(todoItems));
}

function loadTodoList() {
  const todoListString = localStorage.getItem("todoList");
  todoItems = todoListString ? JSON.parse(todoListString) : [];

  todoItems.forEach(item => {
    item.dueDate = new Date(item.dueDate);
  });
}


loadTodoList();
renderTodoList();