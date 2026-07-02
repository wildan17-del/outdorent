'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { formatRupiah } from '@/lib/utils';
import { Tent, Users, Calendar, Plus, ShoppingCart, Sparkles } from 'lucide-react';

export default function RekomendasiPage() {
  const [rules, setRules] = useState([]);
  const [items, setItems] = useState([]);
  const [peserta, setPeserta] = useState(1);
  const [durasi, setDurasi] = useState(1);
  const [jenis, setJenis] = useState('');
  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [rulesSnap, itemsSnap] = await Promise.all([
        getDocs(collection(db, 'recommendation_rules')),
        getDocs(collection(db, 'items')),
      ]);
      setRules(rulesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, []);

  function handleCari() {
    if (!jenis) return;
    const matchedRules = rules.filter((r) => r.jenis_kegiatan === jenis);
    const rekomendasi = matchedRules.map((rule) => {
      const item = items.find((i) => i.id === rule.id_barang);
      if (!item) return null;
      let qty = 0;
      if (rule.rasio_per_peserta) qty = Math.ceil(peserta * rule.rasio_per_peserta);
      else if (rule.rasio_per_kelompok) qty = rule.rasio_per_kelompok;
      return { ...item, qtyRecom: qty, catatan: rule.catatan };
    }).filter(Boolean);

    setHasil({ jenis, peserta, durasi, rekomendasi });
  }

  function tambahSemua() {
    if (!user) return router.push('/login');
    hasil.rekomendasi.forEach((r) => {
      if (r.qtyRecom > 0) addItem({ ...r, qty: r.qtyRecom });
    });
    router.push('/keranjang');
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} />
    </div>
  );

  const jenisList = [...new Set(rules.map((r) => r.jenis_kegiatan))];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      {/* Header */}
      <div className="text-center mb-8 lg:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--green-light)' }}>
          <Sparkles size={28} style={{ color: 'var(--green-accent)' }} />
        </div>
        <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight mb-2" style={{ color: 'var(--starbucks-green)' }}>
          Rekomendasi Perlengkapan
        </h1>
        <p className="text-base" style={{ color: 'var(--text-black-soft)' }}>
          Input kegiatanmu, dapatkan daftar perlengkapan yang pas!
        </p>
      </div>

      {/* Form */}
      <div className="card p-6 lg:p-8 mb-8">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-black)' }}>
              <Users size={15} /> Jumlah Peserta
            </label>
            <input type="number" min={1} value={peserta} onChange={(e) => setPeserta(Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-black)' }}>
              <Calendar size={15} /> Lama Kegiatan (hari)
            </label>
            <input type="number" min={1} value={durasi} onChange={(e) => setDurasi(Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-black)' }}>
              <Tent size={15} /> Jenis Kegiatan
            </label>
            <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="select-field">
              <option value="">-- Pilih --</option>
              {jenisList.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={handleCari} disabled={!jenis} className="btn-primary mt-5 disabled:opacity-50">
          Cari Rekomendasi
        </button>
      </div>

      {/* Hasil */}
      {hasil && (
        <div className="card p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--starbucks-green)' }}>Hasil Rekomendasi</h2>
              <p className="text-sm" style={{ color: 'var(--text-black-soft)' }}>
                {hasil.peserta} peserta, {hasil.durasi} hari, {hasil.jenis}
              </p>
            </div>
            <button onClick={tambahSemua} className="btn-primary text-sm">
              <ShoppingCart size={16} /> Tambah Semua
            </button>
          </div>

          {hasil.rekomendasi.filter((r) => r.qtyRecom > 0).length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-black-soft)' }}>Tidak ada rekomendasi untuk kegiatan ini</p>
          ) : (
            <div className="space-y-3">
              {hasil.rekomendasi.filter((r) => r.qtyRecom > 0).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-warm)' }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-black)' }}>{r.nama_barang}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-black-soft)' }}>
                      Jumlah: {r.qtyRecom} | {formatRupiah(r.harga_sewa_per_hari)}/hari
                    </p>
                    {r.catatan && <p className="text-xs mt-0.5" style={{ color: 'var(--text-black-soft)' }}>{r.catatan}</p>}
                  </div>
                  <button
                    onClick={() => { if (!user) return router.push('/login'); addItem({ ...r, qty: r.qtyRecom }); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition"
                    style={{ backgroundColor: 'var(--green-light)', color: 'var(--green-accent)' }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}

              <div className="text-right pt-4 font-bold text-lg" style={{ color: 'var(--green-accent)' }}>
                Total estimasi/hari: {formatRupiah(hasil.rekomendasi.reduce((sum, r) => sum + r.harga_sewa_per_hari * r.qtyRecom, 0))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
