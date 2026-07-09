import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  ShoppingBag, 
  XSquare, 
  Calendar, 
  DollarSign,
  Loader2,
  FileCheck,
  RotateCcw,
  PieChart,
  Calculator
} from 'lucide-react';
import UploadZone from './components/UploadZone';
import DashboardOverview from './components/DashboardOverview';
import PLStatement from './components/PLStatement';
import ProductAnalysis from './components/ProductAnalysis';
import CancellationTracker from './components/CancellationTracker';
import CompletedOrders from './components/CompletedOrders';
import ReturnedOrders from './components/ReturnedOrders';
import BcgAnalysis from './components/BcgAnalysis';
import HppCalculator from './components/HppCalculator';
import { 
  parseHppFile, 
  parseOrdersFile, 
  parseIncomeFile, 
  parseAdsFile, 
  parseBcgFile,
  analyzeShopeeData 
} from './utils/shopeeParser';

const App = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState({ order: null, income: [], hpp: null, ads: null, bcg: null });
  
  // Parsed Raw Datasets
  const [rawOrderData, setRawOrderData] = useState(null);
  const [rawIncomeData, setRawIncomeData] = useState(null);
  const [parsedHpp, setParsedHpp] = useState(null);
  const [parsedBcg, setParsedBcg] = useState(null);
  const [totalAds, setTotalAds] = useState(0);
  const [adsDetails, setAdsDetails] = useState([]);

  // Analysis result
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // File upload handler
  const handleFilesUploaded = async (type, fileOrFiles) => {
    setFiles(prev => ({ ...prev, [type]: fileOrFiles }));
    setLoading(true);
    setError(null);

    try {
      if (type === 'hpp') {
        const hppMapping = await parseHppFile(fileOrFiles);
        setParsedHpp(hppMapping);
      } else if (type === 'bcg') {
        const bcgMapping = await parseBcgFile(fileOrFiles);
        setParsedBcg(bcgMapping);
      } else if (type === 'ads') {
        const adsData = await parseAdsFile(fileOrFiles);
        setTotalAds(adsData.totalAds);
        setAdsDetails(adsData.details);
      } else if (type === 'order') {
        const orderData = await parseOrdersFile(fileOrFiles);
        setRawOrderData(orderData);
      } else if (type === 'income') {
        // fileOrFiles is an array for 'income'
        const allIncomeRows = [];
        for (let file of fileOrFiles) {
          const rows = await parseIncomeFile(file);
          allIncomeRows.push(...rows);
        }
        setRawIncomeData(allIncomeRows);
      }
    } catch (err) {
      setError(err.message);
      setFiles(prev => ({ ...prev, [type]: type === 'income' ? [] : null })); // reset faulty file
    } finally {
      setLoading(false);
    }
  };

  // Re-run analysis when raw data or month filter changes
  useEffect(() => {
    if (rawOrderData && rawIncomeData && parsedHpp) {
      try {
        const monthFilter = selectedMonth === 'all' ? null : selectedMonth;
        const result = analyzeShopeeData(
          rawOrderData, 
          rawIncomeData, 
          parsedHpp, 
          totalAds, 
          adsDetails, 
          monthFilter,
          parsedBcg
        );
        setAnalysisResult(result);
        
        // Auto navigate to dashboard when files are loaded for the first time
        if (activeTab === 'upload') {
          setActiveTab('overview');
        }
      } catch (err) {
        setError(`Gagal menganalisis data: ${err.message}`);
      }
    } else {
      setAnalysisResult(null);
    }
  }, [rawOrderData, rawIncomeData, parsedHpp, totalAds, adsDetails, selectedMonth, parsedBcg]);

  const resetAllData = () => {
    setFiles({ order: null, income: [], hpp: null, ads: null, bcg: null });
    setRawOrderData(null);
    setRawIncomeData(null);
    setParsedHpp(null);
    setParsedBcg(null);
    setTotalAds(0);
    setAdsDetails([]);
    setAnalysisResult(null);
    setSelectedMonth('all');
    setActiveTab('upload');
    setError(null);
  };

  const isDataReady = rawOrderData && rawIncomeData && parsedHpp;

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <BarChart3 className="icon-brand" size={24} />
          </div>
          <div className="brand-text">
            <h2>Shopee Analyzer</h2>
            <span>Marketplace P&L Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={18} />
            <span>Pusat Unggah</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => isDataReady ? setActiveTab('overview') : null}
            disabled={!isDataReady}
            title={!isDataReady ? "Unggah file wajib terlebih dahulu" : ""}
          >
            <TrendingUp size={18} />
            <span>Ringkasan Dashboard</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'pl' ? 'active' : ''}`}
            onClick={() => isDataReady ? setActiveTab('pl') : null}
            disabled={!isDataReady}
          >
            <DollarSign size={18} />
            <span>Laba Rugi (P&amp;L)</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => isDataReady ? setActiveTab('products') : null}
            disabled={!isDataReady}
          >
            <ShoppingBag size={18} />
            <span>Analisis Produk</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'bcg' ? 'active' : ''}`}
            onClick={() => isDataReady ? setActiveTab('bcg') : null}
            disabled={!isDataReady}
          >
            <PieChart size={18} />
            <span>Matriks BCG Produk</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'hpp-calc' ? 'active' : ''}`}
            onClick={() => setActiveTab('hpp-calc')}
          >
            <Calculator size={18} />
            <span>Kalkulator HPP</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => isDataReady ? setActiveTab('completed') : null}
            disabled={!isDataReady}
          >
            <FileSpreadsheet size={18} />
            <span>Pesanan Selesai</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => isDataReady ? setActiveTab('returns') : null}
            disabled={!isDataReady}
          >
            <RotateCcw size={18} />
            <span>Pesanan Retur</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'cancellations' ? 'active' : ''}`}
            onClick={() => isDataReady ? setActiveTab('cancellations') : null}
            disabled={!isDataReady}
          >
            <XSquare size={18} />
            <span>Pesanan Batal</span>
          </button>
        </nav>

        {isDataReady && (
          <div className="sidebar-footer">
            <button className="btn-reset" onClick={resetAllData}>
              Reset Semua Data
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title">
            <h1>
              {activeTab === 'upload' && 'Pusat Unggah Laporan'}
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'pl' && 'P&L Statement'}
              {activeTab === 'products' && 'Analisis Performa Produk'}
              {activeTab === 'bcg' && 'Matriks BCG Produk'}
              {activeTab === 'hpp-calc' && 'Kalkulator HPP & Simulasi Jual'}
              {activeTab === 'completed' && 'Log Pesanan Selesai'}
              {activeTab === 'returns' && 'Log Pesanan Retur / Refund'}
              {activeTab === 'cancellations' && 'Pelacak Pesanan Batal'}
            </h1>
            <p>
              {activeTab === 'upload' && 'Siapkan file ekspor Shopee Anda untuk memulai.'}
              {activeTab === 'overview' && 'Analisis visual kesehatan keuangan toko Anda.'}
              {activeTab === 'pl' && 'Laba bersih take-home profit & potongan biaya administrasi.'}
              {activeTab === 'products' && 'Identifikasi SKU terlaris & HPP paling efisien.'}
              {activeTab === 'bcg' && 'Pemetaan portofolio produk ke dalam kuadran Stars, Cash Cows, Question Marks, dan Dogs.'}
              {activeTab === 'hpp-calc' && 'Hitung modal riil per unit barang & simulasikan rekomendasi harga jual Shopee.'}
              {activeTab === 'completed' && 'Daftar semua rincian pesanan yang berhasil terselesaikan.'}
              {activeTab === 'returns' && 'Pelacakan komplain, barang retur, dan pengembalian dana pembeli.'}
              {activeTab === 'cancellations' && 'Pantau rasio pembatalan order & kurir gagal kirim.'}
            </p>
          </div>

          {/* Month Filter Selector (visible only when data is ready) */}
          {isDataReady && analysisResult && (
            <div className="header-filters">
              <Calendar size={16} className="text-muted" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="filter-select"
              >
                <option value="all">Semua Bulan (Tersedia)</option>
                {analysisResult.availableMonths.map(month => (
                  <option key={month} value={month}>
                    Bulan: {month}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="loading-overlay">
            <Loader2 className="loading-spinner animate-spin" size={40} />
            <p>Membaca dan memproses file Excel...</p>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <section className="content-body">
          {activeTab === 'upload' && (
            <UploadZone
              files={files}
              onFilesUploaded={handleFilesUploaded}
              loading={loading}
              error={error}
              rawOrderData={rawOrderData}
            />
          )}

          {activeTab === 'hpp-calc' && <HppCalculator />}

          {isDataReady && analysisResult ? (
            <>
              {activeTab === 'overview' && <DashboardOverview data={analysisResult} />}
              {activeTab === 'pl' && <PLStatement data={analysisResult} />}
              {activeTab === 'products' && <ProductAnalysis products={analysisResult.products} />}
              {activeTab === 'bcg' && <BcgAnalysis products={analysisResult.products} />}
              {activeTab === 'completed' && <CompletedOrders data={analysisResult} />}
              {activeTab === 'returns' && <ReturnedOrders data={analysisResult} />}
              {activeTab === 'cancellations' && <CancellationTracker batalSummary={analysisResult.batalSummary} />}
            </>
          ) : (
            activeTab !== 'upload' && activeTab !== 'hpp-calc' && (
              <div className="data-prompt-card">
                <FileCheck size={48} className="text-muted mb-4" />
                <h3>Data Belum Lengkap</h3>
                <p>Silakan kembali ke tab <strong>Pusat Unggah</strong> untuk melengkapi file Excel yang wajib diunggah (Order, Income, dan HPP).</p>
                <button className="btn-primary mt-4" onClick={() => setActiveTab('upload')}>
                  Ke Pusat Unggah
                </button>
              </div>
            )
          )}
        </section>

        <footer className="main-footer">
          <p>&copy; {new Date().getFullYear()} Shopee Marketplace Financial Analyzer (Client-Side Only Mode).</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
