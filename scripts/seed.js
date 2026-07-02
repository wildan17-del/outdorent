// ponytail: seed data for Firebase Firestore
// Jalankan: node scripts/seed.js
// Butuh FIREBASE_SERVICE_ACCOUNT di env

const admin = require('firebase-admin');

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : null;

if (!serviceAccount) {
  console.error('ERROR: FIREBASE_SERVICE_ACCOUNT env var required');
  console.error('Export JSON service account key as string');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  console.log('Seeding...');

  // 1. Settings
  await db.collection('settings').doc('global').set({
    tarif_denda_per_hari: 50000,
  });
  console.log('✓ Settings');

  // 2. Categories
  const categories = ['Tenda', 'Sleeping Bag', 'Alat Masak', 'Perlengkapan Hiking', 'Aksesoris'];
  const catRefs = {};
  for (const nama of categories) {
    const ref = await db.collection('categories').add({ nama_kategori: nama });
    catRefs[nama] = ref.id;
  }
  console.log('✓ Categories');

  // 3. Items
  const items = [
    { nama: 'Tenda Kapasitas 4 Orang', kategori: 'Tenda', stok: 10, harga: 100000, kondisi: 'Baik' },
    { nama: 'Tenda Kapasitas 2 Orang', kategori: 'Tenda', stok: 15, harga: 75000, kondisi: 'Baik' },
    { nama: 'Sleeping Bag', kategori: 'Sleeping Bag', stok: 20, harga: 35000, kondisi: 'Baik' },
    { nama: 'Matras Busa', kategori: 'Sleeping Bag', stok: 20, harga: 15000, kondisi: 'Baik' },
    { nama: 'Kompor Portable', kategori: 'Alat Masak', stok: 8, harga: 40000, kondisi: 'Baik' },
    { nama: 'Nesting Set (Panci + Piring)', kategori: 'Alat Masak', stok: 12, harga: 25000, kondisi: 'Baik' },
    { nama: 'Carrier 60L', kategori: 'Perlengkapan Hiking', stok: 10, harga: 50000, kondisi: 'Baik' },
    { nama: 'Trekking Pole', kategori: 'Perlengkapan Hiking', stok: 15, harga: 20000, kondisi: 'Baik' },
    { nama: 'Headlamp', kategori: 'Aksesoris', stok: 25, harga: 15000, kondisi: 'Baik' },
    { nama: 'Jas Hujan Ponco', kategori: 'Aksesoris', stok: 20, harga: 10000, kondisi: 'Baik' },
  ];

  const itemRefs = {};
  for (const i of items) {
    const ref = await db.collection('items').add({
      nama_barang: i.nama,
      id_kategori: catRefs[i.kategori],
      stok: i.stok,
      stok_tersedia: i.stok,
      harga_sewa_per_hari: i.harga,
      kondisi: i.kondisi,
      foto_url: '',
    });
    itemRefs[i.nama] = ref.id;
  }
  console.log('✓ Items');

  // 4. Recommendation Rules
  const rules = [
    { kegiatan: 'Camping', barang: 'Tenda Kapasitas 4 Orang', perKelompok: 1, catatan: '1 tenda untuk 4 orang' },
    { kegiatan: 'Camping', barang: 'Sleeping Bag', perPeserta: 1 },
    { kegiatan: 'Camping', barang: 'Matras Busa', perPeserta: 1 },
    { kegiatan: 'Camping', barang: 'Kompor Portable', perKelompok: 1, catatan: '1 kompor per kelompok' },
    { kegiatan: 'Camping', barang: 'Nesting Set (Panci + Piring)', perKelompok: 1 },
    { kegiatan: 'Camping', barang: 'Headlamp', perPeserta: 1 },
    { kegiatan: 'Pendakian', barang: 'Carrier 60L', perPeserta: 1 },
    { kegiatan: 'Pendakian', barang: 'Sleeping Bag', perPeserta: 1 },
    { kegiatan: 'Pendakian', barang: 'Matras Busa', perPeserta: 1 },
    { kegiatan: 'Pendakian', barang: 'Trekking Pole', perPeserta: 1 },
    { kegiatan: 'Pendakian', barang: 'Headlamp', perPeserta: 1 },
    { kegiatan: 'Pendakian', barang: 'Jas Hujan Ponco', perPeserta: 1 },
    { kegiatan: 'Hiking', barang: 'Carrier 60L', perPeserta: 0.5, catatan: '1 carrier untuk 2 orang' },
    { kegiatan: 'Hiking', barang: 'Trekking Pole', perPeserta: 1 },
    { kegiatan: 'Hiking', barang: 'Jas Hujan Ponco', perPeserta: 1 },
    { kegiatan: 'Picnic', barang: 'Matras Busa', perKelompok: 2 },
    { kegiatan: 'Picnic', barang: 'Nesting Set (Panci + Piring)', perKelompok: 1 },
  ];

  for (const r of rules) {
    await db.collection('recommendation_rules').add({
      jenis_kegiatan: r.kegiatan,
      id_barang: itemRefs[r.barang],
      rasio_per_peserta: r.perPeserta || null,
      rasio_per_kelompok: r.perKelompok || null,
      catatan: r.catatan || '',
    });
  }
  console.log('✓ Recommendation Rules');

  // 5. Create admin user (via Firebase Auth - manual)
  console.log('\n=== ADMIN SETUP ===');
  console.log('Buat admin di Firebase Console > Authentication > Add user');
  console.log('Email: admin@rental.com / Password: admin123');
  console.log('Lalu di Firestore > users, buat dokumen dgn UID yg sama:');
  console.log('{ nama: "Admin", email: "admin@rental.com", role: "admin", createdAt: "<timestamp>" }');

  console.log('\n✅ Seed selesai!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
