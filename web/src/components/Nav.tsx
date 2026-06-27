'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, Trophy, Users, Wallet, UserCircle } from 'lucide-react';

const tabs = [
  { href: '/home', label: 'Home', Icon: LayoutGrid },
  { href: '/home/challenges', label: 'Challenges', Icon: Trophy },
  { href: '/home/friends', label: 'Friends', Icon: Users },
  { href: '/home/wallet', label: 'Wallet', Icon: Wallet },
  { href: '/home/profile', label: 'Profile', Icon: UserCircle },
];

// Tab bar only shows on the five top-level tab roots — pushed
// sub-pages (create, detail, invite, add-friend, history, payout)
// have their own back button, so the tab bar is hidden to avoid
// double navigation.
const ROOTS = tabs.map(t => t.href);

export default function Nav() {
  const pathname = usePathname();
  if (!ROOTS.includes(pathname)) return null;
  return (
    <nav className="nav-bar">
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== '/home' && pathname.startsWith(href));
        return (
          <Link key={href} href={href} className={`nav-item ${active ? 'nav-item-active' : ''}`}>
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            <span className="nav-lbl">{label}</span>
            {active && (
              <motion.div
                layoutId="nav-dot"
                style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', position: 'absolute', bottom: 2 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
