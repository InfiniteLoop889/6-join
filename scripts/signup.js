/**
 * Returns references to all error display fields of the form.
 * @returns {Object} Object with error elements.
 */
function errorFields() {
  return {
    name: document.querySelector('[data-field="errorName"]'),
    email: document.querySelector('[data-field="errorEmail"]'),
    password: document.querySelector('[data-field="errorPassword"]'),
    policy: document.querySelector('[data-field="errorPolicy"]'),
    phone: document.querySelector('[data-field="errorPhone"]'),
  };
}

/**
 * Returns references to all input fields of the form.
 * @returns {Object} Object with form input elements.
 */
function formFields() {
  return {
    name: document.querySelector('[data-field="name"]'),
    email: document.querySelector('[data-field="email"]'),
    password: document.querySelector('[data-field="password"]'),
    confirmPassword: document.querySelector('[data-field="confirmPassword"]'),
    phone: document.querySelector('[data-field="phone"]'),
  };
}

/**
 * Checks whether an email already exists in the user database.
 * @param {string} email - Email to validate.
 * @returns {Promise<boolean>} True if email is available, false if exists.
 */
async function checkEmailExists(email) {
  const inputContainer = document.querySelectorAll(".input-container");
  let errorElements = errorFields();
  const users = await loadData("users/");
  for (const key in users) {
    if (email == users[key].email) {
      errorElements.email.innerHTML = "Email exists";
      addRedOutline(inputContainer[1]);
      return false;
    }
  }
  return true;
}

/**
 * Adds a red outline to the given input container.
 * @param {HTMLElement} target - The input container to highlight.
 */
function addRedOutline(target) {
  target.classList.add("light-red-outline");
}

/**
 * Compares password and confirm password inputs for equality and validity.
 * @param {HTMLInputElement} password - Password input element.
 * @param {HTMLInputElement} confirmPassword - Confirm password input element.
 * @returns {boolean} True if valid and matching, false otherwise.
 */
function comparePasswords(password, confirmPassword) {
  const inputContainer = document.querySelectorAll(".input-container");
  let errorElements = errorFields();
  const identical = password.value.trim() === confirmPassword.value.trim();
  if (!identical) {
    errorElements.password.innerHTML = "Passwords are not identical";
    addRedOutline(inputContainer[2]);
    addRedOutline(inputContainer[3]);
    return false;
  }
  if (password.value.length < 3) {
    errorElements.password.innerHTML = "Please enter a password.";
    addRedOutline(inputContainer[2]);
    addRedOutline(inputContainer[3]);
    return false;
  }
  return identical;
}

/**
 * Displays signup success overlay, then redirects to login.
 */
function showSignupSuccess() {
  openOverlay();
  setTimeout(() => {
    closeOverlay();
    openLogin();
  }, 2000);
}

/**
 * Redirects to the login page.
 */
function openLogin() {
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 250);
}

/**
 * Validates that a name is provided.
 * @param {string} userName - The name to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function checkName(userName) {
  const inputContainer = document.querySelectorAll(".input-container");
  let errorElements = errorFields();
  let validate = userName.trim() <= 0 || !userName.trim() ? false : true;
  if (!validate) {
    errorElements.name.innerHTML = "Please enter your name.";
    addRedOutline(inputContainer[0]);
  }
  return validate;
}

/**
 * Displays an error message for invalid email input.
 */
function errorEmail() {
  const inputContainer = document.querySelectorAll(".input-container");
  let errorElements = errorFields();
  errorElements.email.innerHTML = "Please enter a valid email address.";
  addRedOutline(inputContainer[1]);
}

/**
 * Validates all form fields before submission.
 * @returns {Promise<boolean>} True if all fields are valid, false otherwise.
 */
async function checkFormFields() {
  let inputs = formFields();
  let nameIsValid = checkName(inputs.name.value);
  let emailIsValid = validateEmail(inputs.email.value);
  let emailAvailable = false;
  if (!emailIsValid) errorEmail();
  if (emailIsValid) {
    emailAvailable = await checkEmailExists(inputs.email.value);
  }
  let passwordsMatch = comparePasswords(inputs.password, inputs.confirmPassword);
  let checkbox = checkPrivacy();
  showPrivacyError(!checkbox);
  if (!nameIsValid || !emailIsValid || !emailAvailable || !passwordsMatch || !checkbox) return false;
  return true;
}

/**
 * Checks if privacy policy checkbox is checked.
 * @returns {boolean} True if accepted, false otherwise.
 */
function checkPrivacy() {
  const checkbox = document.getElementById("privacyCheckbox");
  return checkbox.checked;
}

/**
 * Displays or hides privacy policy error message.
 * @param {boolean} show - Whether to show the error message.
 */
function showPrivacyError(show) {
  const errorElem = document.querySelector('.error-signup[data-field="errorPolicy"]');
  if (show) {
    errorElem.textContent = "Please accept the privacy policy.";
  } else {
    errorElem.textContent = "";
  }
}

/**
 * Toggles visibility of lock/eye icons for password fields depending on input value.
 * @param {Event} e - Input event.
 * @param {string} lockId - ID of the lock icon element.
 * @param {string} eyeId - ID of the eye icon element.
 */
function toggleLockIcon(e, lockId, eyeId) {
  const lock = document.getElementById(lockId);
  const eye = document.getElementById(eyeId);
  const hasValue = e.target.value.trim().length > 0;
  lock.style.display = hasValue ? "none" : "inline";
  eye.style.display = hasValue ? "inline" : "none";
  if (!hasValue) {
    e.target.type = "password";
    eye.src = "../assets/icons/eye-icon.svg";
  }
}

/**
 * Toggles input type between text and password, updating the eye icon accordingly.
 * @param {Event} e - Click event on the eye icon.
 * @param {string} data - Data attribute of the input field.
 * @param {string} [path=""] - Base path for the icon source.
 */
function toggleInputType(e, data, path = "") {
  const input = document.querySelector(`[data-field="${data}"]`);
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  e.target.src = isPassword ? `${path}./assets/icons/eye-slash.svg` : `${path}./assets/icons/eye-icon.svg`;
}

/**
 * Clears error messages and removes red outlines for the clicked input container.
 * Behavior depends on the container’s input type (checkbox|password|email|text).
 * Uses `errorFields()` and `formFields()`.
 * @param {Event} e - Event whose `currentTarget` is the container (first child is the input).
 */

function removeErrorReport(e) {
  const errors = errorFields();
  const inputs = formFields();
  let type = e.currentTarget.children[0].type;
  if (type == "checkbox") errors.policy.innerHTML = "";
  if (type == "password") {
    inputs.password.parentElement.classList.remove("light-red-outline");
    inputs.confirmPassword.parentElement.classList.remove("light-red-outline");
    errors.password.innerHTML = "";
  }
  if (type == "email") removeError(inputs.email.parentElement, errors.email);
  if (type == "text") removeError(inputs.name.parentElement, errors.name);
}

function removeError(container, errorElement) {
  container.classList.remove("light-red-outline");
  errorElement.innerHTML = "";
}