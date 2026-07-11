import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, AlertTriangle, AlertCircle, TrendingDown, HelpCircle } from 'lucide-react';

const TikTokProblematicOrders = ({ result }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [problemFilter, setProblemFilter] = useState('all');

  if (!result || !result.problematicOrders) return null;

  const { problematicOrders } = result;

  const formatRp = (num) => {
    if (num === 0) return 'Rp 0';
    const isNeg = num < 0;
    const formatted = Math.abs(Math.round(num)).toLocaleString('id-ID');
    return isNeg ? `− Rp ${formatted}` : `Rp ${formatted}`;
  };

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Count per problem type
  const problemCounts = useMemo(() => {
    const counts = {
      all: problematicOrders.length,
      batalWithResi: 0,
      rugi: 0,
      stagnan: 0
    };
    problematicOrders.forEach(o => {
      if (o.problems.includes('Batal Setelah Resi')) counts.batalWithResi++;
      if (o.problems.includes('Penjualan Rugi')) counts.rugi++;
      if (o.problems.includes('Pengiriman Stagnan')) counts.stagnan++;
    });
    return counts;
  }, [problematicOrders]);

  const filteredOrders = useMemo(() => {
    let orders = problematicOrders;

    if (problemFilter === 'batalWithResi') {
      orders = orders.filter(o => o.problems.includes('Batal Setelah Resi'));
    } else if (problemFilter === 'rugi') {
      orders = orders.filter(o => o.problems.includes('Penjualan Rugi'));
    } else if (problemFilter === 'stagnan') {
      orders = orders.filter(o => o.problems.includes('Pengiriman Stagnan'));
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      orders = orders.filter(o =>
        (o.id && o.id.toLowerCase().includes(lower)) ||
        (o.date && o.date.toLowerCase().includes(lower)) ||
        (o.resi && o.resi.toLowerCase().includes(lower)) ||
        o.items.some(item =>
          (item.pname && item.pname.toLowerCase().includes(lower)) ||
          (item.sku && item.sku.toLowerCase().includes(lower)) ||
          (item.vname && item.vname.toLowerCase().includes(lower))
        )
      );
    }

    return orders;
  }, [problematicOrders, searchTerm, problemFilter]);

  const getProblemBadges = (problems) => {
    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {problems.map((p, idx) => {
          let style = {};
          if (p === 'Pengiriman Stagnan') {
            style = { background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' };
          } else if (p === 'Batal Setelah Resi') {
            style = { background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' };
          } else if (p === 'Penjualan Rugi') {
            style = { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' };
          }
          return (
            <span key={idx} className="badge" style={{ ...style, fontSize: '10.5px', padding: '3px 8px' }}>
              {p}
            </span>
          );
        })}
      </div>
    );
  };

  const getFilterBtnStyle = (filter) => {
    const isActive = problemFilter === filter;
    let activeBorder = '1px solid var(--border-color)';
    let activeBg = 'transparent';
    let activeColor = 'var(--text-muted)';
    
    if (isActive) {
      if (filter === 'all') { activeBorder = '1px solid #ee3b5f'; activeBg = 'rgba(238,59,95,0.15)'; activeColor = '#ee3b5f'; }
      else if (filter === 'batalWithResi') { activeBorder = '1px solid #f43f5e'; activeBg = 'rgba(244,63,94,0.15)'; activeColor = '#f43f5e'; }
      else if (filter === 'rugi') { activeBorder = '1px solid #ef4444'; activeBg = 'rgba(239,68,68,0.15)'; activeColor = '#ef4444'; }
      else if (filter === 'stagnan') { activeBorder = '1px solid #fbbf24'; activeBg = 'rgba(251,191,36,0.15)'; activeColor = '#fbbf24'; }
    }

    return {
      padding: '6px 14px',
      borderRadius: '20px',
      border: activeBorder,
      background: activeBg,
      color: activeColor,
      fontWeight: isActive ? 700 : 500,
      fontSize: '11.5px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    };
  };

  const getProblemExplanation = () => {
    switch (problemFilter) {
      case 'batalWithResi':
        return (
          <div className="card-note alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '0 0 16px 0', padding: '12px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: '8px' }}>
            <AlertCircle size={18} style={{ color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#f43f5e', fontSize: '12.5px' }}>Batal Setelah Resi Keluar (Gagal Kirim / COD Ditolak)</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Pesanan yang dibatalkan oleh sistem, kurir, atau pembeli padahal nomor resi pengiriman sudah dikeluarkan. Ini menandakan barang kemungkinan besar sudah diserahkan ke ekspedisi namun gagal terkirim (misal: COD ditolak pembeli, alamat salah, atau kurir gagal antar).
              </p>
            </div>
          </div>
        );
      case 'rugi':
        return (
          <div className="card-note alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '0 0 16px 0', padding: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px' }}>
            <TrendingDown size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#ef4444', fontSize: '12.5px' }}>Penjualan Rugi (Jual Rugi / Minus Margin)</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Daftar pesanan selesai namun laba bersih transaksinya minus (Dana Settlement kurang dari HPP Modal). Hal ini terjadi karena potongan komisi platform, diskon yang ditanggung penjual, atau selisih ongkir yang terlalu besar melebihi margin produk Anda.
              </p>
            </div>
          </div>
        );
      case 'stagnan':
        return (
          <div className="card-note alert-warning" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '0 0 16px 0', padding: '12px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px' }}>
            <AlertTriangle size={18} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fbbf24', fontSize: '12.5px' }}>Pengiriman Stagnan / Mandek (&gt; 5 Hari)</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Daftar pesanan dengan status dikirim, tetapi tanggal pengiriman (Shipped Time) sudah lebih dari 5 hari dibanding tanggal terlama laporan ditarik, tanpa adanya konfirmasi penerimaan barang (Delivered). Hal ini mengindikasikan logistik mandek atau hilang di perjalanan.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="card-note" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '0 0 16px 0', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Pusat Kontrol Pesanan Bermasalah</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Gunakan filter di bawah untuk menganalisis pesanan yang rugi, pengiriman stagnan/mandek di ekspedisi, atau paket gagal kirim (batal setelah resi keluar). Klik baris pesanan untuk melihat detail rincian produk dan biaya transaksinya.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="orders-list-container">
      {/* Explanation Banner */}
      {getProblemExplanation()}

      {/* Search & Count Bar */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari ID Pesanan, No. Resi, Nama Produk, atau SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-results-count">
          Terfilter <strong>{filteredOrders.length}</strong> pesanan bermasalah
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button style={getFilterBtnStyle('all')} onClick={() => setProblemFilter('all')}>
          Semua Masalah ({problemCounts.all})
        </button>
        <button style={getFilterBtnStyle('stagnan')} onClick={() => setProblemFilter('stagnan')}>
          ⚠️ Pengiriman Stagnan ({problemCounts.stagnan})
        </button>
        <button style={getFilterBtnStyle('batalWithResi')} onClick={() => setProblemFilter('batalWithResi')}>
          🚫 Gagal Kirim / Batal Resi ({problemCounts.batalWithResi})
        </button>
        <button style={getFilterBtnStyle('rugi')} onClick={() => setProblemFilter('rugi')}>
          💸 Penjualan Rugi ({problemCounts.rugi})
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-head">
          <h2>📋 Log Pesanan Bermasalah TikTok</h2>
          <span className="badge red-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            {filteredOrders.length} Temuan
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>No. Pesanan</th>
                <th>No. Resi</th>
                <th>Waktu Pesanan</th>
                <th>Status TikTok</th>
                <th className="r">Dana Dilepas</th>
                <th>Jenis Masalah</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrders[order.id];

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="order-row cursor-pointer" onClick={() => toggleExpand(order.id)}>
                        <td className="text-center">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                        <td><code className="sku-code">{order.id}</code></td>
                        <td>
                          {order.resi && order.resi !== '-' ? (
                            <span className="badge tiktok-badge" style={{ fontFamily: 'monospace' }}>{order.resi}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-muted">{order.date}</td>
                        <td>
                          <span className={`badge ${order.orderCategory === 'Selesai' ? 'green' : order.orderCategory === 'Dibatalkan' ? 'red' : 'yellow'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className={`r font-bold ${order.payout < 0 ? 'text-red' : order.payout > 0 ? 'text-green' : 'text-muted'}`}>
                          {formatRp(order.payout)}
                        </td>
                        <td>
                          {getProblemBadges(order.problems)}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                          <td></td>
                          <td colSpan="6" style={{ padding: '16px 24px' }}>
                            <div className="expanded-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {/* Reason details */}
                              {(order.cancelType || order.cancelReason) && (
                                <div style={{
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  background: 'rgba(239,68,68,0.06)',
                                  border: '1px solid rgba(239,68,68,0.15)',
                                  fontSize: '11.5px',
                                  marginBottom: '8px'
                                }}>
                                  {order.cancelType && (
                                    <div>
                                      <span className="text-muted">Tipe Pembatalan/Retur: </span>
                                      <strong>{order.cancelType}</strong>
                                    </div>
                                  )}
                                  {order.cancelReason && (
                                    <div style={{ marginTop: '2px' }}>
                                      <span className="text-muted">Alasan: </span>
                                      <span>{order.cancelReason}</span>
                                    </div>
                                  )}
                                  {order.refund > 0 && (
                                    <div style={{ marginTop: '2px' }}>
                                      <span className="text-muted">Dana Pengembalian ke Pembeli: </span>
                                      <strong style={{ color: '#ef4444' }}>{formatRp(order.refund)}</strong>
                                    </div>
                                  )}
                                </div>
                              )}

                              <h4 style={{ fontSize: '11px', color: 'var(--text-muted2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Rincian Produk:
                              </h4>
                              <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {order.items.map((item, idx) => (
                                  <li key={idx} style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span>
                                        <strong>{item.pname}</strong>
                                        {item.vname && <span className="text-muted"> ({item.vname})</span>}
                                        <span className="text-teal font-semibold"> x {item.qty}</span>
                                      </span>
                                      <span>
                                        {formatRp(item.revenue)}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                                      <span className="text-muted">Seller SKU: </span>
                                      {item.sku ? (
                                        <code className="sku-code">{item.sku}</code>
                                      ) : (
                                        <span style={{ color: '#ef4444', fontWeight: 600 }}>[KOSONG / NONE]</span>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                                <span>Jumlah Omset Produk (Revenue):</span>
                                <span>{formatRp(order.totalNet)}</span>
                              </div>

                              {/* HPP and Profit details */}
                              <div style={{
                                marginTop: '12px',
                                padding: '12px',
                                backgroundColor: 'rgba(0,0,0,0.15)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted2)', fontWeight: 'bold' }}>
                                  <span>BIAYA PLATFORM (TIKTOK SHOP):</span>
                                  <span style={{ color: '#ee3b5f' }}>{formatRp(order.fees)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', paddingLeft: '8px' }}>
                                  <span className="text-muted">Komisi Platform & Afiliasi:</span>
                                  <span>{formatRp(order.feesBreakdown.komisiPlatform + order.feesBreakdown.komisiAfiliasi)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', paddingLeft: '8px' }}>
                                  <span className="text-muted">Logistik & Ongkir Net:</span>
                                  <span>{formatRp(order.feesBreakdown.logistik)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-orange)', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                                  <span>Dana Bersih Dilepas (Settlement):</span>
                                  <span>{formatRp(order.payout)}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 8px', borderTop: '1px solid var(--border-color)' }}>
                                <span className="text-muted">HPP Modal Barang:</span>
                                <span style={{ color: 'var(--accent-red)' }}>- {formatRp(order.hpp)}</span>
                              </div>

                              <div style={{
                                display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold',
                                padding: '6px 8px', borderRadius: '4px',
                                backgroundColor: order.payout - order.hpp >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'
                              }}>
                                <span>Laba Bersih Transaksi (Net Profit):</span>
                                <span style={{ color: order.payout - order.hpp >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                  {formatRp(order.payout - order.hpp)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted" style={{ padding: '30px' }}>
                    Tidak ada pesanan bermasalah yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TikTokProblematicOrders;
