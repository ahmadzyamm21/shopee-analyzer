/**
 * tiktokParser.js
 * Parser untuk file ekspor TikTok Shop (Seller Center).
 * Mendukung mode COHORT: pesanan dari bulan X dicocokkan ke income dari semua bulan yang diupload.
 */
import * as XLSX from 'xlsx';

// =============================================
// HELPER
// =============================================
const safeFloat = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const s = String(val).replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

const safeInt = (val) => {
  if (val === null || val === undefined) return 0;
  const n = parseInt(String(val));
  return isNaN(n) ? 0 : n;
};

const normalize = (str) =>
  String(str || '')
    .trim()
    .toLowerCase();

const parseDate = (str) => {
  if (!str || str === 'None') return null;
  const parts = String(str).trim().split(' ');
  if (parts.length === 0) return null;
  
  let dateParts = parts[0].split('/');
  if (dateParts.length < 3) {
    dateParts = parts[0].split('-');
  }
  
  if (dateParts.length === 3) {
    let day, month, year;
    if (dateParts[0].length === 4) {
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1;
      day = parseInt(dateParts[2], 10);
    } else {
      day = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10) - 1;
      year = parseInt(dateParts[2], 10);
    }
    
    let hour = 0, min = 0, sec = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(':');
      hour = parseInt(timeParts[0] || 0, 10);
      min = parseInt(timeParts[1] || 0, 10);
      sec = parseInt(timeParts[2] || 0, 10);
    }
    return new Date(year, month, day, hour, min, sec);
  }
  return null;
};

// Cari header kolom secara fleksibel (case-insensitive, partial match)
const findColIdx = (headers, candidates) => {
  for (const c of candidates) {
    const idx = headers.findIndex((h) => normalize(h).includes(normalize(c)));
    if (idx !== -1) return idx;
  }
  return -1;
};

// Dynamic helper to recalculate true sheet range when !ref metadata is incorrect/truncated (bug in TikTok Shop exports)
const recalculateSheetRange = (ws) => {
  if (!ws) return;
  const keys = Object.keys(ws).filter(k => k[0] !== '!');
  if (keys.length > 0) {
    let minRow = 999999, maxRow = 0, minCol = 999999, maxCol = 0;
    keys.forEach(k => {
      const cell = XLSX.utils.decode_cell(k);
      if (cell.r < minRow) minRow = cell.r;
      if (cell.r > maxRow) maxRow = cell.r;
      if (cell.c < minCol) minCol = cell.c;
      if (cell.c > maxCol) maxCol = cell.c;
    });
    ws['!ref'] = XLSX.utils.encode_range({
      s: { r: minRow, c: minCol },
      e: { r: maxRow, c: maxCol }
    });
  }
};

// =============================================
// 1. PARSE FILE PESANAN TIKTOK
// =============================================
/**
 * Membaca file ekspor "Pesanan" dari TikTok Seller Center.
 * Sheet: "OrderSKUList" (atau sheet pertama)
 * Kolom penting: Order ID, Seller SKU, Quantity, Order Status,
 *                Product Name, Variation, SKU Subtotal After Discount
 */
export const parseTikTokOrdersFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });

        // Coba sheet "OrderSKUList" dulu, kalau tidak ada ambil yang pertama
        const sheetName = wb.SheetNames.includes('OrderSKUList')
          ? 'OrderSKUList'
          : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        recalculateSheetRange(ws);
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rows.length < 2) throw new Error('File pesanan TikTok kosong atau tidak valid.');

        const headers = rows[0].map((h) => String(h).trim());

        const COL = {
          orderId: findColIdx(headers, ['order id']),
          sku: findColIdx(headers, ['seller sku', 'sku induk', 'sku']),
          qty: findColIdx(headers, ['quantity', 'jumlah']),
          status: findColIdx(headers, ['order status', 'status pesanan']),
          pname: findColIdx(headers, ['product name', 'nama produk']),
          vname: findColIdx(headers, ['variation', 'variasi']),
          revenue: findColIdx(headers, ['sku subtotal after discount', 'subtotal setelah diskon', 'subtotal']),
          trackingNo: findColIdx(headers, ['tracking id', 'no resi', 'resi']),
          cancelType: findColIdx(headers, ['cancelation/return type', 'tipe pembatalan']),
          refundAmount: findColIdx(headers, ['order refund amount', 'jumlah pengembalian dana']),
          createdTime: findColIdx(headers, ['created time', 'waktu dibuat']),
          shippedTime: findColIdx(headers, ['shipped time', 'waktu dikirim']),
          deliveredTime: findColIdx(headers, ['delivered time', 'waktu diterima']),
          cancelBy: findColIdx(headers, ['cancel by', 'dibatalkan oleh']),
          cancelReason: findColIdx(headers, ['cancel reason', 'alasan pembatalan']),
        };

        if (COL.orderId === -1) throw new Error('Kolom "Order ID" tidak ditemukan di file pesanan TikTok.');
        if (COL.sku === -1) throw new Error('Kolom "Seller SKU" tidak ditemukan di file pesanan TikTok.');

        const orders = {}; // { orderId: { oid, status, items[], totalQty, orderRevenue } }

        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          const oid = String(row[COL.orderId] || '').trim();
          if (!oid || oid === '' || oid.startsWith('Platform')) continue;

          const status = String(row[COL.status] || '').trim();
          const sku = String(row[COL.sku] || '').trim();
          const qty = safeInt(row[COL.qty]);
          const pname = String(row[COL.pname] || '').trim();
          const vname = String(row[COL.vname] || '').trim();
          const revenue = safeFloat(row[COL.revenue]);
          const trackingNo = COL.trackingNo !== -1 ? String(row[COL.trackingNo] || '').trim() : '';
          const cancelType = COL.cancelType !== -1 ? String(row[COL.cancelType] || '').trim() : '';
          const refundAmount = COL.refundAmount !== -1 ? safeFloat(row[COL.refundAmount]) : 0;
          const createdTime = COL.createdTime !== -1 ? String(row[COL.createdTime] || '').trim() : '';
          const shippedTime = COL.shippedTime !== -1 ? String(row[COL.shippedTime] || '').trim() : '';
          const deliveredTime = COL.deliveredTime !== -1 ? String(row[COL.deliveredTime] || '').trim() : '';
          const cancelBy = COL.cancelBy !== -1 ? String(row[COL.cancelBy] || '').trim() : '';
          const cancelReason = COL.cancelReason !== -1 ? String(row[COL.cancelReason] || '').trim() : '';

          if (!orders[oid]) {
            orders[oid] = { 
              oid, 
              status, 
              items: [], 
              totalQty: 0, 
              orderRevenue: 0,
              trackingNo,
              cancelType,
              refundAmount,
              createdTime,
              shippedTime,
              deliveredTime,
              cancelBy,
              cancelReason
            };
          }
          orders[oid].items.push({ sku, qty, pname, vname, revenue });
          orders[oid].totalQty += qty;
          orders[oid].orderRevenue += revenue;
        }

        resolve(orders);
      } catch (err) {
        reject(new Error(`[TikTok Order Parser] ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file pesanan TikTok.'));
    reader.readAsArrayBuffer(file);
  });
};

// =============================================
// 2. PARSE FILE INCOME TIKTOK
// =============================================
/**
 * Membaca file ekspor "Laporan Keuangan / Income" dari TikTok Seller Center.
 * Sheet: "Detail pesanan" (atau sheet pertama)
 * Kolom penting: ID Pesanan/Penyesuaian, ID pesanan terkait, Jenis transaksi,
 *                Total Pendapatan, Total Biaya, Jumlah penyelesaian pembayaran
 *                + semua sub-kolom biaya
 */
export const parseTikTokIncomeFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });

        const sheetName = wb.SheetNames.includes('Detail pesanan')
          ? 'Detail pesanan'
          : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        recalculateSheetRange(ws);
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rows.length < 2) throw new Error('File income TikTok kosong atau tidak valid.');

        const headers = rows[0].map((h) => String(h).trim());

        const COL = {
          orderId: findColIdx(headers, ['id pesanan/penyesuaian', 'order id', 'id pesanan']),
          relatedId: findColIdx(headers, ['id pesanan terkait', 'related order']),
          type: findColIdx(headers, ['jenis transaksi', 'transaction type', 'tipe']),
          revenue: findColIdx(headers, ['total pendapatan', 'total revenue', 'pendapatan']),
          fees: findColIdx(headers, ['total biaya', 'total fee', 'biaya']),
          settlement: findColIdx(headers, ['jumlah penyelesaian', 'settlement', 'penyelesaian pembayaran']),
          // Sub-fee columns
          komisiPlatform: findColIdx(headers, ['biaya komisi platform', 'platform commission']),
          komisiAfiliasi: findColIdx(headers, ['komisi afiliasi', 'affiliate commission']),
          komisiMitra: findColIdx(headers, ['komisi mitra afiliasi', 'mitra afiliasi']),
          komisiIklanAfiliasi: findColIdx(headers, ['komisi iklan toko afiliasi', 'iklan toko afiliasi', 'shop affiliate']),
          komisiDinamis: findColIdx(headers, ['komisi dinamis', 'dynamic commission']),
          logistik: findColIdx(headers, ['biaya layanan logistik', 'logistik', 'logistics']),
          ongkir: findColIdx(headers, ['ongkir', 'shipping fee', 'biaya pengiriman']),
          cashback: findColIdx(headers, ['cashback bonus', 'biaya layanan cashback']),
          prosesPesanan: findColIdx(headers, ['biaya pemrosesan pesanan', 'processing fee', 'pemrosesan']),
          diskonOngkirPenjual: findColIdx(headers, ['diskon ongkir dari penjual', 'seller shipping discount']),
          orderDate: findColIdx(headers, ['waktu pemesanan', 'order date', 'created time']),
          diskonVoucherSeller: findColIdx(headers, ['diskon voucher yang ditanggung penjual', 'seller voucher discount']),
          diskonProduk: findColIdx(headers, ['diskon penjual', 'seller discount']),
          subtotalSebelumDiskon: findColIdx(headers, ['subtotal sebelum diskon', 'original subtotal']),
        };

        if (COL.orderId === -1) throw new Error('Kolom "ID Pesanan" tidak ditemukan di file income TikTok.');

        const records = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const oid = String(row[COL.orderId] || '').trim();
          if (!oid) continue;

          const relatedId = COL.relatedId !== -1 ? String(row[COL.relatedId] || '').trim() : '';
          const type = String(row[COL.type] || '').trim();
          const rawRevenue = safeFloat(row[COL.revenue]);
          const fees = safeFloat(row[COL.fees]);
          const settlement = safeFloat(row[COL.settlement]);
          const diskonVoucherSeller = COL.diskonVoucherSeller !== -1 ? safeFloat(row[COL.diskonVoucherSeller]) : 0;
          const diskonProduk = COL.diskonProduk !== -1 ? safeFloat(row[COL.diskonProduk]) : 0;
          const subtotalSebelumDiskon = COL.subtotalSebelumDiskon !== -1 ? safeFloat(row[COL.subtotalSebelumDiskon]) : 0;

          // Total Omset = Subtotal setelah diskon penjual + Diskon voucher seller
          const revenue = type === 'Pesanan' ? rawRevenue + diskonVoucherSeller : rawRevenue;

          records.push({
            oid,
            relatedId,
            type,
            revenue,
            fees,
            settlement,
            komisiPlatform: COL.komisiPlatform !== -1 ? safeFloat(row[COL.komisiPlatform]) : 0,
            komisiAfiliasi: COL.komisiAfiliasi !== -1 ? safeFloat(row[COL.komisiAfiliasi]) : 0,
            komisiMitra: COL.komisiMitra !== -1 ? safeFloat(row[COL.komisiMitra]) : 0,
            komisiIklanAfiliasi: COL.komisiIklanAfiliasi !== -1 ? safeFloat(row[COL.komisiIklanAfiliasi]) : 0,
            komisiDinamis: COL.komisiDinamis !== -1 ? safeFloat(row[COL.komisiDinamis]) : 0,
            logistik: COL.logistik !== -1 ? safeFloat(row[COL.logistik]) : 0,
            ongkir: COL.ongkir !== -1 ? safeFloat(row[COL.ongkir]) : 0,
            cashback: COL.cashback !== -1 ? safeFloat(row[COL.cashback]) : 0,
            prosesPesanan: COL.prosesPesanan !== -1 ? safeFloat(row[COL.prosesPesanan]) : 0,
            diskonOngkirPenjual: COL.diskonOngkirPenjual !== -1 ? safeFloat(row[COL.diskonOngkirPenjual]) : 0,
            orderDate: COL.orderDate !== -1 ? String(row[COL.orderDate] || '').trim() : '',
            diskonVoucherSeller,
            diskonProduk,
            subtotalSebelumDiskon,
          });
        }

        resolve(records);
      } catch (err) {
        reject(new Error(`[TikTok Income Parser] ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file income TikTok.'));
    reader.readAsArrayBuffer(file);
  });
};

// =============================================
// 3. PARSE FILE HPP TIKTOK (format sama dengan Shopee)
// =============================================
/**
 * Membaca file HPP/COGS.
 * Format: kolom "SKU Induk" (atau "SKU") + "HPP" (atau "Harga Modal")
 */
export const parseTikTokHppFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        recalculateSheetRange(ws);
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rows.length < 2) throw new Error('File HPP TikTok kosong.');

        const headers = rows[0].map((h) => String(h).trim());
        const skuIdx = findColIdx(headers, ['sku induk', 'sku']);
        const hppIdx = findColIdx(headers, ['hpp', 'harga modal', 'modal', 'cogs']);

        if (skuIdx === -1) throw new Error('Kolom "SKU Induk" atau "SKU" tidak ditemukan di file HPP.');
        if (hppIdx === -1) throw new Error('Kolom "HPP" atau "Harga Modal" tidak ditemukan di file HPP.');

        const hppMap = {};
        const rawEntries = [];
        const prodIdx = findColIdx(headers, ['nama produk', 'product name', 'produk']);
        const varIdx = findColIdx(headers, ['nama variasi', 'variation name', 'variasi']);

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const sku = String(row[skuIdx] || '').trim();
          const hpp = safeFloat(row[hppIdx]);
          if (sku) hppMap[sku] = hpp;

          rawEntries.push({
            sku,
            hpp,
            productName: prodIdx !== -1 ? String(row[prodIdx] || '').trim() : '',
            variationName: varIdx !== -1 ? String(row[varIdx] || '').trim() : '',
          });
        }

        resolve({ hppMap, rawEntries });
      } catch (err) {
        reject(new Error(`[TikTok HPP Parser] ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file HPP TikTok.'));
    reader.readAsArrayBuffer(file);
  });
};

const findHppUnit = (sku, pname, vname, hppMap, rawEntries, fallbackVal) => {
  if (sku && hppMap[sku] !== undefined && hppMap[sku] > 0) {
    return hppMap[sku];
  }
  
  if (rawEntries && rawEntries.length > 0) {
    const cleanPname = (pname || '').trim().toLowerCase();
    const cleanVname = (vname || '').trim().toLowerCase();
    
    // Strict 100% exact match on Product Name and Variation Name
    const matched = rawEntries.find(entry => {
      const ep = (entry.productName || '').trim().toLowerCase();
      const ev = (entry.variationName || '').trim().toLowerCase();
      return ep === cleanPname && ev === cleanVname;
    });
    
    if (matched && matched.hpp > 0) {
      return matched.hpp;
    }
  }
  
  return fallbackVal;
};

// =============================================
// 4. COHORT ANALYSIS ENGINE
// =============================================
/**
 * Analisis Cohort TikTok:
 * - Ambil semua Order ID dari `ordersData` (file pesanan)
 * - Cocokkan ke `allIncomeRecords` (gabungan income dari semua file yang diupload)
 *   berdasarkan `oid` atau `relatedId`
 * - Hitung Omset, HPP, Biaya Platform, Settlement, Laba Bersih
 *
 * @param {Object} ordersData - { [orderId]: { oid, status, items[], totalQty, orderRevenue } }
 * @param {Array} allIncomeRecords - Array of income records dari semua file income
 * @param {Object} ttParsedHpp - { hppMap, rawEntries }
 */
export const analyzeTikTokCohort = (ordersData, allIncomeRecords, ttParsedHpp) => {
  const hppMap = (ttParsedHpp && ttParsedHpp.hppMap) ? ttParsedHpp.hppMap : (ttParsedHpp || {});
  const rawEntries = (ttParsedHpp && ttParsedHpp.rawEntries) ? ttParsedHpp.rawEntries : [];
  const orderIds = new Set(Object.keys(ordersData));

  // Find the latest createdTime in the orders data (to use as report export date reference)
  let maxOrderDate = null;
  Object.values(ordersData).forEach((order) => {
    const dt = parseDate(order.createdTime);
    if (dt && (!maxOrderDate || dt > maxOrderDate)) {
      maxOrderDate = dt;
    }
  });

  // Filter income records yang termasuk ke dalam cohort order IDs
  const cohortIncomeRecords = allIncomeRecords.filter((rec) => {
    if (rec.type !== 'Pesanan') return false;
    const mainMatch = orderIds.has(rec.oid);
    const relatedMatch = rec.relatedId && orderIds.has(rec.relatedId);
    return mainMatch || relatedMatch;
  });

  // Build a set of matched order IDs
  const matchedOrderIds = new Set();
  cohortIncomeRecords.forEach((rec) => {
    const targetId = orderIds.has(rec.oid) ? rec.oid : rec.relatedId;
    if (targetId) matchedOrderIds.add(targetId);
  });

  // Aggregate income metrics
  let totalRevenue = 0;
  let totalFees = 0;
  let totalSettlement = 0;

  const feesBreakdown = {
    komisiPlatform: 0,
    komisiAfiliasi: 0,
    komisiMitra: 0,
    komisiIklanAfiliasi: 0,
    komisiDinamis: 0,
    logistik: 0,
    ongkir: 0,
    cashback: 0,
    prosesPesanan: 0,
    diskonOngkirPenjual: 0,
  };

  let totalDiskonProduk = 0;
  let totalVoucherSeller = 0;
  let totalSubtotalSebelumDiskon = 0;

  cohortIncomeRecords.forEach((rec) => {
    totalRevenue += rec.revenue;
    totalFees += rec.fees;
    totalSettlement += rec.settlement;
    totalDiskonProduk += rec.diskonProduk || 0;
    totalVoucherSeller += rec.diskonVoucherSeller || 0;
    totalSubtotalSebelumDiskon += rec.subtotalSebelumDiskon || 0;
    Object.keys(feesBreakdown).forEach((k) => {
      feesBreakdown[k] += rec[k] || 0;
    });
  });

  // Calculate total ads from Iklan-type records, filtered by order months
  // Extract unique year-month from order dates (e.g. '2026/03')
  const orderMonths = new Set();
  Object.values(ordersData).forEach((order) => {
    const ct = order.createdTime || '';
    // Format YYYY/MM/DD or YYYY-MM-DD
    let match = ct.match(/(\d{4})[\/-](\d{2})/);
    if (match) {
      orderMonths.add(`${match[1]}/${match[2]}`);
    } else {
      // Format DD/MM/YYYY or DD-MM-YYYY
      match = ct.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})/);
      if (match) {
        orderMonths.add(`${match[3]}/${match[2]}`);
      }
    }
  });

  let totalAds = 0;
  allIncomeRecords.forEach((rec) => {
    if (rec.type && rec.type.toLowerCase().includes('iklan')) {
      const dateMatch = (rec.orderDate || '').match(/(\d{4})[\/-](\d{2})/);
      if (dateMatch) {
        const recMonth = `${dateMatch[1]}/${dateMatch[2]}`;
        if (orderMonths.has(recMonth)) {
          totalAds += Math.abs(rec.settlement);
        }
      }
    }
  });

  // HPP Calculation
  let totalHppMapped = 0;
  let totalQtyMapped = 0;
  let unmappedQty = 0;

  // Per-SKU breakdown
  const skuMap = {}; // { sku: { qty, revenue, hpp, settlement, pname, vname } }

  matchedOrderIds.forEach((oid) => {
    const order = ordersData[oid];
    if (!order) return;

    const orderRecs = cohortIncomeRecords.filter(
      (r) => r.oid === oid || r.relatedId === oid
    );
    const ordRevenue = orderRecs.reduce((s, r) => s + r.revenue, 0);
    const ordSettlement = orderRecs.reduce((s, r) => s + r.settlement, 0);
    const numItems = order.items.length || 1;

    order.items.forEach((item) => {
      const { sku, qty, pname, vname } = item;
      const hppUnit = findHppUnit(sku, pname, vname, hppMap, rawEntries, 0);

      if (!skuMap[sku]) {
        skuMap[sku] = { qty: 0, revenue: 0, hpp: 0, settlement: 0, pname, vname, hppUnit };
      }
      skuMap[sku].qty += qty;
      skuMap[sku].revenue += ordRevenue / numItems;
      skuMap[sku].settlement += ordSettlement / numItems;

      if (hppUnit > 0) {
        skuMap[sku].hpp += qty * hppUnit;
        totalHppMapped += qty * hppUnit;
        totalQtyMapped += qty;
      } else {
        unmappedQty += qty;
      }
    });
  });

  const avgHpp = totalQtyMapped > 0 ? totalHppMapped / totalQtyMapped : 0;
  const estimatedHpp = unmappedQty * avgHpp;
  const totalHpp = totalHppMapped + estimatedHpp;
  const totalQty = totalQtyMapped + unmappedQty;

  // Fill estimated HPP for unmapped SKUs
  Object.values(skuMap).forEach((s) => {
    if (s.hpp === 0 && s.qty > 0) {
      s.hpp = s.qty * avgHpp;
      s.hppUnit = avgHpp;
    }
  });

  // P&L Calculations
  const grossProfit = totalRevenue - totalHpp;
  const netOperatingProfit = grossProfit + totalFees - totalAds; // fees are negative, ads are positive

  // Sorted SKU list by qty desc
  const skuList = Object.entries(skuMap)
    .map(([sku, data]) => ({
      sku,
      ...data,
      grossProfit: data.revenue - data.hpp,
      margin: data.revenue > 0 ? ((data.revenue - data.hpp) / data.revenue) * 100 : 0,
    }))
    .sort((a, b) => b.qty - a.qty);

  // Order count by source (we track this via records)
  const totalMatchedOrders = matchedOrderIds.size;
  const totalOrders = orderIds.size;

  // Classify orders into lists
  const completedOrdersList = [];
  const returnedOrdersList = [];
  const cancelledOrdersList = [];
  const allOrdersList = [];
  const problematicOrdersList = [];

  let totalBatalCount = 0;
  let totalBatalWithResi = 0;
  let totalBatalNoResi = 0;
  let totalBatalBrutoVal = 0;
  let totalBatalWithResiVal = 0;
  let totalBatalNoResiVal = 0;
  const cancelReasons = {};
  const batalDetails = [];

  Object.values(ordersData).forEach((order) => {
    const oid = order.oid;
    const isCompleted = order.status === 'Selesai' || order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered';
    const isReturned = order.cancelType === 'Return/Refund' || order.refundAmount > 0;
    const isCancelled = order.status === 'Dibatalkan' || order.status.toLowerCase() === 'cancelled' || order.cancelType === 'Cancel';

    const orderRecs = cohortIncomeRecords.filter(
      (r) => r.oid === oid || r.relatedId === oid
    );
    const orderRevenue = orderRecs.reduce((s, r) => s + r.revenue, 0);
    const orderFees = orderRecs.reduce((s, r) => s + r.fees, 0);
    const orderSettlement = orderRecs.reduce((s, r) => s + r.settlement, 0);

    const orderFeesBreakdown = {
      komisiPlatform: orderRecs.reduce((s, r) => s + (r.komisiPlatform || 0), 0),
      komisiAfiliasi: orderRecs.reduce((s, r) => s + (r.komisiAfiliasi || 0) + (r.komisiMitra || 0) + (r.komisiIklanAfiliasi || 0), 0),
      logistik: orderRecs.reduce((s, r) => s + (r.logistik || 0) + (r.ongkir || 0), 0),
      komisiDinamis: orderRecs.reduce((s, r) => s + (r.komisiDinamis || 0), 0),
      cashback: orderRecs.reduce((s, r) => s + (r.cashback || 0), 0),
      prosesPesanan: orderRecs.reduce((s, r) => s + (r.prosesPesanan || 0), 0)
    };

    let orderHpp = 0;
    order.items.forEach((item) => {
      const hppUnit = findHppUnit(item.sku, item.pname, item.vname, hppMap, rawEntries, avgHpp);
      orderHpp += item.qty * hppUnit;
    });

    const formattedOrder = {
      id: oid,
      date: order.createdTime,
      status: order.status,
      resi: order.trackingNo,
      totalQty: order.totalQty,
      totalNet: orderRevenue,
      payout: orderSettlement,
      fees: orderFees,
      feesBreakdown: orderFeesBreakdown,
      items: order.items,
      hpp: orderHpp,
      refund: order.refundAmount || 0,
      cancelType: order.cancelType || '',
      cancelReason: order.cancelReason || '',
      orderCategory: isReturned ? 'Retur/Refund' : isCancelled ? 'Dibatalkan' : isCompleted ? 'Selesai' : order.status,
      problems: []
    };

    const hasResi = order.trackingNo && order.trackingNo !== '-';

    // Identify problems
    if (isCancelled && hasResi) {
      formattedOrder.problems.push('Batal Setelah Resi');
    }
    if (isCompleted && (orderSettlement - orderHpp < 0)) {
      formattedOrder.problems.push('Penjualan Rugi');
    }
    
    // Stalled Shipment: Shipped but Shipped Time is > 5 days from maxOrderDate
    const isShipped = normalize(order.status) === 'dikirim';
    if (isShipped && maxOrderDate) {
      const shipTime = parseDate(order.shippedTime);
      if (shipTime) {
        const diffMs = maxOrderDate.getTime() - shipTime.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 5) {
          formattedOrder.problems.push('Pengiriman Stagnan');
        }
      }
    }

    if (isCompleted && !isReturned) {
      completedOrdersList.push(formattedOrder);
    }
    if (isReturned && hasResi) {
      returnedOrdersList.push(formattedOrder);
    }
    if (isCancelled) {
      cancelledOrdersList.push(formattedOrder);
      
      totalBatalCount++;
      const hasResi = order.trackingNo && order.trackingNo !== '-';
      const grossVal = order.orderRevenue || 0;
      
      if (hasResi) {
        totalBatalWithResi++;
        totalBatalWithResiVal += grossVal;
      } else {
        totalBatalNoResi++;
        totalBatalNoResiVal += grossVal;
      }
      totalBatalBrutoVal += grossVal;

      const reason = order.cancelReason || 'Tidak Diketahui';
      cancelReasons[reason] = (cancelReasons[reason] || 0) + 1;

      order.items.forEach((item) => {
        batalDetails.push({
          id: oid,
          date: order.createdTime,
          sku: item.sku,
          pname: item.pname,
          vname: item.vname,
          qty: item.qty,
          cancelBy: order.cancelBy || 'System',
          cancelReason: order.cancelReason || 'Unknown'
        });
      });
    }

    // Always push to allOrdersList
    allOrdersList.push(formattedOrder);

    // Push to problematic if it has problems
    if (formattedOrder.problems.length > 0) {
      problematicOrdersList.push(formattedOrder);
    }
  });

  return {
    // Summary
    summary: {
      totalOrders,
      totalMatchedOrders,
      totalQty,
      totalQtyMapped,
      unmappedQty,
      avgHpp,
      totalRevenue,
      totalHpp,
      grossProfit,
      grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      totalFees,
      netOperatingProfit,
      netMargin: totalRevenue > 0 ? (netOperatingProfit / totalRevenue) * 100 : 0,
      totalSettlement,
      feesBreakdown,
      selisihOngkir: feesBreakdown.diskonOngkirPenjual,
      totalAds,
      totalDiskonProduk,
      totalVoucherSeller,
      totalSubtotalSebelumDiskon,
    },
    // Per-SKU data
    skuList,
    // Raw matched income records (for order list)
    matchedIncomeRecords: cohortIncomeRecords,
    ordersData,
    completedOrders: completedOrdersList.sort((a, b) => b.date.localeCompare(a.date)),
    returnedOrders: returnedOrdersList.sort((a, b) => b.date.localeCompare(a.date)),
    cancelledOrders: cancelledOrdersList.sort((a, b) => b.date.localeCompare(a.date)),
    allOrders: allOrdersList.sort((a, b) => b.date.localeCompare(a.date)),
    problematicOrders: problematicOrdersList.sort((a, b) => b.date.localeCompare(a.date)),
    batalSummary: {
      totalCount: totalBatalCount,
      withResiCount: totalBatalWithResi,
      noResiCount: totalBatalNoResi,
      totalValue: totalBatalBrutoVal,
      withResiValue: totalBatalWithResiVal,
      noResiValue: totalBatalNoResiVal,
      reasons: Object.entries(cancelReasons).map(([reason, count]) => ({ reason, count })),
      details: batalDetails
    }
  };
};

export const downloadTikTokHppTemplate = (rawOrders = null, ttParsedHpp = null) => {
  const headers = [['SKU Induk', 'Nama Produk', 'Nama Variasi', 'HPP']];
  let rowsData = [];

  const hppMap = (ttParsedHpp && ttParsedHpp.hppMap) ? ttParsedHpp.hppMap : (ttParsedHpp || {});
  const rawEntries = (ttParsedHpp && ttParsedHpp.rawEntries) ? ttParsedHpp.rawEntries : [];

  const uniqueProducts = new Map();

  // 1. First, populate from the currently uploaded HPP database (to preserve all of them!)
  if (rawEntries.length > 0) {
    rawEntries.forEach(entry => {
      const sku = String(entry.sku || '').trim();
      const pname = String(entry.productName || '').trim();
      const vname = String(entry.variationName || '').trim();
      const key = sku || `${pname}||${vname}`;
      if (key) {
        uniqueProducts.set(key, { sku, pname, vname, hpp: entry.hpp });
      }
    });
  }

  // 2. Next, append any new products sold in rawOrders that are not in the database
  if (rawOrders && Object.keys(rawOrders).length > 0) {
    Object.values(rawOrders).forEach((order) => {
      if (!order.items) return;
      order.items.forEach((item) => {
        const sku = String(item.sku || '').trim();
        const pname = String(item.pname || '').trim();
        const vname = String(item.vname || '').trim();
        const key = sku || `${pname}||${vname}`;
        
        if (key && !uniqueProducts.has(key)) {
          // New product! Add with HPP 0 so user can fill it
          uniqueProducts.set(key, { sku, pname, vname, hpp: 0 });
        }
      });
    });
  }

  // 3. Fallback default template if both are empty
  if (uniqueProducts.size === 0) {
    rowsData = [
      ['HELM-BOGO-01', 'ACN Helm Bogo Retro Classic Original SNI', 'Hitam Glossy', 60000],
      ['HELM-BOY-02', 'Helm Motor Anak Cowok SNI Transformer', 'Transformer Blue', 40000],
      ['STICKER-01', '1 Set Sticker Cutting Logo Cargloss Reflectif', 'Putih', 1000]
    ];
  } else {
    // Sort products by SKU or Name
    const sortedProducts = Array.from(uniqueProducts.values()).sort((a, b) => {
      const keyA = a.sku || a.pname;
      const keyB = b.sku || b.pname;
      return keyA.localeCompare(keyB);
    });

    sortedProducts.forEach((item) => {
      rowsData.push([item.sku || '', item.pname, item.vname, item.hpp]);
    });
  }

  const wsData = [...headers, ...rowsData];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 25 }, // SKU Induk
    { wch: 50 }, // Nama Produk
    { wch: 20 }, // Nama Variasi
    { wch: 15 }  // HPP
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Database HPP');
  XLSX.writeFile(wb, 'template_database_hpp_tiktok.xlsx');
};
