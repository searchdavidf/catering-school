// src/app/catering/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCateringClient } from '@/lib/supabase-client'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  preparingOrders: number
  todayOrders: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    preparingOrders: 0,
    todayOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const supabase = getCateringClient()
    
    // Get all orders stats
    const { data: orders } = await supabase
      .from('orders')
      .select('status, created_at')

    if (orders) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        approvedOrders: orders.filter(o => o.status === 'approved').length,
        preparingOrders: orders.filter(o => o.status === 'preparing').length,
        todayOrders: orders.filter(o => new Date(o.created_at) >= today).length,
      })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#FFD000]">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FFD000] mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Orders" value={stats.totalOrders} icon="📋" />
        <StatCard label="Pending" value={stats.pendingOrders} icon="⏳" />
        <StatCard label="Approved" value={stats.approvedOrders} icon="✅" />
        <StatCard label="Preparing" value={stats.preparingOrders} icon="👨‍🍳" />
        <StatCard label="Today" value={stats.todayOrders} icon="📅" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/catering/orders"
          className="bg-[#0A1640] rounded-xl p-6 border border-[#FFD000]/20 hover:border-[#FFD000]/50 transition-colors"
        >
          <span className="text-3xl mb-3 block">📋</span>
          <h3 className="text-white font-semibold mb-1">View Orders</h3>
          <p className="text-gray-400 text-sm">Manage and track all orders</p>
        </Link>

        <Link
          href="/catering/kitchen"
          className="bg-[#0A1640] rounded-xl p-6 border border-[#FFD000]/20 hover:border-[#FFD000]/50 transition-colors"
        >
          <span className="text-3xl mb-3 block">👨‍🍳</span>
          <h3 className="text-white font-semibold mb-1">Kitchen View</h3>
          <p className="text-gray-400 text-sm">See live kitchen orders</p>
        </Link>

        <Link
          href="/catering/menu"
          className="bg-[#0A1640] rounded-xl p-6 border border-[#FFD000]/20 hover:border-[#FFD000]/50 transition-colors"
        >
          <span className="text-3xl mb-3 block">📖</span>
          <h3 className="text-white font-semibold mb-1">Menu Items</h3>
          <p className="text-gray-400 text-sm">Manage menu and pricing</p>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-[#0A1640] rounded-xl p-4 border border-[#FFD000]/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-[#FFD000] text-2xl font-bold">{value}</span>
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  )
}
