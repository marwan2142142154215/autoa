# Rekening Checker Web App - KKS Bandar 80

Hybrid web application untuk mengecek rekening dengan Google OAuth login dan Chrome extension injection.

## 🚀 Fitur

- **Google OAuth Login** - Login aman dengan akun Google
- **Chrome Extension Injection** - Bypass proteksi website
- **Multi-threading** - Proses batch hingga 20 user ID
- **Modern UI** - Interface mirip ScatterAnalyzer
- **Real-time Logs** - Monitoring proses pengecekan
- **Export Results** - Export ke CSV
- **Responsive Design** - Bekerja di desktop dan mobile

## 📋 Persyaratan

1. **Google Chrome Browser** (versi terbaru)
2. **Koneksi Internet** stabil
3. **Akun Google** untuk login

## 🛠️ Instalasi

### Cara 1: Langsung Buka (Tanpa Install)

1. Download semua file
2. Buka `index.html` di Google Chrome
3. Login dengan Google
4. Siap digunakan!

### Cara 2: Local Server (Recommended)

```bash
# Install Node.js (jika belum ada)
# Download dari: https://nodejs.org/

# Clone atau download project
cd rekening-checker-web

# Start local server
python -m http.server 8000
# atau
npx serve .

# Buka browser
http://localhost:8000
```

### Cara 3: Install Chrome Extension (Optional)

Untuk bypass proteksi yang lebih baik:

1. Buka Chrome → Extensions → Manage Extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Pilih folder `extension`
5. Extension akan otomatis terinstall

## 📖 Cara Penggunaan

### 1. Login
- Klik "Login dengan Google"
- Pilih akun Google Anda
- Tunggu proses login selesai

### 2. Setup Login Credentials
- **Username**: Username untuk login ke target website
- **Password**: Password untuk login ke target website  
- **PIN**: PIN (jika diperlukan)

### 3. Setup User IDs
- Masukkan user IDs yang akan dicek
- Pisahkan dengan koma atau baris baru
- Maksimal 20 user IDs per batch

### 4. Konfigurasi Pengaturan (Optional)
- **Target URL**: URL target website (default: `https://bandar80.idrbo2.com/new-transaction.html`)
- **Custom Headers**: Tambahkan headers khusus jika diperlukan
- **Extension ID**: ID Chrome extension (default: `eppiocemhmnlbhjplcgkofciiegomcon`)

### 5. Mulai Pengecekan
- Klik "Cek Rekening"
- Monitor progress di progress bar
- Lihat hasil di tab "Hasil"
- Export hasil ke CSV jika needed

## 🔧 Konfigurasi

### Target URL
Default: `https://bandar80.idrbo2.com/new-transaction.html`

### Custom Headers
Tambahkan headers seperti:
- `X-Access-Token`: Token akses
- `X-Agent-Pkid`: Primary key
- `X-Agent-Role`: Role user
- `X-Agent-Suid`: Sub user ID
- `X-Agent-User`: User info
- `X-Agent-UserId`: User ID

### Extension Scripts
Aplikasi menggunakan 3 script utama:
1. `location.js` - Override navigator properties
2. `extend-native-history-api.js` - Override history API
3. `requests.js` - Override fetch/XHR requests

## 📊 Hasil dan Export

### Format Hasil
- **User ID**: ID yang dicek
- **Status**: Success/Failed
- **Bank**: Nama bank (jika ditemukan)
- **Nama**: Nama pemilik rekening (jika ditemukan)
- **No. Rekening**: Nomor rekening (jika ditemukan)
- **Time**: Timestamp pengecekan

### Export CSV
Klik "Export" untuk download hasil dalam format CSV:
```csv
User ID,Status,Bank,Nama,No. Rekening,Time
user123,Success,BCA,John Doe,123456789,2024-01-01 12:00:00
```

## 🐛 Troubleshooting

### Login Gagal
- Pastikan koneksi internet stabil
- Coba refresh browser
- Hapus cache dan cookies
- Gunakan browser incognito mode

### Extension Error
- Pastikan Chrome extension terinstall dengan benar
- Reload halaman target website
- Cek console untuk error messages

### Data Tidak Ditemukan
- Pastikan login credentials benar
- Cek apakah target URL masih aktif
- Verifikasi user IDs yang dimasukkan

### Performance Issues
- Kurangi jumlah user IDs per batch
- Tutup tab browser lain yang tidak perlu
- Restart browser jika perlu

## 🔒 Keamanan

- **OAuth 2.0** - Login aman dengan Google
- **No Data Storage** - Data tidak disimpan di server
- **Local Storage** - Settings disimpan lokal
- **HTTPS** - Koneksi aman untuk login Google

## 📱 Browser Support

- ✅ Google Chrome (Recommended)
- ✅ Microsoft Edge
- ✅ Opera
- ⚠️ Firefox (Limited support)

## 🆘 Bantuan

### Common Issues

**Q: Extension tidak bekerja?**
A: Pastikan extension terinstall dengan benar dan di-enable

**Q: Login Google gagal?**  
A: Coba refresh browser dan login kembali

**Q: Hasil tidak muncul?**
A: Cek login credentials dan target URL

**Q: Export CSV error?**
A: Pastikan ada hasil sebelum export

### Support
- Email: support@example.com
- Discord: [Link Discord]
- Documentation: [Link Docs]

## 📝 Changelog

### v1.0.0 (2024-01-01)
- Initial release
- Google OAuth login
- Chrome extension injection
- Multi-threading support
- CSV export
- Modern UI design

## 📄 License

MIT License - Free untuk penggunaan personal dan commercial.

---

**Developed with ❤️ by KKS Bandar 80 Team**
