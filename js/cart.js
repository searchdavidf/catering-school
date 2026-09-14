// js/cart.js — Cart module

const Cart = {
  items: [],

  init() {
    const saved = localStorage.getItem('catering_cart');
    if (saved) this.items = JSON.parse(saved);
    this.render();
    this.updateCount();
  },

  save() {
    localStorage.setItem('catering_cart', JSON.stringify(this.items));
  },

  add(item) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...item, quantity: 1 });
    }
    this.save();
    this.render();
    this.updateCount();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.render();
    this.updateCount();
  },

  updateQuantity(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.remove(id);
      return;
    }
    this.save();
    this.render();
    this.updateCount();
  },

  clear() {
    this.items = [];
    this.save();
    this.render();
    this.updateCount();
  },

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  getCount() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  },

  toggle() {
    const sidebar = document.getElementById('cartSidebar');
    const isOpen = sidebar.style.right === '0px';
    sidebar.style.right = isOpen ? '-400px' : '0px';
    if (!isOpen) this.render();
  },

  render() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const toggleBtn = document.getElementById('cartToggle');

    if (this.items.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Your cart is empty</p>';
      totalEl.innerHTML = '';
      if (toggleBtn) toggleBtn.style.display = 'none';
      return;
    }

    if (toggleBtn) toggleBtn.style.display = 'flex';

    container.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div style="color:var(--gold);font-size:0.85rem;">AED ${item.price}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', -1)">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', 1)">+</button>
          <button class="qty-btn" onclick="Cart.remove('${item.id}')" style="margin-left:8px;color:var(--danger);">🗑️</button>
        </div>
      </div>
    `).join('');

    totalEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.1rem;">
        <span>Total</span>
        <span style="color:var(--gold);">AED ${this.getTotal().toFixed(2)}</span>
      </div>
    `;
  },

  updateCount() {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = this.getCount();
  },

  checkout() {
    if (this.items.length === 0) {
      Toast.show('Your cart is empty', 'error');
      return;
    }
    document.getElementById('cartSidebar').style.right = '-400px';
    document.getElementById('checkoutModal').style.display = 'flex';
  },

  closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
  },

  showOrderSuccess(orderId) {
    document.getElementById('orderSuccessId').textContent = orderId.slice(0, 8);
    document.getElementById('orderSuccessModal').style.display = 'flex';
  },

  closeOrderSuccess() {
    document.getElementById('orderSuccessModal').style.display = 'none';
  },

  async submitOrder(e) {
    e.preventDefault();
    const name = document.getElementById('customerName').value.trim();
    const contact = document.getElementById('customerContact').value.trim();
    const dept = document.getElementById('customerDept').value.trim();

    try {
      const order = await API.createOrder({
        customer_name: name,
        contact,
        department: dept,
        total: this.getTotal(),
        status: 'pending',
      }, this.items);

      this.clear();
      this.closeCheckout();
      this.showOrderSuccess(order.id);
    } catch (err) {
      Toast.show('Failed to place order. Please try again.', 'error');
      console.error(err);
    }
  }
};
