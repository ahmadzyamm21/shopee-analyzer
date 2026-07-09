import React, { useState, useEffect, useRef } from 'react';
import { Percent, Info, ShoppingBag, ArrowRight, HelpCircle, Search, Check, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import shopeeCategories from '../utils/shopee_categories.json';

const HppCalculator = () => {
  // 1. Core States
  const [hppValue, setHppValue] = useState(0); // HARGA MODAL / HPP (RP) - Default 0 as in mockup
  const [manualPrice, setManualPrice] = useState(0); // HARGA JUAL RENCANA (RP) - Default 0
  const [sellerVoucher, setSellerVoucher] = useState(0); // VOUCHER TOKO YANG DIPASANG (RP) - Default 0

  // 2. Shopee Seller & Category Setup
  const [sellerType, setSellerType] = useState('star'); // star, nonStar, mall
  const [categoryGroup, setCategoryGroup] = useState('G'); // G for default
  const [productSize, setProductSize] = useState('biasa'); // biasa, khusus

  // Default selected category
  const [selectedCategory, setSelectedCategory] = useState({
    "Kategori": "Sepeda Motor",
    "Sub Kategori": "Aksesoris Sepeda Motor",
    "Jenis Produk": "Karpet Motor, Speedometer, Odometer, & Gauge Motor, Sarung Motor, Stiker, Logo, & Emblem, Jok & Sarung Jok Motor, Spion Motor & Aksesoris, Kunci & Keamanan, Box Motor, Dudukan Handphone, Karpet Lumpur, Aksesoris Sepeda Motor Lainnya",
    "Star Rate": 8.25,
    "Mall Rate": 10.45,
    "Kategori Gratis Ongkir": "G",
    "GO Biasa": 7.5,
    "GO Khusus": 9.0
  });

  // Search Category State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 3. Shopee Basic Fees State
  const [adminFeePercent, setAdminFeePercent] = useState(8.25); 
  const transactionFeePercent = 0.0; // Removed from calculations
  const [flatProcessFee, setFlatProcessFee] = useState(1250); 

  // 4. Shopee Optional Programs State (Checkboxes & Percentages)
  const [activeGratisOngkir, setActiveGratisOngkir] = useState(true);
  const [gratisOngkirPercent, setGratisOngkirPercent] = useState(0.0); // Default 0.0%

  const [activeCashback, setActiveCashback] = useState(false);
  const [cashbackPercent, setCashbackPercent] = useState(0.0); // Default 0.0%

  const [activeLiveXtra, setActiveLiveXtra] = useState(false);
  const [liveXtraPercent, setLiveXtraPercent] = useState(0.0); // Default 0.0%

  const [activeSpayLater, setActiveSpayLater] = useState(false);
  const [spayLaterPercent, setSpayLaterPercent] = useState(0.0); // Default 0.0%

  const [activeAffiliate, setActiveAffiliate] = useState(false);
  const [affiliatePercent, setAffiliatePercent] = useState(0.0); // Default 0.0%

  const [activeInsurance, setActiveInsurance] = useState(false);
  const [insurancePercent, setInsurancePercent] = useState(0.0); // Default 0.0%

  const [activeHematKirim, setActiveHematKirim] = useState(false);
  const [hematKirimFee, setHematKirimFee] = useState(350); 

  // 5. Co-Funding Campaign States (CO-FOUNDED)
  const [activeCoFunding, setActiveCoFunding] = useState(true); // Default active as shown in mockup
  const [coFundingCampaignPercent, setCoFundingCampaignPercent] = useState(0.0); // CAMPAIGN (%) - Default 0
  const [coFundingPlatformSharePercent, setCoFundingPlatformSharePercent] = useState(90.0); // DITANGGUNG PLATFORM (%) - Default 90
  const [coFundingSellerSharePercent, setCoFundingSellerSharePercent] = useState(10.0); // DITANGGUNG SELLER (%) - Default 10

  // 6. Advertising Cost States
  const [activeAdvertising, setActiveAdvertising] = useState(false);
  const [advertisingType, setAdvertisingType] = useState('percent'); // percent, nominal
  const [advertisingValue, setAdvertisingValue] = useState(0.0);

  // 6. Collapsible / Accordion States
  const [isOpenSimulasi, setIsOpenSimulasi] = useState(true);
  const [isOpenShopeeFees, setIsOpenShopeeFees] = useState(true);
  const [isOpenHasil, setIsOpenHasil] = useState(true);

  // Sync Co-Funding shares
  const handlePlatformShareChange = (val) => {
    setCoFundingPlatformSharePercent(val);
    setCoFundingSellerSharePercent(Math.max(0, 100 - val));
  };

  const handleSellerShareChange = (val) => {
    setCoFundingSellerSharePercent(val);
    setCoFundingPlatformSharePercent(Math.max(0, 100 - val));
  };

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const lower = val.toLowerCase().trim();
    const filtered = shopeeCategories.filter(item => 
      item.Kategori.toLowerCase().includes(lower) || 
      item['Sub Kategori'].toLowerCase().includes(lower) || 
      item['Jenis Produk'].toLowerCase().includes(lower)
    ).slice(0, 15);
    
    setSearchResults(filtered);
    setShowDropdown(true);
  };

  // Select Category
  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Automatically update Admin Fee % when selected category or shop type changes
  useEffect(() => {
    if (selectedCategory) {
      const starRate = selectedCategory['Star Rate'];
      const mallRate = selectedCategory['Mall Rate'];
      const rate = sellerType === 'mall' ? mallRate : starRate;
      setAdminFeePercent(rate);
      
      const group = selectedCategory['Kategori Gratis Ongkir'] || 'G';
      setCategoryGroup(group);
    }
  }, [sellerType, selectedCategory]);

  // Handle Click Outside Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper formatting
  const formatRp = (num) => {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  // Calculations
  const totalHpp = hppValue;
  const gratisOngkirCap = 40000; // Fixed standard size cap as requested

  // Net price after store voucher
  const hargaSetelahVoucher = Math.max(0, manualPrice - sellerVoucher);

  // Co-funding calculations
  const totalDiscountCampaign = activeCoFunding ? (coFundingCampaignPercent / 100) * hargaSetelahVoucher : 0;
  const platformShare = activeCoFunding ? (coFundingPlatformSharePercent / 100) * totalDiscountCampaign : 0;
  const sellerShare = activeCoFunding ? (coFundingSellerSharePercent / 100) * totalDiscountCampaign : 0;

  // Base price for Shopee percentage commission fees (calculated after voucher and seller-funded campaign discount)
  const discountedPrice = Math.max(0, hargaSetelahVoucher - sellerShare);

  // Calculate Shopee deductions
  let calcAdminFee = (discountedPrice * adminFeePercent) / 100;
  let calcTransactionFee = (discountedPrice * transactionFeePercent) / 100;
  let calcGratisOngkir = activeGratisOngkir ? (discountedPrice * gratisOngkirPercent) / 100 : 0;
  let isGratisOngkirCapped = false;
  if (activeGratisOngkir && calcGratisOngkir > gratisOngkirCap) {
    calcGratisOngkir = gratisOngkirCap;
    isGratisOngkirCapped = true;
  }

  let calcCashback = activeCashback ? (discountedPrice * cashbackPercent) / 100 : 0;
  let calcLiveXtra = activeLiveXtra ? (discountedPrice * liveXtraPercent) / 100 : 0;
  let calcSpayLater = activeSpayLater ? (discountedPrice * spayLaterPercent) / 100 : 0;
  let calcAffiliate = activeAffiliate ? (discountedPrice * affiliatePercent) / 100 : 0;
  let calcInsurance = activeInsurance ? (discountedPrice * insurancePercent) / 100 : 0;

  const totalFlatFees = flatProcessFee + (activeHematKirim ? hematKirimFee : 0);

  const totalDeductionsRupiah = 
    calcAdminFee + 
    calcTransactionFee + 
    calcGratisOngkir + 
    calcCashback + 
    calcLiveXtra + 
    calcSpayLater + 
    calcAffiliate + 
    calcInsurance +
    totalFlatFees +
    sellerShare + // Borne by seller in campaign
    sellerVoucher; // Store voucher borne by seller

  const netProfitUnit = manualPrice - totalHpp - totalDeductionsRupiah;
  const actualMarginPercent = manualPrice > 0 ? (netProfitUnit / manualPrice) * 100 : 0;

  // Sum up active platform fee percentages (excluding co-funding since it has its own custom share math)
  let activeGratisOngkirPercent = activeGratisOngkir ? gratisOngkirPercent : 0;
  const totalPlatformFeesPercent = 
    adminFeePercent + 
    transactionFeePercent + 
    activeGratisOngkirPercent + 
    (activeCashback ? cashbackPercent : 0) + 
    (activeLiveXtra ? liveXtraPercent : 0) + 
    (activeSpayLater ? spayLaterPercent : 0) + 
    (activeAffiliate ? affiliatePercent : 0) +
    (activeInsurance ? insurancePercent : 0);

  return (
    <div className="hpp-calculator-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Introduction */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)', borderColor: 'rgba(249, 115, 22, 0.2)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-orange) 0%, var(--accent-red) 100%)', borderRadius: '12px', padding: '12px', color: 'white' }}>
            <Percent size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Simulasi Kalkulator HPP &amp; Laba Bersih Shopee</h3>
            <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
              Masukkan harga modal, harga jual rencana, voucher toko, dan biaya campaign untuk menghitung estimasi keuntungan bersih toko Anda secara detail.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Input Card (HPP, Price, Voucher, Campaign) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Simulasi Biaya & Laba Produk (Collapsible) */}
          <div className="card">
            <div 
              onClick={() => setIsOpenSimulasi(!isOpenSimulasi)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: isOpenSimulasi ? '1px solid var(--border-color)' : 'none', paddingBottom: isOpenSimulasi ? '12px' : '0', marginBottom: isOpenSimulasi ? '16px' : '0' }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📦 Simulasi Biaya &amp; Laba Produk</span>
              </h3>
              {isOpenSimulasi ? <ChevronUp size={16} style={{ color: 'var(--text-muted2)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted2)' }} />}
            </div>

            {isOpenSimulasi && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p className="text-muted" style={{ fontSize: '12px', margin: '0 0 4px 0' }}>
                  Masukkan komponen harga modal dan persentase potongan biaya marketplace untuk melihat estimasi keuntungan bersih.
                </p>

                {/* Grid HPP & Selling Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>HARGA MODAL / HPP (RP)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={hppValue === 0 ? '' : hppValue}
                        onChange={(e) => setHppValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0"
                        style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px', fontWeight: 'bold' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>HARGA JUAL RENCANA (RP)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={manualPrice === 0 ? '' : manualPrice}
                        onChange={(e) => setManualPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0"
                        style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px', fontWeight: 'bold' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Voucher Toko */}
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>VOUCHER TOKO YANG DIPASANG (RP)</label>
                  <input
                    type="number"
                    value={sellerVoucher === 0 ? '' : sellerVoucher}
                    onChange={(e) => setSellerVoucher(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#00ced1', fontWeight: '600', marginTop: '2px' }}>
                    Harga Jual - Voucher = {formatRp(hargaSetelahVoucher)}
                  </div>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

                {/* Co-Funded Campaign Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 'bold', color: 'var(--accent-orange)', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={activeCoFunding}
                        onChange={(e) => setActiveCoFunding(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                      />
                      <Tag size={16} /> Biaya Campaign (Co-Funded)
                    </label>
                  </div>

                  {activeCoFunding && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>CAMPAIGN (%)</label>
                          <input
                            type="number"
                            value={coFundingCampaignPercent === 0 ? '' : coFundingCampaignPercent}
                            onChange={(e) => setCoFundingCampaignPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="0"
                            style={{ width: '100%', padding: '6px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>DITANGGUNG PLATFORM (%)</label>
                          <input
                            type="number"
                            value={coFundingPlatformSharePercent === 0 ? '' : coFundingPlatformSharePercent}
                            onChange={(e) => handlePlatformShareChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                            placeholder="0"
                            style={{ width: '100%', padding: '6px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>DITANGGUNG SELLER (%)</label>
                          <input
                            type="number"
                            value={coFundingSellerSharePercent === 0 ? '' : coFundingSellerSharePercent}
                            onChange={(e) => handleSellerShareChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                            placeholder="0"
                            style={{ width: '100%', padding: '6px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#ffb703', fontWeight: 'bold', marginTop: '2px' }}>
                        Diskon Campaign: {formatRp(totalDiscountCampaign)} | Platform: {formatRp(platformShare)} | Seller: {formatRp(sellerShare)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Pengaturan Biaya Shopee (Collapsible) */}
          <div className="card">
            <div 
              onClick={() => setIsOpenShopeeFees(!isOpenShopeeFees)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: isOpenShopeeFees ? '1px solid var(--border-color)' : 'none', paddingBottom: isOpenShopeeFees ? '12px' : '0', marginBottom: isOpenShopeeFees ? '16px' : '0' }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️ Pengaturan Biaya Shopee</span>
              </h3>
              {isOpenShopeeFees ? <ChevronUp size={16} style={{ color: 'var(--text-muted2)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted2)' }} />}
            </div>
            
            {isOpenShopeeFees && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Tipe Penjual dropdown */}
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: '600' }}>Tipe Penjual / Toko</label>
                  <select
                    value={sellerType}
                    onChange={(e) => setSellerType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="star" style={{ background: '#1e2235' }}>Penjual Star / Star+</option>
                    <option value="nonStar" style={{ background: '#1e2235' }}>Penjual Non-Star</option>
                    <option value="mall" style={{ background: '#1e2235' }}>Shopee Mall</option>
                  </select>
                </div>

                {/* Search Category Bar */}
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }} ref={dropdownRef}>
                  <label style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: '600' }}>Cari Kategori Produk Anda</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted2)' }} />
                    <input
                      type="text"
                      placeholder="Ketik nama produk (misal: helm, kaos, laptop, susu...)"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* Dropdown Results */}
                  {showDropdown && searchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '64px', left: 0, right: 0, backgroundColor: '#1e2235', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 100, maxHeight: '250px', overflowY: 'auto' }}>
                      {searchResults.map((cat, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectCategory(cat)}
                          style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px', transition: 'background 0.2s' }}
                          className="hover-bg-dark"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12.5px', color: 'white', fontWeight: 'bold' }}>
                              {cat['Sub Kategori']}
                            </span>
                            <span className="badge blue" style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {cat.Kategori}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cat['Jenis Produk']}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Category Info */}
                {selectedCategory && (
                  <div style={{ padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.03)', borderRadius: '8px', border: '1px dashed rgba(34, 197, 94, 0.2)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kategori Aktif Terpilih:</span>
                      <span className="badge green" style={{ fontSize: '10px', background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                        GO GRUP {categoryGroup}
                      </span>
                    </div>
                    <strong style={{ fontSize: '12.5px', color: 'white' }}>
                      {selectedCategory.Kategori} &gt; {selectedCategory['Sub Kategori']}
                    </strong>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted2)' }}>
                      📖 <strong>Jenis Produk:</strong> {selectedCategory['Jenis Produk']}
                    </span>
                  </div>
                )}

                {/* Biaya Administrasi */}
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: '600' }}>Biaya Administrasi (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.05"
                      value={adminFeePercent}
                      onChange={(e) => setAdminFeePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 24px 10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px', fontWeight: 'bold' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '13px', color: 'var(--accent-orange)' }}>%</span>
                  </div>
                </div>

                {/* OPTIONAL SHOPEE PROGRAMS (CHECKBOXES & INPUTS) */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-orange)' }}>Ikut Program Shopee Opsional (Centang jika ikut):</h4>
                  
                  {/* 1. Gratis Ongkir XTRA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={activeGratisOngkir}
                          onChange={(e) => setActiveGratisOngkir(e.target.checked)}
                          style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                        />
                        Gratis Ongkir XTRA
                      </label>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted2)', marginLeft: '20px' }}>
                        (Diisi manual, default 0.00%)
                      </span>
                    </div>
                    {activeGratisOngkir && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={gratisOngkirPercent}
                          onChange={(e) => setGratisOngkirPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ width: '50px', padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted2)' }}>%</span>
                      </div>
                    )}
                  </div>

                  {/* 2. Promo XTRA / Cashback XTRA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={activeCashback}
                        onChange={(e) => setActiveCashback(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                      />
                      Cashback / Promo XTRA
                    </label>
                    {activeCashback && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={cashbackPercent}
                          onChange={(e) => setCashbackPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ width: '50px', padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted2)' }}>%</span>
                      </div>
                    )}
                  </div>

                  {/* 3. Shopee Live XTRA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={activeLiveXtra}
                        onChange={(e) => setActiveLiveXtra(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                      />
                      Shopee Live XTRA
                    </label>
                    {activeLiveXtra && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={liveXtraPercent}
                          onChange={(e) => setLiveXtraPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ width: '50px', padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted2)' }}>%</span>
                      </div>
                    )}
                  </div>

                  {/* 4. SPayLater Merchant Fee */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={activeSpayLater}
                        onChange={(e) => setActiveSpayLater(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                      />
                      Transaksi SPayLater
                    </label>
                    {activeSpayLater && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={spayLaterPercent}
                          onChange={(e) => setSpayLaterPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ width: '50px', padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted2)' }}>%</span>
                      </div>
                    )}
                  </div>

                  {/* 5. Komisi Affiliate / Video */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={activeAffiliate}
                        onChange={(e) => setActiveAffiliate(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                      />
                      Komisi Affiliate / Video
                    </label>
                    {activeAffiliate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={affiliatePercent}
                          onChange={(e) => setAffiliatePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ width: '50px', padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted2)' }}>%</span>
                      </div>
                    )}
                  </div>

                  {/* 6. Biaya Asuransi Pengiriman */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={activeInsurance}
                        onChange={(e) => setActiveInsurance(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                      />
                      Biaya Asuransi Pengiriman
                    </label>
                    {activeInsurance && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          step="0.05"
                          value={insurancePercent}
                          onChange={(e) => setInsurancePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ width: '50px', padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted2)' }}>%</span>
                      </div>
                    )}
                  </div>

                  {/* 7. Biaya Hemat Kirim (Flat) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={activeHematKirim}
                        onChange={(e) => setActiveHematKirim(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                      />
                      Program Hemat Kirim
                    </label>
                    {activeHematKirim && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted2)' }}>Rp</span>
                        <input
                          type="number"
                          value={hematKirimFee}
                          onChange={(e) => setHematKirimFee(Math.max(0, parseInt(e.target.value) || 0))}
                          style={{ width: '55px', padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', textAlign: 'center' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 8. Estimasi Biaya Iklan per Produk (Opsional) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={activeAdvertising}
                          onChange={(e) => setActiveAdvertising(e.target.checked)}
                          style={{ cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                        />
                        Estimasi Biaya Iklan Produk (Opsional)
                      </label>
                      {activeAdvertising && (
                        <span style={{ fontSize: '11px', color: '#ffb703', fontWeight: 'bold' }}>
                          Iklan: {formatRp(calcAdvertising)}
                        </span>
                      )}
                    </div>
                    {activeAdvertising && (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                        <select
                          value={advertisingType}
                          onChange={(e) => setAdvertisingType(e.target.value)}
                          style={{ padding: '6px', backgroundColor: '#1e2235', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="percent" style={{ background: '#1e2235', color: 'white' }}>% Persen</option>
                          <option value="nominal" style={{ background: '#1e2235', color: 'white' }}>Rp Nominal</option>
                        </select>
                        <div style={{ position: 'relative', flex: 1 }}>
                          {advertisingType === 'nominal' && (
                            <span style={{ position: 'absolute', left: '8px', top: '5px', fontSize: '11px', color: 'var(--text-muted2)' }}>Rp</span>
                          )}
                          <input
                            type="number"
                            step={advertisingType === 'percent' ? '0.1' : '100'}
                            value={advertisingValue === 0 ? '' : advertisingValue}
                            onChange={(e) => setAdvertisingValue(Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="0"
                            style={{ 
                              width: '100%', 
                              padding: advertisingType === 'nominal' ? '5px 8px 5px 28px' : '5px 24px 5px 8px', 
                              backgroundColor: 'rgba(0,0,0,0.2)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '4px', 
                              color: 'white', 
                              fontSize: '12px', 
                              fontWeight: 'bold',
                              textAlign: 'left'
                            }}
                          />
                          {advertisingType === 'percent' && (
                            <span style={{ position: 'absolute', right: '8px', top: '5px', fontSize: '11px', color: 'var(--text-muted2)' }}>%</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Fees Inputs (Process Fee Only) */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Biaya Proses Pesanan (Flat)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>Rp</span>
                      <input
                        type="number"
                        value={flatProcessFee}
                        onChange={(e) => setFlatProcessFee(Math.max(0, parseFloat(e.target.value) || 0))}
                        style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outputs (Hasil Perhitungan & Keuntungan) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 3: Hasil Perhitungan & Keuntungan (Collapsible) */}
          <div className="card" style={{ borderLeft: '6px solid var(--accent-green)', background: 'rgba(34, 197, 94, 0.01)' }}>
            <div 
              onClick={() => setIsOpenHasil(!isOpenHasil)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: isOpenHasil ? '1px solid var(--border-color)' : 'none', paddingBottom: isOpenHasil ? '12px' : '0', marginBottom: isOpenHasil ? '16px' : '0' }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)' }}>
                <span>📊 Hasil Perhitungan &amp; Keuntungan</span>
                {!isOpenHasil && <span style={{ fontSize: '12.5px', color: 'var(--accent-green)', fontWeight: 'bold' }}>({formatRp(netProfitUnit)} / {actualMarginPercent.toFixed(1)}%)</span>}
              </h3>
              {isOpenHasil ? <ChevronUp size={16} style={{ color: 'var(--text-muted2)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted2)' }} />}
            </div>

            {isOpenHasil && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: 'rgba(34, 197, 94, 0.05)', padding: '16px', borderRadius: '8px', border: '1px dashed rgba(34, 197, 94, 0.2)', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rencana Harga Jual:</span>
                    <strong style={{ fontSize: '28px', color: 'var(--accent-green)', fontWeight: '800', margin: '4px 0' }}>
                      {formatRp(manualPrice)}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>
                      Margin Bersih yang Anda Dapatkan: {actualMarginPercent.toFixed(2)}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span className="text-muted">Modal Awal Barang (HPP):</span>
                      <span className="font-semibold">{formatRp(totalHpp)}</span>
                    </div>

                    {sellerVoucher > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span className="text-muted">Voucher Diskon Penjual:</span>
                        <span className="font-semibold" style={{ color: 'var(--accent-orange)' }}>- {formatRp(sellerVoucher)}</span>
                      </div>
                    )}

                    {activeCoFunding && sellerShare > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span className="text-muted">Campaign Co-Funding (Seller Share):</span>
                        <span className="font-semibold" style={{ color: 'var(--accent-orange)' }}>- {formatRp(sellerShare)}</span>
                      </div>
                    )}

                    {/* Rincian Biaya Potongan Persentase */}
                    <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 'bold', color: 'white', fontSize: '11px' }}>Rincian Potongan Shopee ({totalPlatformFeesPercent.toFixed(2)}%):</span>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Biaya Administrasi ({adminFeePercent}%):</span>
                        <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcAdminFee)}</span>
                      </div>
                      


                      {activeGratisOngkir && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">
                            Gratis Ongkir Xtra ({gratisOngkirPercent}%)
                            {isGratisOngkirCapped && ' (Maksimal Cap)'}:
                          </span>
                          <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcGratisOngkir)}</span>
                        </div>
                      )}

                      {activeCashback && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">Cashback / Promo Xtra ({cashbackPercent}%):</span>
                          <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcCashback)}</span>
                        </div>
                      )}

                      {activeLiveXtra && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">Shopee Live Xtra ({liveXtraPercent}%):</span>
                          <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcLiveXtra)}</span>
                        </div>
                      )}

                      {activeSpayLater && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">SPayLater Merchant Fee ({spayLaterPercent}%):</span>
                          <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcSpayLater)}</span>
                        </div>
                      )}

                      {activeAffiliate && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">Komisi Affiliate / Video ({affiliatePercent}%):</span>
                          <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcAffiliate)}</span>
                        </div>
                      )}

                      {activeInsurance && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">Biaya Asuransi ({insurancePercent}%):</span>
                          <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcInsurance)}</span>
                        </div>
                      )}

                      {activeAdvertising && calcAdvertising > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">
                            Estimasi Biaya Iklan 
                            {advertisingType === 'percent' ? ` (${advertisingValue}%)` : ''}:
                          </span>
                          <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcAdvertising)}</span>
                        </div>
                      )}

                      {(flatProcessFee > 0 || activeHematKirim) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed var(--border-color)', paddingTop: '4px', marginTop: '2px' }}>
                          {flatProcessFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span className="text-muted">Biaya Proses Pesanan (Flat):</span>
                              <span style={{ color: 'var(--accent-red)' }}>- {formatRp(flatProcessFee)}</span>
                            </div>
                          )}
                          {activeHematKirim && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span className="text-muted">Biaya Hemat Kirim (Flat):</span>
                              <span style={{ color: 'var(--accent-red)' }}>- {formatRp(hematKirimFee)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                      <span className="text-muted" style={{ fontWeight: 'bold' }}>Keuntungan Bersih (Margin):</span>
                      <span className="font-semibold text-green" style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>
                        + {formatRp(netProfitUnit)} ({actualMarginPercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Info Tip */}
                  <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Info size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      <strong>Tips Harga Coret:</strong> Untuk memasang promo diskon/harga coret di Shopee, Anda harus menaikkan harga listing di atas rencana harga jual di atas, lalu memotongnya lewat fitur Promo Toko Shopee.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HppCalculator;