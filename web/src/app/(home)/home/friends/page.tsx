'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRight } from 'lucide-react';
import { Stagger, Item } from '@/components/ui';
import { Profile, getMyFriends, getPendingRequests, respondToFriendRequest } from '@/lib/api';

type PendingRow = { id: string; profiles: Profile };

export default function FriendsPage() {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    Promise.all([getMyFriends(), getPendingRequests()])
      .then(([f, p]) => { setFriends(f); setPending(p); })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const respond = async (id: string, accept: boolean) => {
    try { await respondToFriendRequest(id, accept); } catch { /* reload reflects state */ }
    load();
  };

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="page-title">Friends</h1>
        <Link href="/home/friends/add" className="chip chip-active" style={{ gap: 5, fontWeight: 700 }}>
          <UserPlus size={14} /> Add
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <span style={{ display: 'inline-block', width: 22, height: 22, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <span className="section-tag">Pending requests</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {pending.map(req => (
                  <div key={req.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 11 }}>{req.profiles.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{req.profiles.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{req.profiles.username}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => respond(req.id, true)} style={{ padding: '7px 12px', borderRadius: 10, background: 'var(--accent-soft)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>Accept</button>
                      <button onClick={() => respond(req.id, false)} style={{ padding: '7px 12px', borderRadius: 10, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.4)', color: 'var(--danger)', fontSize: 12, fontWeight: 700 }}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <span className="section-tag">All friends ({friends.length})</span>

          {friends.length === 0 ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 28 }}>
              <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No friends yet.</p>
              <Link href="/home/friends/add" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Find people <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <Stagger style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {friends.map((f, i) => (
                <Item key={f.id}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', width: 18 }}>#{i + 1}</span>
                    <div className="avatar avatar-accent" style={{ width: 36, height: 36, fontSize: 11 }}>{f.initials}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{f.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{f.username}</p>
                    </div>
                  </div>
                </Item>
              ))}
            </Stagger>
          )}
        </>
      )}
    </div>
  );
}
