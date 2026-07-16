import * as XLSX from 'xlsx';

// Helper to format date nicely
const formatDateStr = (dateStr) => {
  if (!dateStr) return '-';
  return dateStr.substring(0, 19).replace('T', ' ');
};

// BCG helper
const getBcgCategoryLabel = (qty, unitProfit, thresholdQty, thresholdProfit, customBcg) => {
  if (customBcg) {
    const cat = String(customBcg).toLowerCase().trim();
    if (cat.includes('star') || cat.includes('bintang')) return 'Stars (Bintang)';
    if (cat.includes('cow') || cat.includes('sapi')) return 'Cash Cows (Sapi Perah)';
    if (cat.includes('question') || cat.includes('tanya') || cat.includes('?')) return 'Question Marks (Tanda Tanya)';
    if (cat.includes('dog') || cat.includes('anjing') || cat.includes('beban')) return 'Dogs (Anjing/Beban)';
  }
  
  if (qty >= thresholdQty && unitProfit >= thresholdProfit) return 'Stars (Bintang)';
  if (qty >= thresholdQty && unitProfit < thresholdProfit) return 'Cash Cows (Sapi Perah)';
  if (qty < thresholdQty && unitProfit >= thresholdProfit) return 'Question Marks (Tanda Tanya)';
  return 'Dogs (Anjing/Beban)';
};

// Set sheet column widths automatically based on content length
const autoFitColumns = (worksheet, extraWidth = 3) => {
  const objectMaxLength = [];
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
  
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 10; // min width
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = { c: C, r: R };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      const cell = worksheet[cellRef];
      if (cell && cell.v !== undefined && cell.v !== null) {
        const valStr = String(cell.v);
        if (valStr.length > maxWidth) {
          maxWidth = valStr.length;
        }
      }
    }
    objectMaxLength.push({ wch: maxWidth + extraWidth });
  }
  worksheet['!cols'] = objectMaxLength;
};

// Export Shopee Report to Excel
export const exportShopeeReport = (data, activeMonth = 'all') => {
  if (!data || !data.summary) {
    alert('Data Shopee tidak valid atau belum siap diekspor.');
    return;
  }

  const { summary, products, completedOrders, returnedOrders, problematicOrders, batalSummary } = data;
  
  // Calculate total revenue as Harga Asli - Diskon Penjual - Voucher Penjual
  const totalOmzet = summary.hargaAsliBruto - Math.abs(summary.diskonProdukSeller) - Math.abs(summary.voucherSeller);
  const getPercentStr = (val) => {
    if (!totalOmzet || totalOmzet === 0) return '0.00%';
    return ((Math.abs(val) / totalOmzet) * 100).toFixed(2) + '%';
  };

  const workbook = XLSX.utils.book_new();

  // === 1. SHEET: RINGKASAN LABA RUGI (P&L) ===
  const plData = [
    ['LAPORAN LABA RUGI SHOPEE', ''],
    ['Bulan Analisis', activeMonth === 'all' ? 'Semua Bulan (Tersedia)' : activeMonth],
    ['Tanggal Ekspor', new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID')],
    ['', ''],
    ['Parameter Keuangan', 'Nilai (Rp)', 'Persentase dari Omset', 'Deskripsi'],
    ['Total Pendapatan Toko (Omzet)', totalOmzet, '100.00%', 'Total omzet kotor sebelum potongan Shopee (Harga Asli - Diskon - Voucher Seller)'],
    ['Harga Asli Bruto', summary.hargaAsliBruto, getPercentStr(summary.hargaAsliBruto), 'Total harga asli produk sebelum diskon & voucher'],
    ['Diskon Produk dari Seller', -Math.abs(summary.diskonProdukSeller), getPercentStr(summary.diskonProdukSeller), 'Total diskon produk yang dibiayai penjual'],
    ['Voucher Toko dari Seller', -Math.abs(summary.voucherSeller), getPercentStr(summary.voucherSeller), 'Total voucher belanja yang disponsori penjual'],
    ['Dana Dilepas Shopee (Neto)', summary.totalPenghasilanDilepas, getPercentStr(summary.totalPenghasilanDilepas), 'Total omzet neto masuk ke Saldo Penjual'],
    ['HPP / Modal Barang', -Math.abs(summary.totalHpp), getPercentStr(summary.totalHpp), 'Modal awal barang untuk unit yang terjual'],
    ['Laba Bersih (Take Home Profit)', summary.labaBersih, getPercentStr(summary.labaBersih), 'Penghasilan bersih setelah HPP, iklan, selisih ongkir, & kerugian retur'],
    ['', ''],
    ['Faktor Pengurang / Biaya Lainnya', '', '', ''],
    ['Fee Platform Shopee', -Math.abs(summary.totalBiayaAdminLayanan), getPercentStr(summary.totalBiayaAdminLayanan), 'Total biaya administrasi, komisi AMS, dan layanan Shopee'],
    ['Biaya Iklan (Shopee Ads)', -Math.abs(summary.totalAds), getPercentStr(summary.totalAds), 'Total biaya top-up iklan yang digunakan'],
    ['Selisih Ongkir (Beban Penjual)', -Math.abs(summary.netBiayaPengiriman), getPercentStr(summary.netBiayaPengiriman), 'Selisih ongkos kirim yang ditanggung oleh penjual'],
    ['Pengembalian Dana Pembeli (Refund)', -Math.abs(summary.refundPembeli), getPercentStr(summary.refundPembeli), 'Total dana dikembalikan ke pembeli karena batal/retur'],
    ['', ''],
    ['Rincian Potongan Shopee (Fee Platform)', '', '', ''],
    ['Biaya Administrasi', -Math.abs(summary.biayaAdmin), getPercentStr(summary.biayaAdmin), 'Biaya administrasi standar Shopee'],
    ['Biaya Layanan', -Math.abs(summary.biayaLayanan), getPercentStr(summary.biayaLayanan), 'Biaya program layanan Shopee'],
    ['Biaya Transaksi', -Math.abs(summary.biayaTransaksi), getPercentStr(summary.biayaTransaksi), 'Biaya pemrosesan transaksi pembayaran'],
    ['Biaya Komisi AMS', -Math.abs(summary.biayaKomisiAms), getPercentStr(summary.biayaKomisiAms), 'Biaya komisi program affiliate/marketing Shopee'],
    ['Biaya Layanan Gratis Ongkir XTRA', -Math.abs(summary.biayaGratongXtra), getPercentStr(summary.biayaGratongXtra), 'Biaya layanan program Gratis Ongkir Xtra'],
    ['Biaya Layanan Promo XTRA', -Math.abs(summary.biayaPromoXtra), getPercentStr(summary.biayaPromoXtra), 'Biaya layanan program Cashback Xtra / Promo Xtra'],
    ['Biaya Program Shopee Live Xtra', -Math.abs(summary.biayaLiveXtra), getPercentStr(summary.biayaLiveXtra), 'Biaya layanan penjualan live streaming Shopee Live Xtra'],
    ['Biaya Proses Pesanan', -Math.abs(summary.biayaProses), getPercentStr(summary.biayaProses), 'Biaya pemrosesan order'],
    ['Biaya Kampanye', -Math.abs(summary.biayaKampanye), getPercentStr(summary.biayaKampanye), 'Biaya pendaftaran program kampanye Shopee'],
    ['Premi Asuransi Penjual', -Math.abs(summary.premi), getPercentStr(summary.premi), 'Biaya asuransi pengiriman dibebankan ke penjual'],
    ['Biaya Program Hemat Biaya Kirim', -Math.abs(summary.hematKirim), getPercentStr(summary.hematKirim), 'Potongan program diskon ongkir hemat'],
    ['Voucher Co-Fund Seller', -Math.abs(summary.voucherCofund), getPercentStr(summary.voucherCofund), 'Voucher subsidi bersama Shopee & Penjual'],
    ['', ''],
    ['Statistik Operasional', '', '', ''],
    ['Pesanan Selesai', summary.orderSelesaiCount, '', 'Jumlah pesanan berstatus Selesai'],
    ['Pesanan Batal', summary.orderBatalCount, '', 'Jumlah pesanan berstatus Batal'],
    ['Unit Terjual Neto', summary.qtyTerjualNet, '', 'Jumlah total kuantitas barang terjual (net)'],
    ['Unit Retur/Refund', summary.qtyRetur, '', 'Jumlah total kuantitas barang diretur pembeli']
  ];

  const wsPl = XLSX.utils.aoa_to_sheet(plData);
  autoFitColumns(wsPl);
  XLSX.utils.book_append_sheet(workbook, wsPl, 'P&L Laba Rugi');

  // === 2. SHEET: ANALISIS PERFORMA PRODUK (BCG MATRIX) ===
  const activeProducts = (products || []).filter(p => p.qty > 0);
  const qtys = activeProducts.map(i => i.qty).sort((a, b) => a - b);
  
  const getMedian = (arr) => {
    if (arr.length === 0) return 0;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };
  const thresholdQty = getMedian(qtys) || 5; 

  const itemsWithProfit = activeProducts.map(p => {
    const unitPrice = p.omzetNet / p.qty;
    const unitProfit = unitPrice - p.hppUnit;
    return unitProfit;
  });
  const sumProfit = itemsWithProfit.reduce((acc, p) => acc + p, 0);
  const thresholdProfit = itemsWithProfit.length > 0 ? (sumProfit / itemsWithProfit.length) : 0;

  const productHeaders = [
    'SKU Induk', 'Ref SKU', 'Nama Produk', 'Nama Variasi', 
    'Qty Terjual (Net)', 'Qty Retur', 'Omzet Bruto (Rp)', 'Omzet Net (Rp)', 
    'HPP Satuan (Rp)', 'Total HPP (Rp)', 'Laba Kotor (Rp)', 'Laba Bersih (Rp)', 
    'Margin Bersih (%)', 'Kategori BCG Matrix'
  ];

  const productRows = (products || []).map(p => {
    const unitPrice = p.qty > 0 ? p.omzetNet / p.qty : 0;
    const unitProfit = unitPrice - p.hppUnit;
    const margin = unitPrice > 0 ? (unitProfit / unitPrice) * 100 : 0;
    const labaKotor = p.omzetNet - p.totalHpp;
    const category = getBcgCategoryLabel(p.qty, unitProfit, thresholdQty, thresholdProfit, p.customBcg);

    return [
      p.sku || '',
      p.sku || '',
      p.name || '',
      p.variation || '',
      p.qty || 0,
      p.qtyRetur || 0,
      p.omzetBruto || 0,
      p.omzetNet || 0,
      p.hppUnit || 0,
      p.totalHpp || 0,
      labaKotor || 0,
      p.labaBersih !== undefined ? p.labaBersih : (p.omzetNet - p.totalHpp),
      margin,
      category
    ];
  });

  const wsProd = XLSX.utils.aoa_to_sheet([productHeaders, ...productRows]);
  autoFitColumns(wsProd);
  XLSX.utils.book_append_sheet(workbook, wsProd, 'Analisis Produk');

  // === 3. SHEET: PESANAN BERMASALAH ===
  const problemHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Status', 'Masalah Terdeteksi', 
    'Nama Produk', 'Nama Variasi', 'SKU', 'Qty', 
    'HPP Produk (Rp)', 'Pelepasan Dana (Rp)', 'Selisih Laba (Rp)'
  ];

  const problemRows = [];
  (problematicOrders || []).forEach(o => {
    const problemsStr = (o.problems || []).join(', ');
    const items = o.items || [{ name: o.name || '', variation: o.variation || '', sku: o.sku || '', qty: o.qty || 1, hpp: o.hpp || 0 }];
    
    items.forEach((item, idx) => {
      problemRows.push([
        idx === 0 ? o.id : '',
        idx === 0 ? formatDateStr(o.date) : '',
        idx === 0 ? o.status : '',
        idx === 0 ? problemsStr : '',
        item.name || '',
        item.variation || '',
        item.sku || '',
        item.qty || 0,
        item.hpp || 0,
        idx === 0 ? (o.payout || 0) : 0,
        idx === 0 ? ((o.payout || 0) - (o.hpp || 0)) : 0
      ]);
    });
  });

  const wsProb = XLSX.utils.aoa_to_sheet([problemHeaders, ...problemRows]);
  autoFitColumns(wsProb);
  XLSX.utils.book_append_sheet(workbook, wsProb, 'Pesanan Bermasalah');

  // === 4. SHEET: PESANAN SELESAI ===
  const compHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Status', 'Nama Produk', 
    'Nama Variasi', 'SKU', 'Qty', 'Harga Asli Unit (Rp)', 
    'Total Bruto (Rp)', 'Dana Dilepas (Rp)', 'Total HPP (Rp)', 'Laba Bersih (Rp)'
  ];

  const compRows = [];
  (completedOrders || []).forEach(o => {
    const items = o.items || [{ name: o.name || '', variation: o.variation || '', sku: o.sku || '', qty: o.qty || 1, price: o.price || 0, hpp: o.hpp || 0 }];
    
    items.forEach((item, idx) => {
      compRows.push([
        idx === 0 ? o.id : '',
        idx === 0 ? formatDateStr(o.date) : '',
        idx === 0 ? o.status : '',
        item.name || '',
        item.variation || '',
        item.sku || '',
        item.qty || 0,
        item.price || 0,
        item.price * item.qty,
        idx === 0 ? (o.payout || 0) : 0,
        idx === 0 ? (o.hpp || 0) : 0,
        idx === 0 ? ((o.payout || 0) - (o.hpp || 0)) : 0
      ]);
    });
  });

  const wsComp = XLSX.utils.aoa_to_sheet([compHeaders, ...compRows]);
  autoFitColumns(wsComp);
  XLSX.utils.book_append_sheet(workbook, wsComp, 'Pesanan Selesai');

  // === 5. SHEET: PESANAN RETUR ===
  const retHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Status Retur/Pesanan', 'Nama Produk', 
    'Nama Variasi', 'Qty Retur', 'Dana Refund ke Pembeli (Rp)', 'Dana Dilepas (Rp)'
  ];

  const retRows = [];
  (returnedOrders || []).forEach(o => {
    const items = o.items || [{ name: o.name || '', variation: o.variation || '', qty: o.qty || 1 }];
    
    items.forEach((item, idx) => {
      retRows.push([
        idx === 0 ? o.id : '',
        idx === 0 ? formatDateStr(o.date) : '',
        idx === 0 ? (o.returnStatus || o.status) : '',
        item.name || '',
        item.variation || '',
        idx === 0 ? (o.totalQtyRetur || item.qty || 0) : 0,
        idx === 0 ? (o.refund || 0) : 0,
        idx === 0 ? (o.payout || 0) : 0
      ]);
    });
  });

  const wsRet = XLSX.utils.aoa_to_sheet([retHeaders, ...retRows]);
  autoFitColumns(wsRet);
  XLSX.utils.book_append_sheet(workbook, wsRet, 'Pesanan Retur & Refund');

  // === 6. SHEET: PESANAN BATAL ===
  const cancelHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Alasan Pembatalan', 'Kurir / Resi Terbit?', 
    'Nama Produk', 'Qty', 'Harga (Rp)', 'Nilai Bruto (Rp)'
  ];

  const cancelRows = [];
  (batalSummary.details || []).forEach(o => {
    cancelRows.push([
      o.id || '',
      formatDateStr(o.date),
      o.cancelReason || 'Tidak diketahui',
      o.hasResi ? 'Ya (' + (o.resi || 'Ada') + ')' : 'Tidak (Tanpa Resi)',
      o.name || '',
      o.qty || 0,
      o.price || 0,
      o.bruto || 0
    ]);
  });

  const wsCancel = XLSX.utils.aoa_to_sheet([cancelHeaders, ...cancelRows]);
  autoFitColumns(wsCancel);
  XLSX.utils.book_append_sheet(workbook, wsCancel, 'Pesanan Batal');

  // Write and Save
  const monthName = activeMonth === 'all' ? 'Semua_Bulan' : activeMonth.replace(/\s+/g, '_');
  XLSX.writeFile(workbook, `Laporan_Analisis_Shopee_${monthName}_${Date.now().toString(36)}.xlsx`);
};

// Export TikTok Report to Excel
export const exportTikTokReport = (data) => {
  if (!data || !data.summary) {
    alert('Data TikTok tidak valid atau belum siap diekspor.');
    return;
  }

  const { summary, skuList, completedOrders, returnedOrders, cancelledOrders, problematicOrders, allOrders } = data;
  const workbook = XLSX.utils.book_new();

  const getPercentStr = (val) => {
    if (!summary.totalRevenue || summary.totalRevenue === 0) return '0.00%';
    return ((Math.abs(val) / summary.totalRevenue) * 100).toFixed(2) + '%';
  };

  const getMedian = (arr) => {
    if (arr.length === 0) return 0;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  // === 1. SHEET: LABA RUGI (P&L SUMMARY) ===
  const plData = [
    ['LAPORAN LABA RUGI TIKTOK SHOP BY TOKOPEDIA', ''],
    ['Tanggal Ekspor', new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID')],
    ['', ''],
    ['Parameter Keuangan', 'Nilai (Rp)', 'Persentase dari Pendapatan', 'Deskripsi'],
    ['Total Pendapatan Kotor (Revenue)', summary.totalRevenue, '100.00%', 'Total penjualan kotor produk terjual'],
    ['Total HPP / Modal Barang', -Math.abs(summary.totalHpp), getPercentStr(summary.totalHpp), 'Biaya modal awal unit barang yang terjual'],
    ['Laba Kotor (Gross Profit)', summary.grossProfit, getPercentStr(summary.grossProfit), 'Revenue dikurangi HPP sebelum potongan biaya lainnya'],
    ['Laba Operasional Bersih (Net Profit)', summary.netOperatingProfit, getPercentStr(summary.netOperatingProfit), 'Laba bersih akhir (payout - HPP - iklan - selisih ongkir)'],
    ['Pelepasan Dana Neto (Settlement)', summary.totalSettlement, getPercentStr(summary.totalSettlement), 'Dana bersih yang ditransfer TikTok/Tokopedia ke rekening penjual'],
    ['', ''],
    ['Faktor Potongan & Biaya Operasional', '', '', ''],
    ['Total Potongan Layanan Platform (Fees)', -Math.abs(summary.totalFees), getPercentStr(summary.totalFees), 'Total komisi, transaksi, & biaya admin program platform'],
    ['Biaya Iklan Terpakai', -Math.abs(summary.totalAds || 0), getPercentStr(summary.totalAds || 0), 'Biaya pemasaran/iklan yang dikeluarkan'],
    ['Diskon Produk ditanggung Seller', -Math.abs(summary.totalDiskonProduk || 0), getPercentStr(summary.totalDiskonProduk || 0), 'Potongan harga produk dibebankan kepada penjual'],
    ['Voucher ditanggung Seller', -Math.abs(summary.totalVoucherSeller || 0), getPercentStr(summary.totalVoucherSeller || 0), 'Diskon kupon toko disponsori penjual'],
    ['Selisih Ongkir (Beban Penjual)', -Math.abs(summary.selisihOngkir || 0), getPercentStr(summary.selisihOngkir || 0), 'Selisih biaya pengiriman aktual dengan ongkir dibayar pembeli'],
    ['', ''],
    ['Rincian Potongan Platform (Fees Breakdown)', '', '', ''],
    ['Biaya Komisi Platform (Commission Fee)', -Math.abs(summary.feesBreakdown?.komisiPlatform || 0), getPercentStr(summary.feesBreakdown?.komisiPlatform || 0), 'Komisi penjualan standar TikTok Shop'],
    ['Biaya Transaksi (Transaction Fee)', -Math.abs(summary.feesBreakdown?.biayaTransaksi || 0), getPercentStr(summary.feesBreakdown?.biayaTransaksi || 0), 'Biaya administrasi pemrosesan gerbang pembayaran'],
    ['Biaya Program / Layanan Tambahan', -Math.abs(summary.feesBreakdown?.biayaProgram || 0), getPercentStr(summary.feesBreakdown?.biayaProgram || 0), 'Komisi keikutsertaan program (misal diskon ongkir extra)'],
    ['Pengembalian Dana Pembeli (Refund)', -Math.abs(summary.feesBreakdown?.refundPembeli || 0), getPercentStr(summary.feesBreakdown?.refundPembeli || 0), 'Pengembalian dana untuk pesanan retur/komplain'],
    ['', ''],
    ['Statistik Operasional', '', '', ''],
    ['Total Pesanan Terproses (Cohort)', summary.totalOrders, '', 'Total pesanan dalam database cohort'],
    ['Pesanan Berhasil Dicocokkan (Matched)', summary.totalMatchedOrders, '', 'Jumlah pesanan yang cocok dengan laporan finansial'],
    ['Unit Terjual (Qty Terkirim)', summary.totalQty, '', 'Kuantitas total barang terkirim'],
    ['Unit dengan HPP Terpetakan', summary.totalQtyMapped, '', 'Kuantitas barang yang memiliki data HPP'],
    ['Unit Tanpa HPP (Unmapped Qty)', summary.unmappedQty, '', 'Kuantitas barang yang belum memiliki data HPP (diasumsikan HPP = 0)']
  ];

  const wsPl = XLSX.utils.aoa_to_sheet(plData);
  autoFitColumns(wsPl);
  XLSX.utils.book_append_sheet(workbook, wsPl, 'P&L Laba Rugi');

  // === 2. SHEET: PROFITABILITAS SKU ===
  const ttQtys = (skuList || []).map(i => i.qty).sort((a, b) => a - b);
  const ttThresholdQty = getMedian(ttQtys) || 5;

  const ttProfits = (skuList || []).map(s => {
    const uPrice = s.qty > 0 ? s.revenue / s.qty : 0;
    const uProfit = uPrice - (s.qty > 0 ? s.hpp / s.qty : 0);
    return uProfit;
  });
  const ttSumProfit = ttProfits.reduce((acc, p) => acc + p, 0);
  const ttThresholdProfit = ttProfits.length > 0 ? (ttSumProfit / ttProfits.length) : 0;

  const skuHeaders = [
    'SKU Produk', 'Nama Produk', 'Nama Variasi', 'Qty Terjual (Net)', 
    'Total Omzet (Rp)', 'Total HPP (Rp)', 'Laba Kotor (Rp)', 
    'Margin Kotor (%)', 'Kategori BCG Matrix'
  ];

  const skuRows = (skuList || []).map(s => {
    const uPrice = s.qty > 0 ? s.revenue / s.qty : 0;
    const hppUnit = s.qty > 0 ? s.hpp / s.qty : 0;
    const uProfit = uPrice - hppUnit;
    const profit = s.revenue - s.hpp;
    const margin = s.revenue > 0 ? (profit / s.revenue) * 100 : 0;
    const category = getBcgCategoryLabel(s.qty, uProfit, ttThresholdQty, ttThresholdProfit, null);

    return [
      s.sku || '',
      s.pname || '',
      s.vname || '',
      s.qty || 0,
      s.revenue || 0,
      s.hpp || 0,
      profit,
      margin,
      category
    ];
  });

  const wsSku = XLSX.utils.aoa_to_sheet([skuHeaders, ...skuRows]);
  autoFitColumns(wsSku);
  XLSX.utils.book_append_sheet(workbook, wsSku, 'Profitabilitas SKU');

  // === 3. SHEET: PESANAN BERMASALAH ===
  const probHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Status', 'Masalah Terdeteksi', 
    'Nama Produk', 'Nama Variasi', 'SKU', 'Qty', 
    'HPP (Rp)', 'Nilai Settlement (Rp)', 'Selisih Laba (Rp)'
  ];

  const probRows = [];
  (problematicOrders || []).forEach(o => {
    const problemsStr = (o.problems || []).join(', ');
    const items = o.items || [{ name: o.name || '', variation: o.variation || '', sku: o.sku || '', qty: o.qty || 1, hpp: o.hpp || 0 }];
    
    items.forEach((item, idx) => {
      probRows.push([
        idx === 0 ? o.id : '',
        idx === 0 ? formatDateStr(o.date) : '',
        idx === 0 ? o.status : '',
        idx === 0 ? problemsStr : '',
        item.name || '',
        item.variation || '',
        item.sku || '',
        item.qty || 0,
        item.hpp || 0,
        idx === 0 ? (o.payout || 0) : 0,
        idx === 0 ? ((o.payout || 0) - (o.hpp || 0)) : 0
      ]);
    });
  });

  const wsProb = XLSX.utils.aoa_to_sheet([probHeaders, ...probRows]);
  autoFitColumns(wsProb);
  XLSX.utils.book_append_sheet(workbook, wsProb, 'Pesanan Bermasalah');

  // === 4. SHEET: PESANAN SELESAI ===
  const compHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Status', 'Nama Produk', 
    'Nama Variasi', 'SKU', 'Qty', 'Total Omzet (Rp)', 
    'Dana Cair/Settlement (Rp)', 'Total HPP (Rp)', 'Keuntungan Bersih (Rp)'
  ];

  const compRows = [];
  (completedOrders || []).forEach(o => {
    const items = o.items || [{ name: o.name || '', variation: o.variation || '', sku: o.sku || '', qty: o.qty || 1, hpp: o.hpp || 0 }];
    
    items.forEach((item, idx) => {
      compRows.push([
        idx === 0 ? o.id : '',
        idx === 0 ? formatDateStr(o.date) : '',
        idx === 0 ? o.status : '',
        item.name || '',
        item.variation || '',
        item.sku || '',
        item.qty || 0,
        idx === 0 ? (o.totalBruto || 0) : 0,
        idx === 0 ? (o.payout || 0) : 0,
        idx === 0 ? (o.hpp || 0) : 0,
        idx === 0 ? ((o.payout || 0) - (o.hpp || 0)) : 0
      ]);
    });
  });

  const wsComp = XLSX.utils.aoa_to_sheet([compHeaders, ...compRows]);
  autoFitColumns(wsComp);
  XLSX.utils.book_append_sheet(workbook, wsComp, 'Pesanan Selesai');

  // === 5. SHEET: PESANAN RETUR ===
  const retHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Status', 'Nama Produk', 
    'Nama Variasi', 'Qty Retur', 'Refund ke Pembeli (Rp)', 'Dana Dilepas (Rp)'
  ];

  const retRows = [];
  (returnedOrders || []).forEach(o => {
    const items = o.items || [{ name: o.name || '', variation: o.variation || '', qty: o.qty || 1 }];
    
    items.forEach((item, idx) => {
      retRows.push([
        idx === 0 ? o.id : '',
        idx === 0 ? formatDateStr(o.date) : '',
        idx === 0 ? o.status : '',
        item.name || '',
        item.variation || '',
        idx === 0 ? (o.totalQtyRetur || item.qty || 0) : 0,
        idx === 0 ? (o.refund || 0) : 0,
        idx === 0 ? (o.payout || 0) : 0
      ]);
    });
  });

  const wsRet = XLSX.utils.aoa_to_sheet([retHeaders, ...retRows]);
  autoFitColumns(wsRet);
  XLSX.utils.book_append_sheet(workbook, wsRet, 'Pesanan Retur');

  // === 6. SHEET: PESANAN BATAL ===
  const cancelHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Status', 'Alasan Batal', 
    'Resi Terbit?', 'Nama Produk', 'Qty', 'Total Harga (Rp)'
  ];

  const cancelRows = [];
  (cancelledOrders || []).forEach(o => {
    const items = o.items || [{ name: o.name || '', variation: o.variation || '', qty: o.qty || 1, price: o.price || 0 }];
    
    items.forEach((item, idx) => {
      cancelRows.push([
        idx === 0 ? o.id : '',
        idx === 0 ? formatDateStr(o.date) : '',
        idx === 0 ? o.status : '',
        idx === 0 ? (o.cancelReason || 'Pembeli membatalkan') : '',
        idx === 0 ? (o.resi && o.resi !== 'Tanpa Resi' && o.resi !== '-' ? 'Ya (' + o.resi + ')' : 'Tidak') : '',
        item.name || '',
        item.qty || 0,
        item.price * item.qty
      ]);
    });
  });

  const wsCancel = XLSX.utils.aoa_to_sheet([cancelHeaders, ...cancelRows]);
  autoFitColumns(wsCancel);
  XLSX.utils.book_append_sheet(workbook, wsCancel, 'Pesanan Batal');

  // === 7. SHEET: SEMUA PESANAN ===
  const allHeaders = [
    'ID Pesanan', 'Tanggal Pesanan', 'Status', 'Nama Produk', 
    'Nama Variasi', 'SKU', 'Qty', 'Total Omzet (Rp)', 
    'Dana Cair (Rp)', 'Total HPP (Rp)', 'Keuntungan Bersih (Rp)'
  ];

  const allRows = [];
  (allOrders || []).forEach(o => {
    const items = o.items || [{ name: o.name || '', variation: o.variation || '', sku: o.sku || '', qty: o.qty || 1, hpp: o.hpp || 0 }];
    
    items.forEach((item, idx) => {
      allRows.push([
        idx === 0 ? o.id : '',
        idx === 0 ? formatDateStr(o.date) : '',
        idx === 0 ? o.status : '',
        item.name || '',
        item.variation || '',
        item.sku || '',
        item.qty || 0,
        idx === 0 ? (o.totalBruto || 0) : 0,
        idx === 0 ? (o.payout || 0) : 0,
        idx === 0 ? (o.hpp || 0) : 0,
        idx === 0 ? ((o.payout || 0) - (o.hpp || 0)) : 0
      ]);
    });
  });

  const wsAll = XLSX.utils.aoa_to_sheet([allHeaders, ...allRows]);
  autoFitColumns(wsAll);
  XLSX.utils.book_append_sheet(workbook, wsAll, 'Semua Pesanan');

  XLSX.writeFile(workbook, `Laporan_Analisis_TikTok_${Date.now().toString(36)}.xlsx`);
};
