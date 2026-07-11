import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ListOrdered, Filter } from 'lucide-react';

const TikTokAllOrders = ({ result }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  if (!result || !result.allOrders) return null;

  const { allOrders } = result;

  const formatRp = (num) => {
    if (num === 0) return 'Rp 0';
    const isNeg = num < 0;
    const formatted = Math.abs(Math.round(num)).toLocaleString('id-ID');
    return isNeg ? `− Rp ${formatted}` : `Rp ${formatted}`;
  };

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(allOrders.map(o => o.orderCategory));
    return Array.from(cats).sort();
  }, [allOrders]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts = { all: allOrders.length };
    allOrders.forEach(o => {
      counts[o.orderCategory] = (counts[o.orderCategory] || 0) + 1;
    });
    return counts;
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    let orders = allOrders;
    
    if (statusFilter !== 'all') {
      orders = orders.filter(o => o.orderCategory === statusFilter);
    }
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      orders = orders.filter(o =>
        (o.id && o.id.toLowerCase().includes(lower)) ||
        (o.date && o.date.toLowerCase().includes(lower)) ||
        (o.resi && o.resi.toLowerCase().includes(lower)) ||
        (o.status && o.status.toLowerCase().includes(lower)) ||
        o.items.some(item =>
          (item.pname && item.pname.toLowerCase().includes(lower)) ||
          (item.sku && item.sku.toLowerCase().includes(lower)) ||
          (item.vname && item.vname.toLowerCase().includes(lower))
        )
      );
    }
    
    return orders;
  }, [allOrders, searchTerm, statusFilter]);

  const getStatusBadge = (category) => {
    switch (category) {
      case 'Selesai':
        return <span className="badge green">Selesai</span>;
      case 'Retur/Refund':
        return <span className="badge" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>Retur/Refund</span>;
      case 'Dibatalkan':
        return <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Dibatalkan</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.3)' }}>{category}</span>;
    }
  };

  const getFilterBtnStyle = (filter) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    border: statusFilter === filter ? '1px solid #ee3b5f' : '1px solid var(--border-color)',
    background: statusFilter === filter ? 'rgba(238,59,95,0.15)' : 'transparent',
    color: statusFilter === filter ? '#ee3b5f' : 'var(--text-muted)',
    fontWeight: statusFilter === filter ? 700 : 500,
    fontSize: '11.5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  });

  return (
    <div className="orders-list-container">
      {/* Search & Filter Bar */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari ID Pesanan, No. Resi, Nama Produk, SKU, atau Tanggal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="search-results-count">
          Total <strong>{filteredOrders.length}</strong> dari {allOrders.length} pesanan
        </div>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button style={getFilterBtnStyle('all')} onClick={() => setStatusFilter('all')}>
          <Filter size={12} />
          Semua ({categoryCounts.all || 0})
        </button>
        {categories.map(cat => (
          <button key={cat} style={getFilterBtnStyle(cat)} onClick={() => setStatusFilter(cat)}>
            {cat} ({categoryCounts[cat] || 0})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-head">
          <h2>📋 Daftar Semua Pesanan TikTok</h2>
          <span className="badge tiktok-badge">{filteredOrders.length} Order</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>No. Pesanan</th>
                <th>No. Resi</th>
                <th>Waktu Pesanan</th>
                <th>Total Item</th>
                <th className="r">Total (Net)</th>
                <th className="r">Dana Dilepas</th>
                <th>Status</th>
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
                        <td className="font-semibold">{order.totalQty} unit</td>
                        <td className="r font-bold text-teal">{formatRp(order.totalNet)}</td>
                        <td className={`r font-bold ${order.payout < 0 ? 'text-red' : order.payout > 0 ? 'text-green' : 'text-muted'}`}>
                          {formatRp(order.payout)}
                        </td>
                        <td>
                          {getStatusBadge(order.orderCategory)}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                          <td></td>
                          <td colSpan="7" style={{ padding: '16px 24px' }}>
                            <div className="expanded-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {/* Cancel info for cancelled/returned orders */}
                              {(order.cancelType || order.cancelReason) && (
                                <div style={{
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  background: order.orderCategory === 'Retur/Refund'
                                    ? 'rgba(251,191,36,0.08)'
                                    : 'rgba(239,68,68,0.08)',
                                  border: order.orderCategory === 'Retur/Refund'
                                    ? '1px solid rgba(251,191,36,0.2)'
                                    : '1px solid rgba(239,68,68,0.2)',
                                  fontSize: '11.5px'
                                }}>
                                  {order.cancelType && (
                                    <div style={{ marginBottom: '2px' }}>
                                      <span className="text-muted">Tipe: </span>
                                      <strong>{order.cancelType}</strong>
                                    </div>
                                  )}
                                  {order.cancelReason && (
                                    <div>
                                      <span className="text-muted">Alasan: </span>
                                      <span>{order.cancelReason}</span>
                                    </div>
                                  )}
                                  {order.refund > 0 && (
                                    <div style={{ marginTop: '2px' }}>
                                      <span className="text-muted">Refund: </span>
                                      <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatRp(order.refund)}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <h4 style={{ fontSize: '11px', color: 'var(--text-muted2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Rincian Produk di Pesanan Ini:
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

                              {/* Fee breakdown */}
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted2)', fontWeight: 'bold', marginBottom: '4px' }}>
                                  <span>POTONGAN BIAYA PLATFORM (TIKTOK SHOP):</span>
                                  <span style={{ color: '#ee3b5f' }}>{formatRp(order.fees)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', paddingLeft: '8px' }}>
                                  <span className="text-muted">Komisi Platform:</span>
                                  <span>{formatRp(order.feesBreakdown.komisiPlatform)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', paddingLeft: '8px' }}>
                                  <span className="text-muted">Komisi Afiliasi & Kreator:</span>
                                  <span>{formatRp(order.feesBreakdown.komisiAfiliasi)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', paddingLeft: '8px' }}>
                                  <span className="text-muted">Logistik & Ongkir Net:</span>
                                  <span>{formatRp(order.feesBreakdown.logistik)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', paddingLeft: '8px' }}>
                                  <span className="text-muted">Komisi Dinamis:</span>
                                  <span>{formatRp(order.feesBreakdown.komisiDinamis)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', paddingLeft: '8px' }}>
                                  <span className="text-muted">Cashback Bonus:</span>
                                  <span>{formatRp(order.feesBreakdown.cashback)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', paddingLeft: '8px' }}>
                                  <span className="text-muted">Pemrosesan Pesanan:</span>
                                  <span>{formatRp(order.feesBreakdown.prosesPesanan)}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-orange)', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                                  <span>Dana Bersih Dilepas (Settlement):</span>
                                  <span>{formatRp(order.payout)}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 8px', borderTop: '1px solid var(--border-color)' }}>
                                <span className="text-muted">Total HPP Barang (Modal):</span>
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
                  <td colSpan="8" className="text-center text-muted" style={{ padding: '30px' }}>
                    Tidak ada pesanan yang cocok dengan pencarian.
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

export default TikTokAllOrders;
