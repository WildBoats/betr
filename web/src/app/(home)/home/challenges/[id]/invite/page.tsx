'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Copy, Check, Share2 } from 'lucide-react';
import { Btn } from '@/components/ui';

export default function InvitePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/home/challenges/${id}`
    : `/home/challenges/${id}`;

  const copyLink = async () => {
    try {
            await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const code = id.slice(0, 6).toUpperCase();

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div className="page-head">
        <button onClick={() => router.back()} className="icon-btn"><ArrowLeft size={18} /></button>
        <h1 className="page-title">Invite friends</h1>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '28px 16px', marginBottom: 16 }}>
        <p className="section-tag" style={{ marginBottom: 16 }}>Challenge code</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          {code.split('').map((ch, i) => (
            <div key={i} style={{ width: 40, height: 50, borderRadius: 12, background: 'var(--bg-elev)', border: '1.5px solid var(--hairline-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{ch}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 14 }}>Share this code or link with friends</p>
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <input
          readOnly
          value={inviteLink}
          style={{ flex: 1, background: 'transparent', padding: '14px 16px', fontSize: 12, color: 'var(--text-3)', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <Btn onClick={copyLink} variant={copied ? 'surface' : 'accent'}>
          {copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy link</>}
        </Btn>
      </div>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Btn variant="surface" onClick={() => navigator.share({ title: 'Join my challenge', url: inviteLink }).catch(() => {})}>
          <Share2 size={18} /> Share
        </Btn>
      )}
    </div>
  );
}
