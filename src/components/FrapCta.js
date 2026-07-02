'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function FrapCta() {
  const { totalItems } = useCart();

  return (
    <Link href="/keranjang" className="frap-cta" aria-label="Lihat Keranjang">
      <div className="relative">
        <ShoppingCart size={22} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-[11px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center shadow-sm" style={{ color: 'var(--green-accent)' }}>
            {totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}
