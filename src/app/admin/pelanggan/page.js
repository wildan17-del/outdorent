'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users } from 'lucide-react';

export default function AdminPelanggan() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.role === 'pelanggan'));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--green-accent)' }} /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--starbucks-green)' }}>Kelola Pelanggan</h1>

      <div className="card overflow-x-auto">
        {users.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-black-soft)' }}><Users size={32} className="mx-auto mb-2" />Belum ada pelanggan</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--neutral-warm)' }}>
              <tr>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Nama</th>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Email</th>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>No. HP</th>
                <th className="text-left p-3" style={{ color: 'var(--text-black-soft)' }}>Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--ceramic)' }}>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium" style={{ color: 'var(--text-black)' }}>{u.nama || '-'}</td>
                  <td className="p-3" style={{ color: 'var(--text-black-soft)' }}>{u.email}</td>
                  <td className="p-3" style={{ color: 'var(--text-black)' }}>{u.no_hp || '-'}</td>
                  <td className="p-3" style={{ color: 'var(--text-black-soft)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
