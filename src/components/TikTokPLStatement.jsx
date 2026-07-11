import React from 'react';

const formatRp = (num) => {
  if (num === 0) return '−';
  const isNeg = num < 0;
  const formatted = Math.abs(Math.round(num)).toLocaleString('id-ID');
  return isNeg ? `− ${formatted}` : formatted;
};

const formatPct = (num, base) => {
  if (!base || base === 0) return '0%';
  return ((Math.abs(num) / base) * 100).toFixed(1) + '%';
};

const TikTokPLStatement = ({ result }) => {
  if (!result) return null;
  const { summary } = result;
  const { feesBreakdown } = summary;
  const base = summary.totalRevenue;

  const totalAfiliasi = Math.abs(feesBreakdown.komisiAfiliasi) +
    Math.abs(feesBreakdown.komisiMitra) +
    Math.abs(feesBreakdown.komisiIklanAfiliasi);
  const totalLogistik = Math.abs(feesBreakdown.logistik) + Math.abs(feesBreakdown.ongkir);

  const isProfit = summary.netOperatingProfit >= 0;

  return (
    <div className="pl-container">
      <div className="card">
        <div className="card-head">
          <h2>📋 Laporan Laba Rugi Cohort — TikTok Shop</h2>
          <span className={`badge ${isProfit ? 'green' : 'red'}`}>
            {isProfit ? '✅ PROFIT' : '❌ RUGI'} | Net Margin {summary.netMargin.toFixed(1)}%
          </span>
        </div>

        <table className="pl-table">
          <colgroup>
            <col style={{ width: '50%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <tbody>

            {/* A. PENDAPATAN */}
            <tr className="grp-head tiktok-grp">
              <td colSpan="2">A. PENDAPATAN (OMSET COHORT)</td>
              <td className="r">Rasio %</td>
            </tr>
            <tr>
              <td>Harga Jual Awal Produk (Subtotal Sebelum Diskon)</td>
              <td className="val pos">Rp {formatRp(summary.totalSubtotalSebelumDiskon)}</td>
              <td className="val neu">−</td>
            </tr>
            <tr>
              <td>(−) Diskon Penjual (Beban Penjual)</td>
              <td className="val neg">− Rp {formatRp(Math.abs(summary.totalDiskonProduk + summary.totalVoucherSeller))}</td>
              <td className="val neu">{formatPct(summary.totalDiskonProduk + summary.totalVoucherSeller, base)}</td>
            </tr>
            <tr>
              <td className="indent" style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>• Diskon Produk Toko</td>
              <td className="val neg" style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>− Rp {formatRp(Math.abs(summary.totalDiskonProduk))}</td>
              <td className="val neu" style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>{formatPct(summary.totalDiskonProduk, base)}</td>
            </tr>
            <tr>
              <td className="indent" style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>• Voucher Toko (Beban Penjual)</td>
              <td className="val neg" style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>− Rp {formatRp(Math.abs(summary.totalVoucherSeller))}</td>
              <td className="val neu" style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>{formatPct(summary.totalVoucherSeller, base)}</td>
            </tr>
            <tr className="row-sub">
              <td>Total Omset Bersih (Net Revenue)</td>
              <td className="val pos">Rp {formatRp(summary.totalRevenue)}</td>
              <td className="val neu">100%</td>
            </tr>
            <tr>
              <td className="indent">Jumlah Pesanan Cair</td>
              <td className="val neu">{summary.totalMatchedOrders} pesanan</td>
              <td className="val neu">−</td>
            </tr>
            <tr>
              <td className="indent">Volume Produk Terjual</td>
              <td className="val neu">{summary.totalQty} unit</td>
              <td className="val neu">−</td>
            </tr>

            {/* B. HPP */}
            <tr className="grp-head red">
              <td colSpan="3">B. HARGA POKOK PENJUALAN (HPP / COGS)</td>
            </tr>
            <tr className="row-hpp">
              <td>(−) HPP Modal Barang Terjual ({summary.totalQty} unit)
                {summary.unmappedQty > 0 && (
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted2)', marginLeft: '6px' }}>
                    [{summary.unmappedQty} unit pakai rata-rata HPP Rp {Math.round(summary.avgHpp).toLocaleString('id-ID')}]
                  </span>
                )}
              </td>
              <td className="val neg">− Rp {formatRp(summary.totalHpp)}</td>
              <td className="val neu">{formatPct(summary.totalHpp, base)}</td>
            </tr>

            {/* LABA KOTOR */}
            <tr className="row-laba">
              <td>📈 LABA KOTOR (Omset − HPP)</td>
              <td className="val">Rp {formatRp(summary.grossProfit)}</td>
              <td className="val">{formatPct(summary.grossProfit, base)}</td>
            </tr>

            {/* C. BIAYA PLATFORM */}
            <tr className="grp-head tiktok-grp">
              <td colSpan="3">C. BIAYA ADMINISTRASI & LAYANAN TIKTOK SHOP</td>
            </tr>
            <tr>
              <td className="indent">Biaya Komisi Platform</td>
              <td className="val neg">− Rp {formatRp(Math.abs(feesBreakdown.komisiPlatform))}</td>
              <td className="val neu">{formatPct(feesBreakdown.komisiPlatform, base)}</td>
            </tr>
            <tr>
              <td className="indent">Komisi Afiliasi, Mitra & Iklan Afiliasi</td>
              <td className="val neg">− Rp {formatRp(totalAfiliasi)}</td>
              <td className="val neu">{formatPct(totalAfiliasi, base)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Layanan Logistik & Ongkir Net</td>
              <td className="val neg">− Rp {formatRp(totalLogistik)}</td>
              <td className="val neu">{formatPct(totalLogistik, base)}</td>
            </tr>
            <tr>
              <td className="indent">Komisi Dinamis</td>
              <td className="val neg">− Rp {formatRp(Math.abs(feesBreakdown.komisiDinamis))}</td>
              <td className="val neu">{formatPct(feesBreakdown.komisiDinamis, base)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Layanan Cashback Bonus</td>
              <td className="val neg">− Rp {formatRp(Math.abs(feesBreakdown.cashback))}</td>
              <td className="val neu">{formatPct(feesBreakdown.cashback, base)}</td>
            </tr>
            <tr>
              <td className="indent">Biaya Pemrosesan Pesanan</td>
              <td className="val neg">− Rp {formatRp(Math.abs(feesBreakdown.prosesPesanan))}</td>
              <td className="val neu">{formatPct(feesBreakdown.prosesPesanan, base)}</td>
            </tr>
            <tr className="row-sub">
              <td>Total Biaya Administrasi & Layanan TikTok</td>
              <td className="val neg">− Rp {formatRp(Math.abs(summary.totalFees - (summary.selisihOngkir || 0)))}</td>
              <td className="val neu">{formatPct(summary.totalFees - (summary.selisihOngkir || 0), base)}</td>
            </tr>

            {/* D. BIAYA OPERASIONAL LAINNYA */}
            <tr className="grp-head pink">
              <td colSpan="3">D. BIAYA OPERASIONAL LAINNYA</td>
            </tr>
            <tr>
              <td className="indent">Selisih Ongkir (Beban Penjual)</td>
              <td className="val neg">− Rp {formatRp(Math.abs(summary.selisihOngkir || 0))}</td>
              <td className="val neu">{formatPct(summary.selisihOngkir || 0, base)}</td>
            </tr>
            {summary.totalAds > 0 && (
              <tr>
                <td className="indent">Biaya Iklan (TikTok Ads)</td>
                <td className="val neg">− Rp {formatRp(summary.totalAds)}</td>
                <td className="val neu">{formatPct(summary.totalAds, base)}</td>
              </tr>
            )}

            {/* LABA BERSIH OPERASIONAL */}
            <tr className={`row-bersih ${!isProfit ? 'row-rugi' : ''}`}>
              <td>{isProfit ? '✅' : '❌'} LABA BERSIH OPERASIONAL COHORT</td>
              <td className="val">Rp {formatRp(summary.netOperatingProfit)}</td>
              <td className="val">{formatPct(summary.netOperatingProfit, base)}</td>
            </tr>
            <tr className="row-margin">
              <td className="indent">Net Margin (dari Omset Cohort)</td>
              <td></td>
              <td className="val" style={{ color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {summary.netMargin.toFixed(2)}%
              </td>
            </tr>
            <tr className="row-margin">
              <td className="indent">Gross Margin (Laba Kotor dari Omset)</td>
              <td></td>
              <td className="val">{summary.grossMargin.toFixed(2)}%</td>
            </tr>

            {/* D. SETTLEMENT */}
            <tr className="grp-head blue">
              <td colSpan="3">D. INFORMASI DANA SETTLEMENT (PENCAIRAN)</td>
            </tr>
            <tr>
              <td>💰 Total Dana Bersih Dicairkan ke Rekening (Settlement)</td>
              <td className="val pos">Rp {formatRp(summary.totalSettlement)}</td>
              <td className="val neu">{formatPct(summary.totalSettlement, base)}</td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TikTokPLStatement;
