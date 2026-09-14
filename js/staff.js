// js/staff.js — Staff dashboard logic

const StaffDashboard = {
  orders: [],
  currentTab: 'pending',

  async init() {
    const user = await Auth.init();
    if (!user || !Auth.isStaff()) {
      window.location.href = 'index.html';
      return;
    }
    await this.loadOrders();
    this.startPolling();
  },

  async loadOrders() {
    try {
      this.orders = await API.getOrders();
      this.render();
      this.updateStats();
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  },

  startPolling() {
    setInterval(() => this.loadOrders(), 3000);
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab').forEach((t, i) => {
      const tabs = ['pending', 'approved', 'all'];
      t.classList.toggle('active', tabs[i] === tab);
    });
    this.render();
  },

  updateStats() {
    document.getElementById('pendingCount').textContent = this.orders.filter(o => o.status === 'pending').length;
    document.getElementById('approvedCount').textContent = this.orders.filter(o => o.status === 'approved').length;
    document.getElementById('preparingCount').textContent = this.orders.filter(o => o.status === 'preparing').length;
    document.getElementById('deliveredCount').textContent = this.orders.filter(o => o.status === 'delivered').length;
  },

  render() {
    const container = document.getElementById('ordersList');
    let filtered = this.orders;

    if (this.currentTab === 'pending') filtered = this.orders.filter(o => o.status === 'pending');
    else if (this.currentTab === 'approved') filtered = this.orders.filter(o => ['approved', 'preparing', 'ready', 'delivered'].includes(o.status));

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>No orders in this category</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(order => `
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
          ${order.order_items?.map(i => `${i.quantity}x ${i.menu_item_id}`).join(', ') || 'No items'}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:var(--gold);font-weight:700;">AED ${order.total?.toFixed(2) || '0.00'}</span>
          <span style="font-size:0.8rem;color:var(--text-muted);">${new Date(order.created_at).toLocaleString()}</span>
        </div>

        ${order.status === 'pending' ? `
          <div class="order-actions">
            <button onclick="StaffDashboard.approve('${order.id}')" class="btn btn-sm btn-success">✓ Approve</button>
            <button onclick="StaffDashboard.reject('${order.id}')" class="btn btn-sm btn-danger">✕ Reject</button>
            <input type="datetime-local" id="deadline-${order.id}" class="input" style="width:auto;flex:1;min-width:180px;">
            <button onclick="StaffDashboard.setDeadline('${order.id}')" class="btn btn-sm btn-secondary">Set Deadline</button>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  async approve(orderId) {
    try {
      await API.updateOrderStatus(orderId, 'approved', null, Auth.currentUser?.id);
      Toast.show('Order approved', 'success');
      await this.loadOrders();
    } catch (err) {
      Toast.show('Failed to approve order', 'error');
    }
  },

  async reject(orderId) {
    try {
      await API.updateOrderStatus(orderId, 'rejected', null, Auth.currentUser?.id);
      Toast.show('Order rejected', 'info');
      await this.loadOrders();
    } catch (err) {
      Toast.show('Failed to reject order', 'error');
    }
  },

  async setDeadline(orderId) {
    const input = document.getElementById(`deadline-${orderId}`);
    const deadline = input.value;
    if (!deadline) {
      Toast.show('Please select a deadline', 'error');
      return;
    }
    try {
      await API.setDeadline(orderId, new Date(deadline).toISOString());
      Toast.show('Deadline set', 'success');
      await this.loadOrders();
    } catch (err) {
      Toast.show('Failed to set deadline', 'error');
    }
  },
};

document.addEventListener('DOMContentLoaded', () => StaffDashboard.init());
