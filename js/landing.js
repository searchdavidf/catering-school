// js/landing.js — Landing page logic

let menuItems = [];
let filteredItems = [];
let activeCategory = 'all';

async function init() {
  try {
    menuItems = await API.getMenuItems();
    filteredItems = menuItems;
    renderCategories();
    renderMenu();
    Cart.init();
  } catch (err) {
    console.error('Failed to load menu:', err);
    document.getElementById('menuGrid').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p>Failed to load menu. Please refresh.</p>
      </div>
    `;
  }
}

function renderCategories() {
  const categories = ['all', ...new Set(menuItems.map(i => i.category))];
  const container = document.getElementById('categoryPills');
  container.innerHTML = categories.map(cat => `
    <button class="category-pill ${activeCategory === cat ? 'active' : ''}" onclick="filterByCategory('${cat}')">
      ${cat === 'all' ? '🍽️ All' : cat}
    </button>
  `).join('');
}

function filterByCategory(category) {
  activeCategory = category;
  applyFilters();
}

function applyFilters() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

  filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  renderMenu();
  renderCategories();
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const emptyState = document.getElementById('emptyState');

  if (filteredItems.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  grid.innerHTML = filteredItems.map(item => `
    <div class="menu-card" onclick="Cart.add({ id: '${item.id}', name: '${item.name}', price: ${item.price} })">
      <div class="menu-card-image">${getCategoryIcon(item.category)}</div>
      <div class="menu-card-name">${item.name}</div>
      <div class="menu-card-desc">${item.description || ''}</div>
      <div class="menu-card-price">${item.price.toFixed(2)}</div>
    </div>
  `).join('');
}

function getCategoryIcon(category) {
  const icons = {
    'Main Course': '🍛',
    'Breads': '🫓',
    'Desserts': '🍰',
    'Beverages': '🥤',
    'Starters': '🥘',
    'Chinese': '🍜',
  };
  return icons[category] || '🍽️';
}

// Search handler
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  init();
});
