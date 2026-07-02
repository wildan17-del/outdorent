'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Tent, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: '', email: '', password: '', noHp: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.nama });
      await setDoc(doc(db, 'users', cred.user.uid), {
        nama: form.nama,
        email: form.email,
        no_hp: form.noHp,
        role: 'pelanggan',
        createdAt: new Date().toISOString(),
      });
      router.push('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-99px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: 'var(--green-light)' }}>
              <Tent size={28} style={{ color: 'var(--green-accent)' }} />
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--starbucks-green)' }}>Daftar</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-black-soft)' }}>Buat akun Rental Outdoor baru</p>
          </div>

          {error && (
            <div className="text-sm p-3 rounded-lg mb-4" style={{ backgroundColor: 'hsla(4, 82%, 43%, 0.05)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>Nama Lengkap</label>
              <input name="nama" value={form.nama} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>No. HP</label>
              <input name="noHp" value={form.noHp} onChange={handleChange} className="input-field" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-field !pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3" style={{ color: 'var(--text-black-soft)' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-black-soft)' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: 'var(--green-accent)' }} className="font-medium hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
