// src/app/catering/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getCateringClient } from '@/lib/supabase-client'

interface Profile {
  id: string
  full_name: string
  role: 'staff' | 'kitchen' | 'manager' | 'management' | 'owner' | 'cleaner' | 'technician'
}

export default function CateringLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = getCateringClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/catering/login')
        return
      }
      supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (!data) {
            router.push('/catering/login')
            return
          }
          setProfile(data as Profile)
          setLoading(false)
        })
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = getCateringClient()
    await supabase.auth.signOut()
    router.push('/catering/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000B30] flex items-center justify-center">
        <div className="text-[#FFD000] text-lg">Loading...</div>
      </div>
    )
  }

  if (!profile) return null

  const navItems = getNavItems(profile.role)

  return (
    <div className="min-h-screen bg-[#000B30] flex flex-col">
      {/* Top Header */}
      <header className="bg-[#0A1640] border-b border-[#FFD000]/20 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#FFD000] p-2"
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Link href="/catering/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-[#FFD000] font-bold text-lg hidden sm:block">Catering Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white text-sm hidden sm:block">{profile.full_name}</span>
          <span className="bg-[#FFD000]/20 text-[#FFD000] text-xs px-2 py-1 rounded-full capitalize">
            {profile.role}
          </span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm px-3 py-1 border border-white/20 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-[#0A1640] border-r border-[#FFD000]/20 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-[#FFD000] text-[#000B30]'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0A1640] border-r border-[#FFD000]/20 p-4 pt-16">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-[#FFD000] text-[#000B30]'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

function getNavItems(role: string) {
  const items = [{ href: '/catering/dashboard', icon: '📊', label: 'Dashboard' }]

  if (role === 'staff' || role === 'manager' || role === 'management') {
    items.push({ href: '/catering/orders', icon: '📋', label: 'Orders' })
  }

  if (role === 'kitchen' || role === 'manager' || role === 'management') {
    items.push({ href: '/catering/kitchen', icon: '👨‍🍳', label: 'Kitchen' })
  }

  if (role === 'manager' || role === 'management') {
    items.push({ href: '/catering/menu', icon: '📖', label: 'Menu' })
    items.push({ href: '/catering/staff', icon: '👥', label: 'Staff' })
  }

  return items
}
