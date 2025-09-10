/**
 * Renders the task board by categorizing and displaying tasks.
 * @param {Object} tasks - The tasks to render.
 */
function renderBoard(tasks) {
  removeTasks();
  removePlaceholder();

  if (tasks) {
    let categories = {};
    let entries = Object.entries(tasks);

    entries.forEach((task) => {
      if (!categories[task[1].status]) categories[task[1].status] = [];
      categories[task[1].status].push(task);
    });
    loopThroughCategories(categories);
  }
  addPlaceholdersToEmptyColumns();
}

/**
 * Loops through task categories and renders tasks in their respective columns.
 * @param {Object} categories - The categorized tasks.
 */
function loopThroughCategories(categories) {
  for (let status in categories) {
    let column = document.querySelector(`.column[data-task="${status}"]`);
    let taskWrapper = column.querySelector(".task-wrapper");

    if (taskWrapper) {
      let sortedTasks = categories[status].sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0));

      sortedTasks.forEach((task) => {
        let taskTemplate = createTaskTemplate(task[0], task[1]);
        taskWrapper.innerHTML += taskTemplate;
      });
    }
  }
}

/**
 * Removes all tasks from the board.
 */
function removeTasks() {
  const taskWrappers = document.querySelectorAll(".task-wrapper");
  taskWrappers.forEach((taskWrapper) => {
    taskWrapper.querySelectorAll(".task").forEach((task) => task.remove());
  });
}

/**
 * Removes placeholder elements from the board.
 */
function removePlaceholder() {
  const taskWrappers = document.querySelectorAll(".task-wrapper");
  taskWrappers.forEach((taskWrapper) => {
    taskWrapper.querySelectorAll(".empty").forEach((empty) => empty.remove());
  });
}

/**
 * Creates a CSS class name for a given category.
 * @param {string} category - The category name.
 * @returns {string} - The formatted class name.
 */
function createCategoryClass(category) {
  return category.toLowerCase().split(" ").join("-");
}

/**
 * Checks if a task has subtasks and generates progress HTML.
 * @param {Array} subtasks - The subtasks of a task.
 * @returns {string} - The progress HTML or an empty string.
 */
function checkForSubtask(subtasks) {
  if (subtasks) {
    let progressHTML = "";
    const numerus = subtasks.length === 1 ? "Subtask" : "Subtasks";
    const subtaskDone = subtasks.filter((subtask) => subtask.checked);
    progressHTML += createProgressWrapper(subtasks, numerus, subtaskDone);
    return progressHTML;
  } else {
    return "";
  }
}

/**
 * Generates HTML for assigned users.
 * @param {Array} assignedUserArr - Array of assigned users.
 * @returns {string} - The HTML for assigned users or an empty string.
 */
function checkForAssignment(assignedUserArr) {
  if (assignedUserArr) {
    let personHTML = "";
    const total = assignedUserArr.length;

    for (let i = 0; i < total; i++) {
      const user = assignedUserArr[i];
      if (i < 4) {
        let username = createUsernameAbbreviation(user);
        personHTML += createPersonTemplate(user, username);
      } else {
        let remainingPersons = total - 4;
        personHTML += createMorePersonsTemplate(remainingPersons);
        break;
      }
    }
    return personHTML;
  } else {
    return "";
  }
}

/**
 * Creates an abbreviation for a user's name.
 * @param {Object} userObj - The user object.
 * @returns {string} - The username abbreviation.
 */
function createUsernameAbbreviation(userObj) {
  let usernameArr = userObj.name.split(" ");
  if (usernameArr.length > 1) {
    let usernameAbbr = usernameArr[0][0] + usernameArr[1][0];
    return usernameAbbr;
  }
}

/**
 * Adds placeholders to empty columns on the board.
 */
function addPlaceholdersToEmptyColumns() {
  const taskWrappers = document.querySelectorAll(".task-wrapper");
  taskWrappers.forEach((taskWrapper) => {
    if (!taskWrapper.querySelector(".task") && !taskWrapper.querySelector(".empty")) {
      if (taskWrapper.dataset.category === "done") {
        taskWrapper.innerHTML += createTaskPlaceholderDone();
      } else {
        taskWrapper.innerHTML += createTaskPlaceholder();
      }
    }
  });
}

/**
 * Renders a detailed view of a selected task.
 * @param {string} taskId - The ID of the task to render.
 */
async function renderSelectedTask(taskId) {
  const overlayRef = document.getElementById("overlay");
  const task = await loadData(`tasks/${taskId}`);

  overlayRef.innerHTML = "";
  overlayRef.innerHTML += createDetailedTaskTemplate(taskId, task);
  openOverlay();
}

/**
 * Generates HTML for assigned users in the detail view.
 * @param {Array} assignedUserArr - Array of assigned users.
 * @returns {string} - The HTML for assigned users or an empty string.
 */
function checkForAssignmentDetailView(assignedUserArr) {
  if (assignedUserArr) {
    return createPersonTemplateDetailView(assignedUserArr);
  } else {
    return "";
  }
}

/**
 * Creates a list of assigned users.
 * @param {Array} assignedUserArr - Array of assigned users.
 * @returns {string} - The HTML list of assigned users.
 */
function createPersonList(assignedUserArr) {
  let html = "";
  assignedUserArr.forEach((userObj) => {
    let username = createUsernameAbbreviation(userObj);
    html += createPersonListItem(userObj, username);
  });
  return html;
}

/**
 * Generates HTML for subtasks in the detail view.
 * @param {string} taskId - The ID of the task.
 * @param {Array} subtaskArr - Array of subtasks.
 * @returns {string} - The HTML for subtasks or an empty string.
 */
function checkForSubtasksDetailView(taskId, subtaskArr) {
  if (subtaskArr) {
    return createSubtaskTemplate(taskId, subtaskArr);
  } else {
    return "";
  }
}

/**
 * Creates a list of subtasks.
 * @param {string} taskId - The ID of the task.
 * @param {Array} subtaskArr - Array of subtasks.
 * @returns {string} - The HTML list of subtasks.
 */
function createSubtaskList(taskId, subtaskArr) {
  let html = "";
  subtaskArr.forEach((subtaskObj) => {
    html += createSubtaskListItem(taskId, subtaskObj);
  });
  return html;
}

/**
 * Toggles the completion status of a subtask and updates the task's progress.
 * @param {string} taskId - The ID of the task containing the subtask.
 * @param {string} subtaskId - The ID of the subtask to toggle.
 */
async function checkInOutSubtask(taskId, subtaskId) {
  let taskObj = await loadData("tasks/" + taskId);
  let subtaskRef = document.querySelector(`.btn-subtask[data-id="${subtaskId}"]`);
  let subtask = taskObj.subtask.find((subtask) => subtask.id == subtaskId);
  let selectedTask = document.getElementById(`${taskId}`);
  let subtaskProgress = selectedTask.querySelector(".progress-wrapper");
  subtaskRef.classList.toggle("checked");

  await createSubtaskTemplates(taskId, taskObj, subtask, subtaskProgress);
}

/**
 * Updates the subtask's completion status and refreshes the task's progress display.
 * @param {string} taskId - The ID of the task containing the subtask.
 * @param {Object} taskObj - The task object containing all subtasks.
 * @param {Object} subtask - The subtask object to update.
 * @param {HTMLElement} subtaskProgress - The progress wrapper element to update.
 */
async function createSubtaskTemplates(taskId, taskObj, subtask, subtaskProgress) {
  if (subtask) {
    subtask.checked = !subtask.checked;
    await putData("tasks/" + taskId, taskObj);
    if (subtaskProgress) {
      const numerus = taskObj.subtask.length === 1 ? "Subtask" : "Subtasks";
      const subtaskDone = taskObj.subtask.filter((st) => st.checked);
      subtaskProgress.innerHTML = progessTemplate(taskObj.subtask, numerus, subtaskDone);
    }
  }
}

/**
 * Deletes a task from database and reinitializes the board.
 * @param {string} path - Path to the task resource.
 */
async function deleteTask(path) {
  await deleteData(path);
  closeOverlay();
  try {
    await initBoard();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Searches tasks by user input and updates task visibility.
 */
async function searchTasks() {
  const tasks = await loadData("/tasks");
  const desktopInput = document.getElementById("search-input-desktop").value.toLowerCase();
  const mobileInput = document.getElementById("search-input-mobile").value.toLowerCase();
  const searchInput = desktopInput || mobileInput;
  const tasksObjLength = Object.keys(tasks).length;

  toggleResults(tasks, searchInput);
  managePlaceholders(tasksObjLength, searchInput);
}

/**
 * Toggles visibility of tasks based on search input.
 * @param {Object} tasks - All tasks.
 * @param {string} searchInput - User's search query.
 */
function toggleResults(tasks, searchInput) {
  for (let task in tasks) {
    const taskElement = document.querySelector(`.task[data-id="${task}"]`);
    if (taskElement) {
      const isVisible = tasks[task].title.toLowerCase().includes(searchInput) || tasks[task].description.toLowerCase().includes(searchInput);
      taskElement.classList.toggle("hidden", !isVisible);
    }
  }
}

/**
 * Manages placeholder elements depending on search results.
 * @param {number} tasksObjLength - Total number of tasks.
 * @param {string} searchInput - User's search query.
 */
function managePlaceholders(tasksObjLength, searchInput) {
  document.querySelectorAll(".empty").forEach((element) => element.classList.add("hidden"));
  const taskElements = document.querySelectorAll(".task.hidden");
  checkIfNoResults(tasksObjLength, taskElements);

  if (!searchInput) {
    document.querySelectorAll(".empty").forEach((element) => element.classList.remove("hidden"));
  }
}

/**
 * Displays "no results" message if no tasks match the search.
 * @param {number} totalTaskCount - Total tasks.
 * @param {NodeList} hiddenTaskElements - Hidden tasks after search.
 */
function checkIfNoResults(totalTaskCount, hiddenTaskElements) {
  let noResultsRef = document.querySelector(".no-results");
  let doneLastChild = document.querySelector('.column[data-task="done"]');

  if (totalTaskCount === hiddenTaskElements.length) {
    noResultsRef.classList.remove("hidden");
    doneLastChild.classList.add("no-padding-bottom");
  } else {
    noResultsRef.classList.add("hidden");
    doneLastChild.classList.remove("no-padding-bottom");
  }
}

/**
 * Loads a task for editing and prepares overlay.
 * @param {string} taskId - ID of the task to edit.
 */
async function editTask(taskId) {
  const task = await loadData(`tasks/${taskId}`);
  resetTaskData();
  prepareOverlay(taskId);
  await loadUsersTask();
  importEditElements(task);
  activePriority(task.priority);
  changeCategorie(task);
  loadSubTasks(task.subtask);
  renderAssignedUsers(task);
}

/**
 * Prepares overlay content for editing a task.
 * @param {string} taskId - ID of the task.
 */
function prepareOverlay(taskId) {
  const overlayContent = document.querySelector(".overlay-content");
  overlayContent.innerHTML = "";
  overlayContent.innerHTML += editTaskTpl();
  overlayContent.innerHTML += okBtn(taskId);
}

/**
 * Resets temporary task-related arrays.
 */
function resetTaskData() {
  subtask = [];
  users = [];
  assignedUserArr = [];
}

/**
 * Imports editable task elements into overlay form.
 * @param {Object} task - Task data.
 */
function importEditElements(task) {
  const editTaskContainer = document.querySelector(".editTask-container");
  editTaskContainer.innerHTML += titleTaskTpl(task.title);
  editTaskContainer.innerHTML += descriptionTaskTpl(task.description);
  editTaskContainer.innerHTML += dateTaskTpl(task.date);
  editTaskContainer.innerHTML += prioTaskTpl();
  editTaskContainer.innerHTML += assignedTaskTpl();
  editTaskContainer.innerHTML += categoryTaskTpl();
  editTaskContainer.innerHTML += subtaskTpl();
  taskStatus = task.status;
  order = task.order;
}

/**
 * Updates task category in the edit overlay.
 * @param {Object} task - Task data.
 */
function changeCategorie(task) {
  let selectCategory = document.getElementById("select-category");
  selectCategory.innerHTML = task.category;
}

/**
 * Loads subtasks into the edit overlay.
 * @param {Array} arr - Subtasks array.
 */
function loadSubTasks(arr) {
  const subList = document.getElementById("sub-list");
  if (!arr) return;
  arr.forEach((task) => {
    subtask.push(task);
    task.edit = false;
    subList.innerHTML += subListItem(task.value, task.id);
  });
}

/**
 * Renders assigned users in the edit overlay.
 * @param {Object} task - Task data.
 */
function renderAssignedUsers(task) {
  if (!task.assigned) return;
  task.assigned.forEach((user) => {
    assignedUser(user.name);
  });
}

/**
 * Saves an edited task and updates the board.
 * @param {string} taskId - Task ID.
 */
async function saveEditedTask(taskId) {
  if (!taskId) return;
  let path = "tasks/" + taskId;
  let validateTask = isTaskDataValid();
  if (!validateTask) return;
  let task = taskObjTemplate(selectedPriority, assignedUserArr, subtask, taskStatus);
  await putData(path, task);
  await initBoard();
  await renderOpenTask(taskId);
  resetTaskData();
}

/**
 * Renders a task in detailed view.
 * @param {string} taskId - Task ID.
 */
async function renderOpenTask(taskId) {
  const overlayRef = document.getElementById("overlay");
  const task = await loadData(`tasks/${taskId}`);
  overlayRef.innerHTML = "";
  let taskTemplate = createDetailedTaskTemplate(taskId, task).replace("transit", "");
  overlayRef.innerHTML += taskTemplate;
}

/**
 * Creates a new task from board form and updates board.
 */
async function renderTaskFromBoard() {
  let validate = isTaskDataValid();
  if (!validate) return;
  await createTaskForm();
  closeAddTask();
  clearTaskFormContainers();
  await initBoard();
}

/**
 * Clears task form containers on the board.
 */
function clearTaskFormContainers() {
  let firstBoardAddTask = document.getElementById("firstBoardAddTask");
  let secondBoardAddTask = document.getElementById("secondBoardAddTask");
  firstBoardAddTask.innerHTML = "";
  secondBoardAddTask.innerHTML = "";
}

/**
 * Handles hover event over placeholder.
 * @param {Event} event - Hover event.
 */
function placeholderHover(event) {
  event.preventDefault();
  adjustPlaceholders();
}

/**
 * Adjusts placeholders for empty task columns.
 */
function adjustPlaceholders() {
  removePlaceholder();
  addPlaceholdersToEmptyColumns();
}

/**
 * Destroys all active Sortable.js instances.
 */
function destroySortableInstances() {
  sortableInstances.forEach((instance) => instance.destroy());
  sortableInstances = [];
}

let sortableInstances = [];
let placeholder = null;

/**
 * Gets height of a task element.
 * @returns {number|undefined} Task height.
 */
function getTaskHeight() {
  const taskElement = document.querySelector(".task");
  if (taskElement) {
    return taskElement.offsetHeight;
  }
}

/**
 * Handles drag start event for tasks.
 * @param {Object} evt - Sortable event.
 */
function handleDragStart(evt) {
  if (window.matchMedia("(max-width: 800px)").matches) {
    const tasksInColumn = evt.from.querySelectorAll(".task:not(.dragging-task)");
    if (tasksInColumn.length === 0) {
      const taskHeight = getTaskHeight();
      evt.from.style.minHeight = `${taskHeight}px`;
      evt.from.classList.add("empty-dragging");
    }
  }
}

/**
 * Handles drag move event for tasks.
 * @param {Object} evt - Sortable event.
 */
function handleDragMove(evt) {
  hidePlaceholderInColumn(evt.to);
}

/**
 * Handles drag end event and saves order.
 * @param {Object} evt - Sortable event.
 */
async function handleDragEnd(evt) {
  document.querySelectorAll(".task-wrapper").forEach((wrapper) => {
    wrapper.style.minHeight = "";
  });
  resetAllPlaceholders();
  await handleSortableEnd(evt);
}

/**
 * Initializes drag-and-drop for all task columns.
 */
function initDragAndDrop() {
  destroySortableInstances();

  document.querySelectorAll("[data-category]").forEach((column) => {
    const sortable = Sortable.create(column, {
      group: "tasks",
      animation: 150,
      delay: window.matchMedia("(pointer: coarse)").matches ? 150 : 0,
      touchStartThreshold: 5,
      onStart: handleDragStart,
      onMove: handleDragMove,
      onEnd: handleDragEnd,
    });
    sortableInstances.push(sortable);
  });
}

/**
 * Updates tasks after drag-and-drop operation.
 * @param {Object} evt - Sortable event.
 */
async function handleSortableEnd(evt) {
  const column = evt.to;
  const category = column.getAttribute("data-category");
  const tasksInColumn = column.querySelectorAll(".draggable");

  for (let i = 0; i < tasksInColumn.length; i++) {
    const taskId = tasksInColumn[i].dataset.id;
    let taskObj = await loadData("tasks/" + taskId);
    taskObj.status = category;
    taskObj.order = i;
    await putData("tasks/" + taskId, taskObj);
  }

  adjustPlaceholders();
}

/**
 * Hides placeholder inside a given column.
 * @param {Element} column - Column element.
 */
function hidePlaceholderInColumn(column) {
  column.querySelectorAll(".empty").forEach((empty) => empty.classList.add("hidden"));
}

/**
 * Resets all placeholders across columns.
 */
function resetAllPlaceholders() {
  adjustPlaceholders();
}

/**
 * Initializes board with tasks and drag-and-drop.
 */
async function initBoard() {
  let taskObj = await loadData("tasks/");
  document.getElementById("search-input-desktop").value = "";
  document.getElementById("search-input-mobile").value = "";

  renderBoard(taskObj);
  initDragAndDrop();
}

document.addEventListener("DOMContentLoaded", () => {
  initBoard();
  closeAddTaskMobile();
});

/**
 * Handles closing the add-task overlay on small screens.
 */
function closeAddTaskMobile() {
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 590) {
      let addTaskBoard = document.getElementById("add-task-board");
      if (!addTaskBoard.classList.contains("d-none")) {
        const addTask = document.getElementById("add-task-board");
        const container = document.getElementById("task-overlay");
        addTask.classList.toggle("transparent-background");
        container.classList.toggle("transit");
        addTask.classList.toggle("d-none");
      }
    }
  });
}
