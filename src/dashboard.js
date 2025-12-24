// dashboard.js - menu-driven dashboard with separate pages for View/Issue/Return

// Helpers to build UI
function el(tag, props = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else e[k] = v;
  });
  children.forEach(c => { if (c) e.appendChild(c); });
  return e;
}

const ROOT = document.getElementById('dashboardRoot') || document.getElementById('app') || document.body;

// containers
const menuContainer = el('div', { id: 'menuContainer', class: 'menu-container' });
const pageContainer = el('div', { id: 'pageContainer', class: 'page-container', style: 'display:none;' });

// build menu buttons
const viewBtn = el('button', { id: 'viewBooksBtn', class: 'big-btn' });
viewBtn.textContent = 'View Books';
const issueBtn = el('button', { id: 'issueBookBtn', class: 'big-btn' });
issueBtn.textContent = 'Issue Books';
const returnBtn = el('button', { id: 'returnBookBtn', class: 'big-btn' });
returnBtn.textContent = 'Return Books';
const logoutBtn = el('button', { id: 'logoutBtn', class: 'big-btn logout' });
logoutBtn.textContent = 'Logout';

menuContainer.appendChild(viewBtn);
menuContainer.appendChild(issueBtn);
menuContainer.appendChild(returnBtn);
menuContainer.appendChild(logoutBtn);

// page header with back button and title
const backBtn = el('button', { id: 'backBtn', class: 'small-btn' });
backBtn.textContent = 'Back';
const pageTitle = el('h2', { id: 'pageTitle' });
const header = el('div', { class: 'page-header' }, backBtn, pageTitle);

// books list area
const booksList = el('ul', { id: 'booksList', class: 'books-list' });
pageContainer.appendChild(header);
pageContainer.appendChild(booksList);

// mount UI (insert before existing booksList if present, else append)
(function mount() {
  const existingBooksList = document.getElementById('booksList');
  if (existingBooksList) {
    existingBooksList.remove(); // avoid duplicate
  }
  ROOT.appendChild(menuContainer);
  ROOT.appendChild(pageContainer);
})();

// Theme toggle: small sun/moon button that persists preference
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  document.body.classList.toggle('light-mode', theme === 'light');
  if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☾' : '☀';
}

function initialTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function toggleTheme() {
  const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

// apply theme now and wire the button
applyTheme(initialTheme());
themeToggle?.addEventListener('click', toggleTheme);

// Data helpers
async function loadBooks() {
  let books = null;
  try {
    const stored = localStorage.getItem('books');
    if (stored) books = JSON.parse(stored);
  } catch (e) { books = null; }

  if (!books) {
    try {
      const res = await fetch('books.json');
      books = await res.json();
      if (!Array.isArray(books) && Array.isArray(books.books)) books = books.books;
    } catch (e) {
      books = [];
    }
    // ensure IDs
    books = (books || []).map((b, i) => ({ id: b.id ?? `b${i}`, title: b.title ?? 'Untitled', author: b.author ?? 'Unknown', issued: !!b.issued }));
    localStorage.setItem('books', JSON.stringify(books));
  }
  return books;
}

async function persistBooks(books) {
  localStorage.setItem('books', JSON.stringify(books));
}

// render functions
async function displayBooks(mode = 'view') {
  const books = await loadBooks();
  booksList.innerHTML = '';
  pageTitle.textContent = mode === 'view' ? 'All Books' : mode === 'issue' ? 'Available Books to Issue' : 'Issued Books to Return';

  if (!books || books.length === 0) {
    booksList.appendChild(el('li', { html: 'No books available.' }));
    return;
  }

  let filtered = books;
  if (mode === 'issue') filtered = books.filter(b => !b.issued);
  if (mode === 'return') filtered = books.filter(b => b.issued);

  if (filtered.length === 0) {
    const msg = mode === 'issue' ? 'No available books to issue.' : mode === 'return' ? 'No issued books to return.' : 'No books available.';
    booksList.appendChild(el('li', { html: msg }));
    return;
  }

  filtered.forEach(book => {
    const li = el('li', { class: 'book-item' });
    const text = el('span', { class: 'book-text', html: `${escapeHtml(book.title)} — ${escapeHtml(book.author)}` });
    li.appendChild(text);

    if (mode === 'view') {
      const badge = el('span', { class: `status-badge ${book.issued ? 'issued' : 'available'}`, html: book.issued ? 'Issued' : 'Available' });
      li.appendChild(badge);
    } else if (mode === 'issue') {
      const btn = el('button', { class: 'small-btn issue-btn' });
      btn.textContent = 'Issue';
      btn.addEventListener('click', async () => {
        await toggleIssueStatus(book.id, true);
        await displayBooks('issue');
      });
      li.appendChild(btn);
    } else if (mode === 'return') {
      const btn = el('button', { class: 'small-btn return-btn' });
      btn.textContent = 'Return';
      btn.addEventListener('click', async () => {
        await toggleIssueStatus(book.id, false);
        await displayBooks('return');
      });
      li.appendChild(btn);
    }

    booksList.appendChild(li);
  });
}

// simple toggle and persist
async function toggleIssueStatus(bookId, setIssued) {
  const books = await loadBooks();
  const idx = books.findIndex(b => b.id === bookId);
  if (idx === -1) return;
  books[idx].issued = !!setIssued;
  await persistBooks(books);
}

// navigation
function showMenu() {
  pageContainer.style.display = 'none';
  menuContainer.style.display = '';
}

async function openPage(mode) {
  menuContainer.style.display = 'none';
  pageContainer.style.display = '';
  await displayBooks(mode);
}

// back button
backBtn.addEventListener('click', () => {
  showMenu();
});

// menu button handlers
viewBtn.addEventListener('click', () => openPage('view'));
issueBtn.addEventListener('click', () => openPage('issue'));
returnBtn.addEventListener('click', () => openPage('return'));
logoutBtn.addEventListener('click', () => {
  window.location.href = 'login.html';
});

// utility to avoid XSS when inserting text
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
  });
}

// initial
showMenu();
