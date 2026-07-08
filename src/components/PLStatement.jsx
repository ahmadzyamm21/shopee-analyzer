import React from 'react';

const PLStatement = ({ data }) => {
  if (!data || !data.summary) return null;

  const { summary } = data;

  const formatRp = (num) => {
    if (num === 0) return '0';
    const isNeg = num < 0;
    const formatted = Math.abs(Math.round(num)).toLocaleString('id-ID');
    return isNeg ? `− ${formatted}` : formatted;
  };

  const formatPercent = (num) => {
    return num.toFixed(2) + '%';
  };

  // Safe division helper
  const getPercentOfOmzet = (num) => {
    if (summary.totalPenghasilanDilepas === 0) return '0%';
    return ((Math.abs(num) / summary.totalPenghasilanDilepas) * 100).toFixed(2) + '%';
  };

  return (
    <div className="pl-container">
      <div className="card">
        <div className="card-head">
          <h2>📋 Laporan Laba Rugi (Profit &amp; Loss Statement)</h2>
          <span className="badge green">Real-Time Data Klien</span>
        </div>
        <table className="pl-table">
          <colgroup>
            <col style={{ width: '45%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <tbody>
            {/* A. PENDAPATAN KOTOR */}
            <tr className="grp-head">
              <td colspan="2">A. PENDAPATAN KOTOR</td>
              <td className="r">Rasio %</td>
            </tr>
            <tr>
              <td>Harga Asli Produk (GMV Bruto)</td>
              <td className="val pos">{formatRp(summary.hargaAsliBruto)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.hargaAsliBruto)}</td>
            </tr>
            <tr>
              <td className="indent">(−) Total Diskon Produk (Seller)</td>
              <td className="val neg">{formatRp(summary.diskonProdukSeller)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.diskonProdukSeller)}</td>
            </tr>
            <tr>
              <td className="indent">(−) Jumlah Pengembalian Dana (Refund)</td>
              <td className="val neg">{formatRp(summary.refundPembeli)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.refundPembeli)}</td>
            </tr>
            <tr>
              <td className="indent">(−) Voucher Ditanggung Seller</td>
              <td className="val neg">{formatRp(summary.voucherSeller)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.voucherSeller)}</td>
            </tr>
            <tr>
              <td className="indent">(+) Voucher Co-fund Shopee</td>
              <td className="val pos">{formatRp(summary.voucherCofund)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.voucherCofund)}</td>
            </tr>

            {/* B. BIAYA PENGIRIMAN */}
            <tr className="grp-head blue">
              <td colspan="3">B. BIAYA PENGIRIMAN (NET)</td>
            </tr>
            <tr>
              <td className="indent">(+) Ongkir Dibayar Pembeli</td>
              <td className="val pos">{formatRp(summary.ongkirPembeli)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.ongkirPembeli)}</td>
            </tr>
            <tr>
              <td className="indent">(+) Gratis Ongkir dari Shopee (Subsidi)</td>
              <td className="val pos">{formatRp(summary.gratisOngkir)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.gratisOngkir)}</td>
            </tr>
            <tr>
              <td className="indent">(−) Ongkir Diteruskan ke Jasa Kirim (Aktual)</td>
              <td className="val neg">{formatRp(summary.ongkirKurir)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.ongkirKurir)}</td>
            </tr>
            <tr>
              <td className="indent">(−) Ongkos Kirim Pengembalian Barang (Retur)</td>
              <td className="val neg">{formatRp(summary.ongkirRetur)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.ongkirRetur)}</td>
            </tr>
            <tr>
              <td className="indent">(+) Pengembalian Biaya Kirim oleh Shopee</td>
              <td className="val pos">{formatRp(summary.pengembalianOngkir)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.pengembalianOngkir)}</td>
            </tr>
            <tr className="row-sub">
              <td>Net Selisih Ongkos Kirim</td>
              <td className={`val ${summary.netBiayaPengiriman < 0 ? 'neg' : 'pos'}`}>
                {formatRp(summary.netBiayaPengiriman)}
              </td>
              <td className="val neu">{getPercentOfOmzet(summary.netBiayaPengiriman)}</td>
            </tr>

            {/* C. BIAYA ADMIN & LAYANAN PLATFORM */}
            <tr className="grp-head red">
              <td colspan="3">C. BIAYA ADMIN &amp; LAYANAN SHOPEE</td>
            </tr>
            <tr>
              <td className="indent">Biaya Komisi AMS (Affiliate)</td>
              <td className="val neg">{formatRp(summary.biayaKomisiAms)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.biayaKomisiAms)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Administrasi Shopee</td>
              <td className="val neg">{formatRp(summary.biayaAdmin)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.biayaAdmin)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Layanan (GO-XTRA / Promo XTRA)</td>
              <td className="val neg">{formatRp(summary.biayaLayanan)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.biayaLayanan)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Proses Pesanan</td>
              <td className="val neg">{formatRp(summary.biayaProses)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.biayaProses)}</td>
            </tr>
            <tr>
              <td className="indent">Premi &amp; Asuransi Pengiriman</td>
              <td className="val neg">{formatRp(summary.premi)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.premi)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Program Hemat Biaya Kirim</td>
              <td className="val neg">{formatRp(summary.hematKirim)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.hematKirim)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Transaksi / Metode Pembayaran</td>
              <td className="val neg">{formatRp(summary.biayaTransaksi)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.biayaTransaksi)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Kampanye (Campaign Fees)</td>
              <td className="val neg">{formatRp(summary.biayaKampanye)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.biayaKampanye)}</td>
            </tr>
            <tr>
              <td className="indent">(−) Promo Gratis Ongkir dari Penjual</td>
              <td className="val neg">{formatRp(summary.promoOngkirSeller)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.promoOngkirSeller)}</td>
            </tr>
            <tr className="row-sub">
              <td>Total Biaya Admin &amp; Layanan Platform</td>
              <td className="val neg">{formatRp(summary.totalBiayaAdminLayanan)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.totalBiayaAdminLayanan)}</td>
            </tr>

            {/* DANA DILEPAS */}
            <tr className="row-total">
              <td>💰 TOTAL DANA DILEPAS SHOPEE (Total Cash Inflow)</td>
              <td className="val">{formatRp(summary.totalPenghasilanDilepas)}</td>
              <td className="val">100.00%</td>
            </tr>

            {/* D. HPP BARANG */}
            <tr className="grp-head red">
              <td colspan="3">D. HARGA POKOK PENJUALAN (HPP / COGS)</td>
            </tr>
            <tr className="row-hpp">
              <td>(−) HPP Modal Barang Terjual ({summary.qtyTerjualNet} unit)</td>
              <td className="val neg">{formatRp(-summary.totalHpp)}</td>
              <td className="val neu">{getPercentOfOmzet(summary.totalHpp)}</td>
            </tr>

            {/* LABA KOTOR */}
            <tr className="row-laba">
              <td>📈 LABA KOTOR TOKO (Dana Dilepas − HPP)</td>
              <td className="val">{formatRp(summary.labaKotor)}</td>
              <td className="val">{formatPercent((summary.labaKotor / (summary.totalPenghasilanDilepas || 1)) * 100)}</td>
            </tr>

            {/* E. BIAYA IKLAN */}
            {summary.totalAds > 0 && (
              <>
                <tr className="grp-head pink">
                  <td colspan="3">E. BIAYA IKLAN (SHOPEE ADS)</td>
                </tr>
                <tr className="row-hpp" style={{ background: 'rgba(236, 72, 153, 0.05)' }}>
                  <td>(−) Biaya Iklan Shopee Ads (PPN 11% Included)</td>
                  <td className="val neg">{formatRp(-summary.totalAds)}</td>
                  <td className="val neu">{getPercentOfOmzet(summary.totalAds)}</td>
                </tr>
              </>
            )}

            {/* LABA BERSIH */}
            <tr className="row-bersih">
              <td>✅ LABA BERSIH / TAKE HOME PROFIT</td>
              <td className="val">{formatRp(summary.labaBersih)}</td>
              <td className="val">{formatPercent(summary.marginBersih)}</td>
            </tr>

            <tr className="row-margin">
              <td className="indent">Margin Laba Bersih (dari Dana Dilepas)</td>
              <td></td>
              <td className="val">{formatPercent(summary.marginBersih)}</td>
            </tr>
            <tr className="row-margin">
              <td className="indent">Margin Laba Bersih (dari Harga Asli Bruto)</td>
              <td></td>
              <td className="val">
                {formatPercent(summary.hargaAsliBruto > 0 ? (summary.labaBersih / summary.hargaAsliBruto) * 100 : 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PLStatement;
