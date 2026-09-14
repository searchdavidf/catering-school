// js/kitchen.js — Kitchen dashboard logic

const KitchenDashboard = {
  orders: [],
  menuItems: [],
  currentView: 'orders',

  async init() {
    const user = await Auth.init();
    if (!user || !Auth.isKitchen()) {
      window.location.href = 'index.html';
      return;
    }
    await this.loadOrders();
    await this.loadMenuItems();
    this.startPolling();
  },

  async loadOrders() {
    try {
      this.orders = await API.getOrders();
      if (this.currentView === 'orders') this.renderOrders();
      this.updateStats();
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  },

  async loadMenuItems() {
    try {
      this.menuItems = await API.getAllMenuItems();
      if (this.currentView === 'menu') this.renderMenu();
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  },

  startPolling() {
    setInterval(() => this.loadOrders(), 3000);
  },

  switchTab(view) {
    this.currentView = view;
    document.querySelectorAll('.tab').forEach((t, i) => {
      const tabs = ['orders', 'menu'];
      t.classList.toggle('active', tabs[i] === view);
    });
    document.getElementById('ordersView').style.display = view === 'orders' ? 'block' : 'none';
    document.getElementById('menuView').style.display = view === 'menu' ? 'block' : 'none';
    if (view === 'menu') this.renderMenu();
  },

  updateStats() {
    document.getElementById('approvedCount').textContent = this.orders.filter(o => o.status === 'approved').length;
    document.getElementById('preparingCount').textContent = this.orders.filter(o => o.status === 'preparing').length;
    document.getElementById('readyCount').textContent = this.orders.filter(o => o.status === 'ready').length;
    document.getElementById('deliveredCount').textContent = this.orders.filter(o => o.status === 'delivered').length;
  },

  renderOrders() {
    const container = document.getElementById('ordersList');
    const active = this.orders.filter(o => !['pending', 'rejected'].includes(o.status));

    if (active.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">👨‍🍳</div>
          <p>No orders in the pipeline</p>
        </div>
      `;
      return;
    }

    container.innerHTML = active.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-id">${order.id.slice(0, 8)}</div>
            <div class="order-customer">${order.customer_name}</div>
            <div class="order-meta">${order.contact} · ${order.department}</div>
          </div>
          <span class="badge badge-${order.status}">${order.status}</span>
        </div>

        ${order.deadline ? `
          <div class="order-deadline">
            ⏰ Deadline: ${new Date(order.deadline).toLocaleString()}
          </div>
        ` : ''}

        <div style="font-size:0.9rem;color:var(--text-muted);margin-bottom:8px;">
          ${order.order_items?.map(i => `${i.quantity}x Item #${i.menu_item_id.slice(0, 6)}`).join(', ') || 'No items'}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:var(--gold);font-weight:700;">AED ${order.total?.toFixed(2) || '0.00'}</span>
        </div>

        ${order.status === 'approved' ? `
          <div class="order-actions">
            <button onclick="KitchenDashboard.updateStatus('${order.id}', 'preparing')" class="btn btn-sm btn-secondary">Start Preparing</button>
          </div>
        ` : ''}
        ${order.status === 'preparing' ? `
          <div class="order-actions">
            <button onclick="KitchenDashboard.updateStatus('${order.id}', 'ready')" class="btn btn-sm btn-success">Mark Ready</button>
          </div>
        ` : ''}
        ${order.status === 'ready' ? `
          <div class="order-actions">
            <button onclick="KitchenDashboard.updateStatus('${order.id}', 'delivered')" class="btn btn-sm btn-secondary">Mark Delivered</button>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  async updateStatus(orderId, status) {
    try {
      await API.updateOrderStatus(orderId, status, null, Auth.currentUser?.id);
      Toast.show(`Status updated to ${status}`, 'success');
      await this.loadOrders();
    } catch (err) {
      Toast.show('Failed to update status', 'error');
    }
  },

  renderMenu() {
    const container = document.getElementById('menuList');
    container.innerHTML = `
      <div class="grid grid-3">
        ${this.menuItems.map(item => `
          <div class="menu-card" style="${item.available ? '' : 'opacity:0.5;'}">
            <div style="display:flex;justify-content:space-between;align-items:start;">
              <div>
                <div class="menu-card-name">${item.name}</div>
                <div class="menu-card-desc">${item.description || ''}</div>
                <div class="menu-card-price">${item.price.toFixed(2)}</div>
              </div>
              <span class="badge badge-${item.available ? 'delivered' : 'rejected'}">${item.available ? 'Active' : 'Hidden'}</span>
            </div>
            <div class="order-actions">
              <button onclick="KitchenDashboard.editMenuItem('${item.id}')" class="btn btn-sm btn-secondary">Edit</button>
              <button onclick="KitchenDashboard.toggleAvailability('${item.id}', ${!item.available})" class="btn btn-sm btn-secondary">${item.available ? 'Hide' : 'Show'}</button>
              <button onclick="KitchenDashboard.deleteMenuItem('${item.id}')" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  showAddMenuModal() {
    document.getElementById('menuModalTitle').textContent = 'Add Menu Item';
    document.getElementById('menuItemId').value = '';
    document.getElementById('menuForm').reset();
    document.getElementById('menuItemAvailable').checked = true;
    document.getElementById('menuModal').style.display = 'flex';
  },

  closeMenuModal() {
    document.getElementById('menuModal').style.display = 'none';
  },

  editMenuItem(id) {
    const item = this.menuItems.find(m => m.id === id);
    if (!item) return;
    document.getElementById('menuModalTitle').textContent = 'Edit Menu Item';
    document.getElementById('menuItemId').value = item.id;
    document.getElementById('menuItemName').value = item.name;
    document.getElementById('menuItemDesc').value = item.description || '';
    document.getElementById('menuItemPrice').value = item.price;
    document.getElementById('menuItemCategory').value = item.category;
    document.getElementById('menuItemAvailable').checked = item.available;
    document.getElementById('menuModal').style.display = 'flex';
  },

  async saveMenuItem(e) {
    e.preventDefault();
    const id = document.getElementById('menuItemId').value;
    const item = {
      name: document.getElementById('menuItemName').value.trim(),
      description: document.getElementById('menuItemDesc').value.trim(),
      price: parseFloat(document.getElementById('menuItemPrice').value),
      category: document.getElementById('menuItemCategory').value.trim(),
      available: document.getElementById('menuItemAvailable').checked,
    };

    try {
      if (id) {
        await API.updateMenuItem(id, item);
        Toast.show('Item updated', 'success');
      } else {
        await API.createMenuItem(item);
        Toast.show('Item added', 'success');
      }
      this.closeMenuModal();
      await this.loadMenuItems();
    } catch (err) {
      Toast.show('Failed to save item', 'error');
    }
  },

  async toggleAvailability(id, available) {
    try {
      await API.updateMenuItem(id, { available });
      Toast.show(available ? 'Item shown' : 'Item hidden', 'success');
      await this.loadMenuItems();
    } catch (err) {
      Toast.show('Failed to update item', 'error');
    }
  },

  async deleteMenuItem(id) {
    if (!confirm('Delete this item?')) return;
    try {
      await API.deleteMenuItem(id);
      Toast.show('Item deleted', 'success');
      await this.loadMenuItems();
    } catch (err) {
      Toast.show('Failed to delete item', 'error');
    }
  },
};

document.addEventListener('DOMContentLoaded', () => KitchenDashboard.init());
