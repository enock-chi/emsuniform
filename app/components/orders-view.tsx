'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

// ─── Excel helpers ────────────────────────────────────────────────────────────

const THIN_BORDER = {
  top:    { style: 'thin', color: { rgb: 'CCCCCC' } },
  bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
  left:   { style: 'thin', color: { rgb: 'CCCCCC' } },
  right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Uniform {
  id: string
  name: string
  size: string
  quantity: string
}

interface Order {
  id: string
  firstname: string
  lastname: string
  ismale: boolean
  createdAt: string
  uniforms: Uniform[]
}

interface Stattion {
  id: string
  name: string
  orders: Order[]
}

// ─── Summary aggregation ──────────────────────────────────────────────────────

interface ItemSummary {
  name: string
  total: number
  male: number
  female: number
  maleSizes: Record<string, number>
  femaleSizes: Record<string, number>
}

function aggregateStation(orders: Order[]): ItemSummary[] {
  const map: Record<string, ItemSummary> = {}
  for (const o of orders) {
    for (const u of o.uniforms) {
      const qty = parseInt(u.quantity) || 1
      if (!map[u.name]) map[u.name] = { name: u.name, total: 0, male: 0, female: 0, maleSizes: {}, femaleSizes: {} }
      map[u.name].total += qty
      if (u.name.endsWith('(Male)')) {
        map[u.name].male += qty
        map[u.name].maleSizes[u.size] = (map[u.name].maleSizes[u.size] ?? 0) + qty
      } else if (u.name.endsWith('(Female)')) {
        map[u.name].female += qty
        map[u.name].femaleSizes[u.size] = (map[u.name].femaleSizes[u.size] ?? 0) + qty
      }
    }
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
}

interface District {
  id: string
  name: string
  stattions: Stattion[]
}

export interface OrdersData {
  districts: District[]
}

// ─── Flat row used for the table and Excel ───────────────────────────────────

interface FlatRow {
  district: string
  station: string
  firstname: string
  lastname: string
  gender: string
  date: string
  item: string
  size: string
  quantity: number
}

function flatten(districts: District[]): FlatRow[] {
  const rows: FlatRow[] = []
  for (const d of districts) {
    for (const s of d.stattions) {
      for (const o of s.orders) {
        const date = new Date(o.createdAt).toLocaleDateString('en-ZA')
        const gender = o.ismale ? 'Male' : 'Female'
        if (o.uniforms.length === 0) {
          rows.push({ district: d.name, station: s.name, firstname: o.firstname, lastname: o.lastname, gender, date, item: '—', size: '—', quantity: 0 })
        } else {
          for (const u of o.uniforms) {
            rows.push({ district: d.name, station: s.name, firstname: o.firstname, lastname: o.lastname, gender, date, item: u.name, size: u.size, quantity: parseInt(u.quantity) || 1 })
          }
        }
      }
    }
  }
  return rows
}


// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="py-20 text-center text-gray-400">
      <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="font-medium">No orders yet</p>
      <p className="text-sm mt-1">Orders will appear here once submitted</p>
    </div>
  )
}

// ─── Station summary table ────────────────────────────────────────────────────

function SizeChips({ sizes, color }: { sizes: Record<string, number>; color: string }) {
  const entries = Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  if (entries.length === 0) return <span className="text-gray-300 text-xs">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([size, count]) => (
        <span key={size} className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${color}`}>
          {size} <span className="font-bold">×{count}</span>
        </span>
      ))}
    </div>
  )
}

function StationSummaryTable({ items }: { items: ItemSummary[] }) {
  if (items.length === 0) return <p className="px-5 py-4 text-sm text-gray-400 italic">No orders for this station yet</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-200">
            <th className="px-4 py-2.5 text-left font-semibold">Item</th>
            <th className="px-4 py-2.5 text-center font-semibold">Total</th>
            <th className="px-4 py-2.5 text-center font-semibold text-blue-600">Male</th>
            <th className="px-4 py-2.5 text-left font-semibold text-blue-500">Male Sizes</th>
            <th className="px-4 py-2.5 text-center font-semibold text-pink-600">Female</th>
            <th className="px-4 py-2.5 text-left font-semibold text-pink-400">Female Sizes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{item.name}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-sm">{item.total}</span>
              </td>
              <td className="px-4 py-3 text-center text-blue-700 font-semibold">{item.male || '—'}</td>
              <td className="px-4 py-3"><SizeChips sizes={item.maleSizes} color="bg-blue-50 text-blue-700" /></td>
              <td className="px-4 py-3 text-center text-pink-600 font-semibold">{item.female || '—'}</td>
              <td className="px-4 py-3"><SizeChips sizes={item.femaleSizes} color="bg-pink-50 text-pink-600" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrdersView({ data }: { data: OrdersData }) {
  const [tab,            setTab]           = useState<'summary' | 'orders'>('summary')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [filterStation,  setFilterStation]  = useState('')
  const [openDistricts,  setOpenDistricts]  = useState<Set<string>>(new Set())
  const [openStations,   setOpenStations]   = useState<Set<string>>(new Set())

  const allRows = useMemo(() => flatten(data.districts), [data])

  const districts = data.districts
  const stations  = filterDistrict
    ? (districts.find(d => d.id === filterDistrict)?.stattions ?? [])
    : []

  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (filterDistrict) {
        const d = districts.find(d => d.id === filterDistrict)
        if (!d || r.district !== d.name) return false
      }
      if (filterStation) {
        const d  = districts.find(d => d.id === filterDistrict)
        const st = d?.stattions.find(s => s.id === filterStation)
        if (!st || r.station !== st.name) return false
      }
      return true
    })
  }, [allRows, filterDistrict, filterStation, districts])

  // filtered districts for summary view
  const filteredDistricts = useMemo(() => {
    if (!filterDistrict) return districts
    const d = districts.find(d => d.id === filterDistrict)
    if (!d) return []
    if (!filterStation) return [d]
    return [{ ...d, stattions: d.stattions.filter(s => s.id === filterStation) }]
  }, [districts, filterDistrict, filterStation])

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalOrders = useMemo(() => {
    const seen = new Set<string>()
    for (const d of data.districts) {
      for (const s of d.stattions) {
        for (const o of s.orders) seen.add(o.id)
      }
    }
    return seen.size
  }, [data])

  const totalItems = useMemo(() => filteredRows.reduce((sum, r) => sum + r.quantity, 0), [filteredRows])

  // ── Excel exports ─────────────────────────────────────────────────────────

  const handleExportOrders = () => {
    const headers = ['District', 'Station', 'First Name', 'Last Name', 'Gender', 'Date', 'Item', 'Size', 'Qty']
    // Always export ALL data regardless of filter
    const allFlatRows = flatten(data.districts)
    const rows = allFlatRows.map(r => [
      r.district  || '-',
      r.station   || '-',
      r.firstname || '-',
      r.lastname  || '-',
      r.gender    || '-',
      r.date      || '-',
      r.item      || '-',
      r.size      || '-',
      r.quantity  || '-',
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = [24, 22, 14, 14, 8, 12, 36, 10, 6].map(w => ({ wch: w }))

    // Bold + background header row
    const numCols = headers.length
    for (let c = 0; c < numCols; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c })]
      if (!cell) continue
      cell.s = {
        font:    { bold: true, color: { rgb: 'FFFFFF' } },
        fill:    { fgColor: { rgb: '1A7A3C' } },
        border:  THIN_BORDER,
        alignment: { horizontal: 'center' },
      }
    }
    // Borders on all data rows
    for (let r = 1; r <= rows.length; r++) {
      for (let c = 0; c < numCols; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })]
        if (!cell) continue
        cell.s = { border: THIN_BORDER, alignment: { horizontal: c >= numCols - 1 ? 'center' : 'left' } }
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'All Orders')
    XLSX.writeFile(wb, `ems-orders-${new Date().toISOString().slice(0, 10)}.xlsx`, { cellStyles: true })
  }

  const handleExportSummary = () => {
    const wb = XLSX.utils.book_new()

    // Always export ALL districts regardless of filter
    for (const d of data.districts) {
      const sheetRows: (string | number)[][] = []
      // Track which spreadsheet row each section starts at for styling
      const sectionMeta: { districtRow?: number; stationRows: { headerRow: number; dataStart: number; dataEnd: number }[] } =
        { stationRows: [] }

      // District title row
      sectionMeta.districtRow = sheetRows.length
      sheetRows.push([`DISTRICT: ${d.name}`, '', '', '', '', ''])
      sheetRows.push([]) // blank

      for (const s of d.stattions) {
        const stationItems = aggregateStation(s.orders)

        // Station header row
        const stationRow = sheetRows.length
        sheetRows.push([`Station: ${s.name}`, '', '', '', '', ''])

        // Column header row
        sheetRows.push(['Item', 'Total', 'Male', 'Male Sizes', 'Female', 'Female Sizes'])

        const dataStart = sheetRows.length
        const fmtSizes = (sizes: Record<string, number>) =>
          Object.entries(sizes)
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
            .map(([sz, cnt]) => `${sz}: ${cnt}`)
            .join(', ') || '-'

        if (stationItems.length === 0) {
          sheetRows.push(['No orders yet', '-', '-', '-', '-', '-'])
        } else {
          for (const entry of stationItems) {
            sheetRows.push([
              entry.name,
              entry.total  || '-',
              entry.male   || '-',
              fmtSizes(entry.maleSizes),
              entry.female || '-',
              fmtSizes(entry.femaleSizes),
            ])
          }
        }
        const dataEnd = sheetRows.length - 1

        sectionMeta.stationRows.push({ headerRow: stationRow, dataStart, dataEnd })
        sheetRows.push([]) // blank separator
      }

      const ws = XLSX.utils.aoa_to_sheet(sheetRows)
      ws['!cols'] = [38, 9, 9, 36, 9, 36].map(w => ({ wch: w }))
      const NC = 6

      // Style district title
      if (sectionMeta.districtRow !== undefined) {
        for (let c = 0; c < NC; c++) {
          const cell = ws[XLSX.utils.encode_cell({ r: sectionMeta.districtRow, c })]
          if (!cell) continue
          cell.s = {
            font:  { bold: true, sz: 13, color: { rgb: 'FFFFFF' } },
            fill:  { fgColor: { rgb: '145C2C' } },
            border: THIN_BORDER,
            alignment: { horizontal: 'left' },
          }
        }
      }

      for (const { headerRow, dataStart, dataEnd } of sectionMeta.stationRows) {
        // Station label row
        for (let c = 0; c < NC; c++) {
          const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c })]
          if (!cell) continue
          cell.s = {
            font:  { bold: true, color: { rgb: 'FFFFFF' } },
            fill:  { fgColor: { rgb: '1A7A3C' } },
            border: THIN_BORDER,
            alignment: { horizontal: 'left' },
          }
        }
        // Column header row (row just before dataStart)
        for (let c = 0; c < NC; c++) {
          const cell = ws[XLSX.utils.encode_cell({ r: dataStart - 1, c })]
          if (!cell) continue
          cell.s = {
            font:  { bold: true, color: { rgb: '1A3A2C' } },
            fill:  { fgColor: { rgb: 'D1FAE5' } },
            border: THIN_BORDER,
            alignment: { horizontal: c === 0 ? 'left' : 'center' },
          }
        }
        // Data rows — alternate row shading
        for (let r = dataStart; r <= dataEnd; r++) {
          const even = (r - dataStart) % 2 === 0
          for (let c = 0; c < NC; c++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c })]
            if (!cell) continue
            cell.s = {
              fill:  { fgColor: { rgb: even ? 'FFFFFF' : 'F0FDF4' } },
              border: THIN_BORDER,
              alignment: { horizontal: c === 0 ? 'left' : 'center' },
            }
          }
        }
      }

      const sheetName = d.name.replace(/:$/, '').trim().slice(0, 31)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    }

    XLSX.writeFile(wb, `ems-summary-${new Date().toISOString().slice(0, 10)}.xlsx`, { cellStyles: true })
  }

  const toggleDistrict = (id: string) =>
    setOpenDistricts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const toggleStation = (id: string) =>
    setOpenStations(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kit Orders</h1>
            <p className="text-gray-500 text-sm mt-0.5">Gauteng EMS uniform order overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Place Order
            </Link>
            <button
              onClick={tab === 'orders' ? handleExportOrders : handleExportSummary}
              disabled={filteredRows.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Excel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Orders', value: totalOrders },
            { label: 'Items in View', value: totalItems },
            { label: 'Rows in View', value: filteredRows.length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
            {(['summary', 'orders'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors capitalize ${tab === t ? 'bg-white text-green-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'summary' ? 'Summary' : 'All Orders'}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Filter by District</label>
              <select
                value={filterDistrict}
                onChange={e => { setFilterDistrict(e.target.value); setFilterStation('') }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
              >
                <option value="">All Districts</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Station</label>
              <select
                value={filterStation}
                onChange={e => setFilterStation(e.target.value)}
                disabled={!filterDistrict}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">All Stations</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Summary tab ── */}
        {tab === 'summary' && (
          <div className="space-y-4">
            {filteredDistricts.map(district => {
              const districtOpen = openDistricts.has(district.id)
              const districtOrderCount = district.stattions.reduce((n, s) => n + s.orders.length, 0)
              return (
                <div key={district.id} className="bg-white rounded-xl shadow overflow-hidden">
                  {/* District header */}
                  <button
                    onClick={() => toggleDistrict(district.id)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-green-700 text-white hover:bg-green-800 transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-lg">{district.name}</span>
                      <span className="ml-3 text-green-200 text-sm">{district.stattions.length} stations · {districtOrderCount} orders</span>
                    </div>
                    <svg className={`w-5 h-5 text-green-200 transition-transform ${districtOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {districtOpen && (
                    <div className="divide-y divide-gray-100">
                      {district.stattions.map(station => {
                        const stationOpen = openStations.has(station.id)
                        const items = aggregateStation(station.orders)
                        return (
                          <div key={station.id}>
                            {/* Station header */}
                            <button
                              onClick={() => toggleStation(station.id)}
                              className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                <span className="font-semibold text-gray-800">{station.name}</span>
                                <span className="text-xs text-gray-400">{station.orders.length} order{station.orders.length !== 1 ? 's' : ''}</span>
                              </div>
                              <svg className={`w-4 h-4 text-gray-400 transition-transform ${stationOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {stationOpen && <StationSummaryTable items={items} />}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── All Orders tab ── */}
        {tab === 'orders' && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {filteredRows.length === 0 ? <EmptyState /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-700 text-white text-left">
                      {['District', 'Station', 'First Name', 'Last Name', 'Gender', 'Date', 'Item', 'Size', 'Qty'].map(h => (
                        <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.district}</td>
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.station}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{r.firstname}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{r.lastname}</td>
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.gender}</td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{r.item}</td>
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.size}</td>
                        <td className="px-4 py-2.5 text-center font-medium text-gray-800">{r.quantity || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
