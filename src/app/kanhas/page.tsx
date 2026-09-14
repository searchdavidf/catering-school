// src/app/kanhas/page.tsx
'use client'

import { useState } from 'react'

const menuCategories = [
  { id: 'south-nashta', name: 'South ka Nashta' },
  { id: 'north-nashta', name: 'North ka Nashta' },
  { id: 'main-course', name: 'Main Course' },
  { id: 'breads', name: 'Breads' },
  { id: 'rice', name: 'Rice' },
  { id: 'salads', name: 'Salads & Raita' },
  { id: 'combos', name: 'Combos' },
  { id: 'chinese', name: 'Chinese' },
  { id: 'chaat', name: 'Chaat & Snacks' },
]

const menuItems: Record<string, { name: string; price: number; desc?: string }[]> = {
  'south-nashta': [
    { name: 'Idly Sambar', price: 7 },
    { name: 'Vada Sambar', price: 7 },
    { name: 'Sada Dosa', price: 9 },
    { name: 'Paper Sada Dosa', price: 10 },
    { name: 'Masala Dosa', price: 9 },
    { name: 'Ghee Roast Masala Dosa', price: 16 },
    { name: 'Paper Masala Dosa', price: 15 },
    { name: 'Onion & Tomato Uttappam', price: 10 },
    { name: 'Uttappam', price: 15 },
    { name: 'Cheese Uttappam', price: 15 },
  ],
  'north-nashta': [
    { name: 'Indori Poha', price: 12 },
    { name: 'Sevai Khichdi', price: 12 },
    { name: 'Maggie Masala', price: 10 },
    { name: 'Stuffed Parathas', price: 10, desc: 'Aloo / Mooli / Gobhi' },
    { name: 'Paneer Paratha', price: 15 },
    { name: 'Poori & Aloo Sabji', price: 12 },
    { name: 'Chhole Bhature', price: 15 },
    { name: 'Bedami Poori', price: 19 },
    { name: 'Veg Grill Sandwich', price: 15 },
  ],
  'main-course': [
    { name: 'Paneer Lababdar', price: 22 },
    { name: 'Paneer Pasanda', price: 22 },
    { name: 'Paneer Bhurji', price: 19 },
    { name: 'Paneer Tikka Masala', price: 24 },
    { name: 'Butter Paneer', price: 24 },
    { name: 'Kadai Paneer', price: 24 },
    { name: 'Malai Kofta', price: 22 },
    { name: 'Palak Paneer', price: 22 },
    { name: 'Matar Paneer', price: 24 },
    { name: 'Shahi Paneer', price: 22 },
    { name: 'Dal Makhani', price: 20 },
    { name: 'Dal Tadka', price: 18 },
    { name: 'Chana Masala', price: 15 },
    { name: 'Punjabi Rajma Masala', price: 15 },
  ],
  breads: [
    { name: 'Tawa Roti', price: 2 },
    { name: 'Ajwaini Paratha', price: 4 },
    { name: 'Lachha Paratha', price: 4 },
    { name: 'Bread Basket', price: 20, desc: '2 tawa roti, 2 ajwaini roti, 2 lachha paratha' },
  ],
  rice: [
    { name: 'White Rice', price: 10 },
    { name: 'Jeera Pulao', price: 12 },
    { name: 'Matar Pulao', price: 15 },
    { name: 'Vegetable Biryani', price: 22 },
    { name: 'Quinoa Biryani', price: 25 },
    { name: 'Hyderabadi Biryani', price: 25 },
    { name: 'Daal Khichdi', price: 15 },
  ],
  salads: [
    { name: 'Salsa Salad', price: 9 },
    { name: 'Green Salad', price: 7 },
    { name: 'Beetroot Raita', price: 9 },
    { name: 'Vegetable Raita', price: 9 },
    { name: 'Boondi Raita', price: 10 },
    { name: 'Fruit Salad', price: 15 },
  ],
  combos: [
    { name: '4 pcs Mini Daal Bati & Churma', price: 19 },
    { name: 'Chhole Chawal', price: 15 },
    { name: 'Kadhi Chawal', price: 15 },
    { name: 'Rajma Chawal', price: 15 },
    { name: 'Deluxe Indian Thali', price: 22, desc: 'Snack, chhach, daal, paneer sabji, paratha/rice, salad, sweet' },
  ],
  chinese: [
    { name: 'Spring Rolls (2 pcs)', price: 14 },
    { name: 'Hakka Noodles', price: 19 },
    { name: 'Schezwan Noodles', price: 19 },
    { name: 'Singapuri Noodles', price: 22 },
    { name: 'Desi Chowmein', price: 22 },
    { name: 'Fried Rice', price: 19 },
    { name: 'Golden Fry Baby Corn', price: 20 },
    { name: 'Crispy Corn', price: 22 },
    { name: 'Gobhi-65', price: 19 },
    { name: 'Crispy Veg', price: 19 },
    { name: 'Himalyan Momos (8 pcs)', price: 19 },
  ],
  chaat: [
    { name: 'Pani Puri (6 pc)', price: 8 },
    { name: 'Bhel Puri', price: 12 },
    { name: 'Sev Puri', price: 12 },
    { name: 'Dahi Puri', price: 12 },
    { name: 'Chhole Samosa (1 pc)', price: 10 },
    { name: 'Papdi Chaat', price: 12 },
    { name: 'Samosa Chaat', price: 12 },
    { name: 'Kachori Chaat', price: 12 },
    { name: 'Chana Chaat', price: 10 },
    { name: 'Chinese Bhel', price: 15 },
    { name: 'Dabeli', price: 8 },
    { name: 'Vada Pav', price: 6 },
    { name: 'Pav Bhaji', price: 12 },
    { name: 'Cheese Pav Bhaji', price: 15 },
    { name: 'Punjabi Samosa', price: 3 },
  ],
}

export default function KanhasPage() {
  const [activeCategory, setActiveCategory] = useState('south-nashta')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = searchQuery
    ? Object.entries(menuItems).flatMap(([catId, items]) =>
        items
          .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(item => ({ ...item, category: catId }))
      )
    : []

  return (
    <main className="min-h-screen bg-[#000B30] text-white pb-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#000B30]/75 to-[#000B30]/90 bg-cover bg-center px-4 pt-7 pb-10 flex flex-col items-center text-center border-b border-[#FFD000]/20">
        <div className="w-full max-w-[440px] bg-[#0A1640]/80 backdrop-blur-xl border border-[#FFD000]/25 rounded-2xl p-3.5 flex items-center justify-center gap-4 mb-5">
          <div className="w-[75px] h-[75px] bg-[#FFD000]/20 rounded-xl flex items-center justify-center text-3xl">
            🍽️
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-[#FFD000] font-serif leading-tight">Kanha's</h1>
            <p className="text-white text-sm font-medium tracking-wide opacity-90">Veg Restaurant</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-3 bg-[#000B30]/60 border border-[#FFD000]/40 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22C55E]"></span>
          <span className="text-[#FFD000]">Store Status: OPEN</span>
          <span className="w-px h-3.5 bg-white/20"></span>
          <span>07:00 - 23:30</span>
        </div>

        <p className="text-white/90 text-sm font-medium max-w-[380px] leading-relaxed mb-6">
          Musaffah, Shabiya 10 - Opposite Hypermarket, Abu Dhabi<br />
          We serve fasting food on request
        </p>

        <a href="#menu" className="w-full max-w-[400px] bg-[#FFD000] text-[#000B30] px-6 py-4 rounded-xl font-bold text-lg inline-flex items-center justify-center gap-2.5 shadow-[0_4px_15px_rgba(255,208,0,0.2)] active:scale-[0.98] transition-transform">
          📖 Browse Full Menu
        </a>
      </section>

      {/* Connect With Us */}
      <section className="max-w-[440px] mx-auto px-4 mt-7">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#FFD000] mb-3">Connect With Us</h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="https://www.instagram.com/kanhas_veg" target="_blank" className="bg-[#0A1640] rounded-2xl p-4 text-center border border-white/5 hover:border-pink-500/50 transition-colors">
            <span className="text-2xl mb-2 block">📷</span>
            <span className="font-bold text-sm">Instagram</span>
            <span className="text-xs text-gray-400 block">@kanhas_veg</span>
          </a>
          <a href="http://kanhasrestaurant.com/" target="_blank" className="bg-[#0A1640] rounded-2xl p-4 text-center border border-white/5 hover:border-[#FFD000]/50 transition-colors">
            <span className="text-2xl mb-2 block">🌐</span>
            <span className="font-bold text-sm">Website</span>
            <span className="text-xs text-gray-400 block">kanhasrestaurant.com</span>
          </a>
        </div>
      </section>

      {/* Contact & Directions */}
      <section className="max-w-[440px] mx-auto px-4 mt-7">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#FFD000] mb-3">Contact & Directions</h2>
        <div className="grid grid-cols-3 gap-2.5">
          <a href="tel:023094707" className="bg-[#0A1640] rounded-2xl p-4 text-center border border-white/5 hover:border-blue-400/50 transition-colors">
            <span className="text-xl mb-1 block">📞</span>
            <span className="font-bold text-sm">Call</span>
            <span className="text-xs text-gray-400 block">02 309 4707</span>
          </a>
          <a href="https://wa.me/97123094707" target="_blank" className="bg-[#0A1640] rounded-2xl p-4 text-center border border-white/5 hover:border-green-500/50 transition-colors">
            <span className="text-xl mb-1 block">💬</span>
            <span className="font-bold text-sm">WhatsApp</span>
            <span className="text-xs text-gray-400 block">+971 230</span>
          </a>
          <a href="https://maps.app.goo.gl/3oLBVa3G7eKP9dJn9" target="_blank" className="bg-[#0A1640] rounded-2xl p-4 text-center border border-white/5 hover:border-red-500/50 transition-colors">
            <span className="text-xl mb-1 block">📍</span>
            <span className="font-bold text-sm">Map</span>
            <span className="text-xs text-gray-400 block">Shabiya 10</span>
          </a>
        </div>
      </section>

      {/* Order Delivery */}
      <section className="max-w-[440px] mx-auto px-4 mt-7">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#FFD000] mb-3">Order Delivery</h2>
        <div className="grid grid-cols-2 gap-3">
          <a href="https://www.talabat.com/uae" target="_blank" className="bg-[#0A1640] rounded-2xl p-4 flex items-center gap-3 border border-white/5 hover:border-orange-500/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center text-lg">🛵</div>
            <div>
              <span className="font-bold text-sm block">Talabat</span>
              <span className="text-xs text-gray-400">Order website</span>
            </div>
          </a>
          <a href="https://food.noon.com/" target="_blank" className="bg-[#0A1640] rounded-2xl p-4 flex items-center gap-3 border border-white/5 hover:border-[#FFD000]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#FFD000]/15 flex items-center justify-center text-lg">🛍️</div>
            <div>
              <span className="font-bold text-sm block">Noon Food</span>
              <span className="text-xs text-gray-400">Order website</span>
            </div>
          </a>
          <a href="https://deliveroo.ae/" target="_blank" className="bg-[#0A1640] rounded-2xl p-4 flex items-center gap-3 border border-white/5 hover:border-teal-400/50 transition-colors col-span-2">
            <div className="w-10 h-10 rounded-lg bg-teal-400/15 flex items-center justify-center text-lg">🧺</div>
            <div>
              <span className="font-bold text-sm block">Deliveroo</span>
              <span className="text-xs text-gray-400">Order website platform</span>
            </div>
          </a>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="max-w-[440px] mx-auto px-4 mt-7">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#FFD000] mb-3">Our Menu</h2>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search dishes, e.g. paneer, dosa, biryani"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A1640] border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD000]"
          />
          <span className="absolute left-3.5 top-3.5 text-gray-400">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#FFD000] text-[#000B30] border-[#FFD000] font-semibold'
                    : 'bg-[#0A1640] text-white border-white/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items */}
        {searchQuery ? (
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No dishes match your search. Try a different word.</p>
            ) : (
              filteredItems.map((item, i) => (
                <div key={i} className="bg-[#0A1640] rounded-xl p-4 flex justify-between items-start border border-white/5">
                  <div>
                    <span className="font-medium text-white">{item.name}</span>
                    {item.desc && <span className="text-xs text-gray-400 block mt-0.5">{item.desc}</span>}
                  </div>
                  <span className="text-[#FFD000] font-semibold whitespace-nowrap ml-3">
                    AED {item.price}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {menuItems[activeCategory]?.map((item, i) => (
              <div key={i} className="bg-[#0A1640] rounded-xl p-4 flex justify-between items-start border border-white/5">
                <div>
                  <span className="font-medium text-white">{item.name}</span>
                  {item.desc && <span className="text-xs text-gray-400 block mt-0.5">{item.desc}</span>}
                </div>
                <span className="text-[#FFD000] font-semibold whitespace-nowrap ml-3">
                  AED {item.price}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="max-w-[440px] mx-auto px-4 mt-7">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#FFD000] mb-3">What Our Customers Are Saying</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#0A1640] rounded-2xl p-3 border border-white/5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[#FFD000] text-xs">★★★★★</span>
              <span className="text-xs text-gray-400">Google</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed mb-2">Dal Bati combo is truly authentic in taste. Must visit Rajasthani restaurant.</p>
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10">
              <div className="w-4 h-4 rounded-full bg-gray-600"></div>
              <span className="text-xs font-bold">Customer</span>
            </div>
          </div>
          <div className="bg-[#0A1640] rounded-2xl p-3 border border-white/5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[#FFD000] text-xs">★★★★★</span>
              <span className="text-xs text-gray-400">Google</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed mb-2">They are very good! Authentic Indian flavors at places.</p>
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10">
              <div className="w-4 h-4 rounded-full bg-gray-600"></div>
              <span className="text-xs font-bold">Sharhawa</span>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <a href="https://g.page/r/CWvYuld3-ofTEAI/review" target="_blank" className="inline-flex items-center gap-2 bg-[#0A1640] border border-white/10 rounded-full px-6 py-2.5 text-sm font-semibold hover:border-[#FFD000] transition-colors">
            ⭐ Leave a review
          </a>
        </div>
      </section>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex bg-[#0A1640] border-t border-white/10 p-2.5 gap-2.5">
        <a href="tel:023094707" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[#FFD000] text-[#FFD000] font-semibold text-sm">
          📞 Call to order
        </a>
        <a href="https://wa.me/97123094707" target="_blank" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-[#FFD000] text-[#000B30] font-semibold text-sm">
          💬 WhatsApp us
        </a>
      </div>
    </main>
  )
}
