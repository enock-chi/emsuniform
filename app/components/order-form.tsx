'use client'

import { useState } from 'react'
import Link from 'next/link'


// ─── Types ────────────────────────────────────────────────────────────────────


export interface Uniform {
  id: string;
  name: string;
  size: string;
  quantity: string;
}

export interface Order {
  id: string;
  firstname: string;
  lastname: string;
  recipientname: string;
  recipientlastaname: string;
  rank?: string;
  percal: string;
  ismale: boolean;
  createdAt: string;
  uniforms: Uniform[];
}

export interface Stattion {
  id: string;
  name: string;
  orders: Order[];
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

export const KIT_CATEGORIES: KitCategory[] = [
  {
    id: 'uniform_operation',
    name: 'UNIFORM OPERATION',
    items: [
      { id: 'advance_rescue_suit_male',        name: 'Advance Rescue Suit (Male)',           sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'advance_rescue_suit_female',      name: 'Advance Rescue Suit (Female)',         sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'base_ball_caps',             name: 'Base Ball Caps',                     sizes: ['One Size'] },
      { id: 'beanie_green',               name: 'Beanie Green',                       sizes: ['One Size'] },
      { id: 'combat_boots',               name: 'Combat Boots',                       sizes: [
        '0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60'] },
      { id: 'bunny_jacket_green',         name: 'Bunny Jacket Green',                 sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'combat_belt',                name: 'Combat Belt',                        sizes: ['XXXS','XXS','XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'combat_trouser_green',       name: 'Combat Trouser Green',               sizes: [
        '22','24','26','28','30','32','34','36','38','40','42','44','46','48','50','52','54','56','58','60'] },
      { id: 'epaulette',                  name: 'Epaulette',                          sizes: ['One Size'] },
      { id: 'jersey_long_sleeve_green_male',   name: 'Jersey Long Sleeve Green (Male)',   sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'jersey_long_sleeve_green_female', name: 'Jersey Long Sleeve Green (Female)', sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'jump_suit_green_male',            name: 'Jump-Suit Green (Male)',             sizes: [
        '18','20','22','24','26','28','30','32','34','36','38','40','42','44','46','48','50','52','54','56','58','60'] },
      { id: 'jump_suit_green_female',          name: 'Jump-Suit Green (Female)',           sizes: [
        '18','20','22','24','26','28','30','32','34','36','38','40','42','44','46','48','50','52','54','56','58','60'] },
      { id: 'rescue_gloves',              name: 'Rescue Gloves',                      sizes: ['XXXS','XXS','XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'rain_suit_two_piece_green',  name: 'Rain-Suit Two Piece Green',          sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'shirt_ss_green_male',         name: 'Shirt S/S Green (Male)',             sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'shirt_ss_green_female',       name: 'Shirt S/S Green (Female)',           sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'shirt_ls_green_male',         name: 'Shirt L/S Green (Male)',             sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'shirt_ls_green_female',       name: 'Shirt L/S Green (Female)',           sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'short_sleeve_tshirt',        name: 'Short Sleeve T-Shirt',               sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'socks_long_ops',             name: 'Socks Long For OPS',                 sizes: ['One Size'] },
      { id: 'socks_short_ops',            name: 'Socks Short For OPS',                sizes: ['One Size'] },
      { id: 'stars_of_life',              name: 'Stars Of Life',                      sizes: ['One Size'] },
      { id: 'id_qualification_badge',     name: 'Identification Qualification Badge', sizes: ['One Size'] },
      { id: 'soft_shell_jacket_green_male',    name: 'Soft-Shell Jacket Green (Male)',    sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'soft_shell_jacket_green_female',  name: 'Soft-Shell Jacket Green (Female)',  sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'reflective_jacket_green_male',    name: 'Reflective Jacket Green (Male)',    sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
      { id: 'reflective_jacket_green_female',  name: 'Reflective Jacket Green (Female)',  sizes: ['XXXXXXS','XXXXXS','XXXXS','XXXS','XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL','XXXXXL','XXXXXXL'] },
    ],
  },
  {
    id: 'uniform_manager',
    name: 'UNIFORM MANAGER',
    items: [
      { id: 'shirt_ss_white_male',   name: 'Shirt S/S White (Male)',   sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_ss_white_female', name: 'Shirt S/S White (Female)', sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_ls_white_male',   name: 'Shirt L/S White (Male)',   sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_ls_white_female', name: 'Shirt L/S White (Female)', sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'stepout_trouser_belt', name: 'Stepout Trouser Belt',   sizes: ['S','M','L','XL'] },
      { id: 'stepout_trouser',      name: 'Stepout Trouser',        sizes: [
        '28','30','32','34','36','38','40','42','44','46','48','50','52','54','56','58','60'] },
      { id: 'stepout_skirt',        name: 'Stepout Skirt',          sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'jacket_blazer',        name: 'Jacket Blazer',          sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'bunny_jacket_blue',    name: 'Bunny Jacket Blue',      sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'jersey_blue_manager',  name: 'Jersey Blue Manager',    sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'parabelum_shoes',      name: 'Parabelum Shoes',        sizes: [
        '3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60'] },
      { id: 'scarf',                name: 'Scarf',                  sizes: ['One Size'] },
      { id: 'pantyhose',            name: 'Pantyhose',              sizes: ['One Size'] },
      { id: 'court_shoes',          name: 'Court Shoes',            sizes: [
        '3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60'] },
    ],
  },
  {
    id: 'control_uniform',
    name: 'CONTROL UNIFORM',
    items: [
      { id: 'jean_control',           name: 'Jean For Control',       sizes: [
        '28','30','32','34','36','38','40','42','44','46','48','50','52','54','56','58','60'] },
      { id: 'scarf_control',          name: 'Scarf For Control',      sizes: ['One Size'] },
      { id: 'winter_bomber_jacket',   name: 'Winter Bomber Jacket',   sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_blue_ss_control_male',   name: 'Shirt Blue S/S Control (Male)',   sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_blue_ss_control_female', name: 'Shirt Blue S/S Control (Female)', sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_blue_ls_control_male',   name: 'Shirt Blue L/S Control (Male)',   sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'shirt_blue_ls_control_female', name: 'Shirt Blue L/S Control (Female)', sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'jersey_control',         name: 'Jersey Control',         sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
      { id: 'chino_trouser',          name: 'Chino Trouser',          sizes: [
        '28','30','32','34','36','38','40','42','44','46','48','50','52','54','56','58','60'] },
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
      { id: 'safety_boots',        name: 'Safety Boots',        sizes: [
        '3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60'] },
      { id: 'soft_shell_jacket',   name: 'Soft-Shell Jacket',   sizes: ['XS','S','M','L','XL','XXL','XXXL'] },
    ],
  },
]

interface KitSelection {
  [itemId: string]: { selected: boolean; sizes: Record<string, number> }
}

function blankSelections(): KitSelection {
  return Object.fromEntries(
    KIT_CATEGORIES.flatMap(cat => cat.items).map(item => [
      item.id,
      { selected: false, sizes: Object.fromEntries(item.sizes.map(s => [s, 0])) },
    ])
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderForm({ districts }: { districts: District[] }) {
  const [submitted, setSubmitted]       = useState(false)
  const [loading,   setLoading]         = useState(false)
  const [error,     setError]           = useState<string | null>(null)

  const [name,             setName]             = useState('')
  const [surname,          setSurname]          = useState('')
  const [recipientName,    setRecipientName]    = useState('')
  const [recipientSurname, setRecipientSurname] = useState('')
  const [recipientPercalId, setRecipientPercalId] = useState('')
  const [rank, setRank] = useState('')
  const [districtId,       setDistrictId]       = useState('')
  const [stationId,        setStationId]        = useState('')
  const [kitSelections,    setKitSelections]    = useState<KitSelection>(blankSelections)
  const [disclaimerTicked, setDisclaimerTicked] = useState(false)

  function resetForNextEntry() {
    setRecipientName('')
    setRecipientSurname('')
    setRecipientPercalId('')
    setKitSelections(blankSelections())
    setDisclaimerTicked(false)
    setRank('')
    setError(null)
    setSubmitted(false)
  }

  const selectedDistrict = districts.find(d => d.id === districtId)

  const handleDistrictChange = (id: string) => {
    setDistrictId(id)
    setStationId('')
  }

  const toggleItem = (id: string) => {
    const item = KIT_CATEGORIES.flatMap(c => c.items).find(i => i.id === id)!
    setKitSelections(prev => {
      const next = !prev[id].selected
      return {
        ...prev,
        [id]: {
          selected: next,
          sizes: item.sizes[0] === 'One Size' ? { 'One Size': next ? 1 : 0 } : prev[id].sizes,
        },
      }
    })
  }

  const updateSizeQty = (id: string, size: string, qty: number) =>
    setKitSelections(prev => ({ ...prev, [id]: { ...prev[id], sizes: { ...prev[id].sizes, [size]: qty } } }))

  const selectSize = (id: string, size: string) => {
    const item = KIT_CATEGORIES.flatMap(c => c.items).find(i => i.id === id)!
    setKitSelections(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        sizes: Object.fromEntries(item.sizes.map(s => [s, s === size ? 1 : 0])),
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !surname.trim()) {
      setError('Please enter the station manager\'s first and last name.')
      return
    }
    if (!recipientName.trim() || !recipientSurname.trim()) {
      setError('Please enter the recipient\'s first and last name.')
      return
    }
    if (!recipientPercalId.trim()) {
      setError('Please enter the recipient\'s Persal ID.')
      return
    }
    if (!stationId) {
      setError('Please select a district and station.')
      return
    }
    if (!rank.trim()) {
      setError('Please enter the qualification or rank.')
      return
    }

    const selectedUniforms = KIT_CATEGORIES.flatMap(cat => cat.items)
      .flatMap(item => {
        if (!kitSelections[item.id].selected) return []
        return Object.entries(kitSelections[item.id].sizes)
          .filter(([, qty]) => qty > 0)
          .map(([size, qty]) => ({ name: item.name, size, quantity: String(qty) }))
      })

    if (selectedUniforms.length === 0) {
      setError('Please select at least one kit item and choose a size.')
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
          recipientname: recipientName,
          recipientlastaname: recipientSurname,
          recipientpercalid: recipientPercalId,
          rank,
          ismale: true,
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
    setRecipientName(''); setRecipientSurname(''); setRecipientPercalId('')
    setDistrictId(''); setStationId('')
    setKitSelections(blankSelections())
    setDisclaimerTicked(false)
    setRank('')
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
          <p className="text-gray-500 mb-6">Your kit order has been recorded successfully.</p>
          <button
            onClick={resetForNextEntry}
            className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors"
          >
            Submit Next Entry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 pt-6 flex justify-end">
        <Link
          href="/orders"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Orders
        </Link>
      </div>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* ── Section 1: Personal Details ── */}
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-green-700 px-6 py-4 border-l-4 border-green-400">
              <h2 className="text-white font-bold text-lg">1. Station Manager Details</h2>
              <p className="text-green-200 text-sm">Manager information</p>
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

          {/* ── Section 2: Recipient Details ── */}
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-green-700 px-6 py-4 border-l-4 border-green-400">
              <h2 className="text-white font-bold text-lg">2. Recipient Details</h2>
              <p className="text-green-200 text-sm">Person receiving the uniform</p>
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
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
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
                    value={recipientSurname}
                    onChange={e => setRecipientSurname(e.target.value)}
                    className="w-full border-b-2 border-gray-300 focus:border-green-600 outline-none py-2 text-gray-800 bg-transparent transition-colors"
                    placeholder="Enter surname"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persal ID <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={recipientPercalId}
                  onChange={e => setRecipientPercalId(e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-green-600 outline-none py-2 text-gray-800 bg-transparent transition-colors"
                  placeholder="Enter persal ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification & Rank <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={rank}
                  onChange={e => setRank(e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-green-600 outline-none py-2 text-gray-800 bg-transparent transition-colors"
                >
                  <option value="">— Select Qualification & Rank —</option>
                  <option value="ECO-BLS">ECO-BLS</option>
                  <option value="ECO-ILS">ECO-ILS</option>
                  <option value="ECO-ALS">ECO-ALS</option>
                  <option value="ECO-ECT">ECO-ECT</option>
                  <option value="ECA">ECA</option>
                  <option value="ECP">ECP</option>
                  <option value="Station Manager">Station Manager</option>
                  <option value="Shift Leader">Shift Leader</option>
                  <option value="Sub-District Manager">Sub-District Manager</option>
                  <option value="District Manager">District Manager</option>
                </select>
              </div>

            </div>
          </section>

          {/* ── Section 3: Station Details ── */}
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-green-700 px-6 py-4 border-l-4 border-green-400">
              <h2 className="text-white font-bold text-lg">3. Station Details</h2>
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
              <h2 className="text-white font-bold text-lg">4. Kit Selection</h2>
              <p className="text-green-200 text-sm">Tick each item needed — then select the applicable sizes</p>
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
                              <label htmlFor={item.id} className="font-medium text-gray-800 cursor-pointer select-none block">
                                {item.name}
                              </label>
                              {sel.selected && item.sizes[0] !== 'One Size' && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.sizes.map(size => (
                                    <label
                                      key={size}
                                      className={`flex items-center gap-1.5 cursor-pointer rounded-lg px-3 py-1.5 border transition-colors select-none ${
                                        sel.sizes[size]
                                          ? 'border-green-500 bg-green-100 text-green-800 font-semibold'
                                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={!!sel.sizes[size]}
                                        onChange={e => e.target.checked ? selectSize(item.id, size) : updateSizeQty(item.id, size, 0)}
                                        className="accent-green-700 w-3.5 h-3.5"
                                      />
                                      <span className="text-sm">{size}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
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

          {/* ── Disclaimer ── */}
          <section className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Declaration</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerTicked}
                  onChange={e => setDisclaimerTicked(e.target.checked)}
                  className="accent-green-700 w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  I, the station manager, confirm that I have consulted with the named recipient regarding this order, that all selected items and sizes are correct and agreed upon, and that I am authorised to submit this uniform order on their behalf.
                </span>
              </label>
            </div>
          </section>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !disclaimerTicked}
            className="w-full py-3.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 active:bg-green-900 transition-colors shadow-md text-lg tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting…' : 'Submit Kit Order'}
          </button>
        </form>
      </main>
    </div>
  )
}
