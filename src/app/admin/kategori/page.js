'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2, Tag } from 'lucide-react';

export default function AdminKategori() {
  const [categories, setCategories] = useState([]);
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const snap = await getDocs(collection(db, 'categories'));
    setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!nama.trim()) return;
    await addDoc(collection(db, 'categories'), { nama_kategori: nama.trim() });
    setNama('');
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Hapus kategori?')) return;
    await deleteDoc(doc(db, 'categories', id));
    load();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--starbucks-green)' }}>Kelola Kategori</h1>

      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama kategori baru" className="input-field flex-1" required />
        <button type="submit" className="btn-primary flex items-center gap-1">
          <Plus size={18} /> Tambah
        </button>
      </form>

      <div className="card">
        {categories.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-black-soft)' }}><Tag size={32} className="mx-auto mb-2" />Belum ada kategori</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--neutral-warm)' }}>
              <tr>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Nama Kategori</th>
                <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--ceramic)' }}>
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium" style={{ color: 'var(--text-black)' }}>{c.nama_kategori}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(c.id)} style={{ color: 'var(--red)' }} className="hover:opacity-70 p-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
