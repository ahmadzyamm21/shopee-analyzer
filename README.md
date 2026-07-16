# Shopee & TikTok Shop Financial Analyzer

Aplikasi analisis laporan keuangan (P&L), performa produk, dan tracking pesanan untuk platform Shopee dan TikTok Shop.

## Link Deployment (Beta)

* 🔗 **Shopee Analyzer**: [https://shopee-analyzer-beta.vercel.app/shopee](https://shopee-analyzer-beta.vercel.app/shopee)
* 🔗 **TikTok Analyzer**: [https://shopee-analyzer-beta.vercel.app/tiktok](https://shopee-analyzer-beta.vercel.app/tiktok)

## Link Alternatif (GitHub Pages)

* 🌐 **GitHub Pages**: [https://ahmadzyamm21.github.io/shopee-analyzer/](https://ahmadzyamm21.github.io/shopee-analyzer/)

## Fitur Utama

1. **Analisis Laba Rugi (P&L Statement)**: Ringkasan pendapatan kotor (omzet), HPP, biaya platform, iklan, selisih ongkir, kerugian retur, dan laba bersih (take-home profit).
2. **Analisis Performa Produk**: Pemetaan volume penjualan dan margin per produk ke dalam kuadran **BCG Matrix** (Stars, Cash Cows, Question Marks, Dogs).
3. **Log Pesanan Terperinci**: Membagi pesanan menjadi log Pesanan Selesai, Pesanan Retur, Pesanan Batal, dan mendeteksi secara otomatis *Pesanan Bermasalah* (seperti penjualan rugi, pengiriman stagnan, atau pembatalan setelah resi terbit).
4. **Ekspor Laporan**:
   - **Ekspor Excel**: Mengunduh berkas `.xlsx` terstruktur yang berisi detail keuangan di beberapa tab sheet secara instan.
   - **Ekspor/Cetak PDF**: Cetak pratinjau halaman dashboard aktif yang bersih (otomatis menyembunyikan sidebar dan tombol) dengan format optimal.

---

## Teknologi

* **Frontend**: React (Vite)
* **Pustaka Analisis**: `xlsx` (SheetJS)
* **Ikon**: `lucide-react`
* **Keamanan/Auth**: Supabase Integration

---

## Pengembangan Lokal

```bash
# Install dependensi
npm install

# Jalankan server development
npm run dev

# Build untuk produksi
npm run build
```
