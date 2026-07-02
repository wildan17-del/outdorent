import Link from 'next/link';
import {
  Tent,
  ClipboardList,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Compass,
  Package,
  Users,
  Clock,
  BadgeCheck,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* ═══ Hero ═══ */}
      <section className="section-dark relative overflow-hidden">
        <TopoLines />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-8 py-14 lg:py-20">
            {/* Left: Content */}
            <div className="flex-1 lg:pr-10 text-center lg:text-left lg:max-w-[58%]">
              <p className="eyebrow mb-4 flex items-center justify-center lg:justify-start gap-2" style={{ color: 'var(--gold-light)' }}>
                <Compass size={14} /> Outdoor Equipment Rental
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-semibold leading-[1.15] mb-5 text-white">
                Siap Berpetualang?
                {' '}
                <span style={{ color: 'var(--green-light)' }}>Kami Siapkan</span> Perlengkapannya
              </h1>
              <p className="text-base md:text-lg max-w-[52ch] mb-7 leading-relaxed mx-auto lg:mx-0" style={{ color: 'var(--text-white-soft)' }}>
                Sewa perlengkapan outdoor dengan mudah. Dari tenda, kompor, carrier, hingga sleeping bag —
                lengkap untuk petualanganmu ke gunung, pantai, atau camping santai.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/katalog" className="btn-white">
                  Lihat Katalog <ArrowRight size={18} />
                </Link>
                <Link href="/rekomendasi" className="btn-outline-white">
                  Cari Rekomendasi
                </Link>
              </div>
            </div>

            {/* Right: Visual — gear tag, not a generic icon-in-circle */}
            <div className="flex-1 lg:max-w-[36%] flex justify-center">
              <GearTag />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="section-cream py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-14 lg:mb-16">
            <p className="eyebrow mb-3" style={{ color: 'var(--green-accent)' }}>Kenapa Kami</p>
            <h2 className="font-display text-2xl md:text-[2.6rem] font-semibold leading-tight" style={{ color: 'var(--starbucks-green)' }}>
              Petualangan Dimulai dari Sini
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={<ClipboardList size={26} />}
              title="Rekomendasi Otomatis"
              desc="Input jumlah peserta & durasi trip, langsung dapat daftar perlengkapan yang pas — nggak perlu nebak-nebak sendiri."
            />
            <FeatureCard
              icon={<ShieldCheck size={26} />}
              title="Mudah & Terpercaya"
              desc="Sewa cepat, lacak status real-time, denda otomatis kalau telat, riwayat transaksi lengkap tersimpan."
            />
            <FeatureCard
              icon={<Smartphone size={26} />}
              title="Akses di Mana Saja"
              desc="Bisa diinstal sebagai aplikasi PWA. Mobile-first, jadi tetap gampang diakses walau sinyal pas-pasan di basecamp."
            />
          </div>
        </div>
      </section>

      {/* ═══ Dark Feature Band — stats as trail markers, not repeated tiles ═══ */}
      <section className="section-dark py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <p className="eyebrow mb-4" style={{ color: 'var(--gold-light)' }}>Bergabung Sekarang</p>
              <h2 className="font-display text-2xl md:text-[2.6rem] font-semibold leading-tight text-white mb-4">
                Siap Mendaki atau Camping Santai?
              </h2>
              <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: 'var(--text-white-soft)' }}>
                Daftar sekarang dan nikmati kemudahan sewa perlengkapan outdoor.
                Proses cepat, barang berkualitas, harga bersahabat.
              </p>
              <Link href="/register" className="btn-white">
                Daftar Gratis <ArrowRight size={18} />
              </Link>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 max-w-sm lg:max-w-none w-full">
              <StatCard icon={<Package size={20} />} value="50+" label="Perlengkapan" />
              <StatCard icon={<Users size={20} />} value="500+" label="Penyewa Puas" />
              <StatCard icon={<Clock size={20} />} value="24 Jam" label="Proses Cepat" />
              <StatCard icon={<BadgeCheck size={20} />} value="100%" label="Terpercaya" accent />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer CTA — distinct from hero CTA, not a repeat ═══ */}
      <section className="section-cream py-16 lg:py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <p className="eyebrow mb-3" style={{ color: 'var(--green-accent)' }}>Gratis, Tanpa Ribet</p>
          <h2 className="font-display text-2xl md:text-[2.6rem] font-semibold leading-tight mb-4" style={{ color: 'var(--starbucks-green)' }}>
            Perlengkapan Sudah Menunggu
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--text-black-soft)' }}>
            Bikin akun, pilih barang, dan trip berikutnya tinggal berangkat.
          </p>
          <Link href="/register" className="btn-primary text-lg !px-10 !py-4">
            Daftar Gratis
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="section-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3" style={{ color: 'var(--gold)' }}>
            <Tent size={20} />
            <span className="font-display font-semibold text-white">RentalOutdoor</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-white-soft)' }}>
            &copy; {new Date().getFullYear()} Rental Outdoor. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ═══ Signature motif: topographic contour lines, referencing hiking
   maps — sits quietly behind the hero instead of a generic
   icon-in-circle graphic ═══ */
function TopoLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M -100 ${120 + i * 90} C 250 ${40 + i * 90}, 450 ${220 + i * 90}, 750 ${100 + i * 90} S 1250 ${180 + i * 90}, 1400 ${90 + i * 90}`}
          fill="none"
          stroke="var(--green-uplift)"
          strokeWidth="1.5"
          opacity={0.5 - i * 0.06}
        />
      ))}
    </svg>
  );
}

/* ═══ Hero visual: a "gear tag" card — riffs on a rental swing-tag
   instead of a floating icon-in-circle ═══ */
function GearTag() {
  return (
    <div
      className="w-full max-w-[240px] rounded-2xl p-5 relative"
      style={{ background: 'var(--green-uplift)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <span className="eyebrow" style={{ color: 'var(--text-white-soft)' }}>Item #0142</span>
        <Compass size={16} style={{ color: 'var(--gold-light)' }} />
      </div>
      <div className="flex items-center justify-center py-5">
        <Tent size={68} className="text-white/90" strokeWidth={1.2} />
      </div>
      <div className="border-t pt-4 mt-1" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <p className="font-mono-label text-xs" style={{ color: 'var(--text-white-soft)' }}>Tenda Dome 4P</p>
        <p className="text-white font-semibold mt-1">Rp 35.000 / hari</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card p-7 lg:p-8 hover:shadow-md transition-shadow duration-300">
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
        style={{ backgroundColor: 'var(--green-light)' }}
      >
        <span style={{ color: 'var(--green-accent)' }}>{icon}</span>
      </div>
      <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--starbucks-green)' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-black-soft)' }}>{desc}</p>
    </div>
  );
}

function StatCard({ icon, value, label, accent }) {
  return (
    <div
      className="rounded-2xl p-5 text-center"
      style={{
        background: accent ? 'var(--gold)' : 'var(--green-uplift)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex justify-center mb-3" style={{ color: accent ? 'var(--forest-900)' : 'var(--green-light)' }}>
        {icon}
      </div>
      <p className={`text-2xl md:text-3xl font-display font-bold mb-1 ${accent ? '' : 'text-white'}`} style={accent ? { color: 'var(--forest-900)' } : undefined}>
        {value}
      </p>
      <p className="text-sm" style={{ color: accent ? 'rgba(18,36,30,0.75)' : 'var(--text-white-soft)' }}>{label}</p>
    </div>
  );
}