'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatRupiah } from '@/lib/utils';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

export default function AdminBarang() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama_barang: '', id_kategori: '', stok: 1, stok_tersedia: 1, harga_sewa_per_hari: 0, kondisi: 'Baik', foto_url: '' });
  async function load() {
    const [iSnap, cSnap] = await Promise.all([
      getDocs(collection(db, 'items')),
      getDocs(collection(db, 'categories')),
    ]);
    setItems(iSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setCategories(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openModal(item = null) {
    if (item) {
      setEditId(item.id);
      setForm({ nama_barang: item.nama_barang, id_kategori: item.id_kategori, stok: item.stok, stok_tersedia: item.stok_tersedia, harga_sewa_per_hari: item.harga_sewa_per_hari, kondisi: item.kondisi || 'Baik', foto_url: item.foto_url || '' });
    } else {
      setEditId(null);
      setForm({ nama_barang: '', id_kategori: '', stok: 1, stok_tersedia: 1, harga_sewa_per_hari: 0, kondisi: 'Baik', foto_url: '' });
    }
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const data = { ...form, stok: Number(form.stok), stok_tersedia: Number(form.stok_tersedia), harga_sewa_per_hari: Number(form.harga_sewa_per_hari) };

      if (editId) {
        await updateDoc(doc(db, 'items', editId), data);
      } else {
        await addDoc(collection(db, 'items'), data);
      }
      setModal(false);
      load();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus barang ini?')) return;
    await deleteDoc(doc(db, 'items', id));
    load();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--starbucks-green)' }}>Kelola Barang</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-1">
          <Plus size={18} /> Tambah Barang
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--neutral-warm)' }}>
            <tr>
              <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Nama</th>
              <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Kategori</th>
              <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Stok</th>
              <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Tersedia</th>
              <th className="text-right p-3" style={{ color: 'var(--text-black-soft)' }}>Harga/hari</th>
              <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--ceramic)' }}>
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium" style={{ color: 'var(--text-black)' }}>{i.nama_barang}</td>
                <td className="p-3" style={{ color: 'var(--text-black-soft)' }}>{categories.find((c) => c.id === i.id_kategori)?.nama_kategori || '-'}</td>
                <td className="p-3 text-center" style={{ color: 'var(--text-black)' }}>{i.stok}</td>
                <td className="p-3 text-center">
                  <span style={{ color: i.stok_tersedia > 0 ? 'var(--green-accent)' : 'var(--red)' }}>{i.stok_tersedia}</span>
                </td>
                <td className="p-3 text-right font-medium" style={{ color: 'var(--green-accent)' }}>{formatRupiah(i.harga_sewa_per_hari)}</td>
                <td className="p-3 text-center">
                  <button onClick={() => openModal(i)} style={{ color: 'var(--green-accent)' }} className="hover:opacity-70 p-1"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(i.id)} style={{ color: 'var(--red)' }} className="hover:opacity-70 p-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--starbucks-green)' }}>{editId ? 'Edit Barang' : 'Tambah Barang'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input value={form.nama_barang} onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} placeholder="Nama Barang" className="input-field" required />
              <select value={form.id_kategori} onChange={(e) => setForm({ ...form, id_kategori: e.target.value })} className="select-field" required>
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.nama_kategori}</option>))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} placeholder="Stok" className="input-field" required />
                <input type="number" value={form.stok_tersedia} onChange={(e) => setForm({ ...form, stok_tersedia: e.target.value })} placeholder="Stok Tersedia" className="input-field" required />
              </div>
              <input type="number" value={form.harga_sewa_per_hari} onChange={(e) => setForm({ ...form, harga_sewa_per_hari: e.target.value })} placeholder="Harga Sewa per Hari" className="input-field" required />
              <select value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })} className="select-field">
                <option>Baik</option>
                <option>Rusak Ringan</option>
                <option>Rusak Berat</option>
              </select>
              <input value={form.foto_url || ''} onChange={(e) => setForm({ ...form, foto_url: e.target.value })} placeholder="URL Gambar (bisa dari Google/ImgBB)" className="input-field" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Simpan</button>
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
