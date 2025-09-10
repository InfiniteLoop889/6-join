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
 * Opens the privacy policy page.
 * @param {string} [path=""] - Base path for the URL.
 */
function openPrivacy(path = "") {
  const params = new URLSearchParams({
    User: "privacy",
    Status: "to-do",
  });
  window.location.href = `${path}./html-templates/privacy-policy-logged-out.html?${params}`;
}

/**
 * Opens the legal notice page.
 * @param {string} [path=""] - Base path for the URL.
 */
function openLegal(path = "") {
  const params = new URLSearchParams({
    User: "legal",
    Status: "to-do",
  });
  window.location.href = `${path}./html-templates/legal-notice-logged-out.html?${params}`;
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

// Initialize form events after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const inputs = formFields();
  const error = errorFields();
  const inputContainer = document.querySelectorAll(".input-container");
  addEventToInputs(inputs, error, inputContainer);
});

/**
 * Attaches event listeners to form inputs to clear errors on interaction.
 * @param {Object} inputs - Input field references.
 * @param {Object} error - Error field references.
 * @param {NodeList} inputContainer - List of input container elements.
 */
function addEventToInputs(inputs, error, inputContainer) {
  for (const key in inputs) {
    if (!inputs[key]) return;
    inputs[key].addEventListener("click", () => {
      let name = inputs[key].getAttribute("name");
      if (name == "name") removeErrorReport(error.name, inputContainer[0]);
      if (name == "email") removeErrorReport(error.email, inputContainer[1]);
      if (name == "password" || name == "confirmPassword") {
        removeErrorReport(error.password, inputContainer[2]);
        removeErrorReport(error.password, inputContainer[3]);
      }
    });
  }
}

/**
 * Removes error messages and red outlines from an input container.
 * @param {HTMLElement} error - Error element to clear.
 * @param {HTMLElement} inputContainer - Container element to reset.
 */
function removeErrorReport(error, inputContainer) {
  error.innerHTML = "";
  inputContainer.classList.remove("light-red-outline");
}
