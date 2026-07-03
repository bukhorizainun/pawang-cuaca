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

## Kualitas udara & radar hujan

- **Indeks kualitas udara (AQI AS)** — dari Open-Meteo Air Quality API: PM2.5, PM10,
  ozon, NO₂, SO₂, CO, dengan badge berwarna dan catatan singkat sesuai tingkat bahaya.
  Berguna terutama untuk Indonesia saat musim kabut asap.
- **Radar hujan** — mosaik radar cuaca dunia dari [RainViewer](https://www.rainviewer.com/),
  ditampilkan di atas peta OpenStreetMap (Leaflet). Bisa diputar seperti animasi untuk
  melihat pergerakan hujan 2 jam terakhir, dengan slider dan tombol putar/jeda.

## Fitur

- Pencarian kota sedunia (geocoding Open-Meteo), kota terakhir tersimpan otomatis
- Kondisi saat ini: suhu, terasa seperti, kelembapan, angin + hembusan, tutupan awan, presipitasi, tekanan, UV, matahari terbit–terbenam, waktu setempat
- Grafik 24 jam: garis suhu + batang peluang hujan (canvas murni)
- Prakiraan 7 hari dengan bilah rentang suhu mingguan
- **Panel perbandingan model**: kurva ECMWF vs GFS vs ICON 48 jam — bila kurvanya rapat, model-model dunia sedang sepakat dan prakiraan lebih bisa dipercaya
- Catatan Mbah: satu kalimat saran harian, jenaka secukupnya
- Ikon cuaca SVG garis halus, tema gelap ala dashboard meteorologi

## Aplikasi terpasang (PWA) & notifikasi hujan

- Bisa **dipasang** di HP/laptop lewat tombol "Pasang sebagai aplikasi" (muncul otomatis
  bila browser mendukung), lalu berjalan seperti aplikasi native, lengkap dengan ikon.
- **Bisa dibuka offline** — app shell (HTML/CSS/JS) dan data cuaca terakhir tersimpan lewat
  service worker, jadi tetap menampilkan sesuatu walau koneksi terputus.
- **Notifikasi hujan** — tombol "Ingatkan kalau mau hujan" mengaktifkan notifikasi browser
  saat peluang hujan 2 jam ke depan ≥60%, diperiksa tiap penyegaran otomatis (±10 menit).
  Ini murni client-side (tanpa server push), jadi berjalan selagi aplikasi terbuka; sebagian
  browser (terutama Chrome desktop/Android, saat aplikasi terpasang) bisa memeriksanya
  secara berkala walau tab tertutup, tapi dukungan latar-belakang penuh bergantung
  kebijakan tiap browser/OS — bukan jaminan dari aplikasi ini.

## Kota favorit & tren tekanan

- **Kota favorit** — tombol bintang (☆/★) di sebelah nama kota menambah/menghapus kota
  dari daftar favorit. Favorit tampil sebagai strip di atas halaman, masing-masing dengan
  ikon dan suhu terkini sendiri; klik untuk langsung berpindah ke kota itu.
- **Tren tekanan barometrik** — perubahan tekanan udara 3 jam terakhir dihitung dan
  ditampilkan di samping angka tekanan (naik/turun/stabil, dengan panah). Ini heuristik
  meteorologi klasik: penurunan tajam sering mendahului cuaca aktif, kenaikan tajam
  biasanya menandai cuaca membaik — indikasi, bukan prakiraan pasti.

## Cara pakai

Buka `index.html` di browser. Tanpa install wajib, tanpa API key. Butuh koneksi internet
(fitur offline hanya menampilkan data yang sempat termuat sebelumnya).

## Teknologi

HTML + CSS + JavaScript murni, plus [Leaflet](https://leafletjs.com/) (via CDN, untuk peta radar)
dan sebuah service worker untuk PWA.
