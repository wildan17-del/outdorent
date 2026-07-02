'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatRupiah } from '@/lib/utils';
import { Package, Minus, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DetailBarangPage() {
  // ponytail: params is a Promise in Next.js 16
  const params = useParams();
  const { id } = params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'items', id));
      if (snap.exists()) {
        setItem({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function handleAdd() {
    if (!user) return router.push('/login');
    addItem({ ...item, qty });
    router.push('/keranjang');
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} />
    </div>
  );
  if (!item) return (
    <div className="text-center py-20" style={{ color: 'var(--text-black-soft)' }}>
      Barang tidak ditemukan
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <Link href="/katalog" className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition" style={{ color: 'var(--green-accent)' }}>
        <ArrowLeft size={18} /> Kembali ke Katalog
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image — Starbucks PDP style */}
        <div className="card h-72 md:h-96 flex items-center justify-center">
          {item.foto_url ? (
            <img src={item.foto_url} alt={item.nama_barang} className="w-full h-full object-cover" />
          ) : (
            <Package size={64} className="opacity-30" style={{ color: 'var(--text-black-soft)' }} />
          )}
        </div>

        {/* Detail */}
        <div>
          <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight mb-2" style={{ color: 'var(--starbucks-green)' }}>
            {item.nama_barang}
          </h1>
          <p className="text-3xl font-bold mb-6" style={{ color: 'var(--green-accent)' }}>
            {formatRupiah(item.harga_sewa_per_hari)}
            <span className="text-lg font-normal ml-1" style={{ color: 'var(--text-black-soft)' }}>/hari</span>
          </p>

          {/* Specs */}
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium min-w-[100px]" style={{ color: 'var(--text-black)' }}>Stok tersedia</span>
              <span className={item.stok_tersedia > 0 ? 'font-semibold' : 'font-semibold'} style={{ color: item.stok_tersedia > 0 ? 'var(--green-accent)' : 'var(--red)' }}>
                {item.stok_tersedia > 0 ? `${item.stok_tersedia} unit` : 'Habis'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium min-w-[100px]" style={{ color: 'var(--text-black)' }}>Kondisi</span>
              <span style={{ color: 'var(--text-black-soft)' }}>{item.kondisi || 'Baik'}</span>
            </div>
            {item.deskripsi && (
              <p className="pt-3 leading-relaxed" style={{ color: 'var(--text-black-soft)' }}>{item.deskripsi}</p>
            )}
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center gap-4 mb-8">
            <span className="font-medium text-sm" style={{ color: 'var(--text-black)' }}>Jumlah:</span>
            <div className="flex items-center" style={{ border: '1px solid var(--input-border)', borderRadius: 'var(--radius-input)' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 transition hover:bg-gray-50">
                <Minus size={16} />
              </button>
              <span className="px-5 py-2 font-semibold min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(item.stok_tersedia || 99, qty + 1))} className="px-3 py-2 transition hover:bg-gray-50">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to Cart — Starbucks PDP style Add to Order */}
          <button
            onClick={handleAdd}
            disabled={!item.stok_tersedia}
            className="btn-primary w-full justify-center !py-[14px] !px-8 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {item.stok_tersedia ? 'Tambah ke Keranjang' : 'Stok Habis'}
          </button>
        </div>
      </div>
    </div>
  );
}
