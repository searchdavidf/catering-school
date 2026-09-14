// js/order-lookup.js — Order status lookup

const OrderLookup = {
  toggle() {
    const el = document.getElementById('orderLookup');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  },

  async search() {
    const id = document.getElementById('orderLookupId').value.trim();
    const resultEl = document.getElementById('orderLookupResult');

    if (!id) {
      resultEl.innerHTML = '<p style="color:var(--danger);">Please enter an Order ID</p>';
      return;
    }

    try {
      const order = await API.getOrderById(id);
      if (!order) {
        resultEl.innerHTML = '<p style="color:var(--danger);">Order not found</p>';
        return;
      }

      resultEl.innerHTML = `
        <div style="padding:12px;background:var(--bg-navy-mid);border-radius:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span class="order-id">${order.id.slice(0, 8)}</span>
            <span class="badge badge-${order.status}">${order.status}</span>
          </div>
          <div style="font-weight:600;">${order.customer_name}</div>
          <div style="font-size:0.85rem;color:var(--text-muted);">${order.department}</div>
          ${order.deadline ? `<div style="font-size:0.85rem;color:var(--gold);margin-top:4px;">⏰ ${new Date(order.deadline).toLocaleString()}</div>` : ''}
          <div style="color:var(--gold);font-weight:700;margin-top:8px;">AED ${order.total?.toFixed(2) || '0.00'}</div>
        </div>
      `;
    } catch (err) {
      resultEl.innerHTML = '<p style="color:var(--danger);">Order not found</p>';
    }
  }
};
