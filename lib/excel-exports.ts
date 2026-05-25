// ─── Item × Size Matrix Export ─────────────────────────────────────────────
import { KIT_CATEGORIES } from '../app/components/order-form';

export function exportItemSizeMatrixExcel(districts: District[]) {
  // Build a set of all item names and all sizes for each item
  const itemMap: Record<string, Set<string>> = {};
  for (const cat of KIT_CATEGORIES) {
    for (const item of cat.items) {
      if (!itemMap[item.name]) itemMap[item.name] = new Set();
      for (const sz of item.sizes) itemMap[item.name].add(sz);
    }
  }
  // Build a matrix: item × size → total quantity
  const matrix: Record<string, Record<string, number>> = {};
  for (const d of districts) {
    for (const s of d.stattions) {
      for (const o of s.orders) {
        for (const u of o.uniforms) {
          if (!matrix[u.name]) matrix[u.name] = {};
          matrix[u.name][u.size] = (matrix[u.name][u.size] || 0) + (parseInt(u.quantity) || 1);
        }
      }
    }
  }
  // Prepare columns: first column is Item, then all unique sizes (sorted)
  const allSizes = Array.from(new Set(Object.values(itemMap).flatMap(s => Array.from(s)))).sort((a, b) => {
    // Try numeric sort, fallback to string
    const na = parseInt(a), nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b, undefined, { numeric: true });
  });
  const headers = ['Item', ...allSizes];
  const rows = Object.keys(itemMap).sort().map(itemName => {
    const row = [itemName];
    for (const sz of allSizes) {
      const val = matrix[itemName]?.[sz];
      row.push(val !== undefined ? String(val) : '');
    }
    return row;
  });
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map(() => ({ wch: 12 }));
  // Style header row
  for (let c = 0; c < headers.length; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
    if (!cell) continue;
    cell.s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1A7A3C' } },
      border: THIN_BORDER,
      alignment: { horizontal: 'center' },
    };
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Item Size Matrix');
  XLSX.writeFile(wb, `ems-item-size-matrix-${new Date().toISOString().slice(0, 10)}.xlsx`, { cellStyles: true });
}
// ─── ItemSummary type for aggregateStation ────────────────────────────────
interface ItemSummary {
  name: string;
  total: number;
  male: number;
  female: number;
  maleSizes: Record<string, number>;
  femaleSizes: Record<string, number>;
}

import * as XLSX from 'xlsx'
import type { District, Order } from '../app/components/order-form';

// ─── Types (copied from orders-view) ───────────────────────────────────────
// If you want to keep types in sync, consider extracting them to a shared types file.

// FlatRow type
// interface FlatRow { ... } // Not strictly needed for JS, but for TS you can copy from orders-view

// ─── Flat row used for the table and Excel ─────────────────────────────────
function flatten(districts: District[]) {
  const rows = [];
  for (const d of districts) {
    for (const s of d.stattions) {
      for (const o of s.orders) {
        const date = new Date(o.createdAt).toLocaleDateString('en-ZA');
        if (!o.uniforms || o.uniforms.length === 0) {
          rows.push({
            district: d.name,
            station: s.name,
            firstname: o.firstname,
            lastname: o.lastname,
            recipientname: o.recipientname,
            recipientlastname: o.recipientlastaname,
            rank: o.rank ?? '—', // <-- Add this line
            percalid: o.recipientpercalid ?? '',
            date,
            item: '—',
            size: '—',
            quantity: 0,
          });
        } else {
          for (const u of o.uniforms) {
            rows.push({
              district: d.name,
              station: s.name,
              firstname: o.firstname,
              lastname: o.lastname,
              recipientname: o.recipientname,
              recipientlastname: o.recipientlastaname,
              rank: o.rank ?? '—', // <-- Add this line
              percalid: o.recipientpercalid ?? '',
              date,
              item: u.name,
              size: u.size,
              quantity: parseInt(u.quantity) || 1,
            });
          }
        }
      }
    }
  }
  return rows;
}

// ─── Summary aggregation ───────────────────────────────────────────────────
function aggregateStation(orders: Order[]) {
  const map: Record<string, ItemSummary> = {};
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

const THIN_BORDER = {
  top:    { style: 'thin', color: { rgb: 'CCCCCC' } },
  bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
  left:   { style: 'thin', color: { rgb: 'CCCCCC' } },
  right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
}

export function exportAllOrdersExcel(districts: District[]) {
  const headers = [
    'District',
    'Station',
    'First Name',
    'Last Name',
    'Recipient Name',
    'Recipient Last Name',
    'Rank',                // <-- 1. Insert header here
    'Recipient Persal ID',
    'Date',
    'Item',
    'Size',
    'Qty',
  ];
  
  const allFlatRows = flatten(districts);
  const rows = allFlatRows.map(r => [
    r.district  || '-',
    r.station   || '-',
    r.firstname || '-',
    r.lastname  || '-',
    r.recipientname || '-',
    r.recipientlastname || '-',
    r.rank      || '-',    // <-- 2. Insert row data value here
    r.percalid  || '-',
    r.date      || '-',
    r.item      || '-',
    r.size      || '-',
    r.quantity  || '-',
  ]);
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // 3. Insert a column width (e.g., 16) for Rank right before the Persal ID width (18)
  ws['!cols'] = [24, 22, 14, 14, 18, 18, 16, 18, 12, 36, 10, 6].map(w => ({ wch: w }));

  const numCols = headers.length;
  for (let c = 0; c < numCols; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
    if (!cell) continue;
    cell.s = {
      font:    { bold: true, color: { rgb: 'FFFFFF' } },
      fill:    { fgColor: { rgb: '1A7A3C' } },
      border:  THIN_BORDER,
      alignment: { horizontal: 'center' },
    };
  }
  
  for (let r = 1; r <= rows.length; r++) {
    for (let c = 0; c < numCols; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (!cell) continue;
      cell.s = { border: THIN_BORDER, alignment: { horizontal: c >= numCols - 1 ? 'center' : 'left' } };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'All Orders');
  XLSX.writeFile(wb, `ems-orders-${new Date().toISOString().slice(0, 10)}.xlsx`, { cellStyles: true });
}

export function exportSummaryExcel(districts: District[]) {
  const wb = XLSX.utils.book_new()
  for (const d of districts) {
    const sheetRows: (string | number)[][] = [];
    const sectionMeta: { districtRow: number | undefined; stationRows: { headerRow: number; dataStart: number; dataEnd: number }[] } = { districtRow: undefined, stationRows: [] };
    sectionMeta.districtRow = sheetRows.length
    sheetRows.push([`DISTRICT: ${d.name}`, '', '', '', '', ''])
    sheetRows.push([])
    for (const s of d.stattions) {
      const stationItems = aggregateStation(s.orders)
      const stationRow = sheetRows.length
      sheetRows.push([`Station: ${s.name}`, '', '', '', '', ''])
      sheetRows.push(['Item', 'Total', 'Male', 'Male Sizes', 'Female', 'Female Sizes'])
      const dataStart = sheetRows.length
      const fmtSizes = (sizes: Record<string, number>) =>
        Object.entries(sizes)
          .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
          .map(([sz, cnt]) => `${sz}: ${cnt}`)
          .join(', ') || '-';
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
      sheetRows.push([])
    }
    const ws = XLSX.utils.aoa_to_sheet(sheetRows)
    ws['!cols'] = [38, 9, 9, 36, 9, 36].map(w => ({ wch: w }))
    const NC = 6
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
