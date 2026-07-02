'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';

export default function AdminRekomendasiRules() {
  const [rules, setRules] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ jenis_kegiatan: '', id_barang: '', rasio_per_peserta: '', rasio_per_kelompok: '', catatan: '' });

  async function load() {
    const [rulesSnap, itemsSnap] = await Promise.all([
      getDocs(collection(db, 'recommendation_rules')),
      getDocs(collection(db, 'items')),
    ]);
    setRules(rulesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openModal(rule = null) {
    if (rule) {
      setEditId(rule.id);
      setForm({
        jenis_kegiatan: rule.jenis_kegiatan,
        id_barang: rule.id_barang,
        rasio_per_peserta: rule.rasio_per_peserta || '',
        rasio_per_kelompok: rule.rasio_per_kelompok || '',
        catatan: rule.catatan || '',
      });
    } else {
      setEditId(null);
      setForm({ jenis_kegiatan: '', id_barang: '', rasio_per_peserta: '', rasio_per_kelompok: '', catatan: '' });
    }
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const data = {
      jenis_kegiatan: form.jenis_kegiatan,
      id_barang: form.id_barang,
      rasio_per_peserta: form.rasio_per_peserta ? Number(form.rasio_per_peserta) : null,
      rasio_per_kelompok: form.rasio_per_kelompok ? Number(form.rasio_per_kelompok) : null,
      catatan: form.catatan || '',
    };

    try {
      if (editId) {
        await updateDoc(doc(db, 'recommendation_rules', editId), data);
      } else {
        await addDoc(collection(db, 'recommendation_rules'), data);
      }
      setModal(false);
      load();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus rule ini?')) return;
    await deleteDoc(doc(db, 'recommendation_rules', id));
    load();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--starbucks-green)' }}>Rules Rekomendasi</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-1">
          <Plus size={18} /> Tambah Rule
        </button>
      </div>

      <div className="card overflow-x-auto">
        {rules.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-black-soft)' }}><Settings size={32} className="mx-auto mb-2" />Belum ada rule rekomendasi</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--neutral-warm)' }}>
              <tr>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Kegiatan</th>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Barang</th>
                <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Per Peserta</th>
                <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Per Kelompok</th>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Catatan</th>
                <th className="text-center p-3" style={{ color: 'var(--text-black-soft)' }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--ceramic)' }}>
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium" style={{ color: 'var(--text-black)' }}>{r.jenis_kegiatan}</td>
                  <td className="p-3" style={{ color: 'var(--text-black)' }}>{items.find((i) => i.id === r.id_barang)?.nama_barang || '-'}</td>
                  <td className="p-3 text-center" style={{ color: 'var(--text-black)' }}>{r.rasio_per_peserta || '-'}</td>
                  <td className="p-3 text-center" style={{ color: 'var(--text-black)' }}>{r.rasio_per_kelompok || '-'}</td>
                  <td className="p-3 text-xs" style={{ color: 'var(--text-black-soft)' }}>{r.catatan || '-'}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => openModal(r)} style={{ color: 'var(--green-accent)' }} className="hover:opacity-70 p-1"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(r.id)} style={{ color: 'var(--red)' }} className="hover:opacity-70 p-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--starbucks-green)' }}>{editId ? 'Edit Rule' : 'Tambah Rule'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <select value={form.jenis_kegiatan} onChange={(e) => setForm({ ...form, jenis_kegiatan: e.target.value })} className="select-field" required>
                <option value="">Pilih Jenis Kegiatan</option>
                {['Camping', 'Pendakian', 'Hiking', 'Fishing', 'Picnic'].map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
              <select value={form.id_barang} onChange={(e) => setForm({ ...form, id_barang: e.target.value })} className="select-field" required>
                <option value="">Pilih Barang</option>
                {items.map((i) => (<option key={i.id} value={i.id}>{i.nama_barang}</option>))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>Rasio per Peserta</label>
                  <input type="number" step="0.1" value={form.rasio_per_peserta} onChange={(e) => setForm({ ...form, rasio_per_peserta: e.target.value })} className="input-field" placeholder="cth: 0.25" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-black)' }}>Rasio per Kelompok</label>
                  <input type="number" value={form.rasio_per_kelompok} onChange={(e) => setForm({ ...form, rasio_per_kelompok: e.target.value })} className="input-field" placeholder="cth: 2" />
                </div>
              </div>
              <input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Catatan (opsional)" className="input-field" />
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
