// js/api.js — Supabase API calls

const API = {
  // Menu
  async getMenuItems() {
    const { data, error } = await window.supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('sort_order');
    if (error) throw error;
    return data || [];
  },

  async getAllMenuItems() {
    const { data, error } = await window.supabase
      .from('menu_items')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data || [];
  },

  async createMenuItem(item) {
    const { data, error } = await window.supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMenuItem(id, updates) {
    const { data, error } = await window.supabase
      .from('menu_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMenuItem(id) {
    const { error } = await window.supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Orders
  async createOrder(order, items) {
    const { data: orderData, error: orderError } = await window.supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: orderData.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    await window.supabase.from('order_items').insert(orderItems);
    await window.supabase.from('order_status_log').insert({
      order_id: orderData.id,
      status: 'pending',
    });

    return orderData;
  },

  async getOrders(status = null) {
    let query = window.supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateOrderStatus(orderId, status, note = null, changedBy = null) {
    const { data, error } = await window.supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;

    await window.supabase.from('order_status_log').insert({
      order_id: orderId,
      status,
      changed_by: changedBy,
      note,
    });

    return data;
  },

  async setDeadline(orderId, deadline) {
    const { data, error } = await window.supabase
      .from('orders')
      .update({ deadline, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getOrderById(orderId) {
    const { data, error } = await window.supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();
    if (error) throw error;
    return data;
  },
};
