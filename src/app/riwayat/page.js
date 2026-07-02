'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah } from '@/lib/utils';
import { Clock, Package } from 'lucide-react';
import Link from 'next/link';

const statusLabel = {
  menunggu: 'Menunggu Konfirmasi',
  dibayar: 'Dibayar',
  disewa: 'Sedang Disewa',
  dikembalikan: 'Dikembalikan',
  terlambat: 'Terlambat',
  selesai: 'Selesai',
  batal: 'Dibatalkan',
};

const statusStyle = {
  menunggu: { bg: '#faf6ee', color: 'var(--gold)' },
  dibayar: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  disewa: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  dikembalikan: { bg: 'var(--neutral-warm)', color: 'var(--text-black-soft)' },
  terlambat: { bg: 'hsla(4, 82%, 43%, 0.08)', color: 'var(--red)' },
  selesai: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  batal: { bg: 'hsla(4, 82%, 43%, 0.08)', color: 'var(--red)' },
};

export default function RiwayatPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push('/login');

    async function load() {
      const q = query(collection(db, 'transactions'), where('id_pelanggan', '==', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, [user, authLoading, router]);

  if (authLoading || loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight mb-8 flex items-center gap-3" style={{ color: 'var(--starbucks-green)' }}>
        <Clock size={28} /> Riwayat Penyewaan
      </h1>

      {transactions.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto mb-4 opacity-40" style={{ color: 'var(--text-black-soft)' }} />
          <p className="text-base mb-6" style={{ color: 'var(--text-black-soft)' }}>Belum ada transaksi</p>
          <Link href="/katalog" className="btn-primary">Sewa Sekarang</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((t) => {
            const tglSewa = t.tanggal_sewa ? new Date(t.tanggal_sewa).toLocaleDateString('id-ID') : '-';
            const tglKembali = t.tanggal_kembali_rencana ? new Date(t.tanggal_kembali_rencana).toLocaleDateString('id-ID') : '-';
            const sStyle = statusStyle[t.status] || { bg: 'var(--neutral-warm)', color: 'var(--text-black-soft)' };
            return (
              <div key={t.id} className="card p-4 lg:p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-black-soft)' }}>#{t.id.slice(0, 8)}</span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: sStyle.bg, color: sStyle.color }}
                    >
                      {statusLabel[t.status] || t.status}
                    </span>
                  </div>
                  <p className="font-bold" style={{ color: 'var(--green-accent)' }}>{formatRupiah(t.total_bayar || 0)}</p>
                </div>
                <div className="text-sm space-y-0.5" style={{ color: 'var(--text-black-soft)' }}>
                  <p>Sewa: {tglSewa} | Kembali: {tglKembali}</p>
                  <p>Barang: {t.items?.map((i) => `${i.nama_barang} x${i.qty}`).join(', ') || '-'}</p>
                  {t.denda > 0 && <p style={{ color: 'var(--red)' }}>Denda: {formatRupiah(t.denda)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
