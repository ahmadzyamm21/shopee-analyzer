import React, { useState } from 'react';
import { Search, XCircle, FileText, Ban } from 'lucide-react';

const TikTokCancellationTracker = ({ batalSummary }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!batalSummary) return null;

  const {
    totalCount,
    withResiCount,
    noResiCount,
    totalValue,
    withResiValue,
    noResiValue,
    reasons,
    details
  } = batalSummary;

  const formatRp = (num) => {
    if (num === 0) return 'Rp 0';
    const formatted = Math.abs(Math.round(num)).toLocaleString('id-ID');
    return `Rp ${formatted}`;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDetails = React.useMemo(() => {
    if (!searchTerm) return details;
    const lower = searchTerm.toLowerCase();
    return details.filter(d => 
      (d.id && d.id.toLowerCase().includes(lower)) ||
      (d.date && d.date.toLowerCase().includes(lower)) ||
      (d.sku && d.sku.toLowerCase().includes(lower)) ||
      (d.pname && d.pname.toLowerCase().includes(lower)) ||
      (d.vname && d.vname.toLowerCase().includes(lower)) ||
      (d.cancelBy && d.cancelBy.toLowerCase().includes(lower)) ||
      (d.cancelReason && d.cancelReason.toLowerCase().includes(lower))
    );
  }, [details, searchTerm]);

  return (
    <div className="cancellations-container">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi tiktok-kpi red">
          <div className="kpi-lbl">Total Order Batal / Gagal</div>
          <div className="kpi-val red">{totalCount} pesanan</div>
          <div className="kpi-hint">Total volume pembatalan</div>
        </div>
        <div className="kpi tiktok-kpi orange">
          <div className="kpi-lbl">Gagal Kirim / Kurir (With Resi)</div>
          <div className="kpi-val orange">{withResiCount} pesanan</div>
          <div className="kpi-hint">Sudah dicetak resi / diserahkan kurir</div>
        </div>
        <div className="kpi tiktok-kpi blue">
          <div className="kpi-lbl">Batal Sebelum Kirim (No Resi)</div>
          <div className="kpi-val blue">{noResiCount} pesanan</div>
          <div className="kpi-hint">Dibatalkan pembeli / penjual di awal</div>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginTop: '20px' }}>
        <div className="kpi tiktok-kpi red">
          <div className="kpi-lbl">Total Nilai Bruto Batal</div>
          <div className="kpi-val red">{formatRp(totalValue)}</div>
          <div className="kpi-hint">Nilai transaksi yang hilang</div>
        </div>
        <div className="kpi tiktok-kpi orange">
          <div className="kpi-lbl">Nilai Rugi Ongkir (Est. Kurir)</div>
          <div className="kpi-val orange">{formatRp(withResiValue)}</div>
          <div className="kpi-hint">Kerugian potensi biaya operasional packing</div>
        </div>
        <div className="kpi tiktok-kpi blue">
          <div className="kpi-lbl">Nilai Penyelamatan (No Resi)</div>
          <div className="kpi-val blue">{formatRp(noResiValue)}</div>
          <div className="kpi-hint">Batal awal tanpa kerugian packing</div>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: '20px' }}>
        {/* Reasons Chart / List */}
        <div className="card">
          <div className="card-head">
            <h2>📊 Alasan Pembatalan Terbanyak</h2>
            <span className="badge red">{reasons.length} Alasan</span>
          </div>
          <div className="progress-wrap">
            {reasons.length > 0 ? (
              reasons
                .sort((a, b) => b.count - a.count)
                .map((item) => {
                  const pct = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                  return (
                    <div className="prog-item" key={item.reason}>
                      <div className="prog-lbl">
                        <span>{item.reason}</span>
                        <span>{item.count} pesanan ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="prog-bar">
                        <div
                          className="prog-fill fill-tiktok"
                          style={{ width: `${pct}%`, backgroundColor: '#ef4444' }}
                        />
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center text-muted" style={{ padding: '20px' }}>
                Tidak ada data alasan pembatalan.
              </div>
            )}
          </div>
        </div>

        {/* Search & Detail List */}
        <div className="card">
          <div className="card-head">
            <h2>📋 Daftar Rincian Barang Batal</h2>
            <span className="badge tiktok-badge">{filteredDetails.length} Item</span>
          </div>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div className="search-input-wrapper" style={{ margin: 0, width: '100%' }}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Cari SKU, Nama Barang, Alasan, atau Pembatal..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div className="stat-list" style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 16px' }}>
            {filteredDetails.length > 0 ? (
              filteredDetails.map((detail, idx) => (
                <div className="stat-row" key={idx} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge red" style={{ fontSize: '9px', padding: '2px 6px' }}>
                        {detail.cancelBy === 'Buyer' ? 'Pembeli' : detail.cancelBy === 'Seller' ? 'Penjual' : 'Sistem/Kurir'}
                      </span>
                      <code className="sku-code" style={{ fontSize: '10.5px' }}>{detail.id}</code>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {detail.pname}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>
                      SKU: <code className="sku-code" style={{ padding: '0 2px' }}>{detail.sku}</code> {detail.vname && `| Variasi: ${detail.vname}`}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-red)', marginTop: '4px', fontStyle: 'italic' }}>
                      Alasan: {detail.cancelReason}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '12px', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-muted)' }}>{detail.qty} pcs</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted2)' }}>{detail.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted" style={{ padding: '30px' }}>
                Tidak ada rincian barang batal yang cocok.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokCancellationTracker;
