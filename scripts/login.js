/**
 * Resets signup UI state (hides messages, clears styles).
 * @returns {void}
 */
function resetSignup() {
  emailForm.error.style.display = "none";
  emailForm.success.style.display = "none";
  emailForm.input.classList.remove("error", "success");
}

/**
 * Enables/disables the login button based on email/password validity.
 * Uses global `isEmailValid` and DOM #password.
 * @returns {void}
 */
function updateLoginButton() {
  const passwordInput = document.getElementById("password");
  if (isEmailValid && passwordInput.value.trim()) {
    emailForm.button.disabled = false;
    emailForm.button.style.opacity = "1";
  } else {
    emailForm.button.disabled = true;
    emailForm.button.style.opacity = "0.6";
  }
}

/**
 * Attempts to log in the user by loading users and validating credentials.
 * Navigates on success, shows error on failure.
 * @returns {Promise<void>}
 */
async function handleLogin() {
  const users = await loadData("users/");
  console.log(users);
  
  let userName = isValidLogin(users);
  if (userName) {
    startLogin(userName, "summary");
  } else {
    failLogin();
  }
}

/**
 * Starts login flow by redirecting to the target page with URL params.
 * @param {string} name - Authenticated user's name.
 * @param {string} target - Target page (without extension).
 * @returns {void}
 */
function startLogin(name, target) {
  const params = new URLSearchParams({
    User: name,
    Status: "to-do",
  });
  window.location.href = `./html-templates/${target}.html?${params}`;
}

/**
 * Shows login failure UI and highlights input containers.
 * @returns {void}
 */
function failLogin() {
  const errorElements = errorFields();
  const container = document.querySelectorAll(".input-container");
  errorElements.password.innerHTML =
    "Check your email and Password. Please try again.";
  container.forEach((element) => {
    addRedOutline(element);
  });
}

/**
 * Validates credentials against loaded users.
 * @param {Object<string, {email:string,password:string,name:string}>} users - Users keyed by id.
 * @returns {string|false} The matching user's name, or false if invalid.
 */
function isValidLogin(users) {
  const inputs = formFields();
  let validate = false;
  for (const key in users) {
    if (
      users[key].email == inputs.email.value &&
      users[key].password == inputs.password.value
    ) {
      return users[key].name;
    }
  }
  return false;
}

/**
 * Validates current inputs and updates the login button state.
 * @returns {void}
 */
function activateLogin() {
    const inputs = formFields();
    let email = validateEmail(inputs.email.value.trim());
    let password = checkPasswordLength(inputs.password.value.trim());
    updateLoginButton(email, password);
}

/**
 * Checks if a password has non-zero length.
 * @param {string} password - Password string.
 * @returns {boolean} True if not empty.
 */
function checkPasswordLength(password) {
  if (password.length > 0) return true;
  return false;
}

/**
 * Updates the login button enabled state based on booleans.
 * NOTE: This name duplicates an earlier function and will override it.
 * @param {boolean} email - Email validity flag.
 * @param {boolean} password - Password presence flag.
 * @returns {void}
 */
function updateLoginButton(email, password) {
    let loginBtn = document.getElementById("login-btn");
    if (email && password) {
        loginBtn.disabled = false;
    } else loginBtn.disabled = true;
}

/**
 * Clears login error styles and messages.
 * @returns {void}
 */
function removeLoginErrors() {
  const container = document.querySelectorAll(".input-container");
  const errors = errorFields();
  container.forEach((element) => {
    element.classList.remove("light-red-outline");
  });
  errors.password.innerHTML = "";
}

/* 
 * Registers click handlers to clear errors when inputs are focused.
 */
document.addEventListener("DOMContentLoaded", () => {
  const inputs = formFields();
  for (const key in inputs) {
    if (inputs[key] == null) continue;
    inputs[key].addEventListener("click", () => {
      removeLoginErrors();
    });
  }
});