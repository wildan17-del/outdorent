'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Menu, X, Tent, LogOut, User, Package, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = profile?.role === 'admin';

  async function handleLogout() {
    await signOut(auth);
    router.push('/');
  }

  return (
    <nav className="bg-white sticky top-0 z-50" style={{ boxShadow: 'var(--shadow-nav)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-[72px] md:h-[83px] lg:h-[99px]">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg lg:text-xl" style={{ color: 'var(--starbucks-green)' }}>
            <Tent size={24} className="lg:w-[28px] lg:h-[28px]" />
            <span>RentalOutdoor</span>
          </Link>

          {/* Center/Right: Desktop nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/katalog" className="text-sm font-medium transition flex items-center gap-1" style={{ color: 'var(--text-black)' }}>
              <Package size={16} />
              Katalog
            </Link>
            <Link href="/rekomendasi" className="text-sm font-medium transition" style={{ color: 'var(--text-black)' }}>
              Rekomendasi
            </Link>

            {user ? (
              <>
                <Link href="/keranjang" className="relative text-sm font-medium transition" style={{ color: 'var(--text-black)' }}>
                  <ShoppingCartIcon size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-[11px] font-bold rounded-full text-white" style={{ backgroundColor: 'var(--green-accent)' }}>
                      {totalItems}
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <Link href="/admin/dashboard" className="btn-outline text-sm !py-1 !px-3">
                    Admin
                  </Link>
                )}
                {!isAdmin && (
                  <Link href="/riwayat" className="text-sm font-medium transition" style={{ color: 'var(--text-black)' }}>
                    Riwayat
                  </Link>
                )}

                <Link href="/profil" className="transition" style={{ color: 'var(--text-black)' }}>
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="transition" style={{ color: 'var(--red)' }}>
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline-dark text-sm">
                  Masuk
                </Link>
                <Link href="/register" className="btn-black text-sm">
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} style={{ color: 'var(--text-black)' }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-4 pb-5 pt-3 space-y-1" style={{ backgroundColor: 'var(--neutral-warm)', borderColor: 'var(--ceramic)' }}>
          <MobileLink href="/katalog" icon={<Package size={18} />} label="Katalog" onClick={() => setOpen(false)} />
          <MobileLink href="/rekomendasi" label="Rekomendasi" onClick={() => setOpen(false)} />
          {user ? (
            <>
              <MobileLink href="/keranjang" label={`Keranjang (${totalItems})`} onClick={() => setOpen(false)} />
              {isAdmin && <MobileLink href="/admin/dashboard" label="Admin Panel" onClick={() => setOpen(false)} />}
              {!isAdmin && <MobileLink href="/riwayat" label="Riwayat" onClick={() => setOpen(false)} />}
              <MobileLink href="/profil" label="Profil" onClick={() => setOpen(false)} />
              <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left py-2.5 text-sm font-medium" style={{ color: 'var(--red)' }}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <MobileLink href="/login" label="Masuk" onClick={() => setOpen(false)} />
              <MobileLink href="/register" label="Daftar" onClick={() => setOpen(false)} />
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function ShoppingCartIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MobileLink({ href, label, icon, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 py-2.5 text-sm font-medium"
      style={{ color: 'var(--text-black)' }}
    >
      {icon}
      {label}
    </Link>
  );
}
