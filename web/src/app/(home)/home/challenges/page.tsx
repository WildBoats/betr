'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Lock, Globe, ArrowRight, Compass, SearchX } from 'lucide-react';
import { Stagger, Item, SkeletonList, EmptyState } from '@/components/ui';
import { Challenge, daysLeft, effectiveStatus, getMyActiveChallenges, getPublicFeed, startsIn } from '@/lib/api';

function StatusPill({ status }: { status: string }) {
  const cls = status === 'voting' ? 'status-voting' : status === 'pending' ? 'status-soon' : 'status-live';
  const label = status === 'voting' ? 'Voting' : status === 'pending' ? 'Soon' : 'Live';
  return <span className={`status-pill ${cls}`}><span className="dot" />{label}</span>;
}

export default function ChallengesPage() {
  const [mine, setMine] = useState<Challenge[]>([]);
  const [feed, setFeed] = useState<Challenge[]>([]);  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyActiveChallenges(), getPublicFeed()])
      .then(([m, f]) => { setMine(m); setFeed(f); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = feed.filter(c => c.goal.toLowerCase().includes(q));

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="page-title">Challenges</h1>
        <Link href="/home/challenges/create" className="chip chip-active" style={{ gap: 5, fontWeight: 700 }}>
          <Plus size={14} /> Create
        </Link>
      </div>

      <div className="field" style={{ marginBottom: 18, paddingLeft: 14 }}>
        <Search size={16} color="var(--text-3)" />
        <input
          style={{ flex: 1, background: 'transparent', padding: '14px 12px', fontSize: 15, color: 'var(--text)', width: '100%' }}
          placeholder="Search challenges..."
          value={search}
          onChange={e => setSearch(e.target.value)}        />
     </div>

      {loading ? (
        <SkeletonList count={3} />
      ) : (
        <>
          {mine.length > 0 && (
            <>
              <span className="section-tag">Your active</span>
              <Stagger style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {mine.map(c => {
                  const status = effectiveStatus(c);
                  return (
                    <Item key={c.id}>
                      <Link href={`/home/challenges/${c.id}`} className="card" style={{ display: 'block' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <StatusPill status={status} />
                          <span className="meta-chip">{c.type === 'private' ? <Lock size={11} /> : <Globe size={11} />}</span>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14, lineHeight: 1.4 }}>{c.goal}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[['$' + c.pot.toFixed(0), 'Pot'], ['$' + c.bet_amount.toFixed(0), 'Bet'], [daysLeft(c.ends_at) + 'd', 'Left'], [String(c.participant_count), 'Players']].map(([v, l]) => (
                            <div key={l} className="stat-box"><span className="stat-val">{v}</span><span className="stat-lbl">{l}</span></div>
                          ))}
                        </div>
                      </Link>
                    </Item>
                  );
                })}
              </Stagger>
            </>
          )}

          <span className="section-tag">Public feed</span>

          {filtered.length === 0 ? (
            search ? (
              <EmptyState
                icon={<SearchX size={24} />}
                title="No matches"
                subtitle={`Nothing matches "${search}". Try a different search.`}
              />
            ) : (
              <EmptyState
                icon={<Compass size={24} />}
                title="No public challenges yet"
                subtitle="Be the first to start one — create a public challenge and others can join the pot."
                action={
                  <Link href="/home/challenges/create" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Create a challenge <ArrowRight size={15} />
                  </Link>
                }
              />
            )
          ) : (
            <Stagger style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(c => {
                const timeLabel = effectiveStatus(c) === 'live' ? 'Status' : 'Starts';
                return (
                  <Item key={c.id}>
                    <div className="card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 10 }}>{c.profiles?.initials ?? '?'}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{c.profiles?.name ?? 'Unknown'}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-3)' }}>creator</p>
                        </div>
                        <span className="meta-chip"><Globe size={11} /> Public</span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.4 }}>{c.goal}</p>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        {[['$' + c.bet_amount.toFixed(0), 'Bet'], [String(c.participant_count), 'Joined'], [startsIn(c.starts_at), timeLabel]].map(([v, l]) => (
                          <div key={l} className="stat-box"><span className="stat-val">{v}</span><span className="stat-lbl">{l}</span></div>
                        ))}
                        {c.creator_fee_percent > 0 && (
                          <div className="stat-box"><span className="stat-val" style={{ color: 'var(--text-2)' }}>{c.creator_fee_percent}%</span><span className="stat-lbl">Fee</span></div>
                        )}
                      </div>
                      <Link href={`/home/challenges/${c.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', fontSize: 13, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 12 }}>
                        Join for ${c.bet_amount.toFixed(0)} <ArrowRight size={15} />
                      </Link>
                    </div>
                  </Item>
                );
              })}
            </Stagger>
          )}
        </>
      )}
    </div>
  );
}
