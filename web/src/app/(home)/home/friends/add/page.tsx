'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { Profile, searchUsers, sendFriendRequest } from '@/lib/api';

export default function AddFriendsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchUsers(query)); } catch { setResults([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleAdd = async (id: string) => {
    try { await sendFriendRequest(id); } catch { /* already sent */ }
    setSent(s => new Set([...s, id]));
  };

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div className="page-head">
        <button onClick={() => router.back()} className="icon-btn"><ArrowLeft size={18} /></button>
        <h1 className="page-title">Add friends</h1>
      </div>

      <div className="field" style={{ marginBottom: 18, paddingLeft: 14 }}>
        <Search size={16} color="var(--text-3)" />
        <input
          style={{ flex: 1, background: 'transparent', padding: '14px 12px', fontSize: 15, color: 'var(--text)', width: '100%' }}
          placeholder="Search by name or @username..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {searching && <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Searching...</p>}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map(u => {
            const isSent = sent.has(u.id);
            return (
              <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 11 }}>{u.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.username}</p>
                </div>
                <button
                  onClick={() => handleAdd(u.id)}
                  disabled={isSent}
                  style={{
                    padding: '7px 14px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: isSent ? 'var(--surface-2)' : 'var(--accent-soft)',
                    border: `1px solid ${isSent ? 'var(--hairline)' : 'var(--accent)'}`,
                    color: isSent ? 'var(--text-3)' : 'var(--accent)',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  {isSent ? <><Check size={13} /> Sent</> : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {query.length >= 2 && !searching && results.length === 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '28px 0' }}>No users found.</p>
      )}

      {query.length < 2 && (
        <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '28px 0' }}>Type at least 2 characters to search.</p>
      )}
    </div>
  );
}
