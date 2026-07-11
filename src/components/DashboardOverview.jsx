import React from 'react';
import { DollarSign, ShieldAlert, Award, TrendingUp, Percent, ShoppingBag, ArrowRight } from 'lucide-react';

const DashboardOverview = ({ data, onReset }) => {
  if (!data || !data.summary) return null;

  const { summary, batalSummary } = data;

  const formatRp = (num) => {
    const isNeg = num < 0;
    const val = Math.abs(Math.round(num));
    return (isNeg ? '-' : '') + 'Rp ' + val.toLocaleString('id-ID');
  };

  const formatPercent = (num) => {
    return num.toFixed(2) + '%';
  };

  // Calculate total revenue as Harga Asli - Diskon Penjual - Voucher Penjual
  const totalOmzet = summary.hargaAsliBruto - Math.abs(summary.diskonProdukSeller) - Math.abs(summary.voucherSeller);
  
  const getPercent = (val, keepSign = false) => {
    if (!totalOmzet || totalOmzet === 0) return '0.0%';
    const finalVal = keepSign ? val : Math.abs(val);
    const pct = (finalVal / totalOmzet) * 100;
    return pct.toFixed(1) + '%';
  };

  // Key metrics calculations
  const returnRate = summary.orderSelesaiCount > 0 ? (summary.qtyRetur / (summary.qtyTerjualNet + summary.qtyRetur)) * 100 : 0;
  const averageProfit = summary.orderSelesaiCount > 0 ? summary.labaBersih / summary.orderSelesaiCount : 0;
  const cancellationRate = (summary.orderSelesaiCount + summary.orderBatalCount) > 0 
    ? (summary.orderBatalCount / (summary.orderSelesaiCount + summary.orderBatalCount)) * 100 
    : 0;

  // Calculate total payout minus from returned orders (net loss to seller)
  const totalKerugianRetur = data.returnedOrders
    ? data.returnedOrders
        .filter(o => o.payout < 0)
        .reduce((sum, o) => sum + o.payout, 0)
    : 0;

  const countKerugianRetur = data.returnedOrders
    ? data.returnedOrders.filter(o => o.payout < 0).length
    : 0;

  const baseOmset = totalOmzet || 1;
  const hppVal = summary.totalHpp || 0;
  const platformFeeVal = Math.abs(summary.totalBiayaAdminLayanan) || 0;
  const adsVal = summary.totalAds || 0;
  const selisihOngkirVal = Math.abs(summary.netBiayaPengiriman) || 0;
  const profitVal = summary.labaBersih;

  const chartData = [
    { label: 'Omset', value: baseOmset, color: 'linear-gradient(180deg, #3b82f6, #1d4ed8)' },
    { label: 'HPP', value: hppVal, color: 'linear-gradient(180deg, #ef4444, #b91c1c)' },
    { label: 'Biaya Platform', value: platformFeeVal, color: 'linear-gradient(180deg, #f97316, #c2410c)' },
    { label: 'Iklan', value: adsVal, color: 'linear-gradient(180deg, #eab308, #a16207)' },
    { label: 'Selisih Ongkir', value: selisihOngkirVal, color: 'linear-gradient(180deg, #ec4899, #be185d)' },
    { 
      label: profitVal >= 0 ? 'Laba Bersih' : 'Rugi Bersih', 
      value: Math.abs(profitVal), 
      color: profitVal >= 0 ? 'linear-gradient(180deg, #22c55e, #15803d)' : 'linear-gradient(180deg, #ef4444, #991b1b)'
    }
  ];

  const maxChartVal = Math.max(...chartData.map(d => d.value)) || 1;

  return (
    <div className="overview-container">
      {/* Reset Button */}
      {onReset && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid rgba(249, 115, 22, 0.4)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'var(--accent-orange)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            🔄 Reset Data
          </button>
        </div>
      )}
      {/* KPI GRID */}
      <div className="kpi-grid">
        {/* ROW 1: KEY FINANCIAL OUTCOMES */}
        <div className="kpi blue">
          <span className="kpi-lbl">Total Pendapatan Toko</span>
          <span className="kpi-val blue">{formatRp(totalOmzet)} <span style={{ fontSize: '0.75em', marginLeft: '6px', opacity: 0.8 }}>(100.0%)</span></span>
          <span className="kpi-hint">Total omzet kotor sebelum potongan Shopee</span>
        </div>

        <div className="kpi orange">
          <span className="kpi-lbl">Dana Dilepas Shopee</span>
          <span className="kpi-val orange">{formatRp(summary.totalPenghasilanDilepas)} <span style={{ fontSize: '0.75em', marginLeft: '6px', opacity: 0.8 }}>({getPercent(summary.totalPenghasilanDilepas)})</span></span>
          <span className="kpi-hint">Total omzet neto masuk ke Saldo Penjual</span>
        </div>

        <div className={`kpi ${summary.labaBersih >= 0 ? 'green' : 'red'}`}>
          <span className="kpi-lbl">Laba Bersih (Take Home)</span>
          <span className={`kpi-val ${summary.labaBersih >= 0 ? 'green' : 'red'}`}>{formatRp(summary.labaBersih)} <span style={{ fontSize: '0.75em', marginLeft: '6px', opacity: 0.8 }}>({getPercent(summary.labaBersih, true)})</span></span>
          <span className="kpi-hint">Penghasilan bersih setelah dikurangi HPP, iklan, selisih ongkir, dan kerugian retur</span>
        </div>

        {/* ROW 2: KEY COST FACTORS */}
        <div className="kpi red">
          <span className="kpi-lbl">HPP / Modal Barang</span>
          <span className="kpi-val red">{formatRp(summary.totalHpp)} <span style={{ fontSize: '0.75em', marginLeft: '6px', opacity: 0.8 }}>({getPercent(summary.totalHpp)})</span></span>
          <span className="kpi-hint">Modal awal barang untuk {summary.qtyTerjualNet} unit terjual</span>
        </div>

        <div className="kpi red">
          <span className="kpi-lbl">Fee Platform Shopee</span>
          <span className="kpi-val red">{formatRp(Math.abs(summary.totalBiayaAdminLayanan))} <span style={{ fontSize: '0.75em', marginLeft: '6px', opacity: 0.8 }}>({getPercent(summary.totalBiayaAdminLayanan)})</span></span>
          <span className="kpi-hint">Total biaya administrasi, komisi AMS, dan layanan Shopee</span>
        </div>

        <div className="kpi red">
          <span className="kpi-lbl">Biaya Iklan (Shopee Ads)</span>
          <span className="kpi-val red">{formatRp(summary.totalAds)} <span style={{ fontSize: '0.75em', marginLeft: '6px', opacity: 0.8 }}>({getPercent(summary.totalAds)})</span></span>
          <span className="kpi-hint">Total top-up iklan yang tercatat di SVS Invoice</span>
        </div>

        {/* ROW 3: OTHER COST DEDUCTIONS */}
        <div className="kpi red">
          <span className="kpi-lbl">Pengembalian Dana Pembeli (Retur)</span>
          <span className="kpi-val red">{formatRp(summary.refundPembeli)} <span style={{ fontSize: '0.75em', marginLeft: '6px', opacity: 0.8 }}>({getPercent(summary.refundPembeli)})</span></span>
          <span className="kpi-hint">Total dana yang dikembalikan ke pembeli karena pembatalan/retur</span>
        </div>

        <div className="kpi red">
          <span className="kpi-lbl">Selisih Ongkir (Beban Penjual)</span>
          <span className="kpi-val red">{formatRp(summary.netBiayaPengiriman)} <span style={{ fontSize: '0.75em', marginLeft: '6px', opacity: 0.8 }}>({getPercent(summary.netBiayaPengiriman)})</span></span>
          <span className="kpi-hint">Selisih ongkos kirim yang ditanggung oleh penjual</span>
        </div>
      </div>

      {/* Histogram Chart Section */}
      <div className="card" style={{ marginTop: '20px', marginBottom: '20px', padding: '24px' }}>
        <div className="card-head" style={{ marginBottom: '24px' }}>
          <h2>📊 Histogram Alokasi Keuangan (Shopee)</h2>
          <span className="badge orange">Total Omset: {formatRp(totalOmzet)}</span>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          height: '220px', 
          padding: '20px 10px 10px 10px',
          borderBottom: '2px solid var(--border-color)',
          gap: '16px',
          overflowX: 'auto'
        }}>
          {chartData.map((item, idx) => {
            const barHeight = (item.value / maxChartVal) * 140; // Max height of 140px
            const pct = baseOmset > 0 ? (item.value / baseOmset) * 100 : 0;
            return (
              <div key={idx} style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                minWidth: '70px',
                height: '100%',
                justifyContent: 'flex-end'
              }}>
                <span style={{ 
                  fontSize: '10.5px', 
                  fontWeight: 800, 
                  marginBottom: '6px',
                  color: 'var(--text-main)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label.includes('Rugi') && item.value > 0 ? '-' : ''}{formatRp(item.value).replace('Rp ', '')}
                </span>

                <div style={{
                  width: '100%',
                  maxWidth: '48px',
                  height: `${Math.max(barHeight, 4)}px`,
                  background: item.color,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease-in-out',
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }} title={`${item.label}: ${formatRp(item.value)} (${pct.toFixed(1)}% dari omset)`}>
                  <span style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'var(--text-muted2)',
                    opacity: 0.8
                  }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>

                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  marginTop: '10px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* HIGHLIGHT BOXES */}
      <div className="highlight-box">
        <div className="hl-cell">
          <div className="hl-lbl">Rata-rata Laba per Pesanan</div>
          <div className="hl-val color-green">{formatRp(averageProfit)}</div>
          <div className="hl-sub">Laba bersih dibagi {summary.orderSelesaiCount} order selesai</div>
        </div>
        <div className="hl-cell">
          <div className="hl-lbl">Tingkat Pengembalian (Return Rate)</div>
          <div className="hl-val color-yellow">{formatPercent(returnRate)}</div>
          <div className="hl-sub">{summary.qtyRetur} unit diretur dari total terjual</div>
        </div>
        <div className="hl-cell">
          <div className="hl-lbl">Rasio Pembatalan (Cancellation)</div>
          <div className="hl-val color-red">{formatPercent(cancellationRate)}</div>
          <div className="hl-sub">{summary.orderBatalCount} order dibatalkan oleh sistem / pembeli</div>
        </div>
      </div>

      {/* QUICK STATS COMPARISON */}
      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <h2>📈 Metrik Volume & Penjualan</h2>
          </div>
          <div className="stat-list">
            <div className="stat-row">
              <span className="lbl">Total Pesanan Selesai</span>
              <span className="val">{summary.orderSelesaiCount.toLocaleString('id-ID')} order</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Kuantitas Terjual Neto</span>
              <span className="val">{summary.qtyTerjualNet.toLocaleString('id-ID')} unit</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Kuantitas Diretur Pembeli</span>
              <span className="val color-yellow">{summary.qtyRetur.toLocaleString('id-ID')} unit</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Rata-rata Dana Dilepas per Pesanan</span>
              <span className="val">{formatRp(summary.totalPenghasilanDilepas / summary.orderSelesaiCount)}</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Rata-rata HPP per Unit Barang</span>
              <span className="val">{formatRp(summary.totalHpp / summary.qtyTerjualNet)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>⚙️ Rincian Biaya Fee Platform Shopee</h2>
          </div>
          <div className="stat-list">
            <div className="stat-row">
              <span className="lbl">Biaya Administrasi</span>
              <span className="val color-red">{formatRp(summary.biayaAdmin)} ({getPercent(summary.biayaAdmin)})</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Biaya Layanan Gratis Ongkir XTRA</span>
              <span className="val color-red">{formatRp(summary.biayaLayanan * 2 / 3)} ({getPercent(summary.biayaLayanan * 2 / 3)})</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Biaya Layanan Promo XTRA</span>
              <span className="val color-red">{formatRp(summary.biayaLayanan * 1 / 3)} ({getPercent(summary.biayaLayanan * 1 / 3)})</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Biaya Komisi AMS</span>
              <span className="val color-red">{formatRp(summary.biayaKomisiAms)} ({getPercent(summary.biayaKomisiAms)})</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Biaya Proses Pesanan</span>
              <span className="val color-red">{formatRp(summary.biayaProses)} ({getPercent(summary.biayaProses)})</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Premi</span>
              <span className="val color-red">{formatRp(summary.premi)} ({getPercent(summary.premi)})</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Program Hemat Biaya Kirim</span>
              <span className="val color-red">{formatRp(summary.hematKirim)} ({getPercent(summary.hematKirim)})</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Biaya Transaksi</span>
              <span className="val color-red">{formatRp(summary.biayaTransaksi)} ({getPercent(summary.biayaTransaksi)})</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Biaya Kampanye</span>
              <span className="val color-red">{formatRp(summary.biayaKampanye)} ({getPercent(summary.biayaKampanye)})</span>
            </div>
            <div className="stat-row divider-top" style={{ fontWeight: 'bold' }}>
              <span className="lbl">Total Fee Platform</span>
              <span className="val color-red">{formatRp(Math.abs(summary.totalBiayaAdminLayanan))} ({getPercent(summary.totalBiayaAdminLayanan)})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
