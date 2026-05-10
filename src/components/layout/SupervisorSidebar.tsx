'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FilePlus, FileText, HardHat, HelpCircle } from 'lucide-react';

const menuGroups = [
  {
    label: "Field Operations",
    items: [
      { icon: LayoutDashboard, label: 'Field Dashboard', href: '/supervisor/dashboard' },
      { icon: FilePlus, label: 'Log Daily Report', href: '/supervisor/report/new' },
    ]
  },
  {
    label: "History",
    items: [
      { icon: FileText, label: 'My Submissions', href: '/supervisor/reports' },
    ]
  },
  {
    label: "System",
    items: [
      { icon: HelpCircle, label: 'Field Handbook', href: '/supervisor/help' },
    ]
  }
];

export default function SupervisorSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex w-60 lg:w-64 flex-col flex-shrink-0 rounded-2xl font-sans overflow-hidden"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      {/* Logo */}
      <div className="h-24 flex items-center justify-center border-b border-border">
        <div className="w-20 h-20 flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h6 className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest mb-2 px-3">
              {group.label}
            </h6>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-accent/12 text-accent'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    style={isActive ? { boxShadow: 'inset 0 0 20px rgba(212,175,55,0.06)' } : {}}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 transition-all ${
                      isActive ? 'bg-accent/20 shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-muted group-hover:bg-muted/80'
                    }`}>
                      <item.icon size={18} className={isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'} />
                    </div>
                    <span className={`text-sm font-medium leading-none ${isActive ? 'text-accent font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="px-3 py-3 rounded-xl border border-border bg-muted/40">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-display font-bold">CDSMS 1</p>
          <p className="text-[9px] text-muted-foreground/50 font-sans mt-0.5">Field Supervisor</p>
        </div>
      </div>
    </aside>
  );
}
