let subtask = [];
let users = [];
let selectedPriority = "medium";
let assignedUserArr = [];
let taskStatus = "to-do";
let order = 1000;

/**
 * Initializes the Add Task page: loads users, URL status, template, and default priority.
 * @returns {Promise<void>}
 */
async function initAddTaskPage() {
  await loadUsersTask();
  loadUrlStatus();
  loadTaskFormTemplate("firstTaskContainer", "secondTaskContainer");
  activePriority("medium");
}

/**
 * Loads users from storage and populates the local users array.
 * @returns {Promise<void>}
 */
async function loadUsersTask() {
  let usersObj = await loadData("users");
  for (const key in usersObj) {
    users.push(usersObj[key]);
  }
}

/**
 * Creates a subtask object.
 * @param {number} id - Subtask id.
 * @param {string} value - Subtask text.
 * @returns {{id:number,value:string,edit:boolean,checked:boolean}}
 */
function createSubObj(id, value) {
  return {
    id: id,
    value: value,
    edit: false,
    checked: false,
  };
}

/**
 * Sets task status from URL query string (defaults to "to-do").
 * @returns {void}
 */
function loadUrlStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.size == 0 ? (taskStatus = "to-do") : (taskStatus = urlParams.get("Status"));
}

/**
 * Prevents default form submission.
 * @param {Event} event - The submit event.
 * @returns {void}
 */
function preventFromSubmit(event) {
  event.preventDefault();
}

/**
 * Renders the task form into two container targets.
 * @param {string} firstTarget - ID of first container.
 * @param {string} secondTarget - ID of second container.
 * @returns {void}
 */
function loadTaskFormTemplate(firstTarget, secondTarget) {
  let firstContainer = document.getElementById(firstTarget);
  let secondContainer = document.getElementById(secondTarget);
  removeAssignment();
  firstContainer.innerHTML = "";
  secondContainer.innerHTML = "";
  firstContainer.innerHTML += titleTaskTpl();
  firstContainer.innerHTML += descriptionTaskTpl();
  firstContainer.innerHTML += dateTaskTpl();
  secondContainer.innerHTML += prioTaskTpl();
  secondContainer.innerHTML += assignedTaskTpl();
  secondContainer.innerHTML += categoryTaskTpl();
  secondContainer.innerHTML += subtaskTpl();
}

/**
 * Clears assignees and resets each user's assigned flag.
 * @returns {void}
 */
function removeAssignment() {
  assignedUserArr = [];
  users.forEach((user) => {
    user.assigned = false;
  });
}

/**
 * Returns references to assignee-related DOM nodes.
 * @returns {{taskContainer:HTMLElement,btn:HTMLElement,dropdown:HTMLElement,overlay:HTMLElement,input:HTMLInputElement}}
 */
function getAssigneeRefs() {
  return {
    taskContainer: document.getElementById("task-container"),
    btn: document.getElementById("assaign-btn"),
    dropdown: document.getElementById("assigned-dropdown"),
    overlay: document.getElementById("assigned-dropdown-overlay"),
    input: document.getElementById("assignedInputSearch"),
  };
}

/**
 * Toggles the assignee dropdown and related UI state.
 * @returns {void}
 */
function toggleAssignedDropdown() {
  const refs = getAssigneeRefs();
  refs.input.value = "";
  loadUsers();
  refs.taskContainer.classList.toggle("zindex-12");
  refs.dropdown.classList.toggle("d-none");
  refs.overlay.classList.toggle("d-none");
  refs.btn.classList.toggle("rotate-180deg");
  refs.input.parentElement.classList.toggle("blue-border");
  refs.btn.classList.contains("rotate-180deg") ? filterUsers() : resetAssigneeFilter();
}

/**
 * Filters visible users in the dropdown by name.
 * @param {string} [input] - Filter text.
 * @returns {void}
 */
function filterUsers(input) {
  if (!input) return;
  const userContainers = document.querySelectorAll('[data-type="userContainer"]');
  userContainers.forEach((container) => {
    let userName = container.children[1].innerHTML.toLowerCase();
    !userName.includes(input.toLowerCase()) ? container.classList.add("d-none") : container.classList.remove("d-none");
  });
}

/**
 * Resets the assignee filter and placeholder text.
 * @returns {void}
 */
function resetAssigneeFilter() {
  const refs = getAssigneeRefs();
  const userContainers = document.querySelectorAll('[data-type="userContainer"]');
  refs.input.value = "Select contacts to assign";
  userContainers.forEach((container) => {
    container.classList.remove("d-none");
  });
}

/**
 * Returns references to category dropdown elements.
 * @returns {{container:HTMLElement,dropdown:HTMLElement,overlay:HTMLElement,btn:HTMLElement}}
 */
function getCategoryRefs() {
  return {
    container: document.getElementById("category-container"),
    dropdown: document.getElementById("category-dropdown"),
    overlay: document.getElementById("category-dropdown-overlay"),
    btn: document.getElementById("category-btn"),
  };
}

/**
 * Toggles the category dropdown and visual state.
 * @returns {void}
 */
function toggleCategoryDropdown() {
  const r = getCategoryRefs();
  r.container.classList.toggle("zindex-12");
  r.container.classList.toggle("boxshadow");
  r.dropdown.classList.toggle("d-none");
  r.overlay.classList.toggle("d-none");
  r.btn.classList.toggle("rotate-180deg");
  r.btn.parentElement.classList.toggle("blue-border");
}

/**
 * Toggles a blue outline on the target's parent (focus/active styling).
 * @param {Event} e - UI event.
 * @returns {void}
 */
function toggleBlueOutline(e) {
  e.target.parentElement.classList.toggle("blue-border");
}

/**
 * Sets and highlights the selected priority button.
 * @param {"urgent"|"medium"|"low"} prio - Priority key.
 * @returns {void}
 */
function activePriority(prio) {
  const priorities = ["urgent", "medium", "low"];
  selectedPriority = prio;
  priorities.forEach((priority) => {
    const btn = document.getElementById(priority);
    const icon = document.getElementById(`${priority}-btn-icon`);
    priority == selectedPriority ? prioBtnActive(btn, icon, priority) : prioBtnOff(btn, icon, priority);
  });
}

/**
 * Applies active styles to a priority button and stores selection.
 * @param {HTMLElement} btn
 * @param {HTMLElement} icon
 * @param {"urgent"|"medium"|"low"} priority
 * @returns {void}
 */
function prioBtnActive(btn, icon, priority) {
  btn.classList.add(`active-${priority}-btn`);
  icon.classList.add(`active-${priority}-icon`);
  selectedPriority = priority;
}

/**
 * Removes active styles from a priority button.
 * @param {HTMLElement} btn
 * @param {HTMLElement} icon
 * @param {"urgent"|"medium"|"low"} priority
 * @returns {void}
 */
function prioBtnOff(btn, icon, priority) {
  btn.classList.remove(`active-${priority}-btn`);
  icon.classList.remove(`active-${priority}-icon`);
}

/**
 * Adds a subtask from the input field to the list.
 * @returns {void}
 */
function addSubtask() {
  const inputElement = document.getElementById("subtask-input");
  const subList = document.getElementById("sub-list");
  if (inputElement.value.trim().length == 0) {
    inputElement.value = "";
    return;
  }
  let id = getNextFreeId();
  subtask.push(createSubObj(id, inputElement.value));
  subList.innerHTML += subListItem(inputElement.value, id);
  inputElement.value = "";
}

/**
 * Returns the next free numeric id for subtasks.
 * @returns {number}
 */
function getNextFreeId() {
  let i = 0;
  while (subtask.some((item) => item.id === i)) {
    i++;
  }
  return i;
}

/**
 * Removes a subtask by id and re-renders the list.
 * @param {number} value - Subtask id.
 * @returns {void}
 */
function removeSubItem(value) {
  const newArr = subtask.filter((element) => element.id != value);
  subtask = newArr;
  reloadSubTask();
}

/**
 * Re-renders the subtask list depending on edit mode.
 * @returns {void}
 */
function reloadSubTask() {
  const subList = document.getElementById("sub-list");
  subList.innerHTML = "";
  subtask.forEach((element) => {
    if (element.edit == false) {
      subList.innerHTML += subListItem(element.value, element.id);
    } else {
      subList.innerHTML += subListItemEdit(element.value, element.id);
    }
  });
}

/**
 * Toggles edit mode for a subtask and persists updated value.
 * @param {number} id - Subtask id.
 * @param {boolean} editMode - Edit mode flag.
 * @returns {void}
 */
function editSubItem(id, editMode) {
  const input = document.getElementById(`sub-input-${id}`);
  for (let index = 0; index < subtask.length; index++) {
    if (subtask[index].id == id) {
      subtask[index].edit = editMode;
      if (input.value.trim().length > 0) {
        subtask[index].value = input.value;
      }
      break;
    }
  }
  reloadSubTask();
}

/**
 * Selects a category from dropdown and updates the label.
 * @param {Event} e - Click event on category item.
 * @returns {void}
 */
function selectCategory(e) {
  let value = e.target.innerHTML;
  const selectCategory = document.getElementById("select-category");
  selectCategory.innerHTML = value;
  toggleCategoryDropdown();
}

/**
 * Renders the user list into the assignee dropdown.
 * @returns {void}
 */
function loadUsers() {
  const assignedDropdown = document.getElementById("assigned-dropdown");
  assignedDropdown.innerHTML = "";
  users.forEach((user) => {
    let initials = initialsFromName(user.name);
    if (user.assigned) {
      assignedDropdown.innerHTML += singleUserContainer("single-user-container_select", initials, user.name, user.color);
    } else {
      assignedDropdown.innerHTML += singleUserContainer("single-user-container", initials, user.name, user.color);
    }
  });
}

/**
 * Derives initials from a user's full name.
 * @param {string} user - Full name string.
 * @returns {string}
 */
function initialsFromName(user) {
  let initials = "";
  const array = user.split(" ");
  array.forEach((element) => {
    initials += element.charAt(0);
  });
  return initials;
}

/**
 * Toggles a user's assigned state and updates UI/icons.
 * @param {string} name - User name.
 * @returns {void}
 */
function assignedUser(name) {
  let index = searchUserIndex(name);
  const refs = getAssigneeRefs();
  if (!users[index]) return;
  if (users[index].assigned == false) {
    users[index].assigned = true;
    loadUsers();
    assignedUserArr.push(users[index]);
    loadAssignedUserIcons();
  } else {
    users[index].assigned = false;
    loadUsers();
    removeUserFromArray(name);
    loadAssignedUserIcons();
  }
  filterUsers(refs.input.value);
}

/**
 * Finds a user's index by name.
 * @param {string} name - User name.
 * @returns {number|undefined}
 */
function searchUserIndex(name) {
  for (let index = 0; index < users.length; index++) {
    if (users[index].name == name) {
      return index;
    }
  }
}

/**
 * Renders up to four assignee icons (+counter for the rest).
 * @returns {void}
 */
function loadAssignedUserIcons() {
  const container = document.getElementById("icons-container");
  if (!container) return;

  const firstFour = assignedUserArr.slice(0, 4);
  const rest = Math.max(assignedUserArr.length - 4, 0);
  let userTempArr = firstFour.map((u) => userIcon(u.color, initialsFromName(u.name), u.name));
  let html = userTempArr.join("");

  if (rest > 0) {
    html += assignedUserIcon("#2a3647", `+${rest}`);
  }
  container.innerHTML = html;
}

/**
 * Removes a user from the local assigned array by name.
 * @param {string} name - User name.
 * @returns {void}
 */
function removeUserFromArray(name) {
  let arr = [];
  assignedUserArr.forEach((user) => {
    if (user.name != name) {
      arr.push(user);
    }
  });
  assignedUserArr = arr;
}

/**
 * Validates, builds, and posts a task, then plays success animation.
 * @returns {Promise<void>}
 */
async function createTaskForm() {
  let validateTask = isTaskDataValid();
  if (!validateTask) return;
  let task = taskObjTemplate(selectedPriority, assignedUserArr, subtask, taskStatus);
  await postData("tasks", task);
  animationSuccess();
}

/**
 * Re-initializes the page if the current form state is valid.
 * @returns {void}
 */
function runInitIfValid() {
  let validateTask = isTaskDataValid();
  if (!validateTask) return;
  updateStatusToTodo();
  initAddTaskPage();
}

/**
 * Forces status to "to-do" and updates the URL accordingly.
 * @returns {void}
 */
function updateStatusToTodo() {
  taskStatus = "to-do";
  const url = new URL(window.location.href);
  url.searchParams.set("Status", "to-do");
  window.history.replaceState({}, "", url);
}

/**
 * Validates task form fields and shows inline errors.
 * @returns {boolean} True if valid, else false.
 */
function isTaskDataValid() {
  let isValid = true;
  const formIds = getFormElementsIds();
  if (formIds.title.value.trim().length <= 0) {
    showError(formIds.title, "title");
    formIds.title.value = "";
    isValid = false;
  }
  if (formIds.description.value.trim().length <= 0) {
    formIds.description.value = "";
  }
  if (formIds.category.span.innerHTML == "Select Task category") {
    showError(formIds.category.dropdown, "category");
    isValid = false;
  }
  if (!formIds.date.value) {
    showError(formIds.date, "date");
    isValid = false;
  }
  return isValid;
}

/**
 * Returns references to task form elements.
 * @returns {{title:HTMLInputElement,date:HTMLInputElement,category:{span:HTMLElement,dropdown:HTMLElement},description:HTMLTextAreaElement}}
 */
function getFormElementsIds() {
  const titelId = document.getElementById("titleInput");
  const dateId = document.getElementById("date");
  const categoryId = document.getElementById("select-category");
  const descriptionId = document.getElementById("description");
  const categoryDropdown = document.getElementById("open-category-dropdown");
  let formIds = {
    title: titelId,
    date: dateId,
    category: {
      span: categoryId,
      dropdown: categoryDropdown,
    },
    description: descriptionId,
  };
  return formIds;
}

/**
 * Builds a task object from current form values.
 * @param {"urgent"|"medium"|"low"} [priority="medium"] - Selected priority.
 * @param {Array<Object>} users - Assigned users array.
 * @param {Array<Object>} subtask - Subtasks array.
 * @param {string} [status="to-do"] - Task status.
 * @returns {Object}
 */
function taskObjTemplate(priority = "medium", users, subtask, status = "to-do") {
  let categoryText = document.getElementById("select-category").innerText;
  console.log(categoryText);

  return {
    title: document.getElementById("titleInput").value,
    description: document.getElementById("description").value,
    date: document.getElementById("date").value,
    priority: priority,
    assigned: users,
    category: document.getElementById("select-category").innerText,
    subtask: subtask,
    status: status,
    order: order,
  };
}

/**
 * Clears error styling from a field and removes its error message.
 * @param {HTMLElement} target - The input element.
 * @param {HTMLElement} error - The error message element.
 * @returns {void}
 */
function clearInputError(target, error) {
  target.classList.remove("light-red-outline");
  target.classList.add("blue-outline");
  error.innerHTML = "";
}

/**
 * Applies error styling to an input field.
 * @param {HTMLElement} target - The input element.
 * @returns {void}
 */
function addErrorClasses(target) {
  target.classList.add("light-red-outline");
  target.classList.remove("blue-outline");
}

/**
 * Displays an error message on a field and attaches a reset handler.
 * @param {HTMLElement} target - The input element.
 * @param {string} name - The field name (used to find the error element).
 * @returns {void}
 */
function showError(target, name) {
  let error = document.getElementById(`${name}Error`);
  addErrorClasses(target);
  error.innerHTML = "This field is required";
  target.addEventListener("click", () => {
    clearInputError(target, error);
  });
}

/**
 * Removes all validation outlines from a field when it loses focus.
 * @param {FocusEvent} e - The blur event.
 * @returns {void}
 */
function onFocusOut(e) {
  let target = e.target;
  target.classList.remove("light-red-outline");
  target.classList.remove("blue-outline");
}

/**
 * Shows a success animation and navigates back to the board page.
 * @returns {void}
 */
function animationSuccess() {
  const successMessage = document.querySelector(".success-message");
  successMessage.classList.add("is-open");
  setTimeout(() => {
    goToPage(taskStatus, "board");
  }, 1600);
}

/**
 * Validates a date string against today's date.
 * If the input is incomplete or in the past, the field is reset or set to today.
 *
 * @param {string} value - Date string in "YYYY-MM-DD" format.
 */

function checkDate(value) {
  const input = document.getElementById("date");
  const today = new Date().toISOString().split("T")[0];
  const todayArr = today.split("-").map((x) => Number(x));
  const userDateArr = value.split("-").map((x) => Number(x));
  if (userDateArr.length < 3) {
    input.value = "";
    return
  };
  if (userDateArr[0] < todayArr[0] && userDateArr[1] < todayArr[1] && userDateArr[2] < todayArr[2]) {
    input.value = today;
    return
  };
  if (userDateArr[1] <= todayArr[1] && userDateArr[2] < todayArr[2]) {    
    input.value = today;
    return
  };
  if (userDateArr[0] <= todayArr[0] && userDateArr[1] < todayArr[1]) {
    input.value = today;
    return
  };
  if (userDateArr[0] < todayArr[0]) input.value = today;
}

/**
 * Sets the minimum selectable date of the date input field to today.
 * @returns {void}
 */
function setMinDateToToday() {
  const today = new Date().toISOString().split("T")[0];
  const todayArray = today.split("-");
  document.getElementById("date").setAttribute("min", today);
}