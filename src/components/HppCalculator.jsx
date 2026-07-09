import React, { useState, useEffect, useRef } from 'react';
import { Percent, Info, ShoppingBag, ArrowRight, HelpCircle, Search, Check } from 'lucide-react';

const HppCalculator = () => {
  // 1. HPP Components State
  const [purchasePrice, setPurchasePrice] = useState(25000);
  const [packingPrice, setPackingPrice] = useState(1500);
  const [cargoPrice, setCargoPrice] = useState(1000);
  const [laborPrice, setLaborPrice] = useState(500);
  const [defectRate, setDefectRate] = useState(2); // in percent of purchase price
  const [otherOverhead, setOtherOverhead] = useState(0);

  // 2. Shopee Seller & Category Setup
  const [sellerType, setSellerType] = useState('star'); // star, nonStar, mall
  const [categoryGroup, setCategoryGroup] = useState('B'); // B for Helm default
  const [productSize, setProductSize] = useState('biasa'); // biasa, khusus

  // Search Category State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('Otomotif (Helm, Aksesoris Motor/Mobil, Ban, Oli)');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Official Shopee Indonesia Admin Fee Rates (2025/2026)
  const shopeeAdminRates = {
    nonStar: {
      A: 10.0,
      B: 9.0,
      C: 6.5,
      D: 5.25,
      E: 4.25,
      F: 4.25,
      G: 4.25,
      H: 4.25,
      khusus: 2.5
    },
    star: {
      A: 10.0,
      B: 9.0,
      C: 6.5,
      D: 5.25,
      E: 4.25,
      F: 4.25,
      G: 4.25,
      H: 4.25,
      khusus: 2.5
    },
    mall: {
      A: 11.0,
      B: 9.95,
      C: 7.7,
      D: 5.7,
      E: 4.2,
      F: 4.2,
      G: 4.2,
      H: 4.2,
      khusus: 2.5
    }
  };

  // Official Gratis Ongkir XTRA Rates (based on User Table)
  const gratisOngkirRates = {
    A: { biasa: 1.0, khusus: 2.5 },
    B: { biasa: 2.0, khusus: 3.5 },
    C: { biasa: 3.5, khusus: 5.0 },
    D: { biasa: 5.5, khusus: 7.0 },
    E: { biasa: 6.0, khusus: 7.5 },
    F: { biasa: 6.5, khusus: 8.0 },
    G: { biasa: 7.5, khusus: 9.0 },
    H: { biasa: 8.0, khusus: 9.5 },
    khusus: { biasa: 1.0, khusus: 2.5 }
  };

  // Shopee Search Database with exact subcategory overrides
  const categorySearchDatabase = [
    { keywords: ['helm', 'helmet', 'visor', 'kancing helm', 'pet helm', 'bogo', 'retro', 'motor', 'mobil', 'otomotif', 'ban', 'oli', 'kancing', 'skrup'], group: 'B', name: 'Otomotif (Helm, Aksesoris Motor/Mobil, Ban, Oli)', adminFeeOverride: 9.0 },
    { keywords: ['speaker', 'home theater', 'karaoke', 'mixer', 'amplifier', 'mikrofon', 'microphone', 'audio', 'kabel audio'], group: 'B', name: 'Audio (Speaker, Mikrofon, Mixer, Amplifier)', adminFeeOverride: 9.0 },
    { keywords: ['earphone', 'headphone', 'headset', 'handsfree'], group: 'C', name: 'Audio (Earphone, Headphone, Headset)', adminFeeOverride: 6.75 },
    { keywords: ['mp3', 'mp4', 'media player', 'cd', 'dvd', 'blu-ray', 'tape', 'radio'], group: 'B', name: 'Audio (Media Player, CD/DVD, Radio)', adminFeeOverride: 9.5 },
    { keywords: ['kelistrikan', 'saklar', 'stop kontak', 'sambungan kabel', 'alarm', 'bel'], group: 'A', name: 'Kelistrikan (Saklar, Stop Kontak, Kabel Roll)', adminFeeOverride: 10.0 },
    { keywords: ['baju', 'pakaian', 'kaos', 't-shirt', 'kemeja', 'celana', 'rok', 'jaket', 'sweater', 'hoodie', 'gamis', 'hijab', 'kerudung', 'daster', 'kebaya', 'pakaian dalam', 'kaki', 'jeans', 'singlet', 'jersey'], group: 'A', name: 'Fashion & Pakaian (Pria/Wanita, Muslim, Pakaian Dalam)' },
    { keywords: ['sepatu', 'sandal', 'sneakers', 'boots', 'heels', 'wedges', 'flat shoes', 'kaos kaki'], group: 'A', name: 'Alas Kaki & Sepatu (Pria, Wanita, Anak)' },
    { keywords: ['tas', 'ransel', 'backpack', 'clutch', 'tote bag', 'dompet', 'koper', 'selempang'], group: 'A', name: 'Tas & Aksesoris Fashion' },
    { keywords: ['kosmetik', 'skincare', 'makeup', 'lipstik', 'bedak', 'foundations', 'serum', 'toner', 'facial wash', 'parfum', 'minyak wangi', 'sabun', 'shampoo', 'perawatan tubuh', 'body lotion'], group: 'A', name: 'Kecantikan, Kosmetik & Perawatan Diri' },
    { keywords: ['ibu', 'bayi', 'anak', 'mainan', 'botol susu', 'stroller', 'gendongan', 'baju bayi', 'empeng', 'piring bayi'], group: 'A', name: 'Ibu & Bayi (Kecuali Susu & Popok)' },
    { keywords: ['handphone', 'hp', 'smartphone', 'tablet', 'aksesoris hp', 'charger', 'casing', 'kabel data', 'powerbank', 'antigores'], group: 'D', name: 'Handphone, Gadget & Aksesorisnya', adminFeeOverride: 5.25 },
    { keywords: ['elektronik', 'tv', 'televisi', 'kulkas', 'ac', 'mesin cuci', 'microwave', 'oven', 'blender', 'rice cooker', 'kipas angin', 'setrika'], group: 'B', name: 'Peralatan Elektronik Rumah Tangga' },
    { keywords: ['kamera', 'camera', 'dslr', 'mirrorless', 'lensa', 'tripod', 'gimbal', 'cctv', 'drone'], group: 'C', name: 'Kamera, Foto & Video' },
    { keywords: ['komputer', 'laptop', 'pc', 'mouse', 'keyboard', 'printer', 'scanner', 'ram', 'ssd', 'harddisk', 'vga', 'router', 'wifi', 'tinta', 'proyektor'], group: 'C', name: 'Komputer & Aksesoris PC/Laptop' },
    { keywords: ['perlengkapan rumah', 'home', 'living', 'furniture', 'meja', 'kursi', 'lemari', 'tempat tidur', 'kasur', 'sprei', 'selimut', 'bantal', 'gorden', 'lampu', 'dekorasi', 'dapur', 'piring', 'gelas', 'panci', 'sapu', 'rak'], group: 'C', name: 'Perlengkapan Rumah & Furniture' },
    { keywords: ['olahraga', 'sport', 'sepeda', 'jersey', 'sepatu bola', 'raket', 'barbel', 'tenda', 'camping', 'outdoor', 'alat pancing'], group: 'B', name: 'Peralatan Olahraga & Outdoor', adminFeeOverride: 9.0 },
    { keywords: ['makanan', 'minuman', 'snack', 'camilan', 'kopi', 'teh', 'mie instan', 'cokelat', 'permen', 'bumbu dapur', 'sambal', 'sirup', 'kue'], group: 'A', name: 'Makanan & Minuman (FMCG / Kuliner)', adminFeeOverride: 10.0 },
    { keywords: ['buku', 'novel', 'komik', 'majalah', 'buku pelajaran', 'alat tulis', 'pulpen', 'pensil', 'penghapus', 'penggaris', 'buku tulis', 'kertas', 'crayon'], group: 'D', name: 'Buku, Novel, Alat Tulis & Kantor' },
    { keywords: ['hewan', 'pet', 'kucing', 'anjing', 'ikan', 'burung', 'makanan kucing', 'makanan anjing', 'pasir kucing', 'kandang'], group: 'A', name: 'Kebutuhan Hewan Peliharaan (Pet Shop)', adminFeeOverride: 10.0 },
    { keywords: ['sembako', 'beras', 'minyak goreng', 'gula pasir', 'garam', 'telur', 'tepung', 'kecap'], group: 'E', name: 'Sembako & Kebutuhan Pokok Sehari-hari' },
    { keywords: ['popok', 'diaper', 'pampers', 'susu bayi', 'susu formula', 'susu anak'], group: 'C', name: 'Popok Bayi & Susu Formula Anak', adminFeeOverride: 6.5 },
    { keywords: ['hobi', 'koleksi', 'action figure', 'gundam', 'lego', 'kartu game', 'board game', 'alat musik', 'gitar', 'keyboard musik', 'biola'], group: 'B', name: 'Hobi, Koleksi & Alat Musik' },
    { keywords: ['digital', 'pulsa', 'paket data', 'voucher', 'tiket', 'e-money', 'pln', 'listrik', 'bpjs'], group: 'khusus', name: 'Produk Digital (Pulsa, Voucher, PLN, Tiket)' }
  ];

  // 3. Shopee Basic Fees State
  const [adminFeePercent, setAdminFeePercent] = useState(9.0); // 9.0% default
  const [transactionFeePercent, setTransactionFeePercent] = useState(2.0);
  const [flatProcessFee, setFlatProcessFee] = useState(1250); 
  const [targetMarginPercent, setTargetMarginPercent] = useState(15.0);

  // 4. Shopee Optional Programs State (Checkboxes & Percentages)
  const [activeGratisOngkir, setActiveGratisOngkir] = useState(true);
  const [gratisOngkirPercent, setGratisOngkirPercent] = useState(2.0); // B Biasa is 2.0%

  const [activeCashback, setActiveCashback] = useState(false);
  const [cashbackPercent, setCashbackPercent] = useState(1.4);

  const [activeLiveXtra, setActiveLiveXtra] = useState(false);
  const [liveXtraPercent, setLiveXtraPercent] = useState(4.0);

  const [activeSpayLater, setActiveSpayLater] = useState(false);
  const [spayLaterPercent, setSpayLaterPercent] = useState(1.5);

  const [activeAffiliate, setActiveAffiliate] = useState(false);
  const [affiliatePercent, setAffiliatePercent] = useState(5.0);

  const [activeInsurance, setActiveInsurance] = useState(false);
  const [insurancePercent, setInsurancePercent] = useState(0.5);

  const [activeHematKirim, setActiveHematKirim] = useState(false);
  const [hematKirimFee, setHematKirimFee] = useState(350); 

  // Store custom fee override selected from search list
  const [customOverrideRate, setCustomOverrideRate] = useState(null);

  // Automatically adjust Gratis Ongkir XTRA percent based on category group & size
  useEffect(() => {
    if (gratisOngkirRates[categoryGroup]) {
      const rate = gratisOngkirRates[categoryGroup][productSize];
      setGratisOngkirPercent(rate);
    }
  }, [categoryGroup, productSize]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const lower = val.toLowerCase().trim();
    const filtered = categorySearchDatabase.filter(item => 
      item.name.toLowerCase().includes(lower) || 
      item.keywords.some(kw => kw.includes(lower))
    );
    setSearchResults(filtered);
    setShowDropdown(true);
  };

  // Select Category from Search Results
  const selectCategory = (cat) => {
    setCategoryGroup(cat.group);
    setSelectedCategoryName(cat.name);
    if (cat.adminFeeOverride !== undefined) {
      setCustomOverrideRate(cat.adminFeeOverride);
      setAdminFeePercent(cat.adminFeeOverride);
    } else {
      setCustomOverrideRate(null);
      const rate = shopeeAdminRates[sellerType][cat.group];
      setAdminFeePercent(rate);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Automatically update Admin Fee % when Seller Type or Category changes
  useEffect(() => {
    // If the category was selected from search and has a custom override,
    // we adjust it slightly based on shop type if it is Mall (+0.5% - +1.0%)
    if (customOverrideRate !== null) {
      let finalRate = customOverrideRate;
      if (sellerType === 'mall') {
        // Shopee Mall is typically ~1.0% higher than Star
        finalRate = Math.min(11.7, customOverrideRate + 0.95);
      }
      setAdminFeePercent(finalRate);
    } else {
      const rate = shopeeAdminRates[sellerType][categoryGroup] || 4.25;
      setAdminFeePercent(rate);
    }
  }, [sellerType, categoryGroup, customOverrideRate]);

  // Handle Click Outside Dropdown to close it
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
  const defectCost = (purchasePrice * defectRate) / 100;
  const totalHpp = purchasePrice + packingPrice + cargoPrice + laborPrice + defectCost + otherOverhead;

  // Gratis Ongkir XTRA Cap limit: Rp 40.000 for standard, Rp 60.000 for special
  const gratisOngkirCap = productSize === 'khusus' ? 60000 : 40000;

  // Sum up all active platform fee percentages
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
  
  // Total flat fees
  const totalFlatFees = flatProcessFee + (activeHematKirim ? hematKirimFee : 0);

  // Two-Pass calculation to handle the Gratis Ongkir XTRA Cap
  let divisor = 1 - (totalPlatformFeesPercent / 100) - (targetMarginPercent / 100);
  let recommendedPrice = divisor > 0 ? (totalHpp + totalFlatFees) : 0;
  
  let calcAdminFee = 0;
  let calcTransactionFee = 0;
  let calcGratisOngkir = 0;
  let calcCashback = 0;
  let calcLiveXtra = 0;
  let calcSpayLater = 0;
  let calcAffiliate = 0;
  let calcInsurance = 0;
  let totalDeductionsRupiah = 0;
  let isGratisOngkirCapped = false;

  if (divisor > 0) {
    recommendedPrice = (totalHpp + totalFlatFees) / divisor;
    
    // Check if Gratis Ongkir fee exceeds the cap at this price
    calcGratisOngkir = activeGratisOngkir ? (recommendedPrice * gratisOngkirPercent) / 100 : 0;
    
    if (activeGratisOngkir && calcGratisOngkir > gratisOngkirCap) {
      isGratisOngkirCapped = true;
      // Recalculate price treating Gratis Ongkir as a flat fee instead of percentage
      const platformFeesWithoutGratisOngkir = totalPlatformFeesPercent - gratisOngkirPercent;
      const newDivisor = 1 - (platformFeesWithoutGratisOngkir / 100) - (targetMarginPercent / 100);
      
      recommendedPrice = newDivisor > 0 ? (totalHpp + totalFlatFees + gratisOngkirCap) / newDivisor : 0;
      calcGratisOngkir = gratisOngkirCap;
    }

    // Recalculate all percentage deductions based on the final recommended price
    calcAdminFee = (recommendedPrice * adminFeePercent) / 100;
    calcTransactionFee = (recommendedPrice * transactionFeePercent) / 100;
    calcCashback = activeCashback ? (recommendedPrice * cashbackPercent) / 100 : 0;
    calcLiveXtra = activeLiveXtra ? (recommendedPrice * liveXtraPercent) / 100 : 0;
    calcSpayLater = activeSpayLater ? (recommendedPrice * spayLaterPercent) / 100 : 0;
    calcAffiliate = activeAffiliate ? (recommendedPrice * affiliatePercent) / 100 : 0;
    calcInsurance = activeInsurance ? (recommendedPrice * insurancePercent) / 100 : 0;

    totalDeductionsRupiah = 
      calcAdminFee + 
      calcTransactionFee + 
      calcGratisOngkir + 
      calcCashback + 
      calcLiveXtra + 
      calcSpayLater + 
      calcAffiliate + 
      calcInsurance +
      totalFlatFees;
  }

  const netProfitUnit = recommendedPrice - totalHpp - totalDeductionsRupiah;

  // Category explanations mapping
  const categoryExplanations = {
    A: 'Fashion, Aksesoris, Kosmetik, Kecantikan, Ibu & Bayi, Perlengkapan Medis.',
    B: 'Elektronik, Handphone, Gadget, Kamera, Otomotif (Helm, dll), Hobi.',
    C: 'Komputer, Perlengkapan Rumah, Peralatan Olahraga, Media & Musik.',
    D: 'Makanan & Minuman, Buku & Alat Tulis, Kebutuhan Hewan Peliharaan.',
    E: 'Sembako, Susu & Popok Bayi, Perlengkapan Rumah Tangga Tertentu.',
    F: 'Subkategori Kesehatan & Kecantikan Tertentu, Peralatan Bayi.',
    G: 'Subkategori Elektronik & Otomotif Tertentu.',
    H: 'Kategori Khusus Berbiaya Admin Tertentu.',
    khusus: 'Produk Digital, Voucher, Tiket, Pulsa, E-Money.'
  };

  return (
    <div className="hpp-calculator-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Introduction */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)', borderColor: 'rgba(249, 115, 22, 0.2)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-orange) 0%, var(--accent-red) 100%)', borderRadius: '12px', padding: '12px', color: 'white' }}>
            <Percent size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Simulasi Kalkulator HPP &amp; Rekomendasi Harga Jual Shopee</h3>
            <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
              Masukkan komponen modal Anda, pilih tipe penjual, cari kategori produk untuk biaya admin dasar, lalu centang program opsional yang Anda ikuti (SPayLater, Promo/Gratis Ongkir Xtra, Live Xtra, Affiliate, Asuransi, Hemat Kirim) untuk kalkulasi harga jual yang presisi.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: HPP Components */}
          <div className="card">
            <div className="card-head" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>1. Komponen Modal Barang (HPP)</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Harga Beli Produk / Modal Supplier</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>Rp</span>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Biaya Packing (Plastik/Dus)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>Rp</span>
                    <input
                      type="number"
                      value={packingPrice}
                      onChange={(e) => setPackingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ongkir Cargo (ke Gudang)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>Rp</span>
                    <input
                      type="number"
                      value={cargoPrice}
                      onChange={(e) => setCargoPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Upah Tenaga Kerja Packing</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>Rp</span>
                    <input
                      type="number"
                      value={laborPrice}
                      onChange={(e) => setLaborPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tingkat Kerusakan / Defect (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={defectRate}
                      onChange={(e) => setDefectRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 24px 10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>%</span>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overhead Lain-Lain per Unit</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>Rp</span>
                  <input
                    type="number"
                    value={otherOverhead}
                    onChange={(e) => setOtherOverhead(Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shopee Fees */}
          <div className="card">
            <div className="card-head" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>2. Pengaturan Biaya Potongan Shopee</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Tipe Penjual & Ukuran Produk dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: '600' }}>Ukuran Paket/Produk</label>
                  <select
                    value={productSize}
                    onChange={(e) => setProductSize(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="biasa" style={{ background: '#1e2235' }}>Ukuran Biasa (Maks Rp 40.000)</option>
                    <option value="khusus" style={{ background: '#1e2235' }}>Ukuran Khusus (Maks Rp 60.000)</option>
                  </select>
                </div>
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
                  <div style={{ position: 'absolute', top: '64px', left: 0, right: 0, backgroundColor: '#1e2235', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                    {searchResults.map((cat, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectCategory(cat)}
                        style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                        className="hover-bg-dark"
                      >
                        <span style={{ fontSize: '12.5px', color: 'white' }}>{cat.name}</span>
                        <span className="badge blue" style={{ fontSize: '10px', padding: '2px 6px' }}>Grup {cat.group}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Category Info */}
              {selectedCategoryName && (
                <div style={{ padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.03)', borderRadius: '8px', border: '1px dashed rgba(34, 197, 94, 0.2)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kategori Aktif Terpilih:</span>
                    <span className="badge green" style={{ fontSize: '10px', background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                      GRUP {categoryGroup}
                    </span>
                  </div>
                  <strong style={{ fontSize: '12.5px', color: 'white' }}>
                    {selectedCategoryName}
                  </strong>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted2)' }}>
                    📖 <strong>Deskripsi:</strong> {categoryExplanations[categoryGroup]}
                  </span>
                </div>
              )}

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
                      (Auto set dari tabel kategori &amp; ukuran paket)
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
              </div>

              {/* Basic Fees Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Biaya Administrasi (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.05"
                      value={adminFeePercent}
                      onChange={(e) => setAdminFeePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 24px 10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>%</span>
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Biaya Transaksi (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={transactionFeePercent}
                      onChange={(e) => setTransactionFeePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 24px 10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: '600' }}>Target Margin Bersih (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.5"
                      value={targetMarginPercent}
                      onChange={(e) => setTargetMarginPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 24px 10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '6px', color: 'white', fontSize: '13px', fontWeight: 'bold' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '13px', color: 'var(--accent-orange)' }}>%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Outputs / Calculations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Result Card: HPP SUMMARY */}
          <div className="card" style={{ borderLeft: '6px solid var(--accent-red)', background: 'rgba(239, 68, 68, 0.01)' }}>
            <div className="card-head" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--accent-red)' }}>Hasil Perhitungan Modal (HPP)</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span className="text-muted">Harga Beli Produk:</span>
                <span className="font-semibold">{formatRp(purchasePrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span className="text-muted">Biaya Kemasan &amp; Packing:</span>
                <span className="font-semibold">{formatRp(packingPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span className="text-muted">Ongkir Cargo / Logistik:</span>
                <span className="font-semibold">{formatRp(cargoPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span className="text-muted">Upah Tenaga Kerja:</span>
                <span className="font-semibold">{formatRp(laborPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span className="text-muted">Biaya Penyusutan Defect ({defectRate}%):</span>
                <span className="font-semibold">{formatRp(defectCost)}</span>
              </div>
              {otherOverhead > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="text-muted">Overhead Lainnya:</span>
                  <span className="font-semibold">{formatRp(otherOverhead)}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', borderTop: '2px solid var(--border-color)', paddingTop: '12px', marginTop: '4px', color: 'white' }}>
                <span>TOTAL HPP PRODUK:</span>
                <span className="color-red" style={{ color: 'var(--accent-red)' }}>{formatRp(totalHpp)}</span>
              </div>
            </div>
          </div>

          {/* Result Card: SIMULASI JUAL SHOPEE */}
          <div className="card" style={{ borderLeft: '6px solid var(--accent-green)', background: 'rgba(34, 197, 94, 0.01)' }}>
            <div className="card-head" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--accent-green)' }}>Rekomendasi Harga Jual Shopee</h3>
            </div>
            
            {divisor <= 0 ? (
              <div className="alert alert-error" style={{ margin: 0, display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                <Info size={16} />
                <span>Error: Jumlah potongan shopee + target margin sudah melebihi 100%!</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: 'rgba(34, 197, 94, 0.05)', padding: '16px', borderRadius: '8px', border: '1px dashed rgba(34, 197, 94, 0.2)', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rekomendasi Harga Jual:</span>
                  <strong style={{ fontSize: '28px', color: 'var(--accent-green)', fontWeight: '800', margin: '4px 0' }}>
                    {formatRp(recommendedPrice)}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted2)' }}>
                    Pasang harga ini di Shopee untuk dapat margin bersih {targetMarginPercent}%
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span className="text-muted">Modal Awal Barang (HPP):</span>
                    <span className="font-semibold">{formatRp(totalHpp)}</span>
                  </div>

                  {/* Rincian Biaya Potongan Persentase */}
                  <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '11px' }}>Rincian Potongan Shopee ({totalPlatformFeesPercent.toFixed(2)}%):</span>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Biaya Administrasi ({adminFeePercent}%):</span>
                      <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcAdminFee)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Biaya Transaksi ({transactionFeePercent}%):</span>
                      <span style={{ color: 'var(--accent-red)' }}>- {formatRp(calcTransactionFee)}</span>
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
                    <span className="text-muted">Target Margin Bersih ({targetMarginPercent}%):</span>
                    <span className="font-semibold text-green" style={{ color: 'var(--accent-green)' }}>
                      + {formatRp(netProfitUnit)}
                    </span>
                  </div>
                </div>

                {/* Info Tip */}
                <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Info size={16} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <strong>Tips Harga Coret:</strong> Untuk memasang promo diskon/harga coret di Shopee, Anda harus menaikkan harga listing di atas rekomendasi harga jual di atas, lalu memotongnya lewat fitur Promo Toko Shopee.
                  </span>
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
