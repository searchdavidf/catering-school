// src/app/catering/order/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getCateringClient } from '@/lib/supabase-client'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: string
  available: boolean
  last_order_time?: string
}

interface CartItem extends MenuItem {
  quantity: number
  notes?: string
}

export default function CustomerOrderPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState('')
  const [contact, setContact] = useState('')
  const [department, setDepartment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    const supabase = getCateringClient()
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true })

    if (data) {
      setMenuItems(data as MenuItem[])
      const categories = [...new Set(data.map((i: MenuItem) => i.category))]
      if (categories.length > 0) setActiveCategory(categories[0])
    }
    setLoading(false)
  }

  const categories = ['all', ...new Set(menuItems.map(i => i.category))]

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(c => c.id !== id))
    } else {
      setCart(prev => prev.map(c => c.id === id ? { ...c, quantity } : c))
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    setSubmitting(true)
    const supabase = getCateringClient()

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        contact,
        department,
        total,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      setSubmitting(false)
      return
    }

    // Create order items
    const orderItems = cart.map(item => ({
      order_id: orderData.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }))

    await supabase
      .from('order_items')
      .insert(orderItems)

    setOrderId(orderData.id)
    setOrderComplete(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000B30] flex items-center justify-center">
        <div className="text-[#FFD000]">Loading menu...</div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#000B30] flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-6xl mb-4 block">✅</span>
          <h1 className="text-3xl font-bold text-[#FFD000] mb-4">Order Placed!</h1>
          <p className="text-gray-400 mb-2">Your order ID is:</p>
          <p className="text-[#FFD000] font-mono text-lg mb-6">{orderId.slice(0, 8)}</p>
          <p className="text-gray-500 text-sm mb-6">Save this ID to track your order</p>
          <div className="flex gap-4 justify-center">
            <a
              href={`/catering/track?id=${orderId}`}
              className="bg-[#FFD000] text-[#000B30] px-6 py-3 rounded-xl font-semibold"
            >
              Track Order
            </a>
            <button
              onClick={() => {
                setOrderComplete(false)
                setCart([])
                setCustomerName('')
                setContact('')
                setDepartment('')
              }}
              className="bg-white/5 text-gray-300 px-6 py-3 rounded-xl font-semibold border border-white/10"
            >
              New Order
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(i => i.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#000B30] pb-32">
      <header className="bg-[#0A1640] border-b border-[#FFD000]/20 px-4 py-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold text-[#FFD000] text-center">🍱 Place Order</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors capitalize ${
                activeCategory === cat
                  ? 'bg-[#FFD000] text-[#000B30] border-[#FFD000]'
                  : 'bg-[#0A1640] text-gray-300 border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {filteredItems.map((item) => {
            const inCart = cart.find(c => c.id === item.id)
            return (
              <div
                key={item.id}
                className="bg-[#0A1640] rounded-xl p-4 border border-[#FFD000]/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-medium">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                    )}
                  </div>
                  <span className="text-[#FFD000] font-semibold">AED {item.price}</span>
                </div>
                
                {item.last_order_time && (
                  <p className="text-gray-500 text-xs mb-3">
                    Last order: {new Date(item.last_order_time).toLocaleTimeString()}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  {inCart ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white/5 text-white border border-white/10 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-[#FFD000] font-bold">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-[#FFD000] text-[#000B30] flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-[#FFD000] text-[#000B30] px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No items available in this category</p>
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A1640] border-t border-[#FFD000]/20 p-4">
          <div className="max-w-2xl mx-auto">
            {/* Cart Items Summary */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
              {cart.map(item => (
                <div key={item.id} className="flex-shrink-0 bg-white/5 rounded-full px-3 py-1 text-sm text-gray-300">
                  {item.quantity}x {item.name}
                </div>
              ))}
            </div>

            {/* Customer Form */}
            <form onSubmit={submitOrder} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Name *"
                  required
                  className="bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500"
                />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Contact *"
                  required
                  className="bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500"
                />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Department *"
                  required
                  className="bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#FFD000] font-bold text-lg">Total: AED {total}</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FFD000] text-[#000B30] px-8 py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
