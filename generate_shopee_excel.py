import pandas as pd

# Detailed Shopee Indonesia 2026 Admin Fee Database
data = [
    # Otomotif
    {
        "Kategori Utama": "Otomotif",
        "Sub-Kategori": "Suku Cadang & Aksesoris Motor/Mobil",
        "Jenis Produk": "Helm, Ban, Oli, Aksesoris Motor/Mobil",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.25%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Tarif admin dasar kategori otomotif umum"
    },
    # Audio
    {
        "Kategori Utama": "Elektronik (Audio)",
        "Sub-Kategori": "Perangkat Audio & Speaker",
        "Jenis Produk": "Speaker, Home Theater, Karaoke, AV Receiver",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Speaker dan perangkat audio utama"
    },
    {
        "Kategori Utama": "Elektronik (Audio)",
        "Sub-Kategori": "Mikrofon & Aksesoris",
        "Jenis Produk": "Mikrofon, Stand, Kabel Audio & Mixer",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Aksesoris perekaman dan alat audio"
    },
    {
        "Kategori Utama": "Elektronik (Audio)",
        "Sub-Kategori": "Earphone & Headphone",
        "Jenis Produk": "Earphone, Headphone, Headset, Handsfree",
        "Grup Kategori": "Grup C",
        "Admin Fee (Star/Star+/Non-Star)": "6.75%",
        "Admin Fee (Shopee Mall)": "7.70%",
        "Keterangan": "Tarif lebih rendah untuk earphone/headphone"
    },
    {
        "Kategori Utama": "Elektronik (Audio)",
        "Sub-Kategori": "Media Player",
        "Jenis Produk": "MP3 & MP4 Player, CD/DVD/Blu-ray Player, Radio, Voice Recorder",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.50%",
        "Admin Fee (Shopee Mall)": "10.20%",
        "Keterangan": "Tarif media player sedikit lebih tinggi"
    },
    # Kelistrikan
    {
        "Kategori Utama": "Elektronik (Kelistrikan)",
        "Sub-Kategori": "Kelistrikan",
        "Jenis Produk": "Stop Kontak, Sambungan Kabel, Saklar, Alarm, Anti Petir",
        "Grup Kategori": "Grup A",
        "Admin Fee (Star/Star+/Non-Star)": "10.00%",
        "Admin Fee (Shopee Mall)": "11.00%",
        "Keterangan": "Peralatan instalasi kelistrikan"
    },
    # Aksesoris Fashion
    {
        "Kategori Utama": "Aksesoris Fashion",
        "Sub-Kategori": "Aksesoris Rambut & Perhiasan",
        "Jenis Produk": "Topi, Kacamata, Anting, Kalung, Gelang, Jepitan, Bros",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Aksesoris fashion umum non-logam mulia"
    },
    {
        "Kategori Utama": "Aksesoris Fashion",
        "Sub-Kategori": "Aksesoris Tambahan",
        "Jenis Produk": "Masker Kain, Masker Medis",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "8.25%",
        "Admin Fee (Shopee Mall)": "9.25%",
        "Keterangan": "Tarif khusus untuk produk masker"
    },
    {
        "Kategori Utama": "Aksesoris Fashion",
        "Sub-Kategori": "Logam Mulia",
        "Jenis Produk": "Emas Batangan, Berlian, Perak, Platinum, Perhiasan Berharga",
        "Grup Kategori": "Grup E",
        "Admin Fee (Star/Star+/Non-Star)": "4.25%",
        "Admin Fee (Shopee Mall)": "4.20%",
        "Keterangan": "Tarif admin sangat rendah untuk investasi mulia"
    },
    # Fashion Bayi & Anak
    {
        "Kategori Utama": "Fashion Bayi & Anak",
        "Sub-Kategori": "Pakaian & Sepatu Anak",
        "Jenis Produk": "Baju Bayi, Pakaian Anak, Sepatu Anak, Sandal Anak, Kaos Kaki Anak",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Fashion khusus anak & bayi"
    },
    {
        "Kategori Utama": "Fashion Bayi & Anak",
        "Sub-Kategori": "Aksesoris Perhiasan Anak",
        "Jenis Produk": "Gelang Emas/Perak Anak, Anting Anak, Kalung Anak",
        "Grup Kategori": "Grup E",
        "Admin Fee (Star/Star+/Non-Star)": "4.25%",
        "Admin Fee (Shopee Mall)": "4.20%",
        "Keterangan": "Perhiasan berharga untuk anak/bayi"
    },
    # Fashion Muslim
    {
        "Kategori Utama": "Fashion Muslim",
        "Sub-Kategori": "Pakaian Muslim Dewasa & Anak",
        "Jenis Produk": "Hijab, Gamis, Mukena, Perlengkapan Sholat, Koko, Sarung",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.25%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Fashion muslim secara umum"
    },
    {
        "Kategori Utama": "Fashion Muslim",
        "Sub-Kategori": "Pakaian Olahraga Muslim",
        "Jenis Produk": "Baju Olahraga Muslim Wanita, Baju Renang Muslim",
        "Grup Kategori": "Grup A",
        "Admin Fee (Star/Star+/Non-Star)": "10.00%",
        "Admin Fee (Shopee Mall)": "11.00%",
        "Keterangan": "Baju olahraga / renang muslim khusus"
    },
    # Jam Tangan
    {
        "Kategori Utama": "Jam Tangan",
        "Sub-Kategori": "Jam Tangan & Aksesoris",
        "Jenis Produk": "Jam Tangan Pria, Wanita, Couple, Strap Jam, Baterai Jam",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Seluruh jam tangan dan sparepartnya"
    },
    # Koper & Tas Travel
    {
        "Kategori Utama": "Koper & Tas Travel",
        "Sub-Kategori": "Koper & Aksesoris Travel",
        "Jenis Produk": "Koper, Bantal Leher Travel, Tag Koper, Organizer, Pelindung Koper",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Perlengkapan bagasi dan travel"
    },
    {
        "Kategori Utama": "Koper & Tas Travel",
        "Sub-Kategori": "Tas Duffel",
        "Jenis Produk": "Tas Duffel Travel",
        "Grup Kategori": "Grup A",
        "Admin Fee (Star/Star+/Non-Star)": "10.00%",
        "Admin Fee (Shopee Mall)": "11.00%",
        "Keterangan": "Tas duffel besar"
    },
    # Pakaian Dewasa
    {
        "Kategori Utama": "Pakaian Pria & Wanita",
        "Sub-Kategori": "Pakaian Pria & Wanita Dewasa",
        "Jenis Produk": "Kaos, Kemeja, Celana, Jaket, Blazer, Dress, Rok, Pakaian Dalam, Piyama",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "8.25%",
        "Admin Fee (Shopee Mall)": "9.25%",
        "Keterangan": "Tarif admin pakaian dewasa utama"
    },
    {
        "Kategori Utama": "Pakaian Pria & Wanita",
        "Sub-Kategori": "Kaos Kaki",
        "Jenis Produk": "Kaos Kaki Pria/Wanita Dewasa",
        "Grup Kategori": "Grup A",
        "Admin Fee (Star/Star+/Non-Star)": "10.00%",
        "Admin Fee (Shopee Mall)": "11.00%",
        "Keterangan": "Tarif khusus kaos kaki"
    },
    {
        "Kategori Utama": "Pakaian Pria & Wanita",
        "Sub-Kategori": "Stocking",
        "Jenis Produk": "Stocking Wanita",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Stocking wanita dewasa"
    },
    # Sepatu & Sandal
    {
        "Kategori Utama": "Sepatu Pria & Wanita",
        "Sub-Kategori": "Alas Kaki Dewasa",
        "Jenis Produk": "Sepatu, Sandal, Sneakers, Boots, Loafer, Heels, Wedges, Flat Shoes",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Sandal, sepatu dan aksesoris perawatan sepatu"
    },
    # Tas Dewasa
    {
        "Kategori Utama": "Tas Pria & Wanita",
        "Sub-Kategori": "Tas & Aksesoris Tas Dewasa",
        "Jenis Produk": "Ransel, Clutch, Dompet, Tote Bag, Tas Selempang, Tas Laptop",
        "Grup Kategori": "Grup B",
        "Admin Fee (Star/Star+/Non-Star)": "9.00%",
        "Admin Fee (Shopee Mall)": "9.95%",
        "Keterangan": "Tas kerja, ransel, clutch dan dompet dewasa"
    },
    # Handphone & Gadget
    {
        "Kategori Utama": "Handphone & Aksesoris",
        "Sub-Kategori": "Gadget & Aksesoris",
        "Jenis Produk": "Smartphone, Tablet, Casing, Charger, Kabel Data, Powerbank",
        "Grup Kategori": "Grup D",
        "Admin Fee (Star/Star+/Non-Star)": "5.25%",
        "Admin Fee (Shopee Mall)": "5.70%",
        "Keterangan": "Tarif elektronik gadget"
    },
    # Makanan & Minuman
    {
        "Kategori Utama": "Makanan & Minuman",
        "Sub-Kategori": "Kuliner & FMCG",
        "Jenis Produk": "Snack, Camilan, Kopi, Teh, Sambal, Mie Instan",
        "Grup Kategori": "Grup A",
        "Admin Fee (Star/Star+/Non-Star)": "10.00%",
        "Admin Fee (Shopee Mall)": "11.00%",
        "Keterangan": "Makanan minuman instan"
    },
    {
        "Kategori Utama": "Makanan & Minuman",
        "Sub-Kategori": "Sembako Pokok",
        "Jenis Produk": "Beras, Minyak Goreng, Gula Pasir, Tepung",
        "Grup Kategori": "Grup E",
        "Admin Fee (Star/Star+/Non-Star)": "4.25%",
        "Admin Fee (Shopee Mall)": "4.20%",
        "Keterangan": "Sembako bahan pokok"
    }
]

# Create DataFrame
df = pd.DataFrame(data)

# Export to Excel
excel_path = "shopee_admin_fees_2026.xlsx"
df.to_excel(excel_path, index=False)
print(f"Excel file generated successfully at: {excel_path}")
