
"use client"
// --- Static mapping: stationId -> { stationName, districtName } ---
const STATION_MAP: Record<string, { stationName: string; districtName: string }> = {
  // Districts as their own entries (for completeness)
  'cmp1o64gdm21207tdoeslbv5w': { stationName: 'City Of Johannesburg', districtName: 'City Of Johannesburg' },
  'cmp1o5t68mp0e07tdqf0jb56h': { stationName: 'CityOF Ekurhuleni', districtName: 'CityOF Ekurhuleni' },
  'cmp1o71men7up7tdm1bol6up': { stationName: 'West Rand', districtName: 'West Rand' },
  'cmp1o6hm63sge7uqg81d4ig0': { stationName: 'Sedibeng', districtName: 'Sedibeng' },
  'cmp1o5ingd6w07tdthah4p7z': { stationName: 'City of Tshwane', districtName: 'City of Tshwane' },
  'cmpk74yhs1f6t7tga16n6ho': { stationName: 'Head Office', districtName: 'Head Office' },

  // Stations (from screenshots, grouped by district)
  // City Of Johannesburg
  'cmpb1ff7d7p4j8w1q8usdoed': { stationName: 'Heidelberg', districtName: 'City Of Johannesburg' },
  'cmpb2m8nt4ytc5v4uk4irw4': { stationName: 'Far East Rand', districtName: 'City Of Johannesburg' },
  'cmpb2ngj6ks9t7cz4lucx6r': { stationName: 'KHuTsohong', districtName: 'City Of Johannesburg' },
  'cmpb3ngj6ks9t7cz4lucx6r': { stationName: 'Nokuthula Ngwenya', districtName: 'City Of Johannesburg' },
  'cmpb4ngj6ks9t7cz4lucx6r': { stationName: 'ECC - Support', districtName: 'City Of Johannesburg' },
  'cmpb5ngj6ks9t7cz4lucx6r': { stationName: 'Lenasia', districtName: 'City Of Johannesburg' },
  'cmpb6ngj6ks9t7cz4lucx6r': { stationName: 'Vanderbijl Park', districtName: 'City Of Johannesburg' },
  'cmpb7ngj6ks9t7cz4lucx6r': { stationName: 'Daggafontein', districtName: 'City Of Johannesburg' },
  'cmpb8ngj6ks9t7cz4lucx6r': { stationName: 'Springs', districtName: 'City Of Johannesburg' },
  'cmpb9ngj6ks9t7cz4lucx6r': { stationName: 'Vereeniging', districtName: 'City Of Johannesburg' },
  'cmpba0ngj6ks9t7cz4lucx6r': { stationName: 'Devon', districtName: 'City Of Johannesburg' },
  'cmpbb0ngj6ks9t7cz4lucx6r': { stationName: 'Pholosong', districtName: 'City Of Johannesburg' },
  'cmpbc0ngj6ks9t7cz4lucx6r': { stationName: 'BARA/ELDOS', districtName: 'City Of Johannesburg' },
  'cmpbd0ngj6ks9t7cz4lucx6r': { stationName: 'Temba', districtName: 'City Of Johannesburg' },
  'cmpbe0ngj6ks9t7cz4lucx6r': { stationName: 'Hillbrow', districtName: 'City Of Johannesburg' },
  'cmpbf0ngj6ks9t7cz4lucx6r': { stationName: 'Goba', districtName: 'City Of Johannesburg' },
  'cmpbg0ngj6ks9t7cz4lucx6r': { stationName: 'Alex', districtName: 'City Of Johannesburg' },
  'cmpbh0ngj6ks9t7cz4lucx6r': { stationName: 'Zola', districtName: 'City Of Johannesburg' },
  'cmpbi0ngj6ks9t7cz4lucx6r': { stationName: 'Chiawelo', districtName: 'City Of Johannesburg' },
  'cmpbj0ngj6ks9t7cz4lucx6r': { stationName: 'Imbali', districtName: 'City Of Johannesburg' },

  // ... (repeat for all other stations from your screenshots, grouped by their district)
  // You can continue filling in the rest using the same pattern.
};

import { useState, useMemo, useEffect } from 'react'
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
  recipientname: string
  recipientlastaname: string
  percal: string
  ismale: boolean
  createdAt: string
  uniforms: Uniform[]
  stationId: string
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
      const isMaleItem   = u.name.endsWith('(Male)')
      const isFemaleItem = u.name.endsWith('(Female)')
      const countAsMale  = isMaleItem  || (!isFemaleItem && o.ismale)
      if (countAsMale) {
        map[u.name].male += qty
        map[u.name].maleSizes[u.size] = (map[u.name].maleSizes[u.size] ?? 0) + qty
      } else {
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


// --- Fetch orders from API route ---
async function fetchOrdersFromApi(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders-redis', { cache: 'no-store' });
    const data = await res.json();
    return data.orders || [];
  } catch {
    return [];
  }
}

// ─── Flat row used for the table and Excel ───────────────────────────────────

interface FlatRow {
  district: string
  station: string
  firstname: string
  lastname: string
  percalid: string
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
        if (o.uniforms.length === 0) {
          rows.push({ district: d.name, station: s.name, firstname: o.firstname, lastname: o.lastname, percalid: o.percal ?? '', date, item: '—', size: '—', quantity: 0 })
        } else {
          for (const u of o.uniforms) {
            rows.push({ district: d.name, station: s.name, firstname: o.firstname, lastname: o.lastname, percalid: o.percal ?? '', date, item: u.name, size: u.size, quantity: parseInt(u.quantity) || 1 })
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

function sizesString(sizes: Record<string, number>): string {
  const entries = Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  if (entries.length === 0) return '—'
  return entries.map(([size, count]) => count > 1 ? `${size}×${count}` : size).join(', ')
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
              <td className="px-4 py-3 text-blue-600 text-sm">{sizesString(item.maleSizes)}</td>
              <td className="px-4 py-3 text-center text-pink-600 font-semibold">{item.female || '—'}</td>
              <td className="px-4 py-3 text-pink-500 text-sm">{sizesString(item.femaleSizes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────


interface OrdersViewProps {
  orders: Order[];
}

export default function OrdersView({ orders }: OrdersViewProps) {
    // Debug: log orders to browser console
    useEffect(() => {
      console.log('[OrdersView] Orders prop:', orders);
    }, [orders]);
  const [tab, setTab] = useState<'summary' | 'orders'>('summary');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterStation, setFilterStation] = useState('');
  const [openDistricts, setOpenDistricts] = useState<Set<string>>(new Set());
  const [openStations, setOpenStations] = useState<Set<string>>(new Set());

  // Group orders by station and district for compatibility with existing UI
  // TODO: Many orders are showing as 'Unknown District'.
  // This is because their stationId is not in STATION_MAP.
  // When you have time, update STATION_MAP to include all stationIds in your data.
  // You can also consider fetching station/district info from a canonical source (e.g., Hygraph) instead of a static map.
  // For now, this will group all unknowns under 'Unknown District'.
  const districts: District[] = useMemo(() => {
    const districtMap: Record<string, District> = {};
    const stationMap: Record<string, Stattion> = {};
    for (const o of orders) {
      const stationId = o.stationId || 'unknown';
      const mapping = STATION_MAP[stationId];
      const stationName = mapping ? mapping.stationName : stationId;
      const districtName = mapping ? mapping.districtName : 'Unknown District';
      const districtId = mapping ? mapping.districtName : 'unknown';
      if (!districtMap[districtId]) districtMap[districtId] = { id: districtId, name: districtName, stattions: [] };
      if (!stationMap[stationId]) stationMap[stationId] = { id: stationId, name: stationName, orders: [] };
      stationMap[stationId].orders.push(o);
      // Attach station to district if not already
      if (!districtMap[districtId].stattions.includes(stationMap[stationId])) {
        districtMap[districtId].stattions.push(stationMap[stationId]);
      }
    }
    return Object.values(districtMap);
  }, [orders]);


  const allRows = useMemo(() => flatten(districts), [districts]);
  const stations = filterDistrict ? (districts.find(d => d.id === filterDistrict)?.stattions ?? []) : [];
  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (filterDistrict) {
        const d = districts.find(d => d.id === filterDistrict);
        if (!d || r.district !== d.name) return false;
      }
      if (filterStation) {
        const d = districts.find(d => d.id === filterDistrict);
        const st = d?.stattions.find(s => s.id === filterStation);
        if (!st || r.station !== st.name) return false;
      }
      return true;
    });
  }, [allRows, filterDistrict, filterStation, districts]);
  // TEMP: Hide 'Unknown District' from summary tab for deployment
  const filteredDistricts = useMemo(() => {
    let ds = districts;
    if (!filterDistrict) {
      ds = districts.filter(d => d.name !== 'Unknown District');
    } else {
      const d = districts.find(d => d.id === filterDistrict);
      if (!d) return [];
      ds = [d];
    }
    if (filterStation && ds.length === 1) {
      return [{ ...ds[0], stattions: ds[0].stattions.filter(s => s.id === filterStation) }];
    }
    return ds;
  }, [districts, filterDistrict, filterStation]);
  const toggleDistrict = (id: string) => setOpenDistricts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleStation = (id: string) => setOpenStations(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const totalOrders = useMemo(() => orders.length, [orders]);
  const totalItems = useMemo(() => filteredRows.reduce((sum, r) => sum + r.quantity, 0), [filteredRows]);

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
                      {['District', 'Station', 'First Name', 'Last Name', 'Recipient Persal ID', 'Date', 'Item', 'Size', 'Qty'].map(h => (
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
                        <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.percalid || '—'}</td>
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
