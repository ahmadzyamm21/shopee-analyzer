import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign, CreditCard, ShoppingCart, BarChart3, Music2, Truck, Megaphone } from 'lucide-react';

const formatRp = (num) => {
  if (num === 0) return 'Rp 0';
  const isNeg = num < 0;
  const formatted = Math.abs(Math.round(num)).toLocaleString('id-ID');
  return isNeg ? `− Rp ${formatted}` : `Rp ${formatted}`;
};

const formatPct = (num) => `${num.toFixed(1)}%`;

const KpiCard = ({ label, value, hint, color, icon: Icon, style }) => (
  <div className={`kpi tiktok-kpi ${color}`} style={style}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div className="kpi-lbl">{label}</div>
      {Icon && (
        <div className={`kpi-icon-wrap ${color}`}>
          <Icon size={14} />
        </div>
      )}
    </div>
    <div className={`kpi-val ${color}`}>{value}</div>
    {hint && <div className="kpi-hint">{hint}</div>}
  </div>
);

const TikTokDashboard = ({ result, onReset }) => {
  const [logoError, setLogoError] = useState(false);
  if (!result) return null;
  const { summary, skuList } = result;

  const feeItems = [
    { label: 'Komisi Platform', value: summary.feesBreakdown.komisiPlatform },
    { label: 'Komisi Afiliasi & Kreator', value: summary.feesBreakdown.komisiAfiliasi + summary.feesBreakdown.komisiMitra + summary.feesBreakdown.komisiIklanAfiliasi },
    { label: 'Komisi Dinamis', value: summary.feesBreakdown.komisiDinamis },
    { label: 'Cashback Bonus', value: summary.feesBreakdown.cashback },
    { label: 'Pemrosesan Pesanan', value: summary.feesBreakdown.prosesPesanan },
    { label: 'Diskon Ongkir dari Penjual', value: summary.feesBreakdown.diskonOngkirPenjual },
  ];

  const totalAbsFees = Math.abs(summary.totalFees - (summary.selisihOngkir || 0));
  const isProfit = summary.netOperatingProfit >= 0;

  const baseOmset = summary.totalRevenue || 1;
  const hppVal = summary.totalHpp || 0;
  const platformFeeVal = Math.abs(summary.totalFees - (summary.selisihOngkir || 0));
  const adsVal = summary.totalAds || 0;
  const selisihOngkirVal = Math.abs(summary.selisihOngkir || 0);
  const profitVal = summary.netOperatingProfit;

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
    <div>
      {/* Header Banner */}
      <div className="tiktok-banner">
        <div className="tiktok-banner-content">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>Analisis Cohort TikTok Shop</div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>
                {summary.totalMatchedOrders} pesanan berhasil dicocokkan dari {summary.totalOrders} pesanan dalam daftar
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                style={{
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                🔄 Reset Data
              </button>
            )}
            <div className={`tiktok-profit-badge ${isProfit ? 'profit' : 'loss'}`}>
              {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isProfit ? 'PROFIT' : 'RUGI'} {formatPct(Math.abs(summary.netMargin))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginTop: '20px' }}>
        <KpiCard
          label="Total Omset (Cohort)"
          value={formatRp(summary.totalRevenue)}
          hint={`100.0% dari omset | ${summary.totalQty} unit terjual`}
          color="orange"
          icon={DollarSign}
        />
        <KpiCard
          label="Total HPP Barang"
          value={formatRp(summary.totalHpp)}
          hint={`${summary.totalRevenue > 0 ? formatPct(summary.totalHpp / summary.totalRevenue * 100) : '0.0%'} dari omset${summary.unmappedQty > 0 ? ` | ${summary.unmappedQty} unit ditaksir` : ''}`}
          color="red"
          icon={Package}
        />

        <KpiCard
          label="Total Biaya Platform"
          value={formatRp(Math.abs(summary.totalFees - (summary.selisihOngkir || 0)))}
          hint={`${formatPct(Math.abs(summary.totalFees - (summary.selisihOngkir || 0)) / summary.totalRevenue * 100)} dari omset`}
          color="red"
          icon={CreditCard}
        />
        <KpiCard
          label="Laba Bersih Operasional"
          value={formatRp(summary.netOperatingProfit)}
          hint={`Net Margin ${formatPct(summary.netMargin)}`}
          color={isProfit ? 'green' : 'red'}
          icon={isProfit ? TrendingUp : TrendingDown}
        />
        <KpiCard
          label="Total Settlement (Dana Cair)"
          value={formatRp(summary.totalSettlement)}
          hint={`${summary.totalRevenue > 0 ? formatPct(summary.totalSettlement / summary.totalRevenue * 100) : '0.0%'} dari omset`}
          color="teal"
          icon={ShoppingCart}
        />
        <KpiCard
          label="Selisih Ongkir (Beban Penjual)"
          value={formatRp(Math.abs(summary.selisihOngkir || 0))}
          hint={`${summary.totalRevenue > 0 ? formatPct(Math.abs(summary.selisihOngkir || 0) / summary.totalRevenue * 100) : '0.0%'} dari omset`}
          color="red"
          icon={Truck}
        />
      </div>

      {/* Ad Card & Histogram Row */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column' }}>
          <KpiCard
            label="Biaya Iklan (TikTok Ads)"
            value={formatRp(summary.totalAds || 0)}
            hint={`${summary.totalRevenue > 0 ? formatPct((summary.totalAds || 0) / summary.totalRevenue * 100) : '0.0%'} dari omset`}
            color="red"
            icon={Megaphone}
            style={{ height: '100%', margin: 0 }}
          />
        </div>
        
        <div style={{ flex: '2 1 560px', display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ padding: '20px 24px', margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-head" style={{ marginBottom: '16px', padding: '0 0 12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>📊 Histogram Alokasi Keuangan (Cohort)</h2>
              <span className="badge orange" style={{ margin: 0 }}>Total Omset: {formatRp(summary.totalRevenue)}</span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end', 
              height: '110px', 
              padding: '10px 0',
              borderBottom: '2px solid var(--border-color)',
              gap: '12px',
              overflowX: 'auto'
            }}>
              {chartData.map((item, idx) => {
                const barHeight = (item.value / maxChartVal) * 80; 
                const pct = baseOmset > 0 ? (item.value / baseOmset) * 100 : 0;
                return (
                  <div key={idx} style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    minWidth: '55px',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 800, 
                      marginBottom: '4px',
                      color: 'var(--text-main)',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.label.includes('Rugi') && item.value > 0 ? '-' : ''}{formatRp(item.value).replace('Rp ', '')}
                    </span>

                    <div style={{
                      width: '100%',
                      maxWidth: '32px',
                      height: `${Math.max(barHeight, 4)}px`,
                      background: item.color,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease-in-out',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }} title={`${item.label}: ${formatRp(item.value)} (${pct.toFixed(1)}% dari omset)`}>
                      <span style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '7.5px',
                        fontWeight: 700,
                        color: 'var(--text-muted2)',
                        opacity: 0.8
                      }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>

                    <span style={{ 
                      fontSize: '9.5px', 
                      fontWeight: 700, 
                      marginTop: '6px',
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
        </div>
      </div>

      {/* Two Column */}
      <div className="two-col">
        {/* Fee Breakdown */}
        <div className="card">
          <div className="card-head">
            <h2>📊 Rincian Biaya Platform TikTok</h2>
            <span className="badge tiktok-badge">Total {formatRp(totalAbsFees)}</span>
          </div>
          <div className="progress-wrap">
            {feeItems.map((item) => {
              const abs = Math.abs(item.value);
              const pct = totalAbsFees > 0 ? (abs / totalAbsFees) * 100 : 0;
              const pctOfOmset = summary.totalRevenue > 0 ? (abs / summary.totalRevenue) * 100 : 0;
              return (
                <div className="prog-item" key={item.label}>
                  <div className="prog-lbl">
                    <span>{item.label}</span>
                    <span>{formatRp(abs)} ({formatPct(pctOfOmset)} omset)</span>
                  </div>
                  <div className="prog-bar">
                    <div
                      className="prog-fill fill-tiktok"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 10 SKU */}
        <div className="card">
          <div className="card-head">
            <h2>📦 Top 10 SKU Paling Laku</h2>
            <span className="badge orange">{skuList.length} SKU total</span>
          </div>
          <div className="stat-list">
            {skuList.slice(0, 10).map((sku, idx) => (
              <div className="stat-row" key={sku.sku}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 800,
                    background: idx < 3 ? 'rgba(238,59,95,0.15)' : 'var(--bg-hover)',
                    color: idx < 3 ? '#ee3b5f' : 'var(--text-muted)',
                    width: '20px', height: '20px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>
                      {sku.pname.length > 70 ? sku.pname.slice(0, 70) + '…' : sku.pname}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted2)' }}>
                      <code className="sku-code">{sku.sku}</code>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--accent-orange)' }}>{sku.qty} pcs</div>
                  <div style={{ fontSize: '11px', color: sku.margin >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    Margin {formatPct(sku.margin)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default TikTokDashboard;
