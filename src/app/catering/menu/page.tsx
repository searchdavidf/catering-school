// src/app/catering/menu/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCateringClient } from '@/lib/supabase-client'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category: string
  image_url?: string
  available: boolean
  sort_order: number
  last_order_time?: string
  created_at: string
}

interface Profile {
  id: string
  full_name: string
  role: string
}

export default function MenuPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available: true,
    last_order_time: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
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

    if (!profileData || !['manager', 'management', 'kitchen'].includes(profileData.role)) {
      router.push('/catering/dashboard')
      return
    }

    setProfile(profileData)
    await fetchMenuItems()
    setLoading(false)
  }

  const fetchMenuItems = async () => {
    const supabase = getCateringClient()
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })

    if (data) setMenuItems(data as MenuItem[])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = getCateringClient()

    const itemData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      category: formData.category,
      image_url: formData.image_url || null,
      available: formData.available,
      last_order_time: formData.last_order_time || null,
    }

    if (editingItem) {
      await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItem.id)
    } else {
      await supabase
        .from('menu_items')
        .insert(itemData)
    }

    resetForm()
    fetchMenuItems()
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || '',
      available: item.available,
      last_order_time: item.last_order_time || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    const supabase = getCateringClient()
    await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
    fetchMenuItems()
  }

  const handleToggleAvailable = async (id: string, available: boolean) => {
    const supabase = getCateringClient()
    await supabase
      .from('menu_items')
      .update({ available })
      .eq('id', id)
    fetchMenuItems()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      available: true,
      last_order_time: '',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#FFD000]">Loading menu...</div>
      </div>
    )
  }

  // Group items by category
  const categories = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#FFD000]">Menu Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#FFD000] text-[#000B30] px-4 py-2 rounded-lg font-medium"
        >
          + Add Item
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative bg-[#0A1640] rounded-2xl p-6 w-full max-w-md border border-[#FFD000]/20">
            <h2 className="text-[#FFD000] font-bold text-lg mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Price (AED) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Last Order Time</label>
                <input
                  type="datetime-local"
                  value={formData.last_order_time}
                  onChange={(e) => setFormData({ ...formData, last_order_time: e.target.value })}
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="available" className="text-gray-300 text-sm">Available</label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#FFD000] text-[#000B30] py-2 rounded-lg font-medium"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-white/5 text-gray-300 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items by Category */}
      <div className="space-y-6">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-gray-300 font-semibold text-lg mb-3 capitalize">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-[#0A1640] rounded-xl p-4 border ${
                    item.available ? 'border-[#FFD000]/20' : 'border-red-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailable(item.id, !item.available)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        item.available
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {menuItems.length === 0 && (
          <div className="bg-[#0A1640] rounded-xl p-8 text-center">
            <p className="text-gray-400">No menu items yet. Add your first item to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
