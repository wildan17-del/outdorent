'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah } from '@/lib/utils';
import { DollarSign, Save } from 'lucide-react';

export default function AdminDenda() {
  const [fines, setFines] = useState([]);
  const [settings, setSettings] = useState({ tarif_denda_per_hari: 50000 });
  const [loading, setLoading] = useState(true);
  const [editingTarif, setEditingTarif] = useState(false);
  const [tarifInput, setTarifInput] = useState(50000);

  async function load() {
    const [finesSnap, settingsSnap] = await Promise.all([
      getDocs(query(collection(db, 'fines'), orderBy('createdAt', 'desc'))),
      getDocs(collection(db, 'settings')),
    ]);
    setFines(finesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    if (!settingsSnap.empty) {
      const s = settingsSnap.docs[0].data();
      setSettings(s);
      setTarifInput(s.tarif_denda_per_hari);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSaveTarif() {
    try {
      const snap = await getDocs(collection(db, 'settings'));
      if (snap.empty) {
        await addDoc(collection(db, 'settings'), { tarif_denda_per_hari: Number(tarifInput) });
      } else {
        await updateDoc(doc(db, 'settings', snap.docs[0].id), { tarif_denda_per_hari: Number(tarifInput) });
      }
      setSettings({ tarif_denda_per_hari: Number(tarifInput) });
      setEditingTarif(false);
    } catch (err) { alert(err.message); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--starbucks-green)' }}>Kelola Denda</h1>

      {/* Tarif */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-3" style={{ color: 'var(--text-black)' }}>Pengaturan Tarif Denda</h2>
        {editingTarif ? (
          <div className="flex items-center gap-3">
            <input type="number" value={tarifInput} onChange={(e) => setTarifInput(e.target.value)} className="input-field w-48" />
            <button onClick={handleSaveTarif} className="btn-primary flex items-center gap-1">
              <Save size={16} /> Simpan
            </button>
            <button onClick={() => setEditingTarif(false)} className="text-sm" style={{ color: 'var(--text-black-soft)' }}>Batal</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold" style={{ color: 'var(--starbucks-green)' }}>{formatRupiah(settings.tarif_denda_per_hari)}<span className="text-sm font-normal" style={{ color: 'var(--text-black-soft)' }}> /hari/barang</span></p>
            <button onClick={() => setEditingTarif(true)} className="text-sm hover:underline" style={{ color: 'var(--green-accent)' }}>Ubah</button>
          </div>
        )}
      </div>

      {/* Riwayat Denda */}
      <div className="card overflow-x-auto">
        <h2 className="font-semibold p-4 pb-0" style={{ color: 'var(--text-black)' }}>Riwayat Denda</h2>
        {fines.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-black-soft)' }}><DollarSign size={32} className="mx-auto mb-2" />Belum ada denda</div>
        ) : (
          <table className="w-full text-sm mt-4">
            <thead style={{ backgroundColor: 'var(--neutral-warm)' }}>
              <tr>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Transaksi</th>
                <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Hari Telat</th>
                <th className="text-right p-3" style={{ color: 'var(--text-black-soft)' }}>Tarif</th>
                <th className="text-right p-3" style={{ color: 'var(--text-black-soft)' }}>Total Denda</th>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--ceramic)' }}>
              {fines.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs" style={{ color: 'var(--text-black)' }}>#{f.id_transaksi?.slice(0, 8)}</td>
                  <td className="p-3 text-center" style={{ color: 'var(--text-black)' }}>{f.jumlah_hari_terlambat} hari</td>
                  <td className="p-3 text-right" style={{ color: 'var(--text-black)' }}>{formatRupiah(f.tarif_per_hari)}</td>
                  <td className="p-3 text-right font-medium" style={{ color: 'var(--red)' }}>{formatRupiah(f.total_denda)}</td>
                  <td className="p-3 text-xs" style={{ color: 'var(--text-black-soft)' }}>{f.createdAt ? new Date(f.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
