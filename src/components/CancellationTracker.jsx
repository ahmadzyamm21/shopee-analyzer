import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, UserCheck, Truck, Search } from 'lucide-react';

const CancellationTracker = ({ batalSummary }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!batalSummary) return null;

  const formatRp = (num) => {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDetails = React.useMemo(() => {
    if (!searchTerm) return batalSummary.details;
    const lower = searchTerm.toLowerCase();
    return batalSummary.details.filter(d => 
      (d.id && d.id.toLowerCase().includes(lower)) || 
      (d.product && d.product.toLowerCase().includes(lower)) || 
      (d.reason && d.reason.toLowerCase().includes(lower)) ||
      (d.resi && d.resi.toLowerCase().includes(lower))
    );
  }, [batalSummary.details, searchTerm]);

  return (
    <div className="cancellation-container">
      {/* KPI GRID CANCEL */}
      <div className="kpi-grid">
        <div className="kpi red">
          <span className="kpi-lbl">Total Pesanan Batal</span>
          <span className="kpi-val red">{batalSummary.totalCount} Pesanan</span>
          <span className="kpi-hint">Pesanan yang tidak diselesaikan oleh sistem/pembeli</span>
        </div>

        <div className="kpi blue">
          <span className="kpi-lbl">Total Potensi Omzet Hilang</span>
          <span className="kpi-val blue">{formatRp(batalSummary.totalValue)}</span>
          <span className="kpi-hint">Nilai bruto total pesanan yang batal</span>
        </div>

        <div className="kpi orange">
          <span className="kpi-lbl">Batal Sebelum Kirim (Tanpa Resi)</span>
          <span className="kpi-val orange">{batalSummary.noResiCount} Order</span>
          <span className="kpi-hint">Nilai: {formatRp(batalSummary.noResiValue)} · Belum ada pickup</span>
        </div>

        <div className="kpi pink">
          <span className="kpi-lbl">Batal Setelah Kirim (Ada Resi)</span>
          <span className="kpi-val pink">{batalSummary.withResiCount} Order</span>
          <span className="kpi-hint">Nilai: {formatRp(batalSummary.withResiValue)} · Sudah dicetak resi</span>
        </div>
      </div>

      <div className="two-col">
        {/* REASONS CARD */}
        <div className="card">
          <div className="card-head">
            <h2>📢 Penyebab &amp; Alasan Pembatalan Pesanan</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Alasan Pembatalan</th>
                <th className="r">Jumlah Order</th>
                <th className="r">Estimasi Nilai</th>
              </tr>
            </thead>
            <tbody>
              {batalSummary.reasons.length > 0 ? (
                batalSummary.reasons.map((item, idx) => {
                  // Calculate total value for this reason
                  const reasonValue = batalSummary.details
                    .filter(d => d.reason === item.reason)
                    .reduce((acc, d) => acc + d.total, 0);

                  return (
                    <tr key={idx}>
                      <td className="font-medium">{item.reason}</td>
                      <td className="r font-bold text-red">{item.count} order</td>
                      <td className="r">{formatRp(reasonValue)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    Tidak ada data alasan pembatalan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* INSIGHT CARD */}
        <div className="card justify-between flex flex-col">
          <div className="card-head">
            <h2>💡 Rekomendasi Tindakan Operasional</h2>
          </div>
          <div className="insight-content p-6">
            <div className="insight-item mb-4">
              <div className="insight-title color-red">
                <Truck size={16} />
                <span>Pengiriman Gagal (Kurir &amp; Sistem)</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Jika banyak pembatalan berstatus "Pengiriman gagal", ini biasanya disebabkan masalah di ekspedisi (alamat pembeli tidak ditemukan, COD ditolak, atau overload gudang kurir). Lakukan pemantauan berkala ekspedisi yang bermasalah dan matikan opsi kurir tersebut jika return ratenya terlalu tinggi.
              </p>
            </div>

            <div className="insight-item">
              <div className="insight-title color-yellow">
                <UserCheck size={16} />
                <span>Pembeli Berubah Pikiran (Batal Cepat)</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Order yang batal "Tanpa Resi" biasanya karena pembeli lupa ganti alamat atau ingin mengganti variasi. Pastikan admin merespons obrolan Shopee dengan cepat untuk membantu perubahan order sebelum mereka melakukan pembatalan mandiri.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL LIST */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari ID Pesanan, Nama Produk, atau Alasan Pembatalan..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>📋 Log Logistik Pesanan Batal</h2>
          <span className="badge red">Detail Data Pesanan Batal</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Nama Produk</th>
                <th>Variasi</th>
                <th>No. Resi</th>
                <th className="r">Qty</th>
                <th className="r">Harga Satuan</th>
                <th className="r">Total Nilai</th>
                <th>Alasan Pembatalan</th>
              </tr>
            </thead>
            <tbody>
              {filteredDetails.length > 0 ? (
                filteredDetails.map((item, idx) => (
                  <tr key={idx}>
                    <td><code className="sku-code">{item.id}</code></td>
                    <td className="product-name-cell" title={item.product}>{item.product}</td>
                    <td className="text-muted">{item.variation || '-'}</td>
                    <td>
                      <span className={`badge ${item.resi === 'Tanpa Resi' ? 'red' : 'blue'}`}>
                        {item.resi}
                      </span>
                    </td>
                    <td className="r font-semibold">{item.qty}</td>
                    <td className="r">{formatRp(item.price)}</td>
                    <td className="r font-bold text-red">{formatRp(item.total)}</td>
                    <td className="text-xs text-muted" title={item.reason}>{item.reason}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-muted">
                    Tidak ada pesanan batal yang cocok dengan pencarian.
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

export default CancellationTracker;
