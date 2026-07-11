import React, { useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

const formatRp = (num) => {
  if (num === 0) return 'Rp 0';
  const isNeg = num < 0;
  const formatted = Math.abs(Math.round(num)).toLocaleString('id-ID');
  return isNeg ? `− Rp ${formatted}` : `Rp ${formatted}`;
};

const TikTokSkuList = ({ result }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('qty');
  const [sortDir, setSortDir] = useState('desc');

  if (!result) return null;
  const { skuList, summary } = result;

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = skuList
    .filter(s =>
      s.sku.toLowerCase().includes(search.toLowerCase()) ||
      s.pname.toLowerCase().includes(search.toLowerCase()) ||
      s.vname.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      return (a[sortKey] - b[sortKey]) * mult;
    });

  const totalQty = filtered.reduce((s, r) => s + r.qty, 0);
  const totalRev = filtered.reduce((s, r) => s + r.revenue, 0);
  const totalHpp = filtered.reduce((s, r) => s + r.hpp, 0);
  const totalGp = filtered.reduce((s, r) => s + r.grossProfit, 0);

  const SortTh = ({ label, k, className = '' }) => (
    <th
      className={`cursor-pointer ${className}`}
      onClick={() => toggleSort(k)}
      style={{ userSelect: 'none' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: className.includes('r') ? 'flex-end' : 'flex-start' }}>
        {label}
        <ArrowUpDown size={11} style={{ opacity: sortKey === k ? 1 : 0.35 }} />
      </span>
    </th>
  );

  return (
    <div>
      <div className="card">
        <div className="card-head">
          <h2>📦 Detail Profitabilitas per SKU (Cohort)</h2>
          <span className="badge orange">{skuList.length} SKU Total</span>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={15} />
              <input
                type="text"
                className="search-input"
                placeholder="Cari SKU, nama produk, variasi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span className="search-results-count">{filtered.length} dari {skuList.length} SKU</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU Induk</th>
                <th>Nama Produk / Variasi</th>
                <SortTh label="Qty" k="qty" className="r" />
                <SortTh label="Omset (Rp)" k="revenue" className="r" />
                <SortTh label="HPP Total (Rp)" k="hpp" className="r" />
                <SortTh label="Settlement (Rp)" k="settlement" className="r" />
                <SortTh label="Laba Kotor (Rp)" k="grossProfit" className="r" />
                <SortTh label="Margin %" k="margin" className="r" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((sku, idx) => (
                <tr key={sku.sku}>
                  <td><span className="sku-code">{sku.sku || '—'}</span></td>
                  <td>
                    <div className="product-name-cell" title={sku.pname}>{sku.pname || '—'}</div>
                    {sku.vname && (
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted2)', marginTop: '2px' }}>{sku.vname}</div>
                    )}
                  </td>
                  <td className="r font-semibold">{sku.qty.toLocaleString('id-ID')}</td>
                  <td className="r" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>{formatRp(sku.revenue)}</td>
                  <td className="r" style={{ color: 'var(--accent-red)' }}>{formatRp(sku.hpp)}</td>
                  <td className="r" style={{ color: 'var(--accent-teal)' }}>{formatRp(sku.settlement)}</td>
                  <td className="r" style={{ color: sku.grossProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                    {formatRp(sku.grossProfit)}
                  </td>
                  <td className="r">
                    <span style={{
                      fontSize: '11.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
                      background: sku.margin >= 20 ? 'rgba(34,197,94,0.12)' : sku.margin >= 0 ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)',
                      color: sku.margin >= 20 ? 'var(--accent-green)' : sku.margin >= 0 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                    }}>
                      {sku.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" style={{ fontWeight: 800 }}>TOTAL ({filtered.length} SKU)</td>
                <td className="r">{totalQty.toLocaleString('id-ID')}</td>
                <td className="r" style={{ color: 'var(--accent-orange)' }}>{formatRp(totalRev)}</td>
                <td className="r" style={{ color: 'var(--accent-red)' }}>{formatRp(totalHpp)}</td>
                <td className="r"></td>
                <td className="r" style={{ color: totalGp >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatRp(totalGp)}</td>
                <td className="r" style={{ color: totalGp >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {totalRev > 0 ? ((totalGp / totalRev) * 100).toFixed(1) : '0'}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TikTokSkuList;
