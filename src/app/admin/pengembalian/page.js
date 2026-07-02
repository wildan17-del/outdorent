'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah, hitungDenda, selisihHari } from '@/lib/utils';
import { Undo2, CheckCircle } from 'lucide-react';

export default function AdminPengembalian() {
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ tarif_denda_per_hari: 50000 });
  const [processing, setProcessing] = useState(null);

  async function load() {
    try {
      const [rentSnap, settingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'transactions'), where('status', '==', 'disewa'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'settings')),
      ]);
      setActiveRentals(rentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      if (!settingsSnap.empty) {
        setSettings(settingsSnap.docs[0].data());
      }
    } catch (err) {
      console.error('Error load pengembalian:', err);
      alert('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleKembalikan(id) {
    setProcessing(id);
    try {
      const t = activeRentals.find((r) => r.id === id);
      const tglKembaliRencana = new Date(t.tanggal_kembali_rencana);
      const tglKembaliAktual = new Date();
      const hariTelat = selisihHari(tglKembaliRencana, tglKembaliAktual);
      const totalBarang = t.items?.reduce((sum, i) => sum + i.qty, 0) || 1;

      let denda = 0;
      let status = 'dikembalikan';

      if (hariTelat > 0) {
        denda = hitungDenda(hariTelat, settings.tarif_denda_per_hari, totalBarang);
        status = 'terlambat';

        await addDoc(collection(db, 'fines'), {
          id_transaksi: id,
          jumlah_hari_terlambat: hariTelat,
          tarif_per_hari: settings.tarif_denda_per_hari,
          total_denda: denda,
          createdAt: new Date().toISOString(),
        });
      }

      await updateDoc(doc(db, 'transactions', id), {
        tanggal_kembali_aktual: tglKembaliAktual.toISOString(),
        denda: denda,
        status: status,
        total_bayar: (t.total_bayar || 0) + denda,
      });

      if (t.items) {
        for (const item of t.items) {
          const itemRef = doc(db, 'items', item.id_barang);
          const snap = await getDoc(itemRef);
          if (snap.exists()) {
            await updateDoc(itemRef, { stok_tersedia: snap.data().stok_tersedia + item.qty });
          }
        }
      }

      load();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(null);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--starbucks-green)' }}>Proses Pengembalian</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-black-soft)' }}>Tarif denda: {formatRupiah(settings.tarif_denda_per_hari)}/hari/barang</p>

      {activeRentals.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-black-soft)' }}>
          <Undo2 size={48} className="mx-auto mb-4" />
          <p>Tidak ada barang yang sedang disewa</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeRentals.map((r) => {
            const tglKembali = new Date(r.tanggal_kembali_rencana);
            const now = new Date();
            const hariTelat = selisihDariSekarang(tglKembali);
            const totalBarang = r.items?.reduce((sum, i) => sum + i.qty, 0) || 1;
            const estimasiDenda = hariTelat > 0 ? hitungDenda(hariTelat, settings.tarif_denda_per_hari, totalBarang) : 0;

            return (
              <div key={r.id} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm" style={{ color: 'var(--text-black-soft)' }}>#{r.id.slice(0, 8)}</span>
                    {hariTelat > 0 && (
                      <span className="ml-2 text-sm font-medium" style={{ color: 'var(--red)' }}>Telat {hariTelat} hari</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleKembalikan(r.id)}
                    disabled={processing === r.id}
                    className="btn-primary flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    {processing === r.id ? 'Memproses...' : 'Kembalikan'}
                  </button>
                </div>
                <div className="text-sm space-y-1" style={{ color: 'var(--text-black-soft)' }}>
                  <p>Barang: {r.items?.map((i) => `${i.nama_barang} x${i.qty}`).join(', ') || '-'}</p>
                  <p>Rencana kembali: {tglKembali.toLocaleDateString('id-ID')}</p>
                  {estimasiDenda > 0 && (
                    <p className="font-medium" style={{ color: 'var(--red)' }}>Estimasi denda: {formatRupiah(estimasiDenda)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function selisihDariSekarang(tgl) {
  const now = new Date();
  return Math.max(0, Math.ceil((now - tgl) / (1000 * 60 * 60 * 24)));
}
