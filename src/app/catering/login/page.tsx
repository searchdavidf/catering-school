// src/app/catering/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCateringClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = getCateringClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/catering/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#000B30] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🍽️</span>
          <h1 className="text-3xl font-bold text-[#FFD000]">Catering Dashboard</h1>
          <p className="text-gray-400 mt-2">Staff & Kitchen Portal</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#0A1640] rounded-2xl p-6 border border-[#FFD000]/20">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#000B30] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD000]"
              placeholder="staff@cateringschool.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#000B30] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD000]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD000] text-[#000B30] py-3 rounded-lg font-bold text-lg disabled:opacity-50 hover:bg-[#FFD000]/90 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-gray-500 text-sm hover:text-gray-300">
            ← Back to projects
          </a>
        </div>
      </div>
    </div>
  )
}
