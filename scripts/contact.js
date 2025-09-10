/**
 * Checks if a user with given email already exists.
 * @param {HTMLInputElement} email - Email input element.
 * @returns {Promise<boolean>} Whether the user exists.
 */
async function userExists(email) {
  let users = await loadData("/users");
  let validate = Object.values(users || {}).some((user) => user.email === email.value);
  if (validate) {
    const error = document.querySelector('[data-field="errorEmail"]');
    error.innerHTML = "email already exist";
    email.style.border = "1px solid #ff8190";
    return validate;
  } else {
    email.style.border = "1px solid #ccc";
    return validate;
  }
}

/**
 * Returns references to contact form input fields.
 * @returns {Object} Form input elements.
 */
function contactFormIds() {
  return {
    email: document.getElementById("contact-email"),
    name: document.getElementById("contact-name"),
    phone: document.getElementById("contact-phone"),
  };
}

/**
 * Initializes the contact form submission logic.
 */
async function initContactForm() {
  const inputs = formFields();
  const inputIds = contactFormIds();
  const form = document.querySelector("form.contact-container");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let validateUser = await validateNewUser();
    if (!validateUser) return;
    const newUser = createUser(document.getElementById("contact-name").value, inputIds.email.value, document.getElementById("contact-phone").value);
    await postData(`users`, newUser);
    loadContacts();
    closeOverlay();
  });
}

/**
 * Validates new or existing user data from form fields.
 * @param {boolean} [oldUser=false] - Whether user is being updated.
 * @returns {Promise<boolean>} Whether the data is valid.
 */
async function validateNewUser(oldUser = false) {
  let inputs = formFields();

  let emailAvailable = oldUser ? true : false;

  let nameIsValid = checkName(inputs.name.value);
  let emailIsValid = validateEmail(inputs.email.value);
  if (!emailIsValid) errorEmail();

  if (emailIsValid && !oldUser) {
    emailAvailable = await checkEmailExists(inputs.email.value);
  }

  let phoneIsValid = validatePhoneNumber(inputs.phone.value);
  if (!phoneIsValid) errorPhoneNumber();

  if (!nameIsValid || !emailIsValid || !emailAvailable || !phoneIsValid) return false;
  return true;
}

/**
 * Validates phone number format.
 * @param {string} input - Phone number input.
 * @returns {boolean} Whether phone number is valid.
 */
function validatePhoneNumber(input) {
  let validate = true;
  if (typeof input !== "string") return false;
  if (/[^0-9()\s+\-]/.test(input)) return false;
  let phone = input.replace(/[()\s\-]/g, "");
  if (phone.startsWith("+")) {
    phone = "+" + phone.slice(1).replace(/\+/g, "");
  } else {
    phone = phone.replace(/\+/g, "");
  }
  validate = /^\+?\d{7,15}$/.test(phone);
  return validate;
}

/**
 * Displays phone number validation error.
 */
function errorPhoneNumber() {
  const inputContainer = document.querySelectorAll(".input-container");
  let errorElements = errorFields();
  errorElements.phone.innerHTML = "Please enter a valid phone number";
  addRedOutline(inputContainer[2]);
}

/**
 * Returns trimmed value of input field by ID.
 * @param {string} id - Element ID.
 * @returns {string|undefined} Input value.
 */
function getValue(id) {
  return document.getElementById(id)?.value.trim();
}

/**
 * Returns a random color string.
 * @returns {string} Hex color.
 */
function getRandomColor() {
  const colors = ["#f1c40f", "#1abc9c", "#3498db", "#e67e22", "#9b59b6"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Creates initials from a name string.
 * @param {string} name - Full name.
 * @returns {string} Initials in uppercase.
 */
function getInitials(name) {
  const trimmed = name.trim();
  const parts = trimmed.split(" ");
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  const firstInitial = parts[0][0].toUpperCase();
  const secondInitial = parts[1][0].toUpperCase();
  return firstInitial + secondInitial;
}

/**
 * Finds or creates a contact group for a given letter.
 * @param {HTMLElement} container - Parent container.
 * @param {string} letter - Group letter.
 * @returns {HTMLElement} Contact group element.
 */
function findOrCreateGroup(container, letter) {
  const allGroups = container.querySelectorAll(".contact-group");
  let group = null;

  for (let i = 0; i < allGroups.length; i++) {
    const label = allGroups[i].querySelector(".group-letter");
    if (label && label.textContent === letter) {
      group = allGroups[i];
      break;
    }
  }
  if (!group) {
    group = document.createElement("div");
    group.classList.add("contact-group");
    group.innerHTML = `<div class="group-letter">${letter}</div>`;
    container.appendChild(group);
  }
  return group;
}

/**
 * Deletes a user from database and updates contacts.
 * @param {string} path - User path.
 */
async function deleteUser(path) {
  const userDetails = document.querySelector(".user-details");
  try {
    await deleteData(path);
    closeOverlay();
    userDetails.innerHTML = "";
    loadContacts();
  } catch (error) {
    console.error("Fehler beim Löschen:", error);
  }
}

/**
 * Removes a user element from HTML by path.
 * @param {string} path - User path.
 */
function removeUserFromHTML(path) {
  const userId = path.split("/")[1];
  const contactEl = document.querySelector(`[data-user-id="${userId}"]`);
  if (contactEl) contactEl.remove();
}

/**
 * Prepares contact form for editing an existing user.
 * @param {string} id - User ID.
 * @param {Object} user - User data.
 */
function editForm(id, user) {
  const form = document.querySelector("form.contact-container");
  editAvatar(user);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let validateUser = await validateNewUser(true);
    console.log(validateUser);

    if (!validateUser) return;
    const updateUser = createUser(document.getElementById("contact-name").value, document.getElementById("contact-email").value, document.getElementById("contact-phone").value, user.color, user.assigned, user.password);
    await putData(`users/${id}`, updateUser);
    openUserInfos(id);
    loadContacts();
    closeOverlay();
  });
}

/**
 * Updates avatar preview in edit form.
 * @param {Object} user - User data.
 */
function editAvatar(user) {
  const avatar = document.getElementById("avatar-edit");
  avatar.innerHTML = user.avatar;
  avatar.style.backgroundColor = user.color;
}

/**
 * Loads all contacts and renders grouped view.
 */
async function loadContacts() {
  let users = await loadData("users");
  let initials = getUniqueInitials(users);
  importContactGroups(users, initials);
}
loadContacts();

/**
 * Extracts unique initials from user list.
 * @param {Object} users - User data.
 * @returns {string[]} Sorted initials.
 */
function getUniqueInitials(users) {
  let result = [];
  for (const key in users) {
    let initial = users[key].name.charAt(0).toUpperCase();
    if (!letterExists(result, initial)) {
      result.push(initial);
    }
  }
  result.sort();
  return result;
}

/**
 * Checks if a letter exists in array.
 * @param {string[]} array - Array of initials.
 * @param {string} initial - Letter to check.
 * @returns {boolean} Exists or not.
 */
function letterExists(array, initial) {
  return array.includes(initial);
}

/**
 * Renders grouped contacts by initials.
 * @param {Object} users - User data.
 * @param {string[]} initials - List of initials.
 */
function importContactGroups(users, initials) {
  let contactsContainer = document.getElementById("contacts-container");
  contactsContainer.innerHTML = "";
  initials.forEach((letter) => {
    let contactGroup = document.createElement("div");
    contactGroup.classList.add("contact-group");
    contactGroup = buildLetterGroup(contactGroup, letter, users);
    contactsContainer.appendChild(contactGroup);
  });
}

/**
 * Builds a contact group section for a letter.
 * @param {HTMLElement} contactGroup - Group element.
 * @param {string} letter - Initial letter.
 * @param {Object} users - User data.
 * @returns {HTMLElement} Updated group element.
 */
function buildLetterGroup(contactGroup, letter, users) {
  let groupLetter = createLetterBox(letter);
  contactGroup.appendChild(groupLetter);
  for (const key in users) {
    let initial = users[key].name.charAt(0).toUpperCase();
    if (initial === letter) {
      contactGroup.appendChild(createContactElement(users[key], key));
    }
  }
  return contactGroup;
}

/**
 * Creates a letter box element for contact groups.
 * @param {string} letter - Initial letter.
 * @returns {HTMLElement} Letter box element.
 */
function createLetterBox(letter) {
  let div = document.createElement("div");
  let span = document.createElement("span");
  div.classList.add("group-letter");
  span.innerHTML = letter;
  div.appendChild(span);
  return div;
}

/**
 * Opens detailed info view for a user.
 * @param {string} id - User ID.
 */
async function openUserInfos(id) {
  let user = await loadData(`users/${id}`);
  const contactField = document.querySelector(".contact-field");
  const usersInfo = document.querySelector(".info-container");
  contactField.style.display = "block";
  usersInfo.innerHTML = renderUserInfo(id, user);
  setTimeout(() => {
    const userDetails = document.querySelector(".user-details");
    userDetails.classList.add("translatex-user");
  }, 100);
}

/**
 * Closes detailed user info view.
 */
function closeUserInfo() {
  const usersInfo = document.querySelector(".info-container");
  const userDetails = document.querySelector(".user-details");
  userDetails.classList.remove("translatex-user");
  setTimeout(() => {
    usersInfo.innerHTML = "";
  }, 250);
}

/**
 * Opens overlay for adding a new contact.
 */
function openAddContact() {
  const overlay = document.getElementById("overlay");
  openOverlay();
  overlay.innerHTML = getContactOverlayTemplate();
  initContactForm();
}

/**
 * Opens overlay for editing a contact by ID.
 * @param {string} id - User ID.
 */
async function editContactById(id) {
  const user = await loadData(`users/${id}`);
  openOverlay();
  editContactOverlay(id, user);
  editForm(id, user);
}

/**
 * Hides contact list and clears info container.
 */
function hideContacts() {
  const contactField = document.querySelector(".contact-field");
  const infoContainer = document.querySelector(".info-container");
  infoContainer.innerHTML = "";
  contactField.style.display = "none";
  toggleContactBg();
}

/**
 * Opens mobile edit/delete menu with animation.
 */
function opencEditMenu() {
  const container = document.querySelector(".mobile-edit-delete");
  container.style.display = "block";
  setTimeout(() => {
    toggleEditMenu();
  }, 100);
}

/**
 * Toggles visibility of edit menu.
 */
function toggleEditMenu() {
  const editMenu = document.querySelector(".user-edit-container");
  editMenu.classList.toggle("edit-translateX");
}

/**
 * Closes mobile edit menu with delay.
 */
function closeEditMenu() {
  const container = document.querySelector(".mobile-edit-delete");
  toggleEditMenu();
  setTimeout(() => {
    container.style.display = "none";
  }, 100);
}

/**
 * Highlights selected contact and resets others.
 * @param {Event} [e] - Click event.
 */
function toggleContactBg(e) {
  const contacts = document.querySelectorAll(".contact, .contact-dark-blue");
  contacts.forEach((contact) => {
    contact.className = "contact";
  });
  if (!e) return;
  e.currentTarget.className = "contact-dark-blue";
}

/**
 * Clears error messages for a field when corrected.
 * @param {Event} event - Input container event.
 */
function checkForError(event) {
  let container = event.currentTarget;
  let inputName = container.children[0].getAttribute("name");
  inputName = inputName.charAt(0).toUpperCase() + inputName.slice(1);

  let errorField = document.querySelector(`[data-field="error${inputName}"]`);
  let errorMessage = container.classList.contains("light-red-outline");

  if (errorMessage) {
    container.classList.remove("light-red-outline");
    errorField.innerHTML = "";
  }
}
