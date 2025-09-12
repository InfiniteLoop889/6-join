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
 * Adds a red outline to the given input container.
 * @param {HTMLElement} target - The input container to highlight.
 */
function addRedOutline(target) {
  target.classList.add("light-red-outline");
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