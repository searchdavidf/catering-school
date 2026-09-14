// src/app/catering/orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCateringClient } from '@/lib/supabase-client'

interface Order {
  id: string
  customer_name: string
  contact: string
  department: string
  status: string
  total: number
  notes?: string
  created_at: string
  approved_by?: string
  approved_at?: string
  acknowledged_by?: string
  acknowledged_at?: string
  dispatched_at?: string
  arrived_at?: string
}

interface Profile {
  id: string
  full_name: string
  role: string
}

interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  notes?: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  approved: 'bg-blue-500/20 text-blue-300',
  rejected: 'bg-red-500/20 text-red-300',
  preparing: 'bg-orange-500/20 text-orange-300',
  complete: 'bg-green-500/20 text-green-300',
  dispatched: 'bg-purple-500/20 text-purple-300',
  arrived: 'bg-teal-500/20 text-teal-300',
}

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending',
  approved: '✅ Approved',
  rejected: '❌ Rejected',
  preparing: '👨‍🍳 Preparing',
  complete: '✨ Complete',
  dispatched: '🚚 Dispatched',
  arrived: '📦 Arrived',
}

export default function OrdersPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderComments, setOrderComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [customerNote, setCustomerNote] = useState('')

  useEffect(() => {
    fetchProfileAndOrders()
  }, [])

  const fetchProfileAndOrders = async () => {
    const supabase = getCateringClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/catering/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', session.user.id)
      .single()

    if (!profileData) {
      router.push('/catering/login')
      return
    }

    setProfile(profileData)
    await fetchOrders()
    setLoading(false)
  }

  const fetchOrders = async () => {
    const supabase = getCateringClient()
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setOrders(data as Order[])
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const supabase = getCateringClient()
    const updates: any = { status: newStatus }
    
    if (newStatus === 'dispatched') updates.dispatched_at = new Date().toISOString()
    if (newStatus === 'arrived') updates.arrived_at = new Date().toISOString()

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)

    if (!error) {
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updates } : null)
      }
    }
  }

  const handleCustomerUpdate = async (orderId: string, field: string, value: string) => {
    const supabase = getCateringClient()
    const { error } = await supabase
      .from('orders')
      .update({ [field]: value })
      .eq('id', orderId)

    if (!error) {
      fetchOrders()
    }
  }

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order)
    setCustomerNote(order.notes || '')

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
    if (!newComment.trim() || !selectedOrder || !profile) return

    const supabase = getCateringClient()
    const { error } = await supabase
      .from('order_comments')
      .insert({
        order_id: selectedOrder.id,
        author_id: profile.id,
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

  const updateCustomerNote = async () => {
    if (!selectedOrder) return
    const supabase = getCateringClient()
    await supabase
      .from('orders')
      .update({ notes: customerNote })
      .eq('id', selectedOrder.id)
    fetchOrders()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#FFD000]">Loading orders...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FFD000] mb-6">Orders Management</h1>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <span key={key} className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[key]}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-3">
          {orders.length === 0 ? (
            <div className="bg-[#0A1640] rounded-xl p-8 text-center">
              <p className="text-gray-400">No orders yet</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                onClick={() => openOrderDetail(order)}
                className={`bg-[#0A1640] rounded-xl p-4 border cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id
                    ? 'border-[#FFD000]'
                    : 'border-[#FFD000]/20 hover:border-[#FFD000]/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{order.customer_name}</h3>
                    <p className="text-gray-400 text-sm">{order.department}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                  <span className="text-[#FFD000] font-semibold">AED {order.total}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Detail Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-[#0A1640] rounded-xl p-4 border border-[#FFD000]/20 sticky top-4">
              <h2 className="text-[#FFD000] font-bold text-lg mb-4">Order Details</h2>

              {/* Customer Info */}
              <div className="mb-4">
                <h3 className="text-gray-300 text-sm font-medium mb-2">Customer</h3>
                <input
                  type="text"
                  value={selectedOrder.customer_name}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, customer_name: e.target.value })}
                  onBlur={() => handleCustomerUpdate(selectedOrder.id, 'customer_name', selectedOrder.customer_name)}
                  disabled={profile?.role === 'kitchen'}
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-2 disabled:opacity-50"
                />
                <input
                  type="text"
                  value={selectedOrder.contact}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, contact: e.target.value })}
                  onBlur={() => handleCustomerUpdate(selectedOrder.id, 'contact', selectedOrder.contact)}
                  disabled={profile?.role === 'kitchen'}
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-2 disabled:opacity-50"
                />
                <input
                  type="text"
                  value={selectedOrder.department}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, department: e.target.value })}
                  onBlur={() => handleCustomerUpdate(selectedOrder.id, 'department', selectedOrder.department)}
                  disabled={profile?.role === 'kitchen'}
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                />
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h3 className="text-gray-300 text-sm font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {item.quantity}x {item.menu_item_id.slice(0, 8)}...
                      </span>
                      <span className="text-[#FFD000]">AED {item.unit_price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <h3 className="text-gray-300 text-sm font-medium mb-2">Notes</h3>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  onBlur={updateCustomerNote}
                  disabled={profile?.role === 'kitchen'}
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                  rows={3}
                  placeholder="Add notes..."
                />
              </div>

              {/* Action Buttons based on role */}
              <div className="space-y-2 mb-4">
                {selectedOrder.status === 'pending' && (profile?.role === 'staff' || profile?.role === 'manager') && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'approved')}
                      className="w-full bg-green-500/20 text-green-300 py-2 rounded-lg text-sm font-medium hover:bg-green-500/30"
                    >
                      ✅ Approve Order
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'rejected')}
                      className="w-full bg-red-500/20 text-red-300 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30"
                    >
                      ❌ Reject Order
                    </button>
                  </>
                )}

                {selectedOrder.status === 'approved' && profile?.role === 'kitchen' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'preparing')}
                    className="w-full bg-orange-500/20 text-orange-300 py-2 rounded-lg text-sm font-medium hover:bg-orange-500/30"
                  >
                    👨‍🍳 Accept & Start Preparing
                  </button>
                )}

                {selectedOrder.status === 'preparing' && profile?.role === 'kitchen' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'complete')}
                    className="w-full bg-green-500/20 text-green-300 py-2 rounded-lg text-sm font-medium hover:bg-green-500/30"
                  >
                    ✨ Mark Complete
                  </button>
                )}

                {selectedOrder.status === 'complete' && (profile?.role === 'manager' || profile?.role === 'management') && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'dispatched')}
                    className="w-full bg-purple-500/20 text-purple-300 py-2 rounded-lg text-sm font-medium hover:bg-purple-500/30"
                  >
                    🚚 Mark Dispatched
                  </button>
                )}

                {selectedOrder.status === 'dispatched' && (profile?.role === 'manager' || profile?.role === 'management') && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'arrived')}
                    className="w-full bg-teal-500/20 text-teal-300 py-2 rounded-lg text-sm font-medium hover:bg-teal-500/30"
                  >
                    📦 Order Arrived in Canteen
                  </button>
                )}
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-gray-300 text-sm font-medium mb-2">Comments</h3>
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
          ) : (
            <div className="bg-[#0A1640] rounded-xl p-8 text-center border border-[#FFD000]/20">
              <p className="text-gray-400">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
