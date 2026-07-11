import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
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
  Calculator,
  ShoppingCart,
  LayoutDashboard,
  Package,
  Music2,
  Store,
  ListOrdered,
  AlertTriangle,
  LogOut
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
import ProblematicOrders from './components/ProblematicOrders';

// Auth & Access Status Components
import { supabase } from './utils/supabaseClient';
import AuthScreen from './components/AuthScreen';
import AccessStatusScreen from './components/AccessStatusScreen';

// TikTok Components
import TikTokUploadZone from './components/TikTokUploadZone';
import TikTokDashboard from './components/TikTokDashboard';
import TikTokPLStatement from './components/TikTokPLStatement';
import TikTokSkuList from './components/TikTokSkuList';
import TikTokCompletedOrders from './components/TikTokCompletedOrders';
import TikTokReturnedOrders from './components/TikTokReturnedOrders';
import TikTokCancellationTracker from './components/TikTokCancellationTracker';
import TikTokAllOrders from './components/TikTokAllOrders';
import TikTokProblematicOrders from './components/TikTokProblematicOrders';

// Parsers
import { 
  parseHppFile, 
  parseOrdersFile, 
  parseIncomeFile, 
  parseAdsFile, 
  parseBcgFile,
  analyzeShopeeData 
} from './utils/shopeeParser';

import {
  parseTikTokOrdersFile,
  parseTikTokIncomeFile,
  parseTikTokHppFile,
  analyzeTikTokCohort
} from './utils/tiktokParser';

// Generate a unique client session ID for this browser if not exists
let clientSessionId = localStorage.getItem('client_session_id');
if (!clientSessionId) {
  clientSessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  localStorage.setItem('client_session_id', clientSessionId);
}

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Derive active platform from URL path
  const activePlatform = location.pathname.startsWith('/tiktok') ? 'tiktok' : 'shopee';

  // SHOPEE STATE
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState({ order: null, income: [], hpp: null, ads: null, bcg: null });
  const [rawOrderData, setRawOrderData] = useState(null);
  const [rawIncomeData, setRawIncomeData] = useState(null);
  const [parsedHpp, setParsedHpp] = useState(null);
  const [parsedBcg, setParsedBcg] = useState(null);
  const [totalAds, setTotalAds] = useState(0);
  const [adsDetails, setAdsDetails] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // TIKTOK STATE
  const [ttActiveTab, setTtActiveTab] = useState('tt-upload');
  const [ttFiles, setTtFiles] = useState({ ttOrders: null, ttIncome: [], ttHpp: null });
  const [ttRawOrders, setTtRawOrders] = useState(null);
  const [ttRawIncome, setTtRawIncome] = useState(null);
  const [ttParsedHpp, setTtParsedHpp] = useState(null);
  const [ttResult, setTtResult] = useState(null);
  const [ttLoading, setTtLoading] = useState(false);
  const [ttError, setTtError] = useState(null);

  // Logo state
  const [logoError, setLogoError] = useState(false);
  const [ttLogoError, setTtLogoError] = useState(false);

  // SUPABASE AUTH STATE
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchUserProfile = async (user, isSignInEvent = false) => {
    try {
      setAuthLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.warn('Profile not found, attempting client-side fallback insert...');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, email: user.email, status: 'pending', current_session_id: clientSessionId }])
          .select()
          .single();
          
        if (insertError) {
          console.error('Client-side fallback profile insert failed:', insertError);
        } else {
          setProfile(newProfile);
        }
      } else {
        // Enforce single active session
        if (isSignInEvent) {
          // Take over session
          await supabase
            .from('profiles')
            .update({ current_session_id: clientSessionId })
            .eq('id', user.id);
          data.current_session_id = clientSessionId;
          setProfile(data);
        } else {
          // Regular check: if session ID in db is different, log out
          if (data.current_session_id && data.current_session_id !== clientSessionId) {
            alert('Akun Anda telah login di perangkat/browser lain. Sesi ini akan ditutup.');
            await supabase.auth.signOut();
            return;
          }
          setProfile(data);
        }
      }
    } catch (err) {
      console.error('Profile fetch/create error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    setAuthLoading(true);
    
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Regular session check on page load
        fetchUserProfile(session.user, false);
      } else {
        setAuthLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const isManual = localStorage.getItem('is_manual_signin') === 'true';
        localStorage.removeItem('is_manual_signin');
        fetchUserProfile(session.user, isManual);
      } else {
        setProfile(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Periodic active session validator (single concurrent login checker)
  useEffect(() => {
    if (!session || !profile) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('current_session_id')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          const localSessionId = localStorage.getItem('client_session_id') || '';
          if (data.current_session_id && data.current_session_id !== localSessionId) {
            alert('Akun Anda telah login di perangkat/browser lain. Sesi ini akan ditutup.');
            await supabase.auth.signOut();
          }
        }
      } catch (err) {
        console.error('Session validation polling error:', err);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [session, profile]);

  const isAccountExpired = () => {
    if (!profile || !profile.expiry_date) return false;
    const expiry = new Date(profile.expiry_date);
    expiry.setHours(23, 59, 59, 999);
    return new Date() > expiry;
  };

  const checkAndIncrementUpload = async () => {
    if (!profile) return true; // Bypass check if no profile/credentials configured
    if (profile.status !== 'approved') return false;
    
    const limit = profile.max_uploads_per_day || 10;
    const todayStr = new Date().toISOString().split('T')[0];
    
    let uploads = profile.uploads_today || 0;
    if (profile.last_upload_date !== todayStr) {
      uploads = 0;
    }
    
    if (uploads >= limit) {
      alert(`Batas upload harian Anda (${limit} kali) telah habis. Silakan hubungi admin untuk menambah kuota harian.`);
      return false;
    }
    
    const newUploadCount = uploads + 1;
    setProfile(prev => ({ ...prev, uploads_today: newUploadCount, last_upload_date: todayStr }));
    
    try {
      await supabase
        .from('profiles')
        .update({ uploads_today: newUploadCount, last_upload_date: todayStr })
        .eq('id', profile.id);
    } catch (e) {
      console.error('Error updating upload count:', e);
    }
    return true;
  };

  // Dynamic Theme Styling
  useEffect(() => {
    if (activePlatform === 'tiktok') {
      document.documentElement.style.setProperty('--accent-red', '#00b56a');
      document.documentElement.style.setProperty('--accent-red-hover', '#009e5c');
      document.documentElement.style.setProperty('--accent-red-dim', 'rgba(0, 181, 106, 0.1)');
      document.documentElement.style.setProperty('--tt-primary', '#00b56a');
      document.documentElement.style.setProperty('--tt-gradient-btn', 'linear-gradient(135deg, #00b56a 0%, #009e5c 100%)');
      document.documentElement.style.setProperty('--tt-badge-bg', 'rgba(0, 181, 106, 0.18)');
      document.documentElement.style.setProperty('--tt-badge-border', 'rgba(0, 181, 106, 0.45)');
    } else {
      document.documentElement.style.setProperty('--accent-red', '#f43f5e');
      document.documentElement.style.setProperty('--accent-red-hover', '#e11d48');
      document.documentElement.style.setProperty('--accent-red-dim', 'rgba(244, 63, 94, 0.1)');
      document.documentElement.style.setProperty('--tt-primary', '#ee3b5f');
      document.documentElement.style.setProperty('--tt-gradient-btn', 'linear-gradient(135deg, #ee3b5f 0%, #c2185b 100%)');
      document.documentElement.style.setProperty('--tt-badge-bg', 'rgba(238, 59, 95, 0.12)');
      document.documentElement.style.setProperty('--tt-badge-border', 'rgba(238, 59, 95, 0.35)');
    }
  }, [activePlatform]);

  // === SHOPEE UPLOAD HANDLER ===
  const handleFilesUploaded = async (type, fileOrFiles) => {
    if (type === 'order') {
      const canUpload = await checkAndIncrementUpload();
      if (!canUpload) return;
    }
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
        const parsed = await parseOrdersFile(fileOrFiles);
        setRawOrderData(parsed);
      } else if (type === 'income') {
        const allIncomeRows = [];
        for (let file of fileOrFiles) {
          const rows = await parseIncomeFile(file);
          allIncomeRows.push(...rows);
        }
        setRawIncomeData(allIncomeRows);
      }
    } catch (err) {
      setError(err.message);
      setFiles(prev => ({ ...prev, [type]: type === 'income' ? [] : null }));
    } finally {
      setLoading(false);
    }
  };

  // === TIKTOK UPLOAD HANDLER ===
  const handleTtFilesUploaded = async (type, fileOrFiles) => {
    if (type === 'ttOrders') {
      const canUpload = await checkAndIncrementUpload();
      if (!canUpload) return;
    }
    setTtFiles(prev => ({ ...prev, [type]: fileOrFiles }));
    setTtLoading(true);
    setTtError(null);

    try {
      if (type === 'ttHpp') {
        const hppMap = await parseTikTokHppFile(fileOrFiles);
        setTtParsedHpp(hppMap);
      } else if (type === 'ttOrders') {
        // Single file for orders
        const orders = await parseTikTokOrdersFile(fileOrFiles);
        setTtRawOrders(orders);
      } else if (type === 'ttIncome') {
        // Multi-file for income reports
        const allIncome = [];
        for (let file of fileOrFiles) {
          const income = await parseTikTokIncomeFile(file);
          allIncome.push(...income);
        }
        setTtRawIncome(allIncome);
      }
    } catch (err) {
      setTtError(err.message);
      setTtFiles(prev => ({ ...prev, [type]: type === 'ttIncome' ? [] : null }));
    } finally {
      setTtLoading(false);
    }
  };

  // Shopee Analysis Effect
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
        if (activeTab === 'upload') {
          setActiveTab('overview');
        }
      } catch (err) {
        setError(`Gagal menganalisis data Shopee: ${err.message}`);
      }
    } else {
      setAnalysisResult(null);
    }
  }, [rawOrderData, rawIncomeData, parsedHpp, totalAds, adsDetails, selectedMonth, parsedBcg]);

  // TikTok Analysis Effect
  useEffect(() => {
    if (ttRawOrders && ttRawIncome && ttParsedHpp) {
      try {
        const result = analyzeTikTokCohort(ttRawOrders, ttRawIncome, ttParsedHpp);
        setTtResult(result);
        if (ttActiveTab === 'tt-upload') {
          setTtActiveTab('tt-overview');
        }
      } catch (err) {
        setTtError(`Gagal menganalisis data TikTok: ${err.message}`);
      }
    } else {
      setTtResult(null);
    }
  }, [ttRawOrders, ttRawIncome, ttParsedHpp]);

  // Early returns (Redirects & Auth check guards) - Placed after all React hooks to satisfy rules of hooks
  if (location.pathname === '/') {
    if (profile && profile.allowed_platform === 'tiktok') {
      return <Navigate to="/tiktok" replace />;
    }
    return <Navigate to="/shopee" replace />;
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', gap: '16px' }}>
        <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-orange)' }} />
        <span style={{ fontSize: '14px', opacity: 0.8, fontWeight: 500 }}>Memuat data keamanan...</span>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onAuthSuccess={(sess) => setSession(sess)} />;
  }

  const isExpired = isAccountExpired();
  if (profile && (profile.status !== 'approved' || isExpired)) {
    return (
      <AccessStatusScreen 
        status={isExpired ? 'expired' : profile.status} 
        expiryDate={profile.expiry_date} 
        userEmail={session.user.email} 
        onLogout={() => { setSession(null); setProfile(null); }}
      />
    );
  }

  // PLATFORM ACCESS RESTRICTION REDIRECTS
  if (profile) {
    if (profile.allowed_platform === 'shopee' && activePlatform === 'tiktok') {
      return <Navigate to="/shopee" replace />;
    }
    if (profile.allowed_platform === 'tiktok' && activePlatform === 'shopee') {
      return <Navigate to="/tiktok" replace />;
    }
  }

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

  const resetTtData = () => {
    setTtFiles({ ttOrders: null, ttIncome: [], ttHpp: null });
    setTtRawOrders(null);
    setTtRawIncome(null);
    setTtParsedHpp(null);
    setTtResult(null);
    setTtActiveTab('tt-upload');
    setTtError(null);
  };

  const isDataReady = rawOrderData && rawIncomeData && parsedHpp;
  const isTtDataReady = ttRawOrders && ttRawIncome && ttParsedHpp;

  const getHeaderIcon = () => {
    const platform = activePlatform;
    const tab = platform === 'shopee' ? activeTab : ttActiveTab;
    
    let IconComponent = null;
    let iconColor = 'var(--accent-red)';
    
    if (platform === 'shopee') {
      iconColor = 'var(--accent-orange)';
      switch (tab) {
        case 'upload': IconComponent = Upload; break;
        case 'overview': IconComponent = TrendingUp; break;
        case 'pl': IconComponent = DollarSign; break;
        case 'products': IconComponent = ShoppingBag; break;
        case 'bcg': IconComponent = PieChart; break;
        case 'hpp-calc': IconComponent = Calculator; break;
        case 'problems': IconComponent = AlertTriangle; iconColor = '#ef4444'; break;
        case 'completed': IconComponent = FileSpreadsheet; break;
        case 'returns': IconComponent = RotateCcw; break;
        case 'cancellations': IconComponent = XSquare; break;
        default: break;
      }
    } else {
      switch (tab) {
        case 'tt-upload': IconComponent = Upload; break;
        case 'tt-overview': IconComponent = LayoutDashboard; break;
        case 'tt-pl': IconComponent = DollarSign; break;
        case 'tt-bcg': IconComponent = PieChart; break;
        case 'tt-hpp-calc': IconComponent = Calculator; break;
        case 'tt-all-orders': IconComponent = ListOrdered; break;
        case 'tt-problems': IconComponent = AlertTriangle; iconColor = '#ef4444'; break;
        case 'tt-completed': IconComponent = ShoppingCart; break;
        case 'tt-returns': IconComponent = RotateCcw; break;
        case 'tt-cancellations': IconComponent = XSquare; break;
        default: break;
      }
    }
    
    if (!IconComponent) return null;
    return <IconComponent size={26} style={{ color: iconColor, flexShrink: 0, marginRight: '10px' }} />;
  };

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="Logo" 
                onError={() => setLogoError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
              />
            ) : (
              <BarChart3 className="icon-brand" size={24} />
            )}
          </div>
          <div className="brand-text">
            <h2>Marketplace Analyzer</h2>
            <span>Financial & performance dashboard</span>
          </div>
        </div>

        {/* Platform Switcher */}
        {(!profile || profile.allowed_platform === 'both') && (
          <div className="platform-switcher" style={{ 
            padding: '0 20px 16px',
            display: 'flex',
            gap: '8px'
          }}>
            <button 
              onClick={() => navigate('/shopee')}
              className={`platform-btn ${activePlatform === 'shopee' ? 'active' : ''}`}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: activePlatform === 'shopee' ? 'var(--accent-orange, #f97316)' : 'rgba(31, 41, 55, 0.4)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Store size={14} />
              <span>Shopee</span>
            </button>
            <button 
              onClick={() => navigate('/tiktok')}
              className={`platform-btn ${activePlatform === 'tiktok' ? 'active' : ''}`}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: activePlatform === 'tiktok' ? 'var(--tt-primary, #00b56a)' : 'rgba(31, 41, 55, 0.4)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Music2 size={14} />
              <span>TikTok</span>
            </button>
          </div>
        )}

        {/* === SHOPEE NAV === */}
        {activePlatform === 'shopee' && (
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
              <Upload size={18} /><span>Pusat Unggah</span>
            </button>
            <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => isDataReady ? setActiveTab('overview') : null} disabled={!isDataReady}>
              <TrendingUp size={18} /><span>Ringkasan Dashboard</span>
            </button>
            <button className={`nav-item ${activeTab === 'pl' ? 'active' : ''}`} onClick={() => isDataReady ? setActiveTab('pl') : null} disabled={!isDataReady}>
              <DollarSign size={18} /><span>Laba Rugi (P&amp;L)</span>
            </button>
            <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => isDataReady ? setActiveTab('products') : null} disabled={!isDataReady}>
              <ShoppingBag size={18} /><span>Analisis Produk</span>
            </button>
            <button className={`nav-item ${activeTab === 'bcg' ? 'active' : ''}`} onClick={() => isDataReady ? setActiveTab('bcg') : null} disabled={!isDataReady}>
              <PieChart size={18} /><span>Matriks BCG Produk</span>
            </button>
            <button className={`nav-item ${activeTab === 'hpp-calc' ? 'active' : ''}`} onClick={() => setActiveTab('hpp-calc')}>
              <Calculator size={18} /><span>Kalkulator HPP</span>
            </button>
            <button className={`nav-item ${activeTab === 'problems' ? 'active' : ''}`} onClick={() => isDataReady ? setActiveTab('problems') : null} disabled={!isDataReady}>
              <AlertTriangle size={18} /><span>Pesanan Bermasalah</span>
            </button>
            <button className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => isDataReady ? setActiveTab('completed') : null} disabled={!isDataReady}>
              <FileSpreadsheet size={18} /><span>Pesanan Selesai</span>
            </button>
            <button className={`nav-item ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => isDataReady ? setActiveTab('returns') : null} disabled={!isDataReady}>
              <RotateCcw size={18} /><span>Pesanan Retur</span>
            </button>
            <button className={`nav-item ${activeTab === 'cancellations' ? 'active' : ''}`} onClick={() => isDataReady ? setActiveTab('cancellations') : null} disabled={!isDataReady}>
              <XSquare size={18} /><span>Pesanan Batal</span>
            </button>
          </nav>
        )}

        {/* === TIKTOK NAV === */}
        {activePlatform === 'tiktok' && (
          <nav className="sidebar-nav">
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-upload' ? 'active tt-active' : ''}`} onClick={() => setTtActiveTab('tt-upload')}>
              <Upload size={18} /><span>Pusat Unggah</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-overview' ? 'active tt-active' : ''}`} onClick={() => isTtDataReady ? setTtActiveTab('tt-overview') : null} disabled={!isTtDataReady}>
              <LayoutDashboard size={18} /><span>Dashboard Cohort</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-pl' ? 'active tt-active' : ''}`} onClick={() => isTtDataReady ? setTtActiveTab('tt-pl') : null} disabled={!isTtDataReady}>
              <DollarSign size={18} /><span>Laba Rugi (P&amp;L)</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-bcg' ? 'active tt-active' : ''}`} onClick={() => isTtDataReady ? setTtActiveTab('tt-bcg') : null} disabled={!isTtDataReady}>
              <PieChart size={18} /><span>Matriks BCG Produk</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-hpp-calc' ? 'active tt-active' : ''}`} onClick={() => setTtActiveTab('tt-hpp-calc')}>
              <Calculator size={18} /><span>Kalkulator HPP</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-all-orders' ? 'active tt-active' : ''}`} onClick={() => isTtDataReady ? setTtActiveTab('tt-all-orders') : null} disabled={!isTtDataReady}>
              <ListOrdered size={18} /><span>Semua Pesanan</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-problems' ? 'active tt-active' : ''}`} onClick={() => isTtDataReady ? setTtActiveTab('tt-problems') : null} disabled={!isTtDataReady}>
              <AlertTriangle size={18} /><span>Pesanan Bermasalah</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-completed' ? 'active tt-active' : ''}`} onClick={() => isTtDataReady ? setTtActiveTab('tt-completed') : null} disabled={!isTtDataReady}>
              <ShoppingCart size={18} /><span>Pesanan Selesai</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-returns' ? 'active tt-active' : ''}`} onClick={() => isTtDataReady ? setTtActiveTab('tt-returns') : null} disabled={!isTtDataReady}>
              <RotateCcw size={18} /><span>Pesanan Retur</span>
            </button>
            <button className={`nav-item tt-nav-item ${ttActiveTab === 'tt-cancellations' ? 'active tt-active' : ''}`} onClick={() => isTtDataReady ? setTtActiveTab('tt-cancellations') : null} disabled={!isTtDataReady}>
              <XSquare size={18} /><span>Pesanan Batal</span>
            </button>
          </nav>
        )}

        {/* Footer User Info & Logout */}
        {session && (
          <div className="sidebar-user-footer" style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid var(--border-color)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            marginTop: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#22c55e', 
                flexShrink: 0 
              }}></div>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 600, 
                opacity: 0.85, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                color: '#fff'
              }}>
                {session.user.email}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {activePlatform === 'shopee' && isDataReady && (
                <button className="btn-reset" style={{ flex: 1, padding: '6px 10px', fontSize: '11px' }} onClick={resetAllData}>Reset Data</button>
              )}
              {activePlatform === 'tiktok' && isTtDataReady && (
                <button className="btn-reset" style={{ flex: 1, padding: '6px 10px', fontSize: '11px' }} onClick={resetTtData}>Reset Data</button>
              )}
              <button 
                onClick={() => supabase.auth.signOut()} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.25)', 
                  color: '#ef4444', 
                  borderRadius: '6px', 
                  padding: '6px 10px', 
                  fontSize: '11px', 
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={12} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title">
            <h1 style={{ display: 'flex', alignItems: 'center' }}>
              {getHeaderIcon()}
              <span className="gradient-text">
                {/* Shopee titles */}
                {activePlatform === 'shopee' && activeTab === 'upload' && 'Pusat Unggah Laporan'}
                {activePlatform === 'shopee' && activeTab === 'overview' && 'Dashboard Overview'}
                {activePlatform === 'shopee' && activeTab === 'pl' && 'P&L Statement'}
                {activePlatform === 'shopee' && activeTab === 'products' && 'Analisis Performa Produk'}
                {activePlatform === 'shopee' && activeTab === 'bcg' && 'Matriks BCG Produk'}
                {activePlatform === 'shopee' && activeTab === 'hpp-calc' && 'Kalkulator HPP & Simulasi Jual'}
                {activePlatform === 'shopee' && activeTab === 'problems' && 'Daftar Pesanan Bermasalah'}
                {activePlatform === 'shopee' && activeTab === 'completed' && 'Log Pesanan Selesai'}
                {activePlatform === 'shopee' && activeTab === 'returns' && 'Log Pesanan Retur / Refund'}
                {activePlatform === 'shopee' && activeTab === 'cancellations' && 'Pelacak Pesanan Batal'}
                {/* TikTok titles */}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-upload' && 'Pusat Unggah TikTok Shop by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-overview' && 'Dashboard Cohort TikTok by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-pl' && 'Laporan Laba Rugi TikTok by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-sku' && 'Profitabilitas SKU TikTok by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-all-orders' && 'Daftar Semua Pesanan TikTok by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-problems' && 'Daftar Pesanan Bermasalah TikTok by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-completed' && 'Log Pesanan Selesai TikTok by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-returns' && 'Log Pesanan Retur TikTok by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-cancellations' && 'Pelacak Pesanan Batal TikTok by Tokopedia'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-hpp-calc' && 'Kalkulator HPP & Simulasi Jual TikTok'}
                {activePlatform === 'tiktok' && ttActiveTab === 'tt-bcg' && 'Matriks BCG Produk TikTok by Tokopedia'}
              </span>
            </h1>
            <p>
              {activePlatform === 'shopee' && activeTab === 'upload' && 'Siapkan file ekspor Shopee Anda untuk memulai.'}
              {activePlatform === 'shopee' && activeTab === 'overview' && 'Analisis visual kesehatan keuangan toko Anda.'}
              {activePlatform === 'shopee' && activeTab === 'pl' && 'Laba bersih take-home profit & potongan biaya administrasi.'}
              {activePlatform === 'shopee' && activeTab === 'products' && 'Identifikasi SKU terlaris & HPP paling efisien.'}
              {activePlatform === 'shopee' && activeTab === 'bcg' && 'Pemetaan portofolio produk ke dalam kuadran Stars, Cash Cows, Question Marks, dan Dogs.'}
              {activePlatform === 'shopee' && activeTab === 'hpp-calc' && 'Hitung modal riil per unit barang & simulasikan rekomendasi harga jual Shopee.'}
              {activePlatform === 'shopee' && activeTab === 'problems' && 'Pantau penjualan rugi, pengiriman stagnan, dan pembatalan setelah resi keluar.'}
              {activePlatform === 'shopee' && activeTab === 'completed' && 'Daftar semua rincian pesanan yang berhasil terselesaikan.'}
              {activePlatform === 'shopee' && activeTab === 'returns' && 'Pelacakan komplain, barang retur, dan pengembalian dana pembeli.'}
              {activePlatform === 'shopee' && activeTab === 'cancellations' && 'Pantau rasio pembatalan order & kurir gagal kirim.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-upload' && 'Unggah file pesanan & income TikTok untuk analisis cohort TikTok Shop by Tokopedia.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-overview' && 'Ringkasan KPI, biaya platform, dan performa toko TikTok Shop by Tokopedia.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-pl' && 'Laba bersih operasional cohort & rincian potongan biaya TikTok Shop by Tokopedia.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-sku' && 'Profitabilitas dan margin per SKU produk dalam cohort TikTok Shop by Tokopedia.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-all-orders' && 'Daftar lengkap seluruh pesanan TikTok: selesai, retur, dan batal.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-problems' && 'Pantau penjualan rugi, retur tanpa resi, dan kurir gagal kirim.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-completed' && 'Daftar rincian pesanan selesai TikTok Shop by Tokopedia.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-returns' && 'Pelacakan komplain, barang retur, dan pengembalian dana TikTok Shop by Tokopedia.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-cancellations' && 'Pantau rasio pembatalan order & kurir gagal kirim TikTok Shop by Tokopedia.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-hpp-calc' && 'Hitung modal riil per unit barang & simulasikan rekomendasi harga jual TikTok Shop by Tokopedia.'}
              {activePlatform === 'tiktok' && ttActiveTab === 'tt-bcg' && 'Pemetaan portofolio produk TikTok ke dalam kuadran Stars, Cash Cows, Question Marks, dan Dogs.'}
            </p>
          </div>

          {/* Month Filter Selector (visible only when data is ready) */}
          {activePlatform === 'shopee' && isDataReady && analysisResult && (
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
        {(loading || ttLoading) && (
          <div className="loading-overlay">
            <Loader2 className={`loading-spinner animate-spin ${activePlatform === 'tiktok' ? 'tiktok-spinner' : ''}`} size={40} />
            <p>Membaca dan memproses file Excel...</p>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <section className="content-body">
          {/* ===== SHOPEE CONTENT ===== */}
          {activePlatform === 'shopee' && (
            <>
              {activeTab === 'upload' && (
                <UploadZone
                  files={files}
                  onFilesUploaded={handleFilesUploaded}
                  loading={loading}
                  error={error}
                  rawOrderData={rawOrderData}
                />
              )}

              {activeTab === 'hpp-calc' && <HppCalculator platform="shopee" />}

              {isDataReady && analysisResult ? (
                <>
                  {activeTab === 'overview' && <DashboardOverview data={analysisResult} onReset={resetAllData} />}
                  {activeTab === 'pl' && <PLStatement data={analysisResult} />}
                  {activeTab === 'products' && <ProductAnalysis products={analysisResult.products} />}
                  {activeTab === 'bcg' && <BcgAnalysis products={analysisResult.products} />}
                  {activeTab === 'problems' && <ProblematicOrders data={analysisResult} />}
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
            </>
          )}

          {/* ===== TIKTOK CONTENT ===== */}
          {activePlatform === 'tiktok' && (
            <>
              {ttActiveTab === 'tt-upload' && (
                <TikTokUploadZone files={ttFiles} onFilesUploaded={handleTtFilesUploaded} loading={ttLoading} error={ttError} rawOrders={ttRawOrders} ttParsedHpp={ttParsedHpp} />
              )}
              {ttActiveTab === 'tt-hpp-calc' && <HppCalculator platform="tiktok" />}
              {isTtDataReady && ttResult ? (
                <>
                  {ttActiveTab === 'tt-overview' && <TikTokDashboard result={ttResult} onReset={resetTtData} />}
                  {ttActiveTab === 'tt-pl' && <TikTokPLStatement result={ttResult} />}
                  {ttActiveTab === 'tt-sku' && <TikTokSkuList result={ttResult} />}
                  {ttActiveTab === 'tt-bcg' && (
                    <BcgAnalysis 
                      products={ttResult.skuList.map(s => ({
                        sku: s.sku,
                        name: s.pname,
                        variation: s.vname,
                        qty: s.qty,
                        omzetNet: s.revenue,
                        hppUnit: s.qty > 0 ? s.hpp / s.qty : 0
                      }))} 
                      platformName="TikTok Shop" 
                    />
                  )}
                  {ttActiveTab === 'tt-all-orders' && <TikTokAllOrders result={ttResult} />}
                  {ttActiveTab === 'tt-problems' && <TikTokProblematicOrders result={ttResult} />}
                  {ttActiveTab === 'tt-completed' && <TikTokCompletedOrders result={ttResult} />}
                  {ttActiveTab === 'tt-returns' && <TikTokReturnedOrders result={ttResult} />}
                  {ttActiveTab === 'tt-cancellations' && <TikTokCancellationTracker batalSummary={ttResult.batalSummary} />}
                </>
              ) : (
                ttActiveTab !== 'tt-upload' && ttActiveTab !== 'tt-hpp-calc' && (
                  <div className="data-prompt-card">
                    <Music2 size={48} className="text-muted mb-4" style={{ color: '#ee3b5f', opacity: 0.5 }} />
                    <h3>Data TikTok Belum Lengkap</h3>
                    <p>Silakan kembali ke <strong>Pusat Unggah TikTok</strong> dan upload ketiga file yang wajib: File Pesanan, File Income, dan File HPP.</p>
                    <button className="btn-tiktok-primary mt-4" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }} onClick={() => setTtActiveTab('tt-upload')}>
                      Ke Pusat Unggah TikTok
                    </button>
                  </div>
                )
              )}
            </>
          )}
        </section>

        <footer className="main-footer">
          <p>&copy; {new Date().getFullYear()} Marketplace Financial Analyzer — Shopee & TikTok Shop (Client-Side Only Mode).</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
