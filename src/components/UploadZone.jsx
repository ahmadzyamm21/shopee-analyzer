import React, { useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, HelpCircle, Download } from 'lucide-react';
import { downloadHppTemplate } from '../utils/shopeeParser';

const UploadZone = ({ files, onFilesUploaded, loading, error }) => {
  const orderInputRef = useRef(null);
  const incomeInputRef = useRef(null);
  const hppInputRef = useRef(null);
  const adsInputRef = useRef(null);

  const handleFileChange = (type, e) => {
    if (type === 'income') {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 0) {
        onFilesUploaded(type, selectedFiles);
      }
    } else {
      const file = e.target.files[0];
      if (file) {
        onFilesUploaded(type, file);
      }
    }
  };

  const renderFileCard = (type, label, description, isRequired) => {
    const isIncome = type === 'income';
    const isHpp = type === 'hpp';
    const file = files[type];
    const hasFiles = isIncome ? (Array.isArray(file) && file.length > 0) : !!file;
    
    const inputRef = type === 'order' ? orderInputRef 
                   : type === 'income' ? incomeInputRef 
                   : type === 'hpp' ? hppInputRef 
                   : adsInputRef;

    return (
      <div className={`upload-card ${hasFiles ? 'uploaded' : ''}`}>
        <div className="upload-info">
          <div className="upload-header">
            <h3>{label}</h3>
            {isRequired && <span className="req-badge">Wajib</span>}
          </div>
          <p>{description}</p>
          {isHpp && (
            <button 
              type="button" 
              className="btn-link"
              onClick={downloadHppTemplate}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-orange)',
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
              <span>Unduh Template Excel HPP</span>
            </button>
          )}
          {isIncome && Array.isArray(file) && file.length > 0 && (
            <div className="file-list-details" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {file.map((f, idx) => (
                <div key={idx} className="file-details" style={{ margin: 0 }}>
                  <CheckCircle2 className="icon-success" size={16} />
                  <span>{f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          )}
          {!isIncome && file && (
            <div className="file-details">
              <CheckCircle2 className="icon-success" size={16} />
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>
        <div className="upload-actions">
          <input
            type="file"
            accept=".xlsx, .xls"
            multiple={isIncome}
            onChange={(e) => handleFileChange(type, e)}
            ref={inputRef}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className={`btn-upload ${hasFiles ? 'btn-change' : 'btn-primary'}`}
            onClick={() => inputRef.current.click()}
            disabled={loading}
          >
            <UploadCloud size={16} />
            <span>{hasFiles ? (isIncome ? 'Ubah File-File' : 'Ubah File') : (isIncome ? 'Unggah Excel (Bisa Multi)' : 'Unggah Excel')}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="upload-container">
      <div className="upload-intro">
        <h2>Pusat Unggah Laporan Shopee</h2>
        <p>Unggah file Excel ekspor asli dari Shopee dan database HPP toko Anda. Pemrosesan dilakukan 100% lokal di browser Anda. Tidak ada data yang dikirim ke server luar.</p>
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
        {renderFileCard(
          'order', 
          '1. Data Pesanan (Order Report)', 
          'Ekspor dari Shopee Seller Centre > Pesanan Saya > Download Data (Pastikan kolom Waktu Pesanan Dibuat tersedia).', 
          true
        )}
        
        {renderFileCard(
          'income', 
          '2. Data Penghasilan (Income Report)', 
          'Ekspor dari Shopee Seller Centre > Keuangan > Penghasilan Saya > Laporan (Pastikan memilih tab Rincian).', 
          true
        )}
        
        {renderFileCard(
          'hpp', 
          '3. Database HPP Toko (COGS)', 
          'Format file Excel berisi kolom: "SKU Induk" (atau "SKU") dan "HPP" (atau "Harga Modal").', 
          true
        )}
        
        {renderFileCard(
          'ads', 
          '4. SVS Invoice / Iklan (Opsional)', 
          'Ekspor dari Shopee Seller Centre > Keuangan > Saldo Saya (SVS Invoice bulanan yang berisi rincian top-up saldo iklan).', 
          false
        )}
      </div>

      <div className="template-help">
        <div className="help-icon-wrapper">
          <HelpCircle size={20} />
        </div>
        <div>
          <h4>💡 Petunjuk Penting Database HPP:</h4>
          <p>Agar HPP terhitung akurat, file HPP wajib memiliki header kolom dengan nama <strong>"SKU Induk"</strong> (atau <strong>"SKU"</strong>) dan <strong>"HPP"</strong> (atau <strong>"Harga Modal"</strong>). Jika tidak dicocokkan lewat SKU, parser akan otomatis mencocokkan lewat <strong>"Nama Produk"</strong> dan <strong>"Nama Variasi"</strong> secara literal.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
