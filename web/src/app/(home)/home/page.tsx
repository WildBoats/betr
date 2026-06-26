'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Globe, Plus, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { Stagger, Item } from '@/components/ui';
import { Challenge, Profile, daysLeft, effectiveStatus, getMyActiveChallenges, getMyProfile } from '@/lib/api';

function StatusPill({ status }: { status: string }) {
  const cls = status === 'voting' ? 'status-voting' : status === 'pending' ? 'status-soon' : 'status-live';
  const label = status === 'voting' ? 'Voting' : status === 'pending' ? 'Soon' : 'Live';
  return (
    <span className={`status-pill ${cls}`}>
      <span className="dot" />
      {label}
    </span>
  );
}

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProfile(), getMyActiveChallenges()])
      .then(([p, c]) => { setProfile(p); setChallenges(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = profile?.name?.split(' ')[0] ?? '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 4 }}>{firstName ? `${greeting}, ${firstName}` : greeting}</p>
          <Logo size="md" />
        </div>
        <Link href="/home/profile" className="avatar avatar-accent" style={{ width: 40, height: 40, fontSize: 12 }}>
          {profile?.initials ?? '??'}
        </Link>
      </div>

      <span className="section-tag">Your active challenges</span>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <span style={{ display: 'inline-block', width: 22, height: 22, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : challenges.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 28, marginBottom: 14 }}>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No active challenges yet.</p>
          <Link href="/home/challenges" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Browse challenges <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <Stagger style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {challenges.map(c => {
            const status = effectiveStatus(c);
            const left = daysLeft(c.ends_at);
            return (
              <Item key={c.id}>
                <Link href={`/home/challenges/${c.id}`} className="card" style={{ display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <StatusPill status={status} />
                    <span className="meta-chip">
                      {c.type === 'private' ? <Lock size={11} /> : <Globe size={11} />}
                      {c.type === 'private' ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14, lineHeight: 1.4 }}>{c.goal}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[['$' + c.pot.toFixed(0), 'Pot'], ['$' + c.bet_amount.toFixed(0), 'Your bet'], [left + 'd', 'Left'], [String(c.participant_count), 'Players']].map(([val, lbl]) => (
                      <div key={lbl} className="stat-box">
                        <span className="stat-val">{val}</span>
                        <span className="stat-lbl">{lbl}</span>
                      </div>
                    ))}
                  </div>
                </Link>
              </Item>
            );
          })}
        </Stagger>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
        <Link href="/home/challenges" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, fontSize: 13, color: 'var(--text)', fontWeight: 700 }}>
          Browse feed
        </Link>
        <Link href="/home/challenges/create" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
          <Plus size={16} /> Create
        </Link>
      </div>
    </div>
  );
}
