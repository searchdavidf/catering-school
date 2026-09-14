// src/app/catering/track/page.tsx
'use client'

import { useEffect, useState } from 'react'
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
  approved_at?: string
  acknowledged_at?: string
  dispatched_at?: string
  arrived_at?: string
}

interface StatusLog {
  id: number
  status: string
  changed_by: string
  note?: string
  created_at: string
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'approved', label: 'Approved', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'complete', label: 'Complete', icon: '✨' },
  { key: 'dispatched', label: 'Dispatched', icon: '🚚' },
  { key: 'arrived', label: 'Arrived', icon: '📦' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-yellow-500/50 bg-yellow-500/10',
  approved: 'border-blue-500/50 bg-blue-500/10',
  preparing: 'border-orange-500/50 bg-orange-500/10',
  complete: 'border-green-500/50 bg-green-500/10',
  dispatched: 'border-purple-500/50 bg-purple-500/10',
  arrived: 'border-teal-500/50 bg-teal-500/10',
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check URL for order ID
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) {
      setOrderId(id)
      fetchOrder(id)
    }
  }, [])

  const fetchOrder = async (id: string) => {
    setLoading(true)
    setError('')

    const supabase = getCateringClient()

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError || !orderData) {
      setError('Order not found. Please check the ID and try again.')
      setLoading(false)
      return
    }

    setOrder(orderData as Order)

    // Fetch status logs
    const { data: logs } = await supabase
      .from('order_status_log')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true })

    setStatusLogs(logs || [])
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return
    // Update URL
    window.history.pushState({}, '', `/catering/track?id=${orderId.trim()}`)
    fetchOrder(orderId.trim())
  }

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'upcoming'
    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey)
    const currentIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
    
    if (order.status === 'rejected') return 'rejected'
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="min-h-screen bg-[#000B30] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <span className="text-5xl mb-4 block">🍱</span>
          <h1 className="text-3xl font-bold text-[#FFD000]">Track Your Order</h1>
          <p className="text-gray-400 mt-2">Enter your order ID to see real-time status</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter order ID..."
              className="flex-1 bg-[#0A1640] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD000]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#FFD000] text-[#000B30] px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? '...' : 'Track'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {order && (
          <div>
            {/* Order Summary */}
            <div className="bg-[#0A1640] rounded-2xl p-6 border border-[#FFD000]/20 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold text-lg">{order.customer_name}</h2>
                  <p className="text-gray-400 text-sm">{order.department}</p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]?.split(' ')[1] || 'text-gray-300'}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Order #{order.id.slice(0, 8)}
                </span>
                <span className="text-[#FFD000] font-bold text-lg">AED {order.total}</span>
              </div>
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-gray-400 text-sm">Notes: {order.notes}</p>
                </div>
              )}
            </div>

            {/* Progress Steps */}
            {order.status !== 'rejected' ? (
              <div className="bg-[#0A1640] rounded-2xl p-6 border border-[#FFD000]/20 mb-6">
                <h3 className="text-[#FFD000] font-semibold mb-4">Order Progress</h3>
                <div className="space-y-3">
                  {STATUS_STEPS.map((step, index) => {
                    const status = getStepStatus(step.key)
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          status === 'completed' 
                            ? 'border-green-500 bg-green-500/20' 
                            : status === 'current'
                            ? 'border-[#FFD000] bg-[#FFD000]/20'
                            : 'border-gray-600 bg-gray-800'
                        }`}>
                          {status === 'completed' ? '✅' : step.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            status === 'current' 
                              ? 'text-[#FFD000]' 
                              : status === 'completed'
                              ? 'text-green-300'
                              : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                        {status === 'current' && (
                          <span className="text-[#FFD000] text-xs animate-pulse">●</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
                <h3 className="text-red-300 font-semibold mb-2">Order Rejected</h3>
                <p className="text-gray-400 text-sm">This order has been rejected. Please contact staff for more information.</p>
              </div>
            )}

            {/* Status Timeline */}
            {statusLogs.length > 0 && (
              <div className="bg-[#0A1640] rounded-2xl p-6 border border-[#FFD000]/20">
                <h3 className="text-[#FFD000] font-semibold mb-4">Status History</h3>
                <div className="space-y-3">
                  {statusLogs.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#FFD000] mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-gray-300 text-sm">{log.note}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <a href="/" className="text-gray-500 text-sm hover:text-gray-300">
            ← Back to projects
          </a>
        </div>
      </div>
    </div>
  )
}
