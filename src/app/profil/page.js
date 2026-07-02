'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'lucide-react';

export default function ProfilPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ nama: '', noHp: '', alamat: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push('/login');
    if (profile) {
      setForm({
        nama: profile.nama || '',
        noHp: profile.no_hp || '',
        alamat: profile.alamat || '',
      });
    }
  }, [user, profile, authLoading, router]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nama: form.nama,
        no_hp: form.noHp,
        alamat: form.alamat,
      });
      setMsg('Profil berhasil diperbarui!');
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: 'var(--green-light)' }}>
          <User size={36} style={{ color: 'var(--green-accent)' }} />
        </div>
        <h1 className="text-[2.8rem] font-semibold leading-tight tracking-tight" style={{ color: 'var(--starbucks-green)' }}>
          Profil Saya
        </h1>
      </div>

      <div className="card p-6 lg:p-8">
        {msg && (
          <div
            className="text-sm p-3 rounded-lg mb-4"
            style={{
              backgroundColor: msg.includes('Error') ? 'hsla(4, 82%, 43%, 0.05)' : 'var(--green-light)',
              color: msg.includes('Error') ? 'var(--red)' : 'var(--green-accent)',
            }}
          >
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>Email</label>
            <input value={user?.email || ''} disabled className="input-field opacity-60" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>Nama Lengkap</label>
            <input name="nama" value={form.nama} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>No. HP</label>
            <input name="noHp" value={form.noHp} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>Alamat</label>
            <textarea name="alamat" value={form.alamat} onChange={handleChange} rows={3} className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center !py-3 disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>
    </div>
  );
}
