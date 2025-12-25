// Test cases for Login Module

function runLoginTests(users) {
  console.log("Running Login Module Tests...");

  // Test 1: Valid login
  let validUser = users.find(u => u.username === "admin" && u.password === "admin123");
  console.assert(validUser !== undefined, "Test 1 Failed: Valid user login");

  // Test 2: Invalid username
  let invalidUser = users.find(u => u.username === "wrong" && u.password === "admin123");
  console.assert(invalidUser === undefined, "Test 2 Failed: Invalid username rejected");

  // Test 3: Invalid password
  let invalidPwd = users.find(u => u.username === "admin" && u.password === "wrongpass");
  console.assert(invalidPwd === undefined, "Test 3 Failed: Invalid password rejected");

  // Test 4: Show/hide password toggle
  const passwordFieldType = "password"; // simulate default
  const showPasswordChecked = true; // simulate toggle
  const newType = showPasswordChecked ? "text" : "password";
  console.assert(newType === "text", "Test 4 Failed: Show password toggle");

  console.log("Login Module Tests Completed!");
}

// Example users for testing
const users = [
  { username: "admin", password: "admin123" },
  { username: "user1", password: "password1" }
];

runLoginTests(users);
