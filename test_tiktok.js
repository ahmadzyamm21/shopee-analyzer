import * as fs from 'fs';
import * as XLSX from 'xlsx';

const incomeBuf = fs.readFileSync('C:\\Users\\ahmad\\Downloads\\testing april\\income mei.xlsx');
const incomeWb = XLSX.read(incomeBuf, { type: 'buffer' });
const incomeWs = incomeWb.Sheets['Detail pesanan'];

console.log('Original range:', incomeWs['!ref']);

// Recalculate range
const keys = Object.keys(incomeWs).filter(k => k[0] !== '!');
if (keys.length > 0) {
  let minRow = 999999, maxRow = 0, minCol = 999999, maxCol = 0;
  keys.forEach(k => {
    const cell = XLSX.utils.decode_cell(k);
    if (cell.r < minRow) minRow = cell.r;
    if (cell.r > maxRow) maxRow = cell.r;
    if (cell.c < minCol) minCol = cell.c;
    if (cell.c > maxCol) maxCol = cell.c;
  });
  incomeWs['!ref'] = XLSX.utils.encode_range({
    s: { r: minRow, c: minCol },
    e: { r: maxRow, c: maxCol }
  });
}

console.log('Recalculated range:', incomeWs['!ref']);

const incomeRows = XLSX.utils.sheet_to_json(incomeWs, { header: 1, defval: '' });
console.log('New incomeRows length:', incomeRows.length);
