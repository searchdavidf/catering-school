// src/app/catering/staff/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCateringClient } from '@/lib/supabase-client'

interface Profile {
  id: string
  full_name: string
  role: 'staff' | 'kitchen' | 'manager' | 'management'
  created_at: string
}

interface CurrentUser {
  id: string
  full_name: string
  role: string
}

export default function StaffPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CurrentUser | null>(null)
  const [staff, setStaff] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' as 'staff' | 'kitchen' | 'manager',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

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

    if (!profileData || !['manager', 'management'].includes(profileData.role)) {
      router.push('/catering/dashboard')
      return
    }

    setProfile(profileData)
    await fetchStaff()
    setLoading(false)
  }

  const fetchStaff = async () => {
    const supabase = getCateringClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setStaff(data as Profile[])
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const response = await fetch('/catering/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          role: formData.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setFormError(result.error || 'Failed to create user')
        setFormLoading(false)
        return
      }

      setFormData({ name: '', email: '', password: '', role: 'staff' })
      setShowForm(false)
      fetchStaff()
    } catch (err: any) {
      setFormError(err.message)
    }
    setFormLoading(false)
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return
    const supabase = getCateringClient()
    
    await supabase.from('profiles').delete().eq('id', id)
    await supabase.auth.admin.deleteUser(id)
    fetchStaff()
  }

  const ROLE_COLORS: Record<string, string> = {
    staff: 'bg-blue-500/20 text-blue-300',
    kitchen: 'bg-orange-500/20 text-orange-300',
    manager: 'bg-purple-500/20 text-purple-300',
    management: 'bg-red-500/20 text-red-300',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#FFD000]">Loading staff...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#FFD000]">Staff Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#FFD000] text-[#000B30] px-4 py-2 rounded-lg font-medium"
        >
          + Add User
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-[#0A1640] rounded-2xl p-6 w-full max-w-md border border-[#FFD000]/20">
            <h2 className="text-[#FFD000] font-bold text-lg mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-gray-300 text-sm mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                  className="w-full bg-[#000B30] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="staff">Staff</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-[#FFD000] text-[#000B30] py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/5 text-gray-300 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((user) => (
          <div key={user.id} className="bg-[#0A1640] rounded-xl p-4 border border-[#FFD000]/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{user.full_name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${ROLE_COLORS[user.role] || 'bg-gray-500/20 text-gray-300'}`}>
                  {user.role}
                </span>
              </div>
              {user.id !== profile?.id && (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-400 text-sm hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-gray-500 text-xs">
              Added: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}

        {staff.length === 0 && (
          <div className="bg-[#0A1640] rounded-xl p-8 text-center col-span-full">
            <p className="text-gray-400">No staff members yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
