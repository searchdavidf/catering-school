// src/app/page.tsx

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#000B30] via-[#0A1640] to-[#000B30] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Brand Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#FFD000] mb-3 tracking-tight">Multi-Bot</h1>
          <p className="text-lg text-gray-300">AI voice assistant for your businesses</p>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/kanhas"
            className="group block p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-[#FFD000]/50 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFD000]/20 flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <h2 className="text-2xl font-semibold text-white group-hover:text-[#FFD000] transition-colors">
                Kanhas Veg
              </h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Restaurant ordering, inventory, and sales analytics
            </p>
          </Link>

          <Link
            href="/fixbnb"
            className="group block p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-teal-400/50 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-400/20 flex items-center justify-center">
                <span className="text-2xl">🏠</span>
              </div>
              <h2 className="text-2xl font-semibold text-white group-hover:text-teal-400 transition-colors">
                Fix BnB
              </h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Turnovers, cleaning coordination, guest-ready verification
            </p>
          </Link>

          <Link
            href="/catering/login"
            className="group block p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-orange-400/50 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-400/20 flex items-center justify-center">
                <span className="text-2xl">🍱</span>
              </div>
              <h2 className="text-2xl font-semibold text-white group-hover:text-orange-400 transition-colors">
                Catering
              </h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              School canteen ordering — staff, kitchen & manager workflow
            </p>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-12">
          Tap a project to open its AI assistant
        </p>
      </div>
    </main>
  )
}
