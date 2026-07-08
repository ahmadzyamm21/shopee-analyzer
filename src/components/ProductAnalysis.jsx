import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronDown } from 'lucide-react';

const ProductAnalysis = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'qty', direction: 'descending' });

  if (!products || products.length === 0) return null;

  const formatRp = (num) => {
    return Math.round(num).toLocaleString('id-ID');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Sorting Handler
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = React.useMemo(() => {
    let sortableItems = [...products];
    
    // Filter items first
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(p => 
        (p.name && p.name.toLowerCase().includes(lower)) || 
        (p.sku && p.sku.toLowerCase().includes(lower)) ||
        (p.variation && p.variation.toLowerCase().includes(lower))
      );
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle string comparison for Name / SKU
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [products, sortConfig, searchTerm]);

  const getSortClass = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc';
    }
    return '';
  };

  // Totals for the current filtered set
  const totals = sortedProducts.reduce((acc, p) => {
    acc.qty += p.qty;
    acc.qtyRetur += p.qtyRetur;
    acc.totalHpp += p.totalHpp;
    acc.omzetBruto += p.omzetBruto;
    acc.omzetNet += p.omzetNet;
    return acc;
  }, { qty: 0, qtyRetur: 0, totalHpp: 0, omzetBruto: 0, omzetNet: 0 });

  return (
    <div className="product-analysis-container">
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari SKU Induk, Nama Produk, atau Variasi..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="search-results-count">
          Menampilkan <strong>{sortedProducts.length}</strong> produk
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>📦 Rincian Performa Penjualan &amp; HPP per SKU</h2>
          <span className="badge blue">Klik header kolom untuk mengurutkan</span>
        </div>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('sku')} className={`cursor-pointer ${getSortClass('sku')}`}>
                  SKU Induk <ArrowUpDown size={12} />
                </th>
                <th onClick={() => requestSort('name')} className={`cursor-pointer ${getSortClass('name')}`}>
                  Nama Produk <ArrowUpDown size={12} />
                </th>
                <th onClick={() => requestSort('variation')} className={`cursor-pointer ${getSortClass('variation')}`}>
                  Variasi <ArrowUpDown size={12} />
                </th>
                <th onClick={() => requestSort('hppUnit')} className={`cursor-pointer r ${getSortClass('hppUnit')}`}>
                  HPP/Unit <ArrowUpDown size={12} />
                </th>
                <th onClick={() => requestSort('qty')} className={`cursor-pointer r ${getSortClass('qty')}`}>
                  Qty Terjual <ArrowUpDown size={12} />
                </th>
                <th onClick={() => requestSort('qtyRetur')} className={`cursor-pointer r ${getSortClass('qtyRetur')}`}>
                  Retur <ArrowUpDown size={12} />
                </th>
                <th onClick={() => requestSort('totalHpp')} className={`cursor-pointer r ${getSortClass('totalHpp')}`}>
                  Total HPP <ArrowUpDown size={12} />
                </th>
                <th onClick={() => requestSort('omzetBruto')} className={`cursor-pointer r ${getSortClass('omzetBruto')}`}>
                  Omzet Bruto <ArrowUpDown size={12} />
                </th>
                <th onClick={() => requestSort('omzetNet')} className={`cursor-pointer r ${getSortClass('omzetNet')}`}>
                  Omzet Neto <ArrowUpDown size={12} />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.length > 0 ? (
                sortedProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td><code className="sku-code">{p.sku || 'N/A'}</code></td>
                    <td className="product-name-cell" title={p.name}>{p.name}</td>
                    <td className="text-muted">{p.variation || '-'}</td>
                    <td className="r">Rp {formatRp(p.hppUnit)}</td>
                    <td className="r text-teal font-semibold">{p.qty.toLocaleString('id-ID')}</td>
                    <td className={`r font-semibold ${p.qtyRetur > 0 ? 'text-yellow' : 'text-muted'}`}>
                      {p.qtyRetur.toLocaleString('id-ID')}
                    </td>
                    <td className="r text-red font-semibold">Rp {formatRp(p.totalHpp)}</td>
                    <td className="r">Rp {formatRp(p.omzetBruto)}</td>
                    <td className="r text-green font-semibold">Rp {formatRp(p.omzetNet)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-muted">
                    Tidak ada produk yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
            {sortedProducts.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>TOTAL KESELURUHAN (FILTERED)</strong></td>
                  <td className="r">-</td>
                  <td className="r text-teal"><strong>{totals.qty.toLocaleString('id-ID')}</strong></td>
                  <td className="r text-yellow"><strong>{totals.qtyRetur.toLocaleString('id-ID')}</strong></td>
                  <td className="r text-red"><strong>Rp {formatRp(totals.totalHpp)}</strong></td>
                  <td className="r"><strong>Rp {formatRp(totals.omzetBruto)}</strong></td>
                  <td className="r text-green"><strong>Rp {formatRp(totals.omzetNet)}</strong></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalysis;
