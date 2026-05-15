'use client'

import { useState } from 'react'


// ─── Types ────────────────────────────────────────────────────────────────────

export interface Stattion {
  id: string
  name: string
}

export interface District {
  id: string
  name: string
  stattions: Stattion[]
}

interface KitItem {
  id: string
  name: string
  sizes: string[]
}

interface KitCategory {
  id: string
  name: string
  items: KitItem[]
}

const KIT_CATEGORIES: KitCategory[] = [
  {
    id: 'uniform_operation',
    name: 'UNIFORM OPERATION',
    items: [
      { id: 'advance_rescue_suit',        name: 'Advance Rescue Suit',                sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'base_ball_caps',             name: 'Base Ball Caps',                     sizes: ['One Size'] },
      { id: 'beanie_green',               name: 'Beanie Green',                       sizes: ['One Size'] },
      { id: 'combat_boots',               name: 'Combat Boots',                       sizes: ['3','4','5','6','7','8','9','10','11','12'] },
      { id: 'bunny_jacket_green',         name: 'Bunny Jacket Green',                 sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'combat_belt',                name: 'Combat Belt',                        sizes: ['S','M','L','XL'] },
      { id: 'combat_trouser_green',       name: 'Combat Trouser Green',               sizes: ['28','30','32','34','36','38','40','42'] },
      { id: 'epaulette',                  name: 'Epaulette',                          sizes: ['One Size'] },
      { id: 'jersey_long_sleeve_green',   name: 'Jersey Long Sleeve Green',           sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'jump_suit_green',            name: 'Jump-Suit Green',                    sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'rescue_gloves',              name: 'Rescue Gloves',                      sizes: ['S','M','L','XL'] },
      { id: 'rain_suit_two_piece_green',  name: 'Rain-Suit Two Piece Green',          sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_ss_green',             name: 'Shirt S/S Green',                    sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_ls_green',             name: 'Shirt L/S Green',                    sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'short_sleeve_tshirt',        name: 'Short Sleeve T-Shirt',               sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'socks_long_ops',             name: 'Socks Long For OPS',                 sizes: ['One Size'] },
      { id: 'socks_short_ops',            name: 'Socks Short For OPS',                sizes: ['One Size'] },
      { id: 'stars_of_life',              name: 'Stars Of Life',                      sizes: ['One Size'] },
      { id: 'id_qualification_badge',     name: 'Identification Qualification Badge', sizes: ['One Size'] },
      { id: 'soft_shell_jacket_green',    name: 'Soft-Shell Jacket Green',            sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'reflective_jacket_green',    name: 'Reflective Jacket Green',            sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
    ],
  },
  {
    id: 'uniform_manager',
    name: 'UNIFORM MANAGER',
    items: [
      { id: 'shirt_ss_white',       name: 'Shirt S/S White',       sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_ls_white',       name: 'Shirt L/S White',       sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'stepout_trouser_belt', name: 'Stepout Trouser Belt',   sizes: ['S','M','L','XL'] },
      { id: 'stepout_trouser',      name: 'Stepout Trouser',        sizes: ['28','30','32','34','36','38','40','42'] },
      { id: 'stepout_skirt',        name: 'Stepout Skirt',          sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'jacket_blazer',        name: 'Jacket Blazer',          sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'bunny_jacket_blue',    name: 'Bunny Jacket Blue',      sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'jersey_blue_manager',  name: 'Jersey Blue Manager',    sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'parabelum_shoes',      name: 'Parabelum Shoes',        sizes: ['3','4','5','6','7','8','9','10','11','12'] },
      { id: 'scarf',                name: 'Scarf',                  sizes: ['One Size'] },
      { id: 'pantyhose',            name: 'Pantyhose',              sizes: ['One Size'] },
      { id: 'court_shoes',          name: 'Court Shoes',            sizes: ['3','4','5','6','7','8','9','10','11','12'] },
    ],
  },
  {
    id: 'control_uniform',
    name: 'CONTROL UNIFORM',
    items: [
      { id: 'jean_control',           name: 'Jean For Control',       sizes: ['28','30','32','34','36','38','40','42'] },
      { id: 'scarf_control',          name: 'Scarf For Control',      sizes: ['One Size'] },
      { id: 'winter_bomber_jacket',   name: 'Winter Bomber Jacket',   sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_blue_ss_control',  name: 'Shirt Blue S/S Control', sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_blue_ls_control',  name: 'Shirt Blue L/S Control', sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'jersey_control',         name: 'Jersey Control',         sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'chino_trouser',          name: 'Chino Trouser',          sizes: ['28','30','32','34','36','38','40','42'] },
      { id: 'golfer_tshirt',          name: 'Golfer T-Shirt',         sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
    ],
  },
  {
    id: 'store_official',
    name: 'UNIFORM FOR STORE OFFICIAL',
    items: [
      { id: 'two_piece_work_suit', name: 'Two Piece Work Suit', sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'long_coat',           name: 'Long Coat',           sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'beanie_blue',         name: 'Beanie Blue',         sizes: ['One Size'] },
      { id: 'floppy_hat',          name: 'Floppy Hat',          sizes: ['One Size'] },
      { id: 'safety_boots',        name: 'Safety Boots',        sizes: ['3','4','5','6','7','8','9','10','11','12'] },
      { id: 'soft_shell_jacket',   name: 'Soft-Shell Jacket',   sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
    ],
  },
]

interface KitSelection {
  [itemId: string]: { selected: boolean; size: string; qty: number }
}

function blankSelections(): KitSelection {
  return Object.fromEntries(
    KIT_CATEGORIES.flatMap(cat => cat.items).map(item => [item.id, { selected: false, size: item.sizes[0], qty: 1 }])
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderForm({ districts }: { districts: District[] }) {
  const [submitted, setSubmitted]       = useState(false)
  const [loading,   setLoading]         = useState(false)
  const [error,     setError]           = useState<string | null>(null)

  const [name,          setName]          = useState('')
  const [surname,       setSurname]       = useState('')
  const [districtId,    setDistrictId]    = useState('')
  const [stationId,     setStationId]     = useState('')
  const [kitSelections, setKitSelections] = useState<KitSelection>(blankSelections)

  const selectedDistrict = districts.find(d => d.id === districtId)

  const handleDistrictChange = (id: string) => {
    setDistrictId(id)
    setStationId('')
  }

  const toggleItem = (id: string) =>
    setKitSelections(prev => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }))

  const updateSize = (id: string, size: string) =>
    setKitSelections(prev => ({ ...prev, [id]: { ...prev[id], size } }))

  const updateQty = (id: string, qty: number) =>
    setKitSelections(prev => ({ ...prev, [id]: { ...prev[id], qty } }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const selectedUniforms = KIT_CATEGORIES.flatMap(cat => cat.items)
      .filter(item => kitSelections[item.id].selected)
      .map(item => ({
        name: item.name,
        size: kitSelections[item.id].size,
        quantity: String(kitSelections[item.id].qty),
      }))

    if (selectedUniforms.length === 0) {
      setError('Please select at least one kit item.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: name,
          lastname: surname,
          stationId,
          uniforms: selectedUniforms,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Failed to submit order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName(''); setSurname('')
    setDistrictId(''); setStationId('')
    setKitSelections(blankSelections())
    setSubmitted(false)
    setError(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Submitted!</h2>
          <p className="text-gray-500">Your kit order has been recorded successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* ── Section 1: Personal Details ── */}
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-green-700 px-6 py-4 border-l-4 border-green-400">
              <h2 className="text-white font-bold text-lg">1. Personal Details</h2>
              <p className="text-green-200 text-sm">Employee information</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border-b-2 border-gray-300 focus:border-green-600 outline-none py-2 text-gray-800 bg-transparent transition-colors"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={surname}
                    onChange={e => setSurname(e.target.value)}
                    className="w-full border-b-2 border-gray-300 focus:border-green-600 outline-none py-2 text-gray-800 bg-transparent transition-colors"
                    placeholder="Enter surname"
                  />
                </div>
              </div>


            </div>
          </section>

          {/* ── Section 2: Station Details ── */}
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-green-700 px-6 py-4 border-l-4 border-green-400">
              <h2 className="text-white font-bold text-lg">2. Station Details</h2>
              <p className="text-green-200 text-sm">Select your district and station</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={districtId}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-green-600 outline-none py-2 text-gray-800 bg-transparent transition-colors"
                >
                  <option value="">— Select District —</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {selectedDistrict && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station / Sub-Station <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={stationId}
                    onChange={e => setStationId(e.target.value)}
                    className="w-full border-b-2 border-gray-300 focus:border-green-600 outline-none py-2 text-gray-800 bg-transparent transition-colors"
                  >
                    <option value="">— Select Station —</option>
                    {selectedDistrict.stattions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* ── Section 3: Kit Selection ── */}
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-green-700 px-6 py-4 border-l-4 border-green-400">
              <h2 className="text-white font-bold text-lg">3. Kit Selection</h2>
              <p className="text-green-200 text-sm">Check each item needed and set your size</p>
            </div>
            <div className="divide-y divide-gray-200">
              {KIT_CATEGORIES.map(category => (
                <div key={category.id}>
                  <div className="bg-gray-50 px-6 py-2 border-l-4 border-green-400">
                    <h3 className="font-semibold text-sm text-green-800 uppercase tracking-wide">{category.name}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {category.items.map(item => {
                      const sel = kitSelections[item.id]
                      return (
                        <div key={item.id} className={`px-6 py-4 transition-colors ${sel.selected ? 'bg-green-50' : ''}`}>
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={item.id}
                              checked={sel.selected}
                              onChange={() => toggleItem(item.id)}
                              className="accent-green-700 w-4 h-4 mt-1 cursor-pointer shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <label htmlFor={item.id} className="font-medium text-gray-800 cursor-pointer select-none">
                                  {item.name}
                                </label>
                                <div className="flex flex-wrap gap-3">
                                  {item.sizes.length > 1 ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-500">Size</span>
                                      <select
                                        value={sel.size}
                                        onChange={e => updateSize(item.id, e.target.value)}
                                        disabled={!sel.selected}
                                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        {item.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400 italic self-center">One Size</span>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500">Qty</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={sel.qty}
                                      disabled={!sel.selected}
                                      onChange={e => updateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                                      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 w-16 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 active:bg-green-900 transition-colors shadow-md text-lg tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting…' : 'Submit Kit Order'}
          </button>
        </form>
      </main>
    </div>
  )
}
