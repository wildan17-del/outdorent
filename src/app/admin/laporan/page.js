'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah } from '@/lib/utils';
import { BarChart3, Download } from 'lucide-react';

const statusBadge = {
  selesai: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  dibayar: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  dikembalikan: { bg: 'var(--neutral-warm)', color: 'var(--text-black-soft)' },
  disewa: { bg: 'var(--green-light)', color: 'var(--green-accent)' },
  menunggu: { bg: 'hsla(38, 92%, 50%, 0.12)', color: '#B8860B' },
  terlambat: { bg: 'hsla(4, 82%, 43%, 0.08)', color: 'var(--red)' },
  batal: { bg: 'hsla(4, 82%, 43%, 0.08)', color: 'var(--red)' },
};

export default function AdminLaporan() {
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  useEffect(() => {
    async function load() {
      const [transSnap, itemsSnap] = await Promise.all([
        getDocs(collection(db, 'transactions')),
        getDocs(collection(db, 'items')),
      ]);
      setTransactions(transSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data(), nama: d.data().nama_barang })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = transactions.filter((t) => {
    if (!t.tanggal_sewa) return false;
    const tgl = new Date(t.tanggal_sewa);
    if (filterStart && tgl < new Date(filterStart)) return false;
    if (filterEnd && tgl > new Date(filterEnd + 'T23:59:59')) return false;
    return true;
  });

  const completed = filtered.filter((t) => t.status === 'selesai' || t.status === 'terlambat' || t.status === 'dikembalikan');
  const totalRevenue = completed.reduce((sum, t) => sum + (t.total_bayar || 0), 0);
  const totalDenda = completed.reduce((sum, t) => sum + (t.denda || 0), 0);

  const itemCount = {};
  filtered.forEach((t) => {
    t.items?.forEach((i) => {
      itemCount[i.nama_barang] = (itemCount[i.nama_barang] || 0) + i.qty;
    });
  });
  const topItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

  function exportCSV() {
    const header = 'ID,Tanggal Sewa,Barang,Total,Denda,Status\n';
    const rows = filtered.map((t) => {
      const barang = t.items?.map((i) => `${i.nama_barang} x${i.qty}`).join('; ') || '';
      return `#${t.id.slice(0, 8)},${t.tanggal_sewa ? new Date(t.tanggal_sewa).toLocaleDateString('id-ID') : ''},"${barang}",${t.total_bayar || 0},${t.denda || 0},${t.status}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--starbucks-green)' }}>Laporan</h1>
        <button onClick={exportCSV} className="btn-primary flex items-center gap-1">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filter */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-black-soft)' }}>Dari tanggal</label>
          <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-black-soft)' }}>Sampai tanggal</label>
          <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="input-field" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm" style={{ color: 'var(--text-black-soft)' }}>Total Transaksi</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-black)' }}>{filtered.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm" style={{ color: 'var(--text-black-soft)' }}>Pendapatan</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--green-accent)' }}>{formatRupiah(totalRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm" style={{ color: 'var(--text-black-soft)' }}>Total Denda</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--red)' }}>{formatRupiah(totalDenda)}</p>
        </div>
      </div>

      {/* Barang Populer */}
      {topItems.length > 0 && (
        <div className="card p-4 mb-6">
          <h2 className="font-semibold mb-3" style={{ color: 'var(--starbucks-green)' }}>Barang Paling Populer</h2>
          <div className="space-y-2">
            {topItems.map(([nama, count], idx) => (
              <div key={nama} className="flex items-center gap-3">
                <span className="text-sm w-6" style={{ color: 'var(--text-black-soft)' }}>{idx + 1}.</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-black)' }}>{nama}</span>
                    <span className="font-medium" style={{ color: 'var(--green-accent)' }}>{count}x disewa</span>
                  </div>
                  <div className="h-2 rounded-full mt-1" style={{ backgroundColor: 'var(--neutral-warm)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${(count / topItems[0][1]) * 100}%`, backgroundColor: 'var(--green-accent)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--neutral-warm)' }}>
            <tr>
              <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>ID</th>
              <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Tanggal</th>
              <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Barang</th>
              <th className="text-right p-3" style={{ color: 'var(--text-black-soft)' }}>Total</th>
              <th className="text-right p-3" style={{ color: 'var(--text-black-soft)' }}>Denda</th>
              <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--ceramic)' }}>
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-xs" style={{ color: 'var(--text-black)' }}>#{t.id.slice(0, 8)}</td>
                <td className="p-3 text-xs" style={{ color: 'var(--text-black-soft)' }}>
                  {t.tanggal_sewa ? new Date(t.tanggal_sewa).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="p-3" style={{ color: 'var(--text-black)' }}>{t.items?.map((i) => `${i.nama_barang} x${i.qty}`).join(', ') || '-'}</td>
                <td className="p-3 text-right font-medium" style={{ color: 'var(--green-accent)' }}>{formatRupiah(t.total_bayar || 0)}</td>
                <td className="p-3 text-right" style={{ color: 'var(--red)' }}>{t.denda ? formatRupiah(t.denda) : '-'}</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                    backgroundColor: statusBadge[t.status]?.bg || 'var(--neutral-warm)',
                    color: statusBadge[t.status]?.color || 'var(--text-black-soft)',
                  }}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
