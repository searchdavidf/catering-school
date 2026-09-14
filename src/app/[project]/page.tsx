// src/app/[project]/page.tsx

'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProjectPage() {
  const params = useParams()
  const project = params?.project as string
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isKanhas = project === 'kanhas'
  const accentColor = isKanhas ? 'bg-[#FFD000]' : 'bg-teal-400'
  const accentText = isKanhas ? 'text-[#000B30]' : 'text-gray-900'

  const skills = isKanhas
    ? [
        { name: 'order-taking', desc: 'Create orders from voice or text', icon: '🛒' },
        { name: 'inventory-query', desc: 'Check stock levels and suppliers', icon: '📦' },
        { name: 'sales-query', desc: 'View revenue and top items', icon: '📊' },
      ]
    : [
        { name: 'turnover-status', desc: 'Check property turnover state', icon: '🏠' },
        { name: 'cleaner-assignment', desc: 'Assign or reassign cleaners', icon: '👷' },
        { name: 'guest-ready-check', desc: 'Verify QC and readiness', icon: '✓' },
      ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) {
      setError('Please enter a request')
      return
    }

    setLoading(true)
    setResponse('')
    setError('')

    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, project, role: 'owner' }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data.message || JSON.stringify(data, null, 2))
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`py-6 px-4 ${accentColor}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold ${accentText} capitalize`}>{project}</h1>
          <p className={`${accentText} opacity-70 text-sm mt-1`}>AI assistant dashboard</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Input Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ask the AI assistant</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {/* Visible label for accessibility */}
            <label htmlFor="ai-input" className="block text-sm font-medium text-gray-700 mb-2">
              Your request
            </label>
            <textarea
              id="ai-input"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-[#FFD000] focus:border-transparent resize-none"
              rows={3}
              placeholder={isKanhas
                ? "e.g., 'Show today's sales' or 'Check paneer stock'"
                : "e.g., 'Check turnover status for Water Edge B3'"
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (error) setError('')
              }}
              disabled={loading}
            />

            {/* Error message near field */}
            {error && (
              <p className="text-red-600 text-sm mb-3" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`px-6 py-3 ${accentColor} ${accentText} rounded-lg font-semibold transition-opacity disabled:opacity-50 min-h-[44px]`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Send'
              )}
            </button>

            {/* Response area */}
            {response && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200" role="status" aria-live="polite">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Response:</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-900">{response}</p>
              </div>
            )}
          </form>
        </section>

        {/* Skills Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl" aria-hidden="true">{skill.icon}</span>
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{skill.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
