'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="Go back"
      style={{
        width: 42,
        height: 42,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        color: 'var(--text-2)',
      }}
    >
      <ChevronLeft size={22} />
    </button>
  );
}