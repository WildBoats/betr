'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Trophy, Undo2, Target } from 'lucide-react';
import { Transaction, getMyTransactions } from '@/lib/api';

const TYPE_LABEL: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  challenge_join: 'Challenge Entry',
  win: 'Winnings',
  refund: 'Refund',
};

function TxIcon({ type }: { type: string }) {
  const size = 16;
  if (type === 'deposit') return <ArrowDownLeft size={size} color="var(--accent)" />;
  if (type === 'withdrawal') return <ArrowUpRight size={size} color="var(--text-2)" />;
  if (type === 'win') return <Trophy size={size} color="var(--accent)" />;
  if (type === 'refund') return <Undo2 size={size} color="var(--text-2)" />;
  return <Target size={size} color="var(--text-2)" />;
}

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTransactions().then(t => setTransactions(t)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const won = transactions.filter(t => t.type === 'win').length;
  const entered = transactions.filter(t => t.type === 'challenge_join').length;

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div className="page-head">
        <button onClick={() => router.back()} className="icon-btn"><ArrowLeft size={18} /></button>
        <h1 className="page-title">History</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <span style={{ display: 'inline-block', width: 22, height: 22, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {[[String(won), 'Won'], [String(entered), 'Entered'], [String(transactions.length), 'All Tx']].map(([v, l]) => (
              <div key={l} className="stat-box" style={{ padding: '14px 4px' }}>
                <span className="stat-val" style={{ fontSize: 20 }}>{v}</span>
                <span className="stat-lbl">{l}</span>
              </div>
            ))}
          </div>

          <span className="section-tag">Transactions</span>

          {transactions.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: '28px 0' }}>No transactions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transactions.map(t => {
                const isPositive = t.amount > 0;
                return (
                  <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elev)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <TxIcon type={t.type} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{t.description || TYPE_LABEL[t.type]}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: isPositive ? 'var(--accent)' : 'var(--danger)' }}>
                      {isPositive ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
