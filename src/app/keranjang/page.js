'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { ShoppingCart, Trash2, Minus, Plus, Package } from 'lucide-react';
import Link from 'next/link';

export default function KeranjangPage() {
  const { cart, removeItem, updateQty, totalItems, totalHarga } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: 'var(--green-light)' }}>
          <ShoppingCart size={36} style={{ color: 'var(--green-accent)' }} />
        </div>
        <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight mb-2" style={{ color: 'var(--starbucks-green)' }}>
          Keranjang Kosong
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-black-soft)' }}>
          Belum ada barang yang ditambahkan ke keranjang
        </p>
        <Link href="/katalog" className="btn-primary">
          Lihat Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight mb-8 flex items-center gap-3" style={{ color: 'var(--starbucks-green)' }}>
        <ShoppingCart size={28} /> Keranjang ({totalItems})
      </h1>

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="card p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--neutral-warm)' }}>
              <Package size={24} className="opacity-40" style={{ color: 'var(--text-black-soft)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate" style={{ color: 'var(--text-black)' }}>{item.nama_barang}</h3>
              <p className="font-bold text-sm" style={{ color: 'var(--green-accent)' }}>
                {formatRupiah(item.harga_sewa_per_hari)}
                <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-black-soft)' }}>/hari</span>
              </p>
            </div>
            <div className="flex items-center gap-1" style={{ border: '1px solid var(--input-border)', borderRadius: 'var(--radius-input)' }}>
              <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} className="p-1.5 hover:bg-gray-50 transition">
                <Minus size={14} style={{ color: 'var(--text-black-soft)' }} />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
              <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1.5 hover:bg-gray-50 transition">
                <Plus size={14} style={{ color: 'var(--text-black-soft)' }} />
              </button>
            </div>
            <p className="font-bold min-w-[80px] text-right text-sm" style={{ color: 'var(--text-black)' }}>
              {formatRupiah(item.harga_sewa_per_hari * item.qty)}
            </p>
            <button onClick={() => removeItem(item.id)} className="p-2 transition" style={{ color: 'var(--red)' }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="card p-6 mt-8">
        <div className="flex justify-between items-center text-xl font-bold mb-4" style={{ color: 'var(--text-black)' }}>
          <span>Total per hari</span>
          <span style={{ color: 'var(--green-accent)' }}>{formatRupiah(totalHarga)}</span>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--text-black-soft)' }}>
          * Belum termasuk lama sewa, diisi saat checkout
        </p>
        {user ? (
          <Link href="/checkout" className="btn-primary w-full justify-center !py-[14px]">
            Lanjut ke Checkout
          </Link>
        ) : (
          <Link href="/login" className="btn-primary w-full justify-center !py-[14px]">
            Masuk untuk Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
