'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah } from '@/lib/utils';
import { Package, Search } from 'lucide-react';

export default function KatalogPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [itemsSnap, catsSnap] = await Promise.all([
        getDocs(collection(db, 'items')),
        getDocs(collection(db, 'categories')),
      ]);
      setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setCategories(catsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = items.filter((i) => {
    const matchSearch = i.nama_barang?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || i.id_kategori === filterCat;
    return matchSearch && matchCat;
  });

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight mb-2" style={{ color: 'var(--starbucks-green)' }}>
          Katalog Barang
        </h1>
        <p className="text-base" style={{ color: 'var(--text-black-soft)' }}>
          Pilih perlengkapan outdoor yang kamu butuhkan
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3.5" style={{ color: 'var(--text-black-soft)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barang..."
            className="input-field !pl-10"
          />
        </div>
        <div className="relative sm:w-56">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="select-field">
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nama_kategori}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-black-soft)' }}>
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Barang tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <Link key={item.id} href={`/katalog/${item.id}`} className="card hover:shadow-md transition-shadow duration-300 group">
              <div className="h-40 flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--neutral-warm)' }}>
                {item.foto_url ? (
                  <img src={item.foto_url} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <Package size={40} className="opacity-30" style={{ color: 'var(--text-black-soft)' }} />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-black)' }}>{item.nama_barang}</h3>
                <p className="font-bold text-lg" style={{ color: 'var(--green-accent)' }}>
                  {formatRupiah(item.harga_sewa_per_hari)}
                  <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-black-soft)' }}>/hari</span>
                </p>
                <p className="text-sm mt-1 font-medium" style={{ color: item.stok_tersedia > 0 ? 'var(--green-accent)' : 'var(--red)' }}>
                  {item.stok_tersedia > 0 ? `Tersedia ${item.stok_tersedia}` : 'Habis'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
