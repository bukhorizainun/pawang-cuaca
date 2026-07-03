# Pawang Cuaca

Prakiraan cuaca sedunia berbasis model resmi badan meteorologi — dibawakan dengan serius. Hampir.

## Sumber data & akurasi

Data diambil dari [Open-Meteo](https://open-meteo.com/), agregator model prakiraan resmi:

- **ECMWF IFS** — Pusat Prakiraan Cuaca Jangka Menengah Eropa
- **GFS** — NOAA, badan cuaca Amerika Serikat
- **ICON** — DWD, badan cuaca Jerman (ICON-D2 ±2 km untuk Eropa Tengah)
- Météo-France, JMA, dan model nasional lain sesuai lokasi

Prakiraan utama memakai mode **best match**: model beresolusi tertinggi yang tersedia
untuk lokasi terpilih, diperbarui tiap 1–6 jam (data `current` tiap ±15 menit).
Aplikasi menyegarkan data otomatis tiap 10 menit.

## Observasi stasiun (pengukuran langsung, bukan model)

- **GeoSphere Austria (TAWES)** — jaringan stasiun otomatis resmi Austria (eks ZAMG),
  data 10-menitan. Muncul otomatis bila lokasi terpilih di Austria; stasiun terdekat
  dipilih dari ±270 stasiun aktif (untuk Linz: Linz-Stadt / Hörsching).
- **METAR bandara** — laporan observasi resmi stasiun meteorologi bandara (tiap 30–60
  menit), diambil dari arsip terbuka MET Norway. Mencakup 18 bandara Indonesia
  (Soekarno-Hatta, YIA Yogyakarta, Juanda, Ngurah Rai, Kualanamu, dll.) plus hub dunia;
  bandara terdekat dalam radius 500 km dipilih otomatis. METAR mentah ikut ditampilkan.
- Kedua panel menampilkan **selisih observasi vs model** — pengecekan jujur seberapa
  akurat prakiraannya saat ini.

## Fitur

- Pencarian kota sedunia (geocoding Open-Meteo), kota terakhir tersimpan otomatis
- Kondisi saat ini: suhu, terasa seperti, kelembapan, angin + hembusan, tutupan awan, presipitasi, tekanan, UV, matahari terbit–terbenam, waktu setempat
- Grafik 24 jam: garis suhu + batang peluang hujan (canvas murni)
- Prakiraan 7 hari dengan bilah rentang suhu mingguan
- **Panel perbandingan model**: kurva ECMWF vs GFS vs ICON 48 jam — bila kurvanya rapat, model-model dunia sedang sepakat dan prakiraan lebih bisa dipercaya
- Catatan Mbah: satu kalimat saran harian, jenaka secukupnya
- Ikon cuaca SVG garis halus, tema gelap ala dashboard meteorologi

## Cara pakai

Buka `index.html` di browser. Tanpa install, tanpa API key. Butuh koneksi internet.

## Teknologi

HTML + CSS + JavaScript murni. Tiga file, nol dependensi.
