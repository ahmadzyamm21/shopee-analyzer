import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const ReturnedOrders = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});

  if (!data || !data.returnedOrders) return null;

  const { returnedOrders } = data;

  const formatRp = (num) => {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
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
      (o.returnStatus && o.returnStatus.toLowerCase().includes(lower)) ||
      o.items.some(item => 
        (item.name && item.name.toLowerCase().includes(lower)) || 
        (item.variation && item.variation.toLowerCase().includes(lower))
      )
    );
  }, [returnedOrders, searchTerm]);

  return (
    <div className="orders-list-container">
      {/* Alert info */}
      <div className="alert alert-error" style={{ background: 'rgba(234, 179, 8, 0.05)', borderColor: 'rgba(234, 179, 8, 0.2)', color: 'var(--accent-yellow)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <AlertTriangle size={24} />
        <div>
          <strong>Pengembalian Barang / Dana (Refund):</strong>
          <p style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text-muted)' }}>
            Daftar pesanan di bawah ini adalah pesanan selesai yang mengalami pengembalian barang secara parsial/penuh, komplain, atau dana yang sukses di-refund oleh Shopee ke pembeli.
          </p>
        </div>
      </div>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari ID Pesanan, Alasan, atau Nama Produk..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="search-results-count">
          Total <strong>{filteredOrders.length}</strong> pesanan retur
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>📋 Log Transaksi Retur &amp; Komplain Pembeli</h2>
          <span className="badge red">{filteredOrders.length} Retur</span>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>No. Pesanan</th>
                <th>Tanggal Order</th>
                <th className="r">Kuantitas Retur</th>
                <th className="r">Nilai Belanja</th>
                <th className="r text-red">Dana Refund Pembeli</th>
                <th>Status Transaksi</th>
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
                        <td className="text-muted">{order.date}</td>
                        <td className="r font-bold text-yellow">{order.totalQtyRetur} unit</td>
                        <td className="r">{formatRp(order.totalNet)}</td>
                        <td className="r font-bold text-red">
                          {order.refund > 0 ? formatRp(order.refund) : formatRp(Math.abs(order.refund))}
                        </td>
                        <td>
                          <span className="badge red">{order.returnStatus}</span>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr className="expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                          <td></td>
                          <td colSpan="6" style={{ padding: '16px 24px' }}>
                            <div className="expanded-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <h4 style={{ fontSize: '11px', color: 'var(--text-muted2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Rincian Item yang Terkena Retur:
                              </h4>
                              <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {order.items.map((item, idx) => (
                                  <li key={idx} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                                    <span>
                                      <strong>{item.name}</strong> 
                                      {item.variation && <span className="text-muted"> ({item.variation})</span>}
                                      <span className="text-yellow font-semibold"> x {item.qty} (Jumlah Retur)</span>
                                    </span>
                                    <span>
                                      {formatRp(item.discPrice * item.qty)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted2)', marginTop: '8px' }}>
                                <span>No. Pesanan Shopee:</span>
                                <code>{order.id}</code>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted2)' }}>
                                <span>Tanggal Pesanan Masuk:</span>
                                <span>{order.date}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-red)', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                                <span>Total Uang yang Berhasil Direfund Shopee:</span>
                                <span>{order.refund > 0 ? formatRp(order.refund) : formatRp(Math.abs(order.refund))}</span>
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
                  <td colSpan="7" className="text-center py-8 text-muted">
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

export default ReturnedOrders;
