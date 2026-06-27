'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet as WalletIcon, History, ChevronRight, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { Profile, ProfileStats, getMyProfile, getProfileStats } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ won: 0, win_rate: 0, completed: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProfile(), getProfileStats()])
      .then(([p, s]) => { setProfile(p); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = () => {
    supabase.auth.signOut().finally(() => router.replace('/'));
  };

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <h1 className="page-title" style={{ marginBottom: 18 }}>Profile</h1>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '28px 16px' }}>
            <Skeleton w={72} h={72} r={36} />
            <Skeleton w={120} h={16} />
            <Skeleton w={80} h={12} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2, 3].map(i => <Skeleton key={i} h={60} r={12} />)}
          </div>
          <Skeleton h={96} r={18} />
        </div>
      ) : (
        <>
          <div className="card" style={{ textAlign: 'center', padding: '28px 16px', marginBottom: 14 }}>
            <div className="avatar avatar-accent" style={{ width: 72, height: 72, fontSize: 24, margin: '0 auto 14px' }}>{profile?.initials ?? '??'}</div>
            <p style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{profile?.name ?? '—'}</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{profile?.username ?? ''}</p>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {[
              ['$' + stats.won.toFixed(0), 'Total won'],
              [stats.win_rate + '%', 'Win rate'],
              [String(stats.streak), 'Streak'],
              [String(stats.completed), 'Completed'],
            ].map(([v, l]) => (
              <div key={l} className="stat-box" style={{ padding: '14px 4px' }}>
                <span className="stat-val" style={{ fontSize: 17 }}>{v}</span>
                <span className="stat-lbl">{l}</span>
              </div>
            ))}
          </div>

          <span className="section-tag">Account</span>
          <div className="card" style={{ padding: '4px 16px', marginBottom: 16 }}>
            <Link href="/home/wallet" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: 10 }}><WalletIcon size={17} color="var(--text-3)" /> Wallet</span>
              <ChevronRight size={17} color="var(--text-3)" />
            </Link>
            <Link href="/home/profile/history" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: 10 }}><History size={17} color="var(--text-3)" /> Challenge history</span>
              <ChevronRight size={17} color="var(--text-3)" />
            </Link>
          </div>

          <button
            onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px', borderRadius: 14, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', color: 'var(--danger)', fontSize: 14, fontWeight: 700 }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </>
      )}
    </div>
  );
}
