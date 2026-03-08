const API_URL = "/api/items";

let items = [];

/* LOAD ITEMS */

async function loadItems() {
  try {

    const res = await fetch(API_URL);
    items = await res.json();

    renderItems(items);
    updateStats();

  } catch (err) {
    console.error("Load error:", err);
  }
}

/* DISPLAY ITEMS */

function renderItems(data) {

  const container = document.getElementById("itemsList");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(item => {

    const card = document.createElement("div");
    card.className = "item-card";

    const type = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : "Unknown";

    card.innerHTML = `
      <div class="item-title">${item.title}</div>
      <div class="item-desc">${item.description}</div>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Status:</strong> ${item.status || "Active"}</p>
      <p><strong>Contact:</strong> ${item.contact}</p>

      <button class="resolve-btn" data-id="${item.id}">
        Mark Resolved
      </button>

      <button class="delete-btn" data-id="${item.id}">
        Delete
      </button>
    `;

    container.appendChild(card);
  });

  attachButtonEvents();
}

/* ATTACH BUTTON EVENTS */

function attachButtonEvents() {

  document.querySelectorAll(".resolve-btn").forEach(btn => {

    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;

      await fetch(`/api/items/${id}`, {
        method: "PUT"
      });

      loadItems();

    });

  });

  document.querySelectorAll(".delete-btn").forEach(btn => {

    btn.addEventListener("click", async () => {

      if (!confirm("Delete this item?")) return;

      const id = btn.dataset.id;

      await fetch(`/api/items/${id}`, {
        method: "DELETE"
      });

      loadItems();

    });

  });

}

/* UPDATE STATS */

function updateStats() {

  const total = document.getElementById("totalItems");
  const lost = document.getElementById("lostCount");
  const found = document.getElementById("foundCount");

  if (!total) return;

  total.textContent = items.length;

  lost.textContent =
    items.filter(i => i.category === "Lost").length;

  found.textContent =
    items.filter(i => i.category === "Found").length;
}

/* SEARCH */

function setupSearch() {

  const search = document.getElementById("searchInput");
  if (!search) return;

  search.addEventListener("input", () => {

    const text = search.value.toLowerCase();

    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(text) ||
      item.description.toLowerCase().includes(text)
    );

    renderItems(filtered);

  });

}

/* FILTER BUTTONS */

function setupFilters() {

  const allBtn = document.getElementById("filterAll");
  const lostBtn = document.getElementById("filterLost");
  const foundBtn = document.getElementById("filterFound");

  if (allBtn)
    allBtn.addEventListener("click", () => renderItems(items));

  if (lostBtn)
    lostBtn.addEventListener("click", () =>
      renderItems(items.filter(i => i.category === "Lost"))
    );

  if (foundBtn)
    foundBtn.addEventListener("click", () =>
      renderItems(items.filter(i => i.category === "Found"))
    );
}

/* SUBMIT FORM */

function setupForm() {

  const form = document.getElementById("itemForm");
  if (!form) return;

  form.addEventListener("submit", async e => {

    e.preventDefault();

    const item = {

  title: document.getElementById("title")?.value || "",
  description: document.getElementById("description")?.value || "",
  category: (document.getElementById("category")?.value || "").toLowerCase(),
  location: document.getElementById("location")?.value || "",
  date: document.getElementById("date")?.value || "",
  contact: document.getElementById("contact")?.value || ""

};

    await fetch(API_URL, {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)

    });

    alert("Item reported successfully");

    window.location.href = "index.html";

  });
}

/* INITIALIZE */

document.addEventListener("DOMContentLoaded", () => {

  loadItems();
  setupSearch();
  setupFilters();
  setupForm();

});