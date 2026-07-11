import React, { useMemo } from 'react';
import { Star, Award, HelpCircle, AlertTriangle, Info, TrendingUp, DollarSign } from 'lucide-react';

const BcgAnalysis = ({ products, platformName = "Shopee" }) => {
  const activeProducts = useMemo(() => {
    return (products || []).filter(p => p.qty > 0);
  }, [products]);

  const formatRp = (num) => {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  };

  const matrixData = useMemo(() => {
    if (activeProducts.length === 0) {
      return { stars: [], cows: [], questions: [], dogs: [], thresholdQty: 0, thresholdProfit: 0 };
    }

    // Calculate metrics for each product
    const items = activeProducts.map(p => {
      const unitPrice = p.omzetNet / p.qty;
      const unitProfit = unitPrice - p.hppUnit;
      const margin = unitPrice > 0 ? (unitProfit / unitPrice) * 100 : 0;
      return {
        ...p,
        unitPrice,
        unitProfit,
        margin
      };
    });

    // Determine thresholds using Median
    const qtys = items.map(i => i.qty).sort((a, b) => a - b);
    const profits = items.map(i => i.unitProfit).sort((a, b) => a - b);

    const getMedian = (arr) => {
      if (arr.length === 0) return 0;
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
    };

    // Use median for volume (Qty) and average for profit to be balanced
    const thresholdQty = getMedian(qtys) || 5; 
    const sumProfit = profits.reduce((acc, p) => acc + p, 0);
    const thresholdProfit = sumProfit / profits.length;

    const stars = [];
    const cows = [];
    const questions = [];
    const dogs = [];

    // Check if any product has custom BCG mapping uploaded
    const hasCustomMapping = items.some(i => i.customBcg);

    const getBcgCategory = (item) => {
      if (item.customBcg) {
        const cat = String(item.customBcg).toLowerCase().trim();
        if (cat.includes('star') || cat.includes('bintang')) return 'stars';
        if (cat.includes('cow') || cat.includes('sapi')) return 'cows';
        if (cat.includes('question') || cat.includes('tanya') || cat.includes('?')) return 'questions';
        if (cat.includes('dog') || cat.includes('anjing') || cat.includes('beban')) return 'dogs';
      }
      
      // Fallback to dynamic calculations
      const isHighVolume = item.qty >= thresholdQty;
      const isHighProfit = item.unitProfit >= thresholdProfit;

      if (isHighVolume && isHighProfit) {
        return 'stars';
      } else if (isHighVolume && !isHighProfit) {
        return 'cows';
      } else if (!isHighVolume && isHighProfit) {
        return 'questions';
      } else {
        return 'dogs';
      }
    };

    items.forEach(item => {
      const category = getBcgCategory(item);
      if (category === 'stars') stars.push(item);
      else if (category === 'cows') cows.push(item);
      else if (category === 'questions') questions.push(item);
      else dogs.push(item);
    });

    // Sort each quadrant by quantity descending
    const sorter = (a, b) => b.qty - a.qty;
    return {
      stars: stars.sort(sorter),
      cows: cows.sort(sorter),
      questions: questions.sort(sorter),
      dogs: dogs.sort(sorter),
      thresholdQty,
      thresholdProfit,
      hasCustomMapping
    };
  }, [activeProducts]);

  if (activeProducts.length === 0) {
    return (
      <div className="card text-center py-12">
        <Info size={48} className="text-muted mb-4 mx-auto" />
        <h3>Data Produk Tidak Cukup</h3>
        <p className="text-muted">Pastikan Anda telah mengunggah data order dan HPP yang valid.</p>
      </div>
    );
  }

  const { stars, cows, questions, dogs, thresholdQty, thresholdProfit, hasCustomMapping } = matrixData;

  return (
    <div className="bcg-container">
      {/* Introduction Card */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)', borderRadius: '12px', padding: '12px', color: 'white' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Matriks Analisis BCG {platformName} (Boston Consulting Group)</h3>
            <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
              Memetakan performa produk Anda ke dalam 4 kuadran berdasarkan **Volume Penjualan (Qty)** dan **Profit Margin per Unit** (Selisih Harga Jual Net vs HPP).
              Gunakan ini untuk mengambil keputusan pemasaran, alokasi stok, dan strategi iklan.
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Indicators */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {hasCustomMapping ? (
          <div className="badge green" style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            📂 Mode: <strong>Ditentukan Manual dari Database BCG</strong>
          </div>
        ) : (
          <>
            <div className="badge blue" style={{ padding: '8px 12px', fontSize: '12px' }}>
              🎯 Batas Volume Tinggi (Median Qty): <strong>&gt;= {thresholdQty} unit</strong>
            </div>
            <div className="badge purple" style={{ padding: '8px 12px', fontSize: '12px' }}>
              💰 Batas Margin Tinggi (Rata-rata Laba): <strong>&gt;= {formatRp(thresholdProfit)} / unit</strong>
            </div>
            <div className="badge gray" style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted2)' }}>
              🤖 Mode: <strong>Perhitungan Otomatis (Fallback)</strong>
            </div>
          </>
        )}
      </div>

      {/* BCG 2x2 GRID */}
      <div className="bcg-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* STARS - BINTANG */}
        <div className="card bcg-quadrant" style={{ borderLeft: '6px solid #a855f7', background: 'rgba(168, 85, 247, 0.02)' }}>
          <div className="card-head" style={{ borderBottom: '1px solid rgba(168, 85, 247, 0.1)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star className="text-purple fill-purple" size={20} style={{ color: '#a855f7' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#a855f7' }}>STARS (Bintang Unggulan)</h3>
            </div>
            <span className="badge purple">{stars.length} SKU</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted2)', marginTop: '6px', marginBottom: '12px' }}>
            💡 **Volume Tinggi &amp; Margin Tinggi**: Produk penyumbang laba terbesar. *Strategi: Pertahankan stok dan genjot iklan.*
          </p>
          <div className="bcg-list" style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stars.length > 0 ? (
              stars.map((item, idx) => (
                <div key={idx} className="bcg-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <strong className="sku-code">{item.sku || 'NO-SKU'}</strong>
                    <div className="text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                      {item.name} {item.variation && `(${item.variation})`}
                    </div>
                  </div>
                  <div className="text-right" style={{ textAlign: 'right' }}>
                    <span className="font-semibold text-teal">{item.qty} unit</span>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '11px' }}>+{formatRp(item.unitProfit)}/u</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted">Belum ada produk di kuadran ini.</div>
            )}
          </div>
        </div>

        {/* QUESTION MARKS - TANDA TANYA */}
        <div className="card bcg-quadrant" style={{ borderLeft: '6px solid #f97316', background: 'rgba(249, 115, 22, 0.02)' }}>
          <div className="card-head" style={{ borderBottom: '1px solid rgba(249, 115, 22, 0.1)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle className="text-orange" size={20} style={{ color: '#f97316' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f97316' }}>QUESTION MARKS (Tanda Tanya)</h3>
            </div>
            <span className="badge orange">{questions.length} SKU</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted2)', marginTop: '6px', marginBottom: '12px' }}>
            💡 **Volume Rendah &amp; Margin Tinggi**: Margin tebal tapi kurang laku. *Strategi: Naikkan performa iklan &amp; diskon pancingan.*
          </p>
          <div className="bcg-list" style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {questions.length > 0 ? (
              questions.map((item, idx) => (
                <div key={idx} className="bcg-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <strong className="sku-code">{item.sku || 'NO-SKU'}</strong>
                    <div className="text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                      {item.name} {item.variation && `(${item.variation})`}
                    </div>
                  </div>
                  <div className="text-right" style={{ textAlign: 'right' }}>
                    <span className="font-semibold text-teal">{item.qty} unit</span>
                    <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '11px' }}>+{formatRp(item.unitProfit)}/u</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted">Belum ada produk di kuadran ini.</div>
            )}
          </div>
        </div>

        {/* CASH COWS - SAPI PERAH */}
        <div className="card bcg-quadrant" style={{ borderLeft: '6px solid #3b82f6', background: 'rgba(59, 130, 246, 0.02)' }}>
          <div className="card-head" style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.1)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award className="text-blue" size={20} style={{ color: '#3b82f6' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>CASH COWS (Sapi Perah)</h3>
            </div>
            <span className="badge blue">{cows.length} SKU</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted2)', marginTop: '6px', marginBottom: '12px' }}>
            💡 **Volume Tinggi &amp; Margin Rendah**: Omzet besar, untung tipis. *Strategi: Kurangi pengeluaran iklan, fokus stok lancar.*
          </p>
          <div className="bcg-list" style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cows.length > 0 ? (
              cows.map((item, idx) => (
                <div key={idx} className="bcg-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <strong className="sku-code">{item.sku || 'NO-SKU'}</strong>
                    <div className="text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                      {item.name} {item.variation && `(${item.variation})`}
                    </div>
                  </div>
                  <div className="text-right" style={{ textAlign: 'right' }}>
                    <span className="font-semibold text-teal">{item.qty} unit</span>
                    <div style={{ color: 'var(--accent-yellow)', fontWeight: 'bold', fontSize: '11px' }}>+{formatRp(item.unitProfit)}/u</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted">Belum ada produk di kuadran ini.</div>
            )}
          </div>
        </div>

        {/* DOGS - ANJING BEBAN */}
        <div className="card bcg-quadrant" style={{ borderLeft: '6px solid #ef4444', background: 'rgba(239, 68, 68, 0.02)' }}>
          <div className="card-head" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.1)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle className="text-red" size={20} style={{ color: '#ef4444' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>DOGS (Beban Toko / Dogs)</h3>
            </div>
            <span className="badge red">{dogs.length} SKU</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted2)', marginTop: '6px', marginBottom: '12px' }}>
            💡 **Volume Rendah &amp; Margin Rendah**: Kurang laku dan margin minim. *Strategi: Cuci gudang, evaluasi harga beli, atau hapus SKU.*
          </p>
          <div className="bcg-list" style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dogs.length > 0 ? (
              dogs.map((item, idx) => (
                <div key={idx} className="bcg-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <strong className="sku-code">{item.sku || 'NO-SKU'}</strong>
                    <div className="text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                      {item.name} {item.variation && `(${item.variation})`}
                    </div>
                  </div>
                  <div className="text-right" style={{ textAlign: 'right' }}>
                    <span className="font-semibold text-teal">{item.qty} unit</span>
                    <div style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '11px' }}>{formatRp(item.unitProfit)}/u</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted">Belum ada produk di kuadran ini.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BcgAnalysis;
