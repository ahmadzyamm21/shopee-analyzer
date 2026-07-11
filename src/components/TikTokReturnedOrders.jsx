import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const TikTokReturnedOrders = ({ result }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});

  if (!result || !result.returnedOrders) return null;

  const { returnedOrders } = result;

  const formatRp = (num) => {
    if (num === 0) return 'Rp 0';
    const isNeg = num < 0;
    const formatted = Math.abs(Math.round(num)).toLocaleString('id-ID');
    return isNeg ? `− Rp ${formatted}` : `Rp ${formatted}`;
  };

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredOrders = React.useMemo(() => {
    if (!searchTerm) return returnedOrders;
    const lower = searchTerm.toLowerCase();
    return returnedOrders.filter(o => 
      (o.id && o.id.toLowerCase().includes(lower)) ||
      (o.date && o.date.toLowerCase().includes(lower)) ||
      (o.resi && o.resi.toLowerCase().includes(lower)) ||
      o.items.some(item => 
        (item.pname && item.pname.toLowerCase().includes(lower)) || 
        (item.sku && item.sku.toLowerCase().includes(lower)) ||
        (item.vname && item.vname.toLowerCase().includes(lower))
      )
    );
  }, [returnedOrders, searchTerm]);

  return (
    <div className="orders-list-container">
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari ID Pesanan, No. Resi, Nama Produk, SKU, atau Tanggal..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="search-results-count">
          Total <strong>{filteredOrders.length}</strong> pesanan retur/refund
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>📋 Log Pesanan Retur / Refund (TikTok)</h2>
          <span className="badge red">{filteredOrders.length} Retur</span>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>No. Pesanan</th>
                <th>No. Resi</th>
                <th>Waktu Pesanan Dibuat</th>
                <th>Total Item</th>
                <th className="r">Refund Ke Pembeli</th>
                <th className="r">Hasil Ke Saya (Net)</th>
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
                        <td className="r font-bold text-orange">
                          {order.refund > 0 ? `− ${formatRp(order.refund)}` : 'Rp 0'}
                        </td>
                        <td className={`r font-bold ${order.payout < 0 ? 'text-red' : 'text-green'}`}>
                          {formatRp(order.payout)}
                        </td>
                        <td>
                          <span className="badge red" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Retur</span>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr className="expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                          <td></td>
                          <td colSpan="7" style={{ padding: '16px 24px' }}>
                            <div className="expanded-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <h4 style={{ fontSize: '11px', color: 'var(--text-muted2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Rincian Produk Terkait Retur:
                              </h4>
                              <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {order.items.map((item, idx) => (
                                  <li key={idx} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                                    <span>
                                      <strong>{item.pname}</strong> 
                                      {item.vname && <span className="text-muted"> ({item.vname})</span>}
                                      <span className="text-teal font-semibold"> x {item.qty}</span>
                                    </span>
                                    <span>
                                      {formatRp(item.revenue)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                                <span>Jumlah Omset Produk Awal:</span>
                                <span>{formatRp(order.totalNet)}</span>
                              </div>

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
                                  <span>BIAYA DAN PENYESUAIAN TRANSAKSI (TIKTOK SHOP):</span>
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
                                  <span>Dana Bersih Dilepas (Hasil Ke Saya):</span>
                                  <span style={{ color: order.payout < 0 ? 'var(--accent-red)' : 'inherit' }}>{formatRp(order.payout)}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 8px', borderTop: '1px solid var(--border-color)' }}>
                                <span className="text-muted">Total HPP Barang (Modal Terbuang/Rugi HPP):</span>
                                <span style={{ color: 'var(--accent-red)' }}>- {formatRp(order.hpp)}</span>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'rgba(239,68,68,0.08)' }}>
                                <span>Total Kerugian Transaksi Retur:</span>
                                <span style={{ color: 'var(--accent-red)' }}>
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
                    Tidak ada pesanan retur yang cocok dengan pencarian.
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

export default TikTokReturnedOrders;
