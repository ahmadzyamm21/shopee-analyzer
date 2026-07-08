import * as XLSX from 'xlsx';

// Helper to convert sheet to JSON rows
export const sheetToJson = (workbook, sheetNameOrIndex) => {
  const sheetName = typeof sheetNameOrIndex === 'number' 
    ? workbook.SheetNames[sheetNameOrIndex] 
    : sheetNameOrIndex;
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return [];
  return XLSX.utils.sheet_to_json(worksheet, { defval: null });
};

// Parse raw cells safely
export const parseNumber = (val) => {
  if (val === null || val === undefined || val === '-') return 0;
  // Handle formatted Indonesian currency strings like "136.365.220" or "Rp 136.365.220"
  let str = String(val).trim();
  str = str.replace(/Rp\s?/g, '');
  if (str.includes(',') && str.includes('.')) {
    // e.g. 1.250,50 -> replace dot (thousands) and replace comma with dot (decimal)
    str = str.replace(/\./g, '').replace(/,/g, '.');
  } else if (str.includes(',')) {
    // e.g. 1250,50
    str = str.replace(/,/g, '.');
  } else if (str.includes('.')) {
    // e.g. 136.365.220 (thousands separator without decimals) or 1250.50
    // If it looks like thousands separator, e.g. 3 decimals/digits after dot
    const parts = str.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/\./g, '');
    }
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

// Parse HPP Excel file
export const parseHppFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('hpp')) || workbook.SheetNames[0];
        const rows = sheetToJson(workbook, sheetName);
        
        const hppBySku = {};
        const hppByNameVar = {};
        
        rows.forEach(row => {
          // Map dynamic header columns
          const keys = Object.keys(row);
          const skuKey = keys.find(k => k.toLowerCase().includes('sku'));
          const nameKey = keys.find(k => k.toLowerCase().includes('nama') || k.toLowerCase().includes('product'));
          const varKey = keys.find(k => k.toLowerCase().includes('variasi') || k.toLowerCase().includes('variation'));
          const hppKey = keys.find(k => k.toLowerCase().includes('hpp') || k.toLowerCase().includes('modal') || k.toLowerCase().includes('cost'));
          
          const sku = skuKey && row[skuKey] ? String(row[skuKey]).trim() : null;
          const name = nameKey && row[nameKey] ? String(row[nameKey]).trim() : null;
          const variation = varKey && row[varKey] !== null ? String(row[varKey]).trim() : '';
          const hpp = hppKey ? parseNumber(row[hppKey]) : 0;
          
          if (sku) {
            hppBySku[sku] = hpp;
          }
          if (name) {
            hppByNameVar[`${name}|${variation}`] = hpp;
          }
        });
        
        resolve({ hppBySku, hppByNameVar });
      } catch (err) {
        reject(new Error(`Gagal membaca file HPP: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
};

// Parse SVS Ads Invoice File
export const parseAdsFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        // SVS invoice usually has Itemised Billing sheet
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('itemised')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to matrix to find rows manually
        const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        let totalAds = 0;
        const details = [];
        
        // Find column indices
        let descIdx = -1;
        let amountIdx = -1;
        let dateIdx = -1;
        
        for (let r = 0; r < matrix.length; r++) {
          const row = matrix[r];
          if (!row || row.length === 0) continue;
          
          // Detect header row
          if (row.some(c => String(c).toLowerCase().includes('description')) && row.some(c => String(c).toLowerCase().includes('amount'))) {
            descIdx = row.findIndex(c => String(c).toLowerCase().includes('description'));
            amountIdx = row.findIndex(c => String(c).toLowerCase().includes('amount') || String(c).toLowerCase().includes('total'));
            dateIdx = row.findIndex(c => String(c).toLowerCase().includes('date'));
            continue;
          }
          
          if (descIdx !== -1 && amountIdx !== -1) {
            const desc = row[descIdx] ? String(row[descIdx]).trim() : '';
            const amount = row[amountIdx] ? parseNumber(row[amountIdx]) : 0;
            const date = dateIdx !== -1 && row[dateIdx] ? String(row[dateIdx]).trim() : '';
            
            if (desc.toLowerCase().includes('iklan') || desc.toLowerCase().includes('ads') || desc.toLowerCase().includes('saldo')) {
              totalAds += amount;
              details.push({ date, description: desc, amount });
            }
          }
        }
        
        // If details empty, check if there's a simple sum
        if (totalAds === 0) {
          matrix.forEach(row => {
            row.forEach((cell, idx) => {
              if (String(cell).toLowerCase().includes('total') && idx + 1 < row.length) {
                const val = parseNumber(row[idx + 1]);
                if (val > 0 && totalAds === 0) totalAds = val;
              }
            });
          });
        }
        
        resolve({ totalAds, details });
      } catch (err) {
        reject(new Error(`Gagal membaca file Iklan: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
};

// Parse Shopee Orders File
export const parseOrdersFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('order')) || workbook.SheetNames[0];
        const rows = sheetToJson(workbook, sheetName);
        resolve(rows);
      } catch (err) {
        reject(new Error(`Gagal membaca file Orders: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
};

// Parse Shopee Income File
export const parseIncomeFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase() === 'income') || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        let headerRowIdx = -1;
        
        for (let r = 0; r < Math.min(15, matrix.length); r++) {
          if (matrix[r].some(c => String(c).trim() === 'No. Pesanan')) {
            headerRowIdx = r;
            break;
          }
        }
        
        if (headerRowIdx === -1) {
          throw new Error('Kolom No. Pesanan tidak ditemukan di file Income');
        }
        
        const headers = matrix[headerRowIdx].map(h => h ? String(h).trim() : '');
        const rows = [];
        
        for (let r = headerRowIdx + 1; r < matrix.length; r++) {
          const rowArr = matrix[r];
          if (!rowArr || rowArr.length === 0) continue;
          
          const rowNum = parseFloat(rowArr[0]);
          if (isNaN(rowNum) || rowArr[0] === null) continue;
          
          const rowObj = {};
          headers.forEach((h, idx) => {
            if (h) rowObj[h] = rowArr[idx] !== undefined ? rowArr[idx] : null;
          });
          rows.push(rowObj);
        }
        
        resolve(rows);
      } catch (err) {
        reject(new Error(`Gagal membaca file Income: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
};

// Run full analysis on parsed datasets
export const analyzeShopeeData = (orderRows, incomeRows, hppData, totalAds = 0, adsDetails = [], filterMonth = null) => {
  const { hppBySku, hppByNameVar } = hppData || { hppBySku: {}, hppByNameVar: {} };

  // Status and ID keys detection
  const statusKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('status pesanan'));
  const orderIdKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('no. pesanan'));
  const waktuKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('waktu pesanan dibuat'));
  const skuKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('sku induk'));
  const prodKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('nama produk'));
  const varKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('nama variasi'));
  const qtyKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('jumlah'));
  const retQtyKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('returned quantity') || k.toLowerCase().includes('jumlah pengembalian'));
  const priceKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('harga awal'));
  const discPriceKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('harga setelah diskon'));
  
  const resiKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('no. resi'));
  const cancelReasonKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('alasan pembatalan'));
  const returnStatusKey = Object.keys(orderRows[0] || {}).find(k => k.toLowerCase().includes('status pembatalan') || k.toLowerCase().includes('status return'));

  // Step 1: Filter orders by selected month
  const filteredOrderRows = orderRows.filter(row => {
    const waktu = waktuKey ? String(row[waktuKey]) : '';
    if (filterMonth) {
      return waktu.includes(filterMonth);
    }
    return true;
  });

  const completedOrderIds = new Set();
  const cancelledOrderIds = new Set();
  const allOrderIdsInPeriod = new Set();

  filteredOrderRows.forEach(row => {
    const status = statusKey ? String(row[statusKey]).trim() : '';
    const id = orderIdKey ? String(row[orderIdKey]).trim() : '';
    if (!id) return;
    
    allOrderIdsInPeriod.add(id);
    if (status.toLowerCase() === 'selesai' || status.toLowerCase() === 'completed') {
      completedOrderIds.add(id);
    } else if (status.toLowerCase() === 'batal' || status.toLowerCase() === 'cancelled') {
      cancelledOrderIds.add(id);
    }
  });

  // Step 2: Extract months present in order file
  const availableMonths = [...new Set(orderRows.map(row => {
    const waktu = waktuKey ? String(row[waktuKey]) : '';
    const match = waktu.match(/^\d{4}-\d{2}/);
    return match ? match[0] : null;
  }).filter(Boolean))].sort();

  // Step 3: Match with income records
  const matchedIncome = [];
  const unmatchedIncome = []; 

  incomeRows.forEach(row => {
    const id = row['No. Pesanan'] ? String(row['No. Pesanan']).trim() : '';
    if (!id) return;

    if (completedOrderIds.has(id)) {
      matchedIncome.push(row);
    } else {
      unmatchedIncome.push(row);
    }
  });

  // Calculate matched P&L metrics
  let totalHargaAsliMatched = 0;
  let totalDiskonProdukMatched = 0;
  let totalRefundMatched = 0;
  let totalVoucherSellerMatched = 0;
  let totalVoucherCofundMatched = 0;
  
  let totalOngkirPembeliMatched = 0;
  let totalGratisOngkirMatched = 0;
  let totalOngkirKurirMatched = 0;
  let totalOngkirReturMatched = 0;
  let totalPengembalianBiayaKirimMatched = 0;
  
  let totalBiayaKomisiMatched = 0;
  let totalBiayaAdminMatched = 0;
  let totalBiayaLayananMatched = 0;
  let totalBiayaProsesMatched = 0;
  let totalPremiMatched = 0;
  let totalHematKirimMatched = 0;
  let totalBiayaTransaksiMatched = 0;
  let totalBiayaKampanyeMatched = 0;
  let totalPromoOngkirSellerMatched = 0;
  
  let totalPenghasilanDilepasMatched = 0;

  matchedIncome.forEach(row => {
    totalHargaAsliMatched += parseNumber(row['Harga Asli Produk']);
    totalDiskonProdukMatched += parseNumber(row['Total Diskon Produk']);
    totalRefundMatched += parseNumber(row['Jumlah Pengembalian Dana ke Pembeli'] || row['Pengembalian Dana ke Pembeli']);
    totalVoucherSellerMatched += parseNumber(row['Voucher disponsor oleh Penjual']);
    totalVoucherCofundMatched += parseNumber(row['Voucher co-fund disponsor oleh Penjual']);
    
    totalOngkirPembeliMatched += parseNumber(row['Ongkir Dibayar Pembeli']);
    totalGratisOngkirMatched += parseNumber(row['Gratis Ongkir dari Shopee']);
    totalOngkirKurirMatched += parseNumber(row['Ongkir yang Diteruskan oleh Shopee ke Jasa Kirim']);
    totalOngkirReturMatched += parseNumber(row['Ongkos Kirim Pengembalian Barang']);
    totalPengembalianBiayaKirimMatched += parseNumber(row['Pengembalian Biaya Kirim']);
    
    totalBiayaKomisiMatched += parseNumber(row['Biaya Komisi AMS']);
    totalBiayaAdminMatched += parseNumber(row['Biaya Administrasi']);
    totalBiayaLayananMatched += parseNumber(row['Biaya Layanan']);
    totalBiayaProsesMatched += parseNumber(row['Biaya Proses Pesanan']);
    totalPremiMatched += parseNumber(row['Premi']);
    totalHematKirimMatched += parseNumber(row['Biaya Program Hemat Biaya Kirim']);
    totalBiayaTransaksiMatched += parseNumber(row['Biaya Transaksi']);
    totalBiayaKampanyeMatched += parseNumber(row['Biaya Kampanye']);
    totalPromoOngkirSellerMatched += parseNumber(row['Promo Gratis Ongkir dari Penjual']);
    
    totalPenghasilanDilepasMatched += parseNumber(row['Total Penghasilan']);
  });

  const netBiayaPengirimanMatched = totalOngkirPembeliMatched + totalGratisOngkirMatched + totalOngkirKurirMatched + totalOngkirReturMatched + totalPengembalianBiayaKirimMatched;
  const totalBiayaAdminLayananMatched = totalBiayaKomisiMatched + totalBiayaAdminMatched + totalBiayaLayananMatched + totalBiayaProsesMatched + totalPremiMatched + totalHematKirimMatched + totalBiayaTransaksiMatched + totalBiayaKampanyeMatched;
  const totalBiayaPlatformShopeeMatched = netBiayaPengirimanMatched + totalBiayaAdminLayananMatched + totalPromoOngkirSellerMatched;

  // Step 4: Product breakdown with HPP matching
  const productDetail = {};
  let totalHpp = 0;
  let totalQty = 0;
  let totalQtyRetur = 0;

  filteredOrderRows.forEach(row => {
    const status = statusKey ? String(row[statusKey]).trim() : '';
    if (status.toLowerCase() !== 'selesai' && status.toLowerCase() !== 'completed') return;

    const sku = skuKey && row[skuKey] ? String(row[skuKey]).trim() : '';
    const product = prodKey && row[prodKey] ? String(row[prodKey]).trim() : '';
    const variation = varKey && row[varKey] !== null ? String(row[varKey]).trim() : '';
    const qty = qtyKey ? parseInt(parseNumber(row[qtyKey])) : 1;
    const retQty = retQtyKey ? parseInt(parseNumber(row[retQtyKey])) : 0;
    const netQty = Math.max(qty - retQty, 0);

    const price = priceKey ? parseNumber(row[priceKey]) : 0;
    const discPrice = discPriceKey ? parseNumber(row[discPriceKey]) : 0;
    const diskonSeller = parseNumber(row[Object.keys(row).find(k => k.toLowerCase().includes('diskon dari penjual'))]);

    // Find HPP
    let hppVal = 0;
    if (sku && hppBySku[sku] !== undefined) {
      hppVal = hppBySku[sku];
    } else if (hppByNameVar[`${product}|${variation}`] !== undefined) {
      hppVal = hppByNameVar[`${product}|${variation}`];
    }

    const key = sku || `${product.substring(0, 30)}|${variation}`;
    if (!productDetail[key]) {
      productDetail[key] = {
        sku,
        name: product,
        variation,
        hppUnit: hppVal,
        qty: 0,
        qtyRetur: 0,
        totalHpp: 0,
        omzetBruto: 0,
        omzetNet: 0,
        diskonSeller: 0
      };
    }

    productDetail[key].qty += netQty;
    productDetail[key].qtyRetur += retQty;
    productDetail[key].totalHpp += hppVal * netQty;
    productDetail[key].omzetBruto += price * qty;
    productDetail[key].omzetNet += discPrice * qty;
    productDetail[key].diskonSeller += diskonSeller;

    totalHpp += hppVal * netQty;
    totalQty += netQty;
    totalQtyRetur += retQty;
  });

  // Step 5: Cancellation analysis
  let totalBatalCount = 0;
  let totalBatalWithResi = 0;
  let totalBatalNoResi = 0;
  let totalBatalBrutoVal = 0;
  let totalBatalNoResiVal = 0;
  let totalBatalWithResiVal = 0;
  const batalDetails = [];
  const cancelReasons = {};

  filteredOrderRows.forEach(row => {
    const status = statusKey ? String(row[statusKey]).trim() : '';
    if (status.toLowerCase() !== 'batal' && status.toLowerCase() !== 'cancelled') return;

    totalBatalCount++;
    const price = priceKey ? parseNumber(row[priceKey]) : 0;
    const qty = qtyKey ? parseInt(parseNumber(row[qtyKey])) : 1;
    const bruto = price * qty;
    totalBatalBrutoVal += bruto;

    const resi = resiKey ? String(row[resiKey]).trim() : '';
    const hasResi = resi && resi !== '-' && resi.toLowerCase() !== 'none' && resi !== '';
    const reason = cancelReasonKey ? String(row[cancelReasonKey]).trim() : 'Tidak diketahui';

    if (hasResi) {
      totalBatalWithResi++;
      totalBatalWithResiVal += bruto;
    } else {
      totalBatalNoResi++;
      totalBatalNoResiVal += bruto;
    }

    cancelReasons[reason] = (cancelReasons[reason] || 0) + 1;

    batalDetails.push({
      id: orderIdKey ? String(row[orderIdKey]).trim() : '',
      product: prodKey ? String(row[prodKey]).trim() : '',
      variation: varKey ? String(row[varKey]).trim() : '',
      resi: hasResi ? resi : 'Tanpa Resi',
      qty,
      price,
      total: bruto,
      reason,
      statusReturn: returnStatusKey ? String(row[returnStatusKey]).trim() : '-'
    });
  });

  const labaKotor = totalPenghasilanDilepasMatched - totalHpp;
  const labaBersih = labaKotor - totalAds;
  const marginBersih = totalPenghasilanDilepasMatched > 0 ? (labaBersih / totalPenghasilanDilepasMatched) * 100 : 0;

  return {
    summary: {
      orderSelesaiCount: completedOrderIds.size,
      orderBatalCount: totalBatalCount,
      qtyTerjualNet: totalQty,
      qtyRetur: totalQtyRetur,
      hargaAsliBruto: totalHargaAsliMatched,
      diskonProdukSeller: totalDiskonProdukMatched,
      refundPembeli: totalRefundMatched,
      voucherSeller: totalVoucherSellerMatched,
      voucherCofund: totalVoucherCofundMatched,
      ongkirPembeli: totalOngkirPembeliMatched,
      gratisOngkir: totalGratisOngkirMatched,
      ongkirKurir: totalOngkirKurirMatched,
      ongkirRetur: totalOngkirReturMatched,
      pengembalianOngkir: totalPengembalianBiayaKirimMatched,
      netBiayaPengiriman: netBiayaPengirimanMatched,
      biayaKomisiAms: totalBiayaKomisiMatched,
      biayaAdmin: totalBiayaAdminMatched,
      biayaLayanan: totalBiayaLayananMatched,
      biayaProses: totalBiayaProsesMatched,
      premi: totalPremiMatched,
      hematKirim: totalHematKirimMatched,
      biayaTransaksi: totalBiayaTransaksiMatched,
      biayaKampanye: totalBiayaKampanyeMatched,
      totalBiayaAdminLayanan: totalBiayaAdminLayananMatched,
      promoOngkirSeller: totalPromoOngkirSellerMatched,
      totalBiayaPlatformShopee: totalBiayaPlatformShopeeMatched,
      totalPenghasilanDilepas: totalPenghasilanDilepasMatched,
      totalHpp,
      totalAds,
      labaKotor,
      labaBersih,
      marginBersih,
      unmatchedIncomeCount: unmatchedIncome.length,
      unmatchedIncomeValue: unmatchedIncome.reduce((acc, row) => acc + parseNumber(row['Total Penghasilan']), 0)
    },
    batalSummary: {
      totalCount: totalBatalCount,
      withResiCount: totalBatalWithResi,
      noResiCount: totalBatalNoResi,
      totalValue: totalBatalBrutoVal,
      withResiValue: totalBatalWithResiVal,
      noResiValue: totalBatalNoResiVal,
      reasons: Object.entries(cancelReasons).map(([reason, count]) => ({ reason, count })),
      details: batalDetails
    },
    products: Object.values(productDetail).sort((a, b) => b.qty - a.qty),
    availableMonths,
    activeMonth: filterMonth
  };
};
