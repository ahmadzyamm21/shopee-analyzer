import React, { useState, useEffect } from 'react';
import { Percent, Info, ShoppingBag, ArrowRight, HelpCircle } from 'lucide-react';

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
  const [categoryGroup, setCategoryGroup] = useState('A'); // A, B, C, D, E, khusus

  // Official Shopee Indonesia Admin Fee Rates (2025/2026)
  const shopeeAdminRates = {
    nonStar: {
      A: 6.0,
      B: 5.0,
      C: 5.0,
      D: 4.0,
      E: 3.0,
      khusus: 2.5
    },
    star: {
      A: 6.5,
      B: 5.5,
      C: 5.5,
      D: 4.5,
      E: 3.5,
      khusus: 2.5
    },
    mall: {
      A: 8.5,
      B: 7.5,
      C: 6.5,
      D: 5.5,
      E: 4.5,
      khusus: 2.5
    }
  };

  // 3. Shopee Fees State
  const [adminFeePercent, setAdminFeePercent] = useState(6.5);
  const [gratisOngkirXtraPercent, setGratisOngkirXtraPercent] = useState(4.0);
  const [cashbackXtraPercent, setCashbackXtraPercent] = useState(0.0);
  const [transactionFeePercent, setTransactionFeePercent] = useState(2.0);
  const [flatProcessFee, setFlatProcessFee] = useState(1250); // Rp 1.250 flat fee
  const [targetMarginPercent, setTargetMarginPercent] = useState(15.0);

  // Automatically update Admin Fee % when Seller Type or Category changes
  useEffect(() => {
    const rate = shopeeAdminRates[sellerType][categoryGroup];
    setAdminFeePercent(rate);
  }, [sellerType, categoryGroup]);

  // Helper formatting
  const formatRp = (num) => {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  // Calculations
  const defectCost = (purchasePrice * defectRate) / 100;
  const totalHpp = purchasePrice + packingPrice + cargoPrice + laborPrice + defectCost + otherOverhead;

  const totalPlatformFeesPercent = adminFeePercent + gratisOngkirXtraPercent + cashbackXtraPercent + transactionFeePercent;
  
  // Recommended Selling Price Formula: 
  // Laba Bersih = Harga Jual * Margin%
  // Laba Bersih = Harga Jual - HPP - (Harga Jual * Platform%) - FlatFee
  // Price = (HPP + FlatFee) / (1 - Platform% - TargetMargin%)
  const divisor = 1 - (totalPlatformFeesPercent / 100) - (targetMarginPercent / 100);
  const recommendedPrice = divisor > 0 ? (totalHpp + flatProcessFee) / divisor : 0;
  
  const platformFeesDeduction = (recommendedPrice * totalPlatformFeesPercent) / 100;
  const netProfitUnit = recommendedPrice - totalHpp - platformFeesDeduction - flatProcessFee;

  // Category explanations mapping
  const categoryExplanations = {
    A: 'Fashion, Aksesoris, Kosmetik, Kecantikan, Ibu & Bayi, Perlengkapan Medis.',
    B: 'Elektronik, Handphone, Gadget, Kamera, Otomotif, Hobi & Koleksi.',
    C: 'Komputer, Perlengkapan Rumah, Peralatan Olahraga, Media & Musik.',
    D: 'Makanan & Minuman, Buku & Alat Tulis, Kebutuhan Hewan Peliharaan.',
    E: 'Sembako, Susu & Popok Bayi, Perlengkapan Rumah Tangga Tertentu.',
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
              Hitung Harga Pokok Penjualan (HPP) riil per unit barang Anda, pilih kategori produk untuk mendeteksi biaya admin Shopee secara otomatis, lalu dapatkan rekomendasi harga jual optimal agar target margin bersih Anda tercapai.
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
              
              {/* INTERACTIVE DROPDOWNS */}
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
                  <label style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: '600' }}>Kategori Produk</label>
                  <select
                    value={categoryGroup}
                    onChange={(e) => setCategoryGroup(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="A" style={{ background: '#1e2235' }}>Grup A (Fashion/Kecantikan)</option>
                    <option value="B" style={{ background: '#1e2235' }}>Grup B (Elektronik/Hobi)</option>
                    <option value="C" style={{ background: '#1e2235' }}>Grup C (Perlengkapan Rumah/Komputer)</option>
                    <option value="D" style={{ background: '#1e2235' }}>Grup D (Makanan/Buku/Bahan Pokok)</option>
                    <option value="E" style={{ background: '#1e2235' }}>Grup E (Sembako/Popok/Susu)</option>
                    <option value="khusus" style={{ background: '#1e2235' }}>Kategori Khusus (Digital/Pulsa)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Category Hint Info */}
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-muted2)', border: '1px solid rgba(255,255,255,0.03)', marginTop: '-4px' }}>
                📖 <strong>Contoh Produk:</strong> {categoryExplanations[categoryGroup]}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gratis Ongkir Xtra (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={gratisOngkirXtraPercent}
                      onChange={(e) => setGratisOngkirXtraPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      style={{ width: '100%', padding: '10px 24px 10px 12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '13px', color: 'var(--text-muted2)' }}>%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cashback Xtra (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={cashbackXtraPercent}
                      onChange={(e) => setCashbackXtraPercent(Math.max(0, parseFloat(e.target.value) || 0))}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span className="text-muted">Potongan Shopee Persentase ({totalPlatformFeesPercent.toFixed(1)}%):</span>
                    <span className="font-semibold text-red" style={{ color: 'var(--accent-red)' }}>
                      - {formatRp(platformFeesDeduction)}
                    </span>
                  </div>
                  {flatProcessFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span className="text-muted">Biaya Proses Pesanan (Flat):</span>
                      <span className="font-semibold text-red" style={{ color: 'var(--accent-red)' }}>
                        - {formatRp(flatProcessFee)}
                      </span>
                    </div>
                  )}
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
