/**
 * Fetches an external HTML file and inserts it into a target element.
 * @param {string} targetId - The ID of the target element where HTML will be inserted.
 * @param {string} htmlPage - Path to the HTML file.
 */
async function fetchAndInsertHtml(targetId, htmlPage) {
  try {
    const target = document.getElementById(targetId);
    const resp = await fetch(htmlPage);
    const html = await resp.text();
    target.innerHTML = html;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Opens overlay elements by making them visible and triggering animation.
 */
function openOverlay() {
  const overlay = document.querySelectorAll(".overlay");
  overlay.forEach((element) => {
    element.classList.remove("hidden");
    setTimeout(() => {
      element.classList.add("visible");
      toggleAnimation();
    }, 1);
  });
}

/**
 * Closes overlay elements by hiding them with animation.
 */
function closeOverlay() {
  const overlay = document.querySelectorAll(".overlay");
  overlay.forEach((element) => {
    element.classList.remove("visible");
    toggleAnimation();
    setTimeout(() => {
      element.classList.add("hidden");
    }, 250);
  });
}

/**
 * Toggles transition animation for overlay wrappers.
 */
function toggleAnimation() {
  const overlayWrapper = document.querySelectorAll(".overlay-wrapper");
  overlayWrapper.forEach((element) => {
    element.classList.toggle("transit");
  });
}

/**
 * Prevents a click event from propagating to parent elements.
 * @param {Event} event - The click event.
 */
function onclickProtection(event) {
  event.stopPropagation();
}

/**
 * Opens the "Add Task" overlay and initializes task form with default values.
 * @param {string} status - The task status to apply.
 */
async function addTask(status) {
  updateTaskStatus(status);
  openAddTask();
  await loadUsersTask();
  loadTaskFormTemplate("firstBoardAddTask", "secondBoardAddTask");
  activePriority("medium");
}

/**
 * Updates the global task status variable.
 * @param {string} status - The new task status.
 */
function updateTaskStatus(status) {
  if (!status) return;
  taskStatus = status;
}

/**
 * Fetches HTML content from a given link.
 * @param {string} link - The path to the HTML file.
 * @returns {Promise<string>} - The raw HTML content.
 */
async function loadHTML(link) {
  const resp = await fetch(link);
  const html = await resp.text();
  return html;
}

/**
 * Opens the "Add Task" overlay with animation.
 */
function openAddTask() {
  const addTask = document.getElementById("add-task-board");
  const container = document.getElementById("task-overlay");
  addTask.classList.toggle("d-none");
  setTimeout(() => {
    addTask.classList.toggle("transparent-background");
    container.classList.toggle("transit");
  }, 10);
}

/**
 * Closes the "Add Task" overlay and clears input fields.
 */
function closeAddTask() {
  clearTaskFormContainers();
  const addTask = document.getElementById("add-task-board");
  const container = document.getElementById("task-overlay");
  addTask.classList.toggle("transparent-background");
  container.classList.toggle("transit");
  setTimeout(() => {
    addTask.classList.toggle("d-none");
  }, 250);
}

/**
 * Renders the user icon (avatar) based on the "User" URL parameter.
 */
async function renderUserIcon() {
  const element = document.querySelector(".profile-picture");
  let params = new URLSearchParams(window.location.search);
  if (element) {
    element.innerHTML = createAvater(params.get("User"));
  }
  return;
}

/**
 * Ensures default URL parameters are set if none exist.
 */
function checkUrlParams() {
  let params = new URLSearchParams(window.location.search);
  const newParams = new URLSearchParams({
    User: "Guest",
    Status: "to-do",
  });
  if (params.size == 0) {
    let url = window.location.href;
    window.location.href = `${url}?${newParams}`;
  } else return;
}

/**
 * Redirects user to another page with updated status and user params.
 * @param {string} status - The new task status.
 * @param {string} target - The target HTML file name.
 */
function goToPage(status, target) {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("User");
  const params = new URLSearchParams({
    User: userName,
    Status: status,
  });
  window.location.href = `../html-templates/${target}.html?${params}`;
}

/**
 * Creates a simple avatar string from a user's name initials.
 * @param {string} name - Full user name.
 * @returns {string} - Initials for avatar.
 */
function createAvater(name) {
  let myArr = name.split(" ");
  let avatar = "";
  myArr.forEach((element) => {
    avatar += element.charAt(0);
  });
  return avatar;
}

/**
 * Appends current URL params to all links with the given data-task attribute.
 * @param {string} target - The data-task attribute value.
 */
function updateLinksWithUserKey(target) {
  const urlParams = new URLSearchParams(window.location.search);
  const links = document.querySelectorAll(`[data-task="${target}"]`);
  links.forEach((element) => {
    let newLink = element.href + `?${encodeURI(urlParams)}`;
    element.href = newLink;
  });
}

/**
 * Adjusts the navigation layout for privacy/legal pages.
 */
function adjustLayoutForPrivacyView() {
  const ul = document.querySelector(".nav-wrapper").children[0];
  const navImg = document.querySelector(".nav-imgs");
  const pageATag = document.querySelector(".page-header");
  pageATag.children[1].remove();

  navImg.innerHTML = "";
  ul.innerHTML = "";
  ul.innerHTML += navLink("login", "../index.html", "Log in");
}

/**
 * Initializes the navigation bar with default params and user-specific content.
 */
function initializeNavbar() {
  checkUrlParams();
  renderUserIcon();
  updateLinksWithUserKey("navLink");
}

/**
 * Toggles the visibility of the side menu with animation.
 */
function toggleMenu() {
  const container = document.querySelector(".menu-container");
  const menu = document.getElementById("menu");
  if (container.classList.contains("d-none")) {
    container.classList.remove("d-none");
    setTimeout(() => {
      menu.classList.toggle("menu-translateX");
    }, 50);
  } else {
    menu.classList.toggle("menu-translateX");
    setTimeout(() => {
      container.classList.add("d-none");
    }, 150);
  }
}

/**
 * Handles user sign-up process.
 */
async function addUser() {
  const inputs = formFields();
  let signUp = await checkFormFields();
  if (!signUp) return;
  await postUser(inputs.name.value, inputs.email.value, inputs.password.value);
  showSignupSuccess();
}

/**
 * Validates if the provided email has correct format.
 * @param {string} email - Email string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || !email) {
    return false;
  }
  return true;
}