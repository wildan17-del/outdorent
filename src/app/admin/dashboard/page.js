'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah } from '@/lib/utils';
import { Package, Users, FileText, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ items: 0, users: 0, transactions: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [itemsSnap, usersSnap, transSnap] = await Promise.all([
        getDocs(collection(db, 'items')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'transactions')),
      ]);

      let revenue = 0;
      transSnap.docs.forEach((d) => {
        const t = d.data();
        if (t.status === 'selesai' || t.status === 'dibayar') {
          revenue += (t.total_bayar || 0) + (t.denda || 0);
        }
      });

      setStats({
        items: itemsSnap.size,
        users: usersSnap.size,
        transactions: transSnap.size,
        revenue,
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Total Barang', value: stats.items, icon: Package, accent: 'var(--green-accent)' },
    { label: 'Total Pelanggan', value: stats.users, icon: Users, accent: 'var(--starbucks-green)' },
    { label: 'Total Transaksi', value: stats.transactions, icon: FileText, accent: 'var(--green-uplift)' },
    { label: 'Pendapatan', value: formatRupiah(stats.revenue), icon: DollarSign, accent: 'var(--gold)' },
  ];

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--starbucks-green)' }}>Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--green-light)' }}
              >
                <c.icon size={22} style={{ color: c.accent }} />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-black)' }}>{c.value}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-black-soft)' }}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
