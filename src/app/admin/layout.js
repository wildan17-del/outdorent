'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Users, FileText,
  Undo2, DollarSign, BarChart3, Settings, Tent
} from 'lucide-react';

const adminMenu = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/barang', label: 'Barang', icon: Package },
  { href: '/admin/kategori', label: 'Kategori', icon: Tag },
  { href: '/admin/pelanggan', label: 'Pelanggan', icon: Users },
  { href: '/admin/transaksi', label: 'Transaksi', icon: FileText },
  { href: '/admin/pengembalian', label: 'Pengembalian', icon: Undo2 },
  { href: '/admin/denda', label: 'Denda', icon: DollarSign },
  { href: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
  { href: '/admin/rekomendasi-rules', label: 'Rules Rekomendasi', icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, profile, loading, router]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} />
    </div>
  );
  if (!user || profile?.role !== 'admin') return null;

  return (
    <div className="flex min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-83px)]">
      {/* Sidebar Desktop */}
      <aside className="w-64 hidden md:flex flex-col border-r" style={{ backgroundColor: 'var(--neutral-warm)', borderColor: 'var(--ceramic)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--ceramic)' }}>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--starbucks-green)' }}>
            <Tent size={20} /> RentalOutdoor
          </Link>
          <p className="text-xs mt-1 font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--text-black-soft)' }}>Panel Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminMenu.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-full transition"
                style={{
                  color: active ? 'var(--green-accent)' : 'var(--text-black)',
                  backgroundColor: active ? 'var(--green-light)' : 'transparent',
                }}
              >
                <m.icon size={18} />
                {m.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden w-full overflow-x-auto" style={{ backgroundColor: 'var(--neutral-warm)', borderBottom: '1px solid var(--ceramic)' }}>
        <nav className="flex gap-1 p-2 text-xs">
          {adminMenu.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="flex-shrink-0 px-4 py-2 rounded-full font-medium transition whitespace-nowrap"
                style={{
                  color: active ? 'var(--green-accent)' : 'var(--text-black)',
                  backgroundColor: active ? 'var(--green-light)' : 'transparent',
                }}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[calc(100dvh-72px)]" style={{ backgroundColor: 'var(--neutral-warm)' }}>
        {children}
      </div>
    </div>
  );
}
