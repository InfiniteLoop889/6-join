let BASE_URL = "https://join-52020-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Creates a user object with default values.
 * @param {string} name - User's full name.
 * @param {string} email - User's email.
 * @param {string} [phone="01510000000"] - User's phone number.
 * @param {string} [color] - Assigned color.
 * @param {boolean} [assigned=false] - Assigned state.
 * @param {string|boolean} [password=false] - User password.
 * @returns {Object} User object.
 */
function createUser(name, email, phone = "01510000000", color = getRandomColor(), assigned = false, password = false) {
  return {
    name: name,
    email: email,
    color: color,
    assigned: assigned,
    phone: phone.toString(),
    password: password.toString(),
    avatar: createAvater(name)
  };
}

/**
 * Generates initials from a name to be used as avatar text.
 * @param {string} name - User's full name.
 * @returns {string} Initials.
 */
function createAvater(name) {
  let myArr = name.split(" ");
  let avatar = "";
  myArr.forEach(element => {
    avatar += element.charAt(0);
  });
  return avatar
}

/**
 * Returns a random color from a preset list.
 * @returns {string} Hex color code.
 */
function getRandomColor() {
  const colors = ["#f1c40f", "#1abc9c", "#3498db", "#e67e22", "#9b59b6"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Creates and posts a new user to the database.
 * @param {string} name - User name.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @param {string} [phone="01510000000"] - Phone number.
 * @param {string} [color] - Assigned color.
 * @param {boolean} [assigned] - Assigned state.
 * @returns {Promise<void>}
 */
async function postUser(name, email, password, phone = "01510000000", color = getRandomColor(), assigned) {
  let user = createUser(name, email, phone.trim(), color, assigned, password);
  let validate = validateUser(user);
  if (!validate) {
    console.error("user obj not correct!");
    return;
  }
  let path = "users/";
  await postData(path, user);
}

/**
 * Validates a user object.
 * @param {Object} user - User object.
 * @returns {boolean} True if valid, otherwise false.
 */
function validateUser(user) {
  if (typeof user.name !== "string" || user.name.trim() === "") return false;
  if (typeof user.email !== "string" || user.email.trim() === "") return false;
  if (typeof user.phone !== "string" || user.phone.trim() === "") return false;
  return true;
}

/**
 * Loads data from the database.
 * @param {string} link - Path after BASE_URL.
 * @returns {Promise<any>} JSON response.
 */
async function loadData(link) {
  let response = await fetch(BASE_URL + link + ".json");
  let responseToJson = await response.json();
  return responseToJson;
}

/**
 * Posts data to the database.
 * @param {string} path - Database path.
 * @param {Object} [data={}] - Data to send.
 * @returns {Promise<any>} JSON response.
 */
async function postData(path, data = {}) {
  if (!path) {
    console.error("path not defined!");
    return;
  }
  let response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  let responseToJson = await response.json();
  return responseToJson;
}

/**
 * Replaces data at a database path.
 * @param {string} path - Database path.
 * @param {Object} [data={}] - Data to write.
 * @returns {Promise<void>}
 */
async function putData(path, data = {}) {
  if (!path) {
    console.error("path not defined!");
    return;
  }
  await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * Deletes data from a database path.
 * @param {string} [path=""] - Database path.
 * @returns {Promise<void>}
 */
async function deleteData(path = "") {
  await fetch(BASE_URL + path + ".json", {
    method: "DELETE",
  });
}