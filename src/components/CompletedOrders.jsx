import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const CompletedOrders = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});

  if (!data || !data.completedOrders) return null;

  const { completedOrders } = data;

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
    if (!searchTerm) return completedOrders;
    const lower = searchTerm.toLowerCase();
    return completedOrders.filter(o => 
      (o.id && o.id.toLowerCase().includes(lower)) ||
      (o.date && o.date.toLowerCase().includes(lower)) ||
      o.items.some(item => 
        (item.name && item.name.toLowerCase().includes(lower)) || 
        (item.variation && item.variation.toLowerCase().includes(lower))
      )
    );
  }, [completedOrders, searchTerm]);

  return (
    <div className="orders-list-container">
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari ID Pesanan, Nama Produk, atau Tanggal..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="search-results-count">
          Total <strong>{filteredOrders.length}</strong> pesanan selesai
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>📋 Daftar Rincian Pesanan Selesai (Januari)</h2>
          <span className="badge green">{filteredOrders.length} Order</span>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>No. Pesanan</th>
                <th>Waktu Pesanan Dibuat</th>
                <th>Total Item</th>
                <th className="r">Total Belanja (Net)</th>
                <th className="r">Dana Dilepas Shopee</th>
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
                        <td className="text-muted">{order.date}</td>
                        <td className="font-semibold">{order.totalQty} unit</td>
                        <td className="r font-bold text-teal">{formatRp(order.totalNet)}</td>
                        <td className="r font-bold text-green">
                          {order.payout > 0 ? formatRp(order.payout) : 'Belum Dilepas'}
                        </td>
                        <td>
                          <span className="badge green">{order.status}</span>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr className="expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                          <td></td>
                          <td colSpan="6" style={{ padding: '16px 24px' }}>
                            <div className="expanded-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <h4 style={{ fontSize: '11px', color: 'var(--text-muted2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Rincian Produk di Pesanan Ini:
                              </h4>
                              <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {order.items.map((item, idx) => (
                                  <li key={idx} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                                    <span>
                                      <strong>{item.name}</strong> 
                                      {item.variation && <span className="text-muted"> ({item.variation})</span>}
                                      <span className="text-teal font-semibold"> x {item.qty}</span>
                                    </span>
                                    <span>
                                      {formatRp(item.discPrice * item.qty)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                                <span>Gross Product Price (Sebelum Diskon):</span>
                                <span>{formatRp(order.totalBruto)}</span>
                              </div>
                              {order.diskonSeller > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-red)' }}>
                                  <span>Potongan Diskon Seller:</span>
                                  <span>- {formatRp(order.diskonSeller)}</span>
                                </div>
                              )}
                              {order.refund > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--accent-yellow)' }}>
                                  <span>Refund Dikembalikan Ke Pembeli:</span>
                                  <span>- {formatRp(order.refund)}</span>
                                </div>
                              )}

                              {order.fees && (
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
                                  <h5 style={{ fontSize: '10px', color: 'var(--text-muted2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                    Rincian Potongan Shopee &amp; Transaksi:
                                  </h5>
                                  
                                  {order.fees.biayaAdmin !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Biaya Administrasi Shopee:</span>
                                      <span>- {formatRp(Math.abs(order.fees.biayaAdmin))}</span>
                                    </div>
                                  )}
                                  {order.fees.biayaLayanan !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Biaya Layanan (GO-XTRA, dll):</span>
                                      <span>- {formatRp(Math.abs(order.fees.biayaLayanan))}</span>
                                    </div>
                                  )}
                                  {order.fees.biayaTransaksi !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Biaya Transaksi / Metode Pembayaran:</span>
                                      <span>- {formatRp(Math.abs(order.fees.biayaTransaksi))}</span>
                                    </div>
                                  )}
                                  {order.fees.biayaKomisi !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Biaya Komisi AMS (Affiliate):</span>
                                      <span>- {formatRp(Math.abs(order.fees.biayaKomisi))}</span>
                                    </div>
                                  )}
                                  {order.fees.biayaProses !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Biaya Proses Pesanan:</span>
                                      <span>- {formatRp(Math.abs(order.fees.biayaProses))}</span>
                                    </div>
                                  )}
                                  {order.fees.premi !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Biaya Premi / Asuransi Kirim:</span>
                                      <span>- {formatRp(Math.abs(order.fees.premi))}</span>
                                    </div>
                                  )}
                                  {order.fees.hematKirim !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Biaya Program Hemat Kirim:</span>
                                      <span>- {formatRp(Math.abs(order.fees.hematKirim))}</span>
                                    </div>
                                  )}
                                  {order.fees.biayaKampanye !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Biaya Kampanye (Campaign):</span>
                                      <span>- {formatRp(Math.abs(order.fees.biayaKampanye))}</span>
                                    </div>
                                  )}
                                  {order.fees.promoOngkir !== 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--accent-red)' }}>
                                      <span>Promo Gratis Ongkir dari Penjual:</span>
                                      <span>- {formatRp(Math.abs(order.fees.promoOngkir))}</span>
                                    </div>
                                  )}
                                  {order.fees.netBiayaKirim !== 0 && (
                                    <div style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      fontSize: '11.5px', 
                                      color: order.fees.netBiayaKirim < 0 ? 'var(--accent-red)' : 'var(--accent-green)' 
                                    }}>
                                      <span>Selisih Ongkos Kirim (Net):</span>
                                      <span>{order.fees.netBiayaKirim < 0 ? `- ${formatRp(Math.abs(order.fees.netBiayaKirim))}` : `+ ${formatRp(order.fees.netBiayaKirim)}`}</span>
                                    </div>
                                  )}
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    fontSize: '12px', 
                                    fontWeight: 'bold', 
                                    borderTop: '1px solid var(--border-color)', 
                                    paddingTop: '8px', 
                                    marginTop: '4px',
                                    color: 'var(--accent-green)' 
                                  }}>
                                    <span>Total Dana Bersih Diterima:</span>
                                    <span>{formatRp(order.payout)}</span>
                                  </div>
                                </div>
                              )}
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
                    Tidak ada pesanan selesai yang cocok dengan pencarian.
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

export default CompletedOrders;
