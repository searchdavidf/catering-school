// src/app/catering/kitchen/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCateringClient } from '@/lib/supabase-client'

interface KitchenOrder {
  id: string
  customer_name: string
  contact: string
  department: string
  status: 'approved' | 'preparing' | 'complete'
  total: number
  created_at: string
  acknowledged_at?: string
  notes?: string
}

interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  unit_price: number
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  preparing: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  complete: 'bg-green-500/20 text-green-300 border-green-500/30',
}

export default function KitchenPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderComments, setOrderComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [lastOrderTime, setLastOrderTime] = useState<string>('')

  useEffect(() => {
    fetchKitchenData()
    const interval = setInterval(fetchKitchenData, 10000) // Auto-refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchKitchenData = async () => {
    const supabase = getCateringClient()

    // Get active orders for kitchen
    const { data } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['approved', 'preparing', 'complete'])
      .order('created_at', { ascending: true })

    if (data) setOrders(data as KitchenOrder[])

    // Get last order time setting
    const { data: menuData } = await supabase
      .from('menu_items')
      .select('last_order_time')
      .not('last_order_time', 'is', null)
      .order('last_order_time', { ascending: false })
      .limit(1)

    if (menuData && menuData.length > 0) {
      setLastOrderTime(menuData[0].last_order_time)
    }

    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: 'preparing' | 'complete') => {
    const supabase = getCateringClient()
    const updates: any = { status: newStatus }
    if (newStatus === 'preparing') updates.acknowledged_at = new Date().toISOString()

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)

    if (!error) {
      fetchKitchenData()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updates } : null)
      }
    }
  }

  const openOrderDetail = async (order: KitchenOrder) => {
    setSelectedOrder(order)

    const supabase = getCateringClient()
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
    setOrderItems(items || [])

    const { data: comments } = await supabase
      .from('order_comments')
      .select('*, profiles(full_name)')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })
    setOrderComments(comments || [])
  }

  const addComment = async () => {
    if (!newComment.trim() || !selectedOrder) return

    const supabase = getCateringClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('order_comments')
      .insert({
        order_id: selectedOrder.id,
        author_id: session.user.id,
        comment: newComment.trim(),
      })

    if (!error) {
      setNewComment('')
      const { data: comments } = await supabase
        .from('order_comments')
        .select('*, profiles(full_name)')
        .eq('order_id', selectedOrder.id)
        .order('created_at', { ascending: true })
      setOrderComments(comments || [])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#FFD000]">Loading kitchen orders...</div>
      </div>
    )
  }

  const approvedOrders = orders.filter(o => o.status === 'approved')
  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const completeOrders = orders.filter(o => o.status === 'complete')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#FFD000]">Kitchen Dashboard</h1>
        {lastOrderTime && (
          <span className="text-sm text-gray-400">
            Last order: {new Date(lastOrderTime).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Order Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* New Orders */}
        <div className="bg-[#0A1640] rounded-xl p-4 border border-blue-500/20">
          <h2 className="text-blue-300 font-semibold mb-4">🆕 New Orders ({approvedOrders.length})</h2>
          <div className="space-y-3">
            {approvedOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">No new orders</p>
            ) : (
              approvedOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => openOrderDetail(order)}
                  className={`bg-[#000B30] rounded-lg p-3 cursor-pointer border transition-colors ${
                    selectedOrder?.id === order.id ? 'border-[#FFD000]' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium text-sm">{order.customer_name}</span>
                    <span className="text-[#FFD000] text-sm font-semibold">AED {order.total}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-2">{order.department}</p>
                  <p className="text-gray-600 text-xs">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preparing */}
        <div className="bg-[#0A1640] rounded-xl p-4 border border-orange-500/20">
          <h2 className="text-orange-300 font-semibold mb-4">👨‍🍳 Preparing ({preparingOrders.length})</h2>
          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">No orders being prepared</p>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => openOrderDetail(order)}
                  className={`bg-[#000B30] rounded-lg p-3 cursor-pointer border transition-colors ${
                    selectedOrder?.id === order.id ? 'border-[#FFD000]' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium text-sm">{order.customer_name}</span>
                    <span className="text-[#FFD000] text-sm font-semibold">AED {order.total}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-2">{order.department}</p>
                  <p className="text-gray-600 text-xs">
                    Started: {order.acknowledged_at ? new Date(order.acknowledged_at).toLocaleTimeString() : '-'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complete */}
        <div className="bg-[#0A1640] rounded-xl p-4 border border-green-500/20">
          <h2 className="text-green-300 font-semibold mb-4">✅ Complete ({completeOrders.length})</h2>
          <div className="space-y-3">
            {completeOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">No completed orders</p>
            ) : (
              completeOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => openOrderDetail(order)}
                  className={`bg-[#000B30] rounded-lg p-3 cursor-pointer border transition-colors ${
                    selectedOrder?.id === order.id ? 'border-[#FFD000]' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium text-sm">{order.customer_name}</span>
                    <span className="text-[#FFD000] text-sm font-semibold">AED {order.total}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-2">{order.department}</p>
                  <p className="text-gray-600 text-xs">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Detail */}
      {selectedOrder && (
        <div className="bg-[#0A1640] rounded-xl p-6 border border-[#FFD000]/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#FFD000] font-bold text-lg">Order: {selectedOrder.customer_name}</h2>
            <span className={`text-sm px-3 py-1 rounded-full border ${STATUS_STYLES[selectedOrder.status]}`}>
              {selectedOrder.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Items */}
            <div>
              <h3 className="text-gray-300 text-sm font-medium mb-3">Items</h3>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm bg-[#000B30] rounded-lg px-3 py-2">
                    <span className="text-gray-300">
                      {item.quantity}x Menu Item #{item.menu_item_id.slice(0, 8)}
                    </span>
                    <span className="text-[#FFD000]">AED {item.unit_price * item.quantity}</span>
                  </div>
                ))}
                {orderItems.length === 0 && (
                  <p className="text-gray-500 text-sm">No items found</p>
                )}
              </div>

              {selectedOrder.notes && (
                <div className="mt-4">
                  <h3 className="text-gray-300 text-sm font-medium mb-2">Customer Notes</h3>
                  <p className="text-gray-400 text-sm bg-[#000B30] rounded-lg px-3 py-2">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions & Comments */}
            <div>
              {/* Action Buttons */}
              <div className="mb-4">
                {selectedOrder.status === 'approved' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'preparing')}
                    className="w-full bg-orange-500/20 text-orange-300 py-3 rounded-lg font-medium hover:bg-orange-500/30"
                  >
                    👨‍🍳 Accept & Start Preparing
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'complete')}
                    className="w-full bg-green-500/20 text-green-300 py-3 rounded-lg font-medium hover:bg-green-500/30"
                  >
                    ✨ Mark Complete
                  </button>
                )}
              </div>

              {/* Comments */}
              <h3 className="text-gray-300 text-sm font-medium mb-3">Comments</h3>
              <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
                {orderComments.map((c) => (
                  <div key={c.id} className="bg-[#000B30] rounded-lg p-2">
                    <p className="text-gray-300 text-sm">{c.comment}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {c.profiles?.full_name} • {new Date(c.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {orderComments.length === 0 && (
                  <p className="text-gray-500 text-sm">No comments yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addComment()}
                  placeholder="Add comment..."
                  className="flex-1 bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={addComment}
                  className="bg-[#FFD000] text-[#000B30] px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
