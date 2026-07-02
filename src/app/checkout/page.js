'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah } from '@/lib/utils';
import { CreditCard, Calendar, Package, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, totalHarga, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [lamaSewa, setLamaSewa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [simulasi, setSimulasi] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-base mb-6" style={{ color: 'var(--text-black-soft)' }}>Silakan login untuk checkout</p>
        <Link href="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (cart.items.length === 0 && !done) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-base mb-6" style={{ color: 'var(--text-black-soft)' }}>Keranjang kosong</p>
        <Link href="/katalog" className="btn-primary">Katalog</Link>
      </div>
    );
  }

  const totalBayar = totalHarga * lamaSewa;

  async function handleBayar() {
    setLoading(true);
    try {
      const tglSewa = new Date();
      const tglKembali = new Date();
      tglKembali.setDate(tglKembali.getDate() + lamaSewa);

      await addDoc(collection(db, 'transactions'), {
        id_pelanggan: user.uid,
        tanggal_sewa: tglSewa.toISOString(),
        tanggal_kembali_rencana: tglKembali.toISOString(),
        tanggal_kembali_aktual: null,
        items: cart.items.map((i) => ({
          id_barang: i.id,
          nama_barang: i.nama_barang,
          qty: i.qty,
          harga_sewa_per_hari: i.harga_sewa_per_hari,
        })),
        total_bayar: totalBayar,
        status: 'menunggu',
        payment_status: 'unpaid',
        denda: 0,
        createdAt: serverTimestamp(),
      });

      setSimulasi(true);
    } catch (err) {
      alert('Gagal checkout: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSimulasiBayar() {
    // ponytail: simulasi bayar, tinggal ubah status aja
    setDone(true);
    clearCart();
  }

  if (done) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: 'var(--green-light)' }}>
          <CheckCircle size={36} style={{ color: 'var(--green-accent)' }} />
        </div>
        <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight mb-2" style={{ color: 'var(--starbucks-green)' }}>
          Pembayaran Berhasil!
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-black-soft)' }}>
          Transaksi sewa kamu sedang diproses, tunggu konfirmasi admin ya~
        </p>
        <Link href="/riwayat" className="btn-primary">
          Lihat Riwayat
        </Link>
      </div>
    );
  }

  if (simulasi) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: 'var(--green-light)' }}>
          <CreditCard size={28} style={{ color: 'var(--green-accent)' }} />
        </div>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--starbucks-green)' }}>Simulasi Pembayaran</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-black-soft)' }}>
          Ini adalah halaman simulasi pembayaran. Tekan tombol di bawah untuk mengonfirmasi pembayaran.
        </p>
        <div className="card p-6 mb-6 text-left">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-black-soft)' }}>Total Pembayaran</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--green-accent)' }}>{formatRupiah(totalBayar)}</p>
        </div>
        <button onClick={handleSimulasiBayar} className="btn-primary w-full justify-center !py-[14px]">
          Konfirmasi Pembayaran (Simulasi)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight mb-8" style={{ color: 'var(--starbucks-green)' }}>
        Checkout
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: 'var(--text-black-soft)' }}>
            Barang yang Disewa
          </h2>
          {cart.items.map((item) => (
            <div key={item.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--neutral-warm)' }}>
                <Package size={18} className="opacity-40" style={{ color: 'var(--text-black-soft)' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-black)' }}>{item.nama_barang}</p>
                <p className="text-xs" style={{ color: 'var(--text-black-soft)' }}>{item.qty} x {formatRupiah(item.harga_sewa_per_hari)}/hari</p>
              </div>
              <p className="font-bold text-sm" style={{ color: 'var(--green-accent)' }}>{formatRupiah(item.harga_sewa_per_hari * item.qty)}</p>
            </div>
          ))}
        </div>

        {/* Order Summary — Starbucks style */}
        <div>
          <div className="card p-6 sticky top-28">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-black)' }}>
              <Calendar size={16} /> Lama Sewa
            </h2>
            <div className="flex items-center gap-2 mb-6">
              <input type="number" min={1} value={lamaSewa} onChange={(e) => setLamaSewa(Number(e.target.value))} className="input-field !w-20 text-center" />
              <span className="text-sm" style={{ color: 'var(--text-black-soft)' }}>hari</span>
            </div>

            <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--ceramic)' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-black-soft)' }}>Total per hari</span>
                <span style={{ color: 'var(--text-black)' }}>{formatRupiah(totalHarga)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-black-soft)' }}>Lama sewa</span>
                <span style={{ color: 'var(--text-black)' }}>{lamaSewa} hari</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3" style={{ borderTop: '1px solid var(--ceramic)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--green-accent)' }}>{formatRupiah(totalBayar)}</span>
              </div>
            </div>

            <button
              onClick={handleBayar}
              disabled={loading || lamaSewa < 1}
              className="btn-primary w-full justify-center !py-[14px] mt-6 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Bayar Sekarang (Simulasi)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
