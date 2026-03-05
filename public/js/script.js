const API = "/api/items";

let allItems = [];
let currentCategory = null;

/* ── LOAD ITEMS ── */
async function loadItems() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Server error: " + res.status);
    allItems = await res.json();
    updateStats();
    applyFilters();
  } catch (err) {
    console.error("loadItems failed:", err);
    showToast("Could not connect to server. Is it running?", "error");
    const container = document.getElementById("itemsList");
    if (container) container.innerHTML = `<p class="error-msg">Failed to load items. Make sure the server is running on port 5000.</p>`;
  }
}

loadItems();

/* ── DISPLAY ITEMS ── */
function displayItems(items) {
  const container = document.getElementById("itemsList");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<p class="empty-msg">No items found.</p>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const categoryClass = item.category === "Lost" ? "lost" : "found";
    const isResolved = item.status === "Resolved";
    const id = Number(item.id);

    return `
      <div class="item-card ${isResolved ? "resolved" : ""}">
        <div class="card-top">
          <span class="badge ${categoryClass}">${item.category}</span>
          <span class="badge status">${item.status || "Open"}</span>
        </div>
        <div class="item-title">${escapeHtml(item.title)}</div>
        <div class="item-desc">${escapeHtml(item.description)}</div>
        <div class="item-meta">
          <p>📍 ${escapeHtml(item.location || "—")}</p>
          <p>📅 ${item.date || "—"}</p>
          <p>📞 ${escapeHtml(item.contact || "—")}</p>
        </div>
        <div class="actions">
          <button
            class="update-btn"
            onclick="updateStatus(${id})"
            ${isResolved ? "disabled" : ""}
          >${isResolved ? "✔ Resolved" : "Mark Resolved"}</button>
          <button class="delete-btn" onclick="deleteItem(${id})">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

/* ── SAFE HTML ESCAPE ── */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── UPDATE STATUS ── */
async function updateStatus(id) {
  try {
    const res = await fetch(API + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Resolved" })
    });
    if (!res.ok) throw new Error("Server responded with " + res.status);
    showToast("Item marked as resolved ✔");
    loadItems();
  } catch (err) {
    console.error("updateStatus failed:", err);
    showToast("Failed to update item. Check server.", "error");
  }
}

/* ── DELETE ITEM ── */
async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  try {
    const res = await fetch(API + "/" + id, { method: "DELETE" });
    if (!res.ok) throw new Error("Server responded with " + res.status);
    showToast("Item deleted.");
    loadItems();
  } catch (err) {
    console.error("deleteItem failed:", err);
    showToast("Failed to delete item. Check server.", "error");
  }
}

/* ── SEARCH ── */
function filterItems() {
  applyFilters();
}

/* ── CATEGORY FILTER ── */
function filterCategory(cat, btn) {
  currentCategory = cat;
  setActiveBtn(btn);
  applyFilters();
}

function showAll(btn) {
  currentCategory = null;
  setActiveBtn(btn);
  applyFilters();
}

/* ── COMBINED FILTER ── */
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

  let filtered = allItems;

  if (currentCategory) {
    filtered = filtered.filter(item => item.category === currentCategory);
  }

  if (keyword) {
    filtered = filtered.filter(item =>
      (item.title || "").toLowerCase().includes(keyword) ||
      (item.description || "").toLowerCase().includes(keyword) ||
      (item.location || "").toLowerCase().includes(keyword)
    );
  }

  displayItems(filtered);
}

/* ── ACTIVE FILTER BUTTON ── */
function setActiveBtn(btn) {
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

/* ── STATS ── */
function updateStats() {
  const total = document.getElementById("totalItems");
  const lost  = document.getElementById("lostCount");
  const found = document.getElementById("foundCount");
  if (total) total.innerText = allItems.length;
  if (lost)  lost.innerText  = allItems.filter(i => i.category === "Lost").length;
  if (found) found.innerText = allItems.filter(i => i.category === "Found").length;
}

/* ── TOAST NOTIFICATION ── */
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) { alert(msg); return; }
  toast.textContent = msg;
  toast.className = "toast show " + type;
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

/* ── ADD ITEM FORM ── */
const form = document.getElementById("itemForm");

if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const item = {
      title:       document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim(),
      category:    document.getElementById("category").value,
      location:    document.getElementById("location").value.trim(),
      date:        document.getElementById("date").value,
      contact:     document.getElementById("contact").value.trim()
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error("Server error " + res.status);
      alert("Item reported successfully!");
      window.location = "index.html";
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to submit. Make sure the server is running.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Report";
    }
  });
}