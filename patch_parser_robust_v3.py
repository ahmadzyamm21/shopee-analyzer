import re
import os

file_path = r'C:\Users\ahmad\.gemini\antigravity\scratch\shopee-analyzer-web\src\utils\shopeeParser.js'

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Normalize line endings
code_norm = code.replace('\r\n', '\n')

# 1. Update matchedIncome loop start
pattern_loop = r'matchedIncome\.forEach\(\s*row\s*=>\s*\{[\s\S]*?totalVoucherCofundMatched\s*\+=\s*parseNumber\(row\[\'Voucher co-fund disponsor oleh Penjual\'\]\);'

replacement_loop = """matchedIncome.forEach(row => {
    totalHargaAsliMatched += parseNumber(row['Harga Asli Produk'] || row['Harga asli produk'] || 0);
    totalDiskonProdukMatched += parseNumber(row['Total Diskon Produk'] || row['Diskon Produk Dari Penjual'] || row['Diskon Produk dari Penjual'] || 0);
    totalRefundMatched += parseNumber(row['Jumlah Pengembalian Dana ke Pembeli'] || row['Pengembalian Dana ke Pembeli'] || 0);
    totalVoucherSellerMatched += parseNumber(row['Voucher disponsor oleh Penjual'] || row['Voucher disponsori oleh Penjual'] || 0);
    totalVoucherCofundMatched += parseNumber(row['Voucher co-fund disponsor oleh Penjual'] || row['Voucher co-fund disponsori oleh Penjual'] || 0);"""

# 2. Update incomeGroup mappings (ends at biayaLiveXtra in clean git state)
pattern_income = r'incomeGroup\[id\]\.payout\s*\+=\s*parseNumber\(row\[\'Total Penghasilan\'\]\);[\s\S]*?incomeGroup\[id\]\.biayaLiveXtra\s*\+=\s*parseNumber\(row\[\'Biaya Program Shopee Live Xtra\'\]\);'

replacement_income = """incomeGroup[id].payout += parseNumber(row['Total Penghasilan'] || 0);
    incomeGroup[id].refund += parseNumber(row['Jumlah Pengembalian Dana ke Pembeli'] || row['Pengembalian Dana ke Pembeli'] || 0);
    incomeGroup[id].biayaAdmin += parseNumber(row['Biaya Administrasi'] || 0);
    incomeGroup[id].biayaLayanan += parseNumber(row['Biaya Layanan'] || 0);
    incomeGroup[id].biayaTransaksi += parseNumber(row['Biaya Transaksi'] || 0);
    incomeGroup[id].biayaKomisi += parseNumber(row['Biaya Komisi AMS'] || 0);
    incomeGroup[id].biayaProses += parseNumber(row['Biaya Proses Pesanan'] || 0);
    incomeGroup[id].premi += parseNumber(row['Premi'] || 0);
    incomeGroup[id].hematKirim += parseNumber(row['Biaya Program Hemat Biaya Kirim'] || 0);
    incomeGroup[id].biayaKampanye += parseNumber(row['Biaya Kampanye'] || row['Biaya kampanye'] || 0);
    incomeGroup[id].promoOngkir += parseNumber(row['Promo Gratis Ongkir dari Penjual'] || 0);
    incomeGroup[id].ongkirPembeli += parseNumber(row['Ongkir Dibayar Pembeli'] || 0);
    incomeGroup[id].gratisOngkir += parseNumber(row['Gratis Ongkir dari Shopee'] || 0);
    incomeGroup[id].ongkirKurir += parseNumber(row['Ongkir yang Diteruskan oleh Shopee ke Jasa Kirim'] || 0);
    incomeGroup[id].ongkirRetur += parseNumber(row['Ongkos Kirim Pengembalian Barang'] || 0);
    incomeGroup[id].pengembalianOngkir += parseNumber(row['Pengembalian Biaya Kirim'] || 0);
    incomeGroup[id].biayaGratongXtra += parseNumber(row['Biaya Layanan Gratis Ongkir XTRA'] || 0);
    incomeGroup[id].biayaPromoXtra += parseNumber(row['Biaya Layanan Promo XTRA'] || 0);
    incomeGroup[id].biayaLiveXtra += parseNumber(row['Biaya Program Shopee Live Xtra'] || 0);
    incomeGroup[id].voucherSeller += parseNumber(row['Voucher disponsor oleh Penjual'] || row['Voucher disponsori oleh Penjual'] || 0);
    incomeGroup[id].voucherCofund += parseNumber(row['Voucher co-fund disponsor oleh Penjual'] || row['Voucher co-fund disponsori oleh Penjual'] || 0);"""

# Replace pattern loop
code_norm, count_l = re.subn(pattern_loop, replacement_loop, code_norm)
print(f"Loop start replaced count: {count_l}")

# Replace pattern income
code_norm, count_i = re.subn(pattern_income, replacement_income, code_norm)
print(f"Income group replaced count: {count_i}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code_norm.replace('\n', os.linesep))

print("Patcher script v3 finished.")
