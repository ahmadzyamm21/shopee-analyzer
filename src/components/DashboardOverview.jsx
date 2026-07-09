import React from 'react';
import { DollarSign, ShieldAlert, Award, TrendingUp, Percent, ShoppingBag, ArrowRight } from 'lucide-react';

const DashboardOverview = ({ data }) => {
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

  // Calculate total revenue before Shopee admin fees for the progress bar baseline
  const totalOmzet = summary.totalPenghasilanDilepas + Math.abs(summary.totalBiayaAdminLayanan);
  
  const hppPercent = totalOmzet > 0 ? (summary.totalHpp / totalOmzet) * 100 : 0;
  const adsPercent = totalOmzet > 0 ? (summary.totalAds / totalOmzet) * 100 : 0;
  const platformPercent = totalOmzet > 0 ? (Math.abs(summary.totalBiayaAdminLayanan) / totalOmzet) * 100 : 0;
  const netProfitPercent = totalOmzet > 0 ? (summary.labaBersih / totalOmzet) * 100 : 0;

  // Key metrics calculations
  const returnRate = summary.orderSelesaiCount > 0 ? (summary.qtyRetur / (summary.qtyTerjualNet + summary.qtyRetur)) * 100 : 0;
  const averageProfit = summary.orderSelesaiCount > 0 ? summary.labaBersih / summary.orderSelesaiCount : 0;
  const cancellationRate = (summary.orderSelesaiCount + summary.orderBatalCount) > 0 
    ? (summary.orderBatalCount / (summary.orderSelesaiCount + summary.orderBatalCount)) * 100 
    : 0;

  return (
    <div className="overview-container">
      {/* KPI GRID */}
      <div className="kpi-grid">
        <div className="kpi orange">
          <span className="kpi-lbl">Harga Asli Produk (GMV Bruto)</span>
          <span className="kpi-val orange">{formatRp(summary.hargaAsliBruto)}</span>
          <span className="kpi-hint">Total nilai listing sebelum diskon & pembatalan</span>
        </div>

        <div className="kpi blue">
          <span className="kpi-lbl">Total Pembayaran Pembeli</span>
          <span className="kpi-val blue">{formatRp(summary.hargaAsliBruto + summary.diskonProdukSeller + summary.ongkirPembeli - summary.voucherSeller)}</span>
          <span className="kpi-hint">Termasuk subsidi Shopee & ongkir pembeli</span>
        </div>

        <div className="kpi orange">
          <span className="kpi-lbl">Dana Dilepas Shopee</span>
          <span className="kpi-val orange">{formatRp(summary.totalPenghasilanDilepas)}</span>
          <span className="kpi-hint">Total omzet neto masuk ke Saldo Penjual</span>
        </div>

        <div className="kpi red">
          <span className="kpi-lbl">HPP / Modal Barang</span>
          <span className="kpi-val red">{formatRp(summary.totalHpp)}</span>
          <span className="kpi-hint">Modal awal barang untuk {summary.qtyTerjualNet} unit terjual</span>
        </div>

        <div className="kpi red">
          <span className="kpi-lbl">Fee Platform & Ongkir Shopee</span>
          <span className="kpi-val red">{formatRp(Math.abs(summary.totalBiayaPlatformShopee))}</span>
          <span className="kpi-hint">Semua komisi AMS, biaya admin & layanan platform</span>
        </div>

        <div className="kpi pink">
          <span className="kpi-lbl">Biaya Iklan (Shopee Ads)</span>
          <span className="kpi-val pink">{formatRp(summary.totalAds)}</span>
          <span className="kpi-hint">Total top-up iklan yang tercatat di SVS Invoice</span>
        </div>

        <div className="kpi green">
          <span className="kpi-lbl">Laba Bersih (Take Home)</span>
          <span className="kpi-val green">{formatRp(summary.labaBersih)}</span>
          <span className="kpi-hint">Penghasilan bersih setelah dikurangi HPP & iklan</span>
        </div>

        <div className="kpi teal">
          <span className="kpi-lbl">Selisih Ongkos Kirim</span>
          <span className="kpi-val teal">{formatRp(summary.netBiayaPengiriman)}</span>
          <span className="kpi-hint">Selisih ongkir pembeli + subsidi vs ongkir kurir aktual</span>
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

      {/* PROGRESS FLOW VISUALIZER */}
      <div className="card">
        <div className="card-head">
          <h2>📊 Alokasi &amp; Alur Penggunaan Total Pendapatan Toko ({formatRp(totalOmzet)})</h2>
          <span className="badge blue">Total 100% Pembagian Hasil</span>
        </div>
        <div className="progress-wrap">
          <div className="prog-item">
            <div className="prog-lbl">
              <span>1. HPP / Modal Barang</span>
              <span className="color-red">{formatRp(summary.totalHpp)} ({hppPercent.toFixed(1)}%)</span>
            </div>
            <div className="prog-bar">
              <div className="prog-fill fill-red" style={{ width: `${Math.min(hppPercent, 100)}%` }}></div>
            </div>
          </div>

          <div className="prog-item">
            <div className="prog-lbl">
              <span>2. Biaya Administrasi & Layanan Shopee</span>
              <span className="color-orange">{formatRp(Math.abs(summary.totalBiayaAdminLayanan))} ({platformPercent.toFixed(1)}%)</span>
            </div>
            <div className="prog-bar">
              <div className="prog-fill fill-orange" style={{ width: `${Math.min(platformPercent, 100)}%` }}></div>
            </div>
          </div>

          {summary.totalAds > 0 && (
            <div className="prog-item">
              <div className="prog-lbl">
                <span>3. Biaya Iklan Shopee Ads</span>
                <span className="color-pink">{formatRp(summary.totalAds)} ({adsPercent.toFixed(1)}%)</span>
              </div>
              <div className="prog-bar">
                <div className="prog-fill fill-pink" style={{ width: `${Math.min(adsPercent, 100)}%` }}></div>
              </div>
            </div>
          )}

          <div className="prog-item divider-top">
            <div className="prog-lbl">
              <strong className="color-text">4. Laba Bersih Toko (Take Home Profit)</strong>
              <strong className="color-green">{formatRp(summary.labaBersih)} ({netProfitPercent.toFixed(1)}%)</strong>
            </div>
            <div className="prog-bar bar-large">
              <div className="prog-fill fill-green" style={{ width: `${Math.max(0, Math.min(netProfitPercent, 100))}%` }}></div>
            </div>
          </div>
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
              <span className="lbl">Rata-rata Nilai Order Selesai (Gross)</span>
              <span className="val">{formatRp(summary.hargaAsliBruto / summary.orderSelesaiCount)}</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Rata-rata HPP per Unit Barang</span>
              <span className="val">{formatRp(summary.totalHpp / summary.qtyTerjualNet)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>📢 Analisis Efisiensi Biaya & Promosi</h2>
          </div>
          <div className="stat-list">
            <div className="stat-row">
              <span className="lbl">Voucher Ditanggung Seller</span>
              <span className="val color-red">{formatRp(Math.abs(summary.voucherSeller))}</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Promo Gratis Ongkir Toko (Freeshipping)</span>
              <span className="val color-red">{formatRp(Math.abs(summary.promoOngkirSeller))}</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Biaya Ads % dari Dana Dilepas</span>
              <span className="val color-pink">{formatPercent(adsPercent)}</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Rasio Biaya Shopee (Platform Fee)</span>
              <span className="val color-orange">{formatPercent(platformPercent)}</span>
            </div>
            <div className="stat-row">
              <span className="lbl">Rasio Laba Kotor Toko</span>
              <span className="val color-blue">{formatPercent(summary.totalPenghasilanDilepas > 0 ? (summary.labaKotor / summary.totalPenghasilanDilepas)*100 : 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
