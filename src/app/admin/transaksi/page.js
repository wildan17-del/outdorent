'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah } from '@/lib/utils';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

const statusColors = {
  menunggu: { bg: 'hsla(38, 92%, 50%, 0.12)', color: '#B8860B' },
  dibayar: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  disewa: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  dikembalikan: { bg: 'var(--neutral-warm)', color: 'var(--text-black-soft)' },
  terlambat: { bg: 'hsla(4, 82%, 43%, 0.08)', color: 'var(--red)' },
  selesai: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  batal: { bg: 'hsla(4, 82%, 43%, 0.08)', color: 'var(--red)' },
};

export default function AdminTransaksi() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status, stokUpdate = null) {
    try {
      const update = { status };
      if (status === 'disewa' && stokUpdate) {
        for (const item of stokUpdate) {
          const itemRef = doc(db, 'items', item.id_barang);
          const snap = await getDoc(itemRef);
          if (snap.exists()) {
            await updateDoc(itemRef, { stok_tersedia: snap.data().stok_tersedia - item.qty });
          }
        }
      }
      if (status === 'selesai' || status === 'dikembalikan') {
        const t = transactions.find((tr) => tr.id === id);
        if (t?.items) {
          for (const item of t.items) {
            const itemRef = doc(db, 'items', item.id_barang);
            const snap = await getDoc(itemRef);
            if (snap.exists()) {
              await updateDoc(itemRef, { stok_tersedia: snap.data().stok_tersedia + item.qty });
            }
          }
        }
      }
      await updateDoc(doc(db, 'transactions', id), update);
      load();
    } catch (err) { alert(err.message); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--starbucks-green)' }}>Kelola Transaksi</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--neutral-warm)' }}>
            <tr>
              <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>ID</th>
              <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Tanggal</th>
              <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Barang</th>
              <th className="text-right p-3" style={{ color: 'var(--text-black-soft)' }}>Total</th>
              <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Status</th>
              <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--ceramic)' }}>
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-xs" style={{ color: 'var(--text-black)' }}>#{t.id.slice(0, 8)}</td>
                <td className="p-3 text-xs" style={{ color: 'var(--text-black-soft)' }}>
                  {t.tanggal_sewa ? new Date(t.tanggal_sewa).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="p-3" style={{ color: 'var(--text-black)' }}>
                  {t.items?.map((i) => `${i.nama_barang} x${i.qty}`).join(', ') || '-'}
                </td>
                <td className="p-3 text-right font-medium" style={{ color: 'var(--green-accent)' }}>{formatRupiah(t.total_bayar || 0)}</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusColors[t.status]?.bg || 'var(--neutral-warm)', color: statusColors[t.status]?.color || 'var(--text-black-soft)' }}>
                    {t.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-1">
                    {t.status === 'menunggu' && (
                      <>
                        <button onClick={() => updateStatus(t.id, 'disewa', t.items)} style={{ color: 'var(--green-accent)' }} className="hover:opacity-70 p-1" title="Setuju & Sewakan">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => updateStatus(t.id, 'batal')} style={{ color: 'var(--red)' }} className="hover:opacity-70 p-1" title="Batalkan">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    {t.status === 'terlambat' && (
                      <button onClick={() => updateStatus(t.id, 'selesai')} style={{ color: 'var(--green-accent)' }} className="hover:opacity-70 p-1 text-xs" title="Selesaikan">
                        Selesaikan
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
