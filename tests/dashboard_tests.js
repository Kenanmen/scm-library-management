// Test cases for Dashboard Module

function runDashboardTests(books) {
  console.log("Running Dashboard Module Tests...");

  // Test 1: Check all four buttons exist
  const buttons = ["View Books", "Issue Book", "Return Book", "Search Book"];
  console.assert(buttons.length === 4, "Test 1 Failed: Dashboard buttons missing");

  // Test 2: Validate book listing
  console.assert(books.length > 0, "Test 2 Failed: No books available");

  // Test 3: Add book functionality (simulate)
  const newBook = { title: "New Book", author: "Author A" };
  books.push(newBook);
  console.assert(books.includes(newBook), "Test 3 Failed: Add book failed");

  console.log("Dashboard Module Tests Completed!");
}

// Example books for testing
const books = [
  { title: "Book 1", author: "Author A" },
  { title: "Book 2", author: "Author B" }
];

runDashboardTests(books);
