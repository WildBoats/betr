'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Btn, Banner } from '@/components/ui';
import { Wallet, Transaction, getMyWallet, getMyTransactions, depositFunds, requestWithdrawal } from '@/lib/api';

const CHIPS = [25, 50, 100, 250];

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, locked_balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [depositAmount, setDepositAmount] = useState(50);
  const [customDeposit, setCustomDeposit] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(false);

  useEffect(() => {
    Promise.all([getMyWallet(), getMyTransactions()])
      .then(([w, t]) => { setWallet(w); setTransactions(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const customNum = Number(customDeposit);
  const effectiveAmount = customDeposit && isFinite(customNum) ? customNum : depositAmount;

  const handleDeposit = async () => {
    if (!(effectiveAmount >= 5)) { setMsg('Minimum deposit is $5'); setMsgOk(false); return; }
    setDepositing(true);
    setMsg('');
    try {
      await depositFunds(effectiveAmount);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Deposit failed');
      setMsgOk(false);
      setDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setMsg('');
    try {
      await requestWithdrawal(wallet.balance);
      setMsg('Withdrawal request submitted.');
      setMsgOk(true);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Withdrawal failed');
      setMsgOk(false);
    }
    setWithdrawing(false);
  };

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div className="page-head">
        <button onClick={() => router.back()} className="icon-btn"><ArrowLeft size={18} /></button>
        <h1 className="page-title">Wallet</h1>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '26px 16px', marginBottom: 18 }}>
        <p className="section-tag" style={{ marginBottom: 8 }}>Available balance</p>
        <p style={{ fontSize: 40, fontWeight: 800, color: 'var(--accent)', marginBottom: 4, letterSpacing: -1 }} className="glow-text">
          ${wallet.balance.toFixed(2)}
        </p>
        {wallet.locked_balance > 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>${wallet.locked_balance.toFixed(2)} locked in challenges</p>
        )}
      </div>

      <span className="section-tag">Deposit</span>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {CHIPS.map(c => (
            <button key={c} onClick={() => { setDepositAmount(c); setCustomDeposit(''); }} className={depositAmount === c && !customDeposit ? 'chip chip-active' : 'chip'} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>${c}</button>
          ))}
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <span style={{ paddingLeft: 16, fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>$</span>
          <input
            style={{ flex: 1, background: 'transparent', padding: '12px 8px', fontSize: 22, fontWeight: 800, color: 'var(--accent)', width: '100%' }}
            placeholder="0.00"
            value={customDeposit}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9.]/g, '');
              const d = v.indexOf('.');
              setCustomDeposit(d === -1 ? v : v.slice(0, d + 1) + v.slice(d + 1).replace(/\./g, ''));
            }}
            inputMode="decimal"
            type="text"
          />
        </div>

        <Btn onClick={handleDeposit} disabled={!(effectiveAmount >= 5)} loading={depositing}>
          Deposit ${effectiveAmount.toFixed(2)} <ArrowRight size={18} />
        </Btn>
      </div>

      {wallet.balance >= 10 && (
        <>
          <span className="section-tag">Withdraw</span>
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>Withdraw your available balance to your bank account.</p>
            <Btn variant="surface" onClick={handleWithdraw} loading={withdrawing}>
              Withdraw ${wallet.balance.toFixed(2)} <ArrowRight size={18} />
            </Btn>
          </div>
        </>
      )}

      <div style={{ marginBottom: 8 }}><Banner msg={msg} ok={msgOk} /></div>

      {!loading && transactions.length > 0 && (
        <>
          <span className="section-tag">History</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transactions.map(t => {
              const isPositive = t.amount > 0;
              return (
                <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '12px 14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{t.description}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: isPositive ? 'var(--accent)' : 'var(--danger)' }}>
                    {isPositive ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
