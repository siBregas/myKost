# 🏠 Aplikasi Manajemen Kost - Google Sheets Only

Aplikasi manajemen ketersediaan kamar kost yang menggunakan **Google Sheets sebagai database**. Tidak memerlukan Supabase atau database lainnya.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📊 Setup Google Sheets

### 1. Format Data di Google Sheets
**ID Sheet Anda:** `1dpt5uCyBfpfBLh0w-8uVC9LgU4ihKErU7babxc_p23Y`

| A (room_id) | B (start_date) | C (end_date) | D (status) | E (note) |
|-------------|----------------|--------------|------------|----------|
| 1           | 2025-09-01     | 2025-09-10   | terisi     | Penghuni lama |
| 1           | 2025-09-15     | 2025-09-20   | booking    | Rosalia DP 200rb |
| 2           | 2025-09-11     | 2025-09-30   | booking    | Yasmin DP |

### 2. Pastikan Google Sheets Public
```
Share → "Anyone with the link can view"
```

## 🎨 Fitur Aplikasi

### ✅ **Calendar View**
- **🔴 Merah + "T"** = Kamar terisi
- **⚫ Abu-abu + "B"** = Kamar booking  
- **⚪ Putih** = Kamar kosong
- Navigation bulan dengan tombol Prev/Next

### ✅ **Detail Kamar** 
- URL: `/kost/[nomor]` (contoh: `/kost/1`)
- Gallery foto + calendar ketersediaan

### ✅ **Auto Fallback**
Jika Google Sheets tidak bisa diakses, otomatis menggunakan sample data.

## ⚙️ Konfigurasi

File `.env.local` sudah dikonfigurasi:
```bash
NEXT_PUBLIC_GOOGLE_SHEETS_ID=1dpt5uCyBfpfBLh0w-8uVC9LgU4ihKErU7babxc_p23Y
NEXT_PUBLIC_GOOGLE_SHEETS_RANGE=Sheet1!A:E
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=  # Kosong = public access
```

## 🔧 Update Data

1. **Edit Google Sheets** langsung
2. **Refresh browser** atau klik "🔄 Reload"  
3. **Perubahan langsung terlihat**

## 🐛 Troubleshooting

### Tabel Masih Putih?
1. ✅ **Cek Google Sheets public**
2. ✅ **Buka Console (F12)** untuk melihat error
3. ✅ **Test CSV URL:**
   ```
   https://docs.google.com/spreadsheets/d/1dpt5uCyBfpfBLh0w-8uVC9LgU4ihKErU7babxc_p23Y/export?format=csv
   ```
4. ✅ **Format data sesuai contoh**

## 📁 Struktur

```
├── app/page.tsx              # Halaman utama
├── app/kost/[id]/page.tsx    # Detail kamar  
├── components/Table.tsx      # Calendar component
├── components/Gallery.tsx    # Foto kamar
└── .env.local               # Konfigurasi
```

**✅ Aplikasi siap digunakan tanpa database external!**
