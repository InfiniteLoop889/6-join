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

function contactFormIds() {
  return {
    email: document.getElementById("contact-email"),
    name: document.getElementById("contact-name"),
    phone: document.getElementById("contact-phone"),
  };
}

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

function errorPhoneNumber() {
  const inputContainer = document.querySelectorAll(".input-container");
  let errorElements = errorFields();
  errorElements.phone.innerHTML = "Please enter a valid phone number";
  addRedOutline(inputContainer[2]);
}

function getValue(id) {
  return document.getElementById(id)?.value.trim();
}

function getRandomColor() {
  const colors = ["#f1c40f", "#1abc9c", "#3498db", "#e67e22", "#9b59b6"];
  return colors[Math.floor(Math.random() * colors.length)];
}

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

function removeUserFromHTML(path) {
  const userId = path.split("/")[1];
  const contactEl = document.querySelector(`[data-user-id="${userId}"]`);
  if (contactEl) contactEl.remove();
}

function editForm(id, user) {
  const form = document.querySelector("form.contact-container");
  editAvatar(user);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let validateUser = await validateNewUser(true);
    console.log(validateUser);

    if (!validateUser) return;
    const updateUser = createUser(
      document.getElementById("contact-name").value,
      document.getElementById("contact-email").value,
      document.getElementById("contact-phone").value,
      user.color,
      user.assigned,
      user.password
    );
    await putData(`users/${id}`, updateUser);
    openUserInfos(id);
    loadContacts();
    closeOverlay();
  });
}

function editAvatar(user) {
  const avatar = document.getElementById("avatar-edit");
  avatar.innerHTML = user.avatar;
  avatar.style.backgroundColor = user.color;
}

async function loadContacts() {
  let users = await loadData("users");
  let initials = getUniqueInitials(users);
  importContactGroups(users, initials);
}
loadContacts();

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

function letterExists(array, initial) {
  return array.includes(initial);
}

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

function createLetterBox(letter) {
  let div = document.createElement("div");
  let span = document.createElement("span");
  div.classList.add("group-letter");
  span.innerHTML = letter;
  div.appendChild(span);
  return div;
}

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

function closeUserInfo() {
  const usersInfo = document.querySelector(".info-container");
  const userDetails = document.querySelector(".user-details");
  userDetails.classList.remove("translatex-user");
  setTimeout(() => {
    usersInfo.innerHTML = "";
  }, 250);
}

function openAddContact() {
  const overlay = document.getElementById("overlay");
  openOverlay();
  overlay.innerHTML = getContactOverlayTemplate();
  initContactForm();
}

async function editContactById(id) {
  const user = await loadData(`users/${id}`);
  openOverlay();
  editContactOverlay(id, user);
  editForm(id, user);
}

function hideContacts() {
  const contactField = document.querySelector(".contact-field");
  const infoContainer = document.querySelector(".info-container");
  infoContainer.innerHTML = "";
  contactField.style.display = "none";
  toggleContactBg();
}

function opencEditMenu() {
  const container = document.querySelector(".mobile-edit-delete");
  container.style.display = "block";
  setTimeout(() => {
    toggleEditMenu();
  }, 100);
}

function toggleEditMenu() {
  const editMenu = document.querySelector(".user-edit-container");
  editMenu.classList.toggle("edit-translateX");
}

function closeEditMenu() {
  const container = document.querySelector(".mobile-edit-delete");
  toggleEditMenu();
  setTimeout(() => {
    container.style.display = "none";
  }, 100);
}

function toggleContactBg(e) {
  const contacts = document.querySelectorAll(".contact, .contact-dark-blue");
  contacts.forEach((contact) => {
    contact.className = "contact";
  });
  if (!e) return;
  e.currentTarget.className = "contact-dark-blue";
}

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
