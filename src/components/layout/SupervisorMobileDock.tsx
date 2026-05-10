'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FilePlus, FileText, HelpCircle } from 'lucide-react';

const dockItems = [
  { icon: Home, label: 'Home', href: '/supervisor/dashboard' },
  { icon: FilePlus, label: 'Log', href: '/supervisor/report/new' },
  { icon: FileText, label: 'Submissions', href: '/supervisor/reports' },
  { icon: HelpCircle, label: 'Handbook', href: '/supervisor/help' },
];

export default function SupervisorMobileDock() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl"
        style={{
          background: 'var(--dock-bg)',
          border: '1px solid var(--dock-border)',
          boxShadow: 'var(--dock-shadow)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}>
        {dockItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 min-w-[54px] ${
                isActive ? 'bg-accent/10' : ''
              }`}
              style={{ color: isActive ? 'var(--accent)' : 'var(--dock-inactive-color)' }}
            >
              <item.icon
                size={18}
                className="transition-all duration-200"
                style={{ filter: isActive ? 'drop-shadow(0 0 6px rgba(212,175,55,0.4))' : 'none' }}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span className={`text-[8px] font-display uppercase tracking-wider leading-none transition-all text-center w-full ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>

            </Link>
          );
        })}
      </div>
    </nav>
  );
}
