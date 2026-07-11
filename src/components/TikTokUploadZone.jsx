import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, HelpCircle, Music2, Download } from 'lucide-react';
import { downloadTikTokHppTemplate } from '../utils/tiktokParser';

const TikTokUploadZone = ({ files, onFilesUploaded, loading, error, rawOrders, ttParsedHpp }) => {
  const [logoError, setLogoError] = useState(false);
  const orderInputRef = useRef(null);
  const incomeInputRef = useRef(null);
  const hppInputRef = useRef(null);

  const handleFileChange = (type, e) => {
    if (type === 'ttIncome') {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 0) onFilesUploaded(type, selectedFiles);
    } else {
      const file = e.target.files[0];
      if (file) onFilesUploaded(type, file);
    }
  };

  const renderCard = (type, label, description, isRequired, isMulti) => {
    const inputRef = type === 'ttOrders' ? orderInputRef : type === 'ttIncome' ? incomeInputRef : hppInputRef;
    const file = files[type];
    const hasFiles = isMulti ? Array.isArray(file) && file.length > 0 : !!file;

    return (
      <div className={`upload-card ${hasFiles ? 'uploaded' : ''}`}>
        <div className="upload-info">
          <div className="upload-header">
            <h3>{label}</h3>
            {isRequired && <span className="req-badge">Wajib</span>}
            {isMulti && !isRequired && <span style={{ fontSize: '9px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>OPSIONAL</span>}
          </div>
          <p>{description}</p>
          {type === 'ttHpp' && (
            <button 
              type="button" 
              className="btn-link"
              onClick={() => downloadTikTokHppTemplate(rawOrders, ttParsedHpp)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ee3b5f',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '4px 0',
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline'
              }}
            >
              <Download size={12} />
              <span>
                {rawOrders && Object.keys(rawOrders).length > 0
                  ? 'Unduh Template Excel HPP (Kustom dari Laporan Order Anda)' 
                  : 'Unduh Contoh Template Excel HPP'}
              </span>
            </button>
          )}
          {isMulti && Array.isArray(file) && file.length > 0 && (
            <div className="file-list-details" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {file.map((f, idx) => (
                <div key={idx} className="file-details" style={{ margin: 0 }}>
                  <CheckCircle2 className="icon-success" size={14} />
                  <span>{f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          )}
          {!isMulti && file && (
            <div className="file-details">
              <CheckCircle2 className="icon-success" size={14} />
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>
        <div className="upload-actions">
          <input
            type="file"
            accept=".xlsx,.xls"
            multiple={isMulti}
            ref={inputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleFileChange(type, e)}
          />
          <button
            type="button"
            className={`btn-upload ${hasFiles ? 'btn-change' : 'btn-tiktok-primary'}`}
            onClick={() => inputRef.current.click()}
            disabled={loading}
          >
            <UploadCloud size={16} />
            <span>{hasFiles ? (isMulti ? 'Ubah File-File' : 'Ubah File') : (isMulti ? 'Unggah Excel (Multi)' : 'Unggah Excel')}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="upload-container">
      <div className="upload-intro">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <h2>Pusat Unggah Laporan TikTok Shop by Tokopedia</h2>
        </div>
        <p>Unggah file Excel ekspor asli dari TikTok Seller Center (Tokopedia). Analisis menggunakan mode <strong style={{ color: '#ee3b5f' }}>Cohort</strong> — pesanan dari file pesanan yang Anda upload akan dicocokkan ke income dari semua file income yang Anda berikan. Tidak ada data yang dikirim ke server.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <strong>Error Pemrosesan File:</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="upload-grid">
        {renderCard(
          'ttOrders',
          '1. File Pesanan TikTok (Cohort Referensi)',
          'Ekspor dari TikTok Seller Center → Pesanan → Download pesanan. Sheet "OrderSKUList".',
          true,
          false
        )}
        {renderCard(
          'ttIncome',
          '2. File Laporan Keuangan / Income TikTok',
          'Ekspor dari TikTok Seller Center → Keuangan → Income. Sheet "Detail pesanan". Unggah semua bulan yang relevan (misal income Mei + income Juni).',
          true,
          true
        )}
        {renderCard(
          'ttHpp',
          '3. Database HPP Toko (COGS)',
          'Format Excel yang sama dengan Shopee: kolom "SKU Induk" (atau "SKU") dan "HPP" (atau "Harga Modal"). Bisa share file HPP yang sama dengan Shopee.',
          true,
          false
        )}
      </div>

      <div className="template-help tiktok-help-box">
        <div className="help-icon-wrapper">
          <HelpCircle size={20} />
        </div>
        <div>
          <h4>🎵 Petunjuk Khusus Mode Cohort TikTok:</h4>
          <p>
            Mode <strong>Cohort</strong> berarti sistem akan mengambil daftar <strong>Order ID dari file pesanan</strong> Anda,
            lalu mencari pencairannya (settlement) di <strong>semua file income</strong> yang Anda upload — baik yang cair di bulan yang sama
            maupun bulan berikutnya. Ini memastikan omset, biaya platform, dan HPP terhitung secara <strong>akurat dan sinkron</strong> per batch pesanan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TikTokUploadZone;
