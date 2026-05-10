'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, MapPin, FileText, Building2, CalendarDays, HelpCircle, Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

const menuGroups = [
  {
    label: "Intelligence",
    items: [
      { icon: LayoutDashboard, label: 'Command Center', href: '/admin/dashboard' },
      { icon: FileText, label: 'Daily Reports', href: '/admin/reports' },
      { icon: Bell, label: 'Notifications', href: '/admin/notifications', badge: true },
    ]
  },
  {
    label: "Management",
    items: [
      { icon: MapPin,        label: 'Sites',       href: '/admin/sites'        },
      { icon: Users,         label: 'Supervisors', href: '/admin/supervisors'  },
      { icon: CalendarDays,  label: 'Holidays',    href: '/admin/holidays'     },
      { icon: HelpCircle,    label: 'Help Center', href: '/admin/help'         },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

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
                    {(item as any).badge && unreadCount > 0 && (
                      <span className="ml-auto bg-accent text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                        {unreadCount}
                      </span>
                    )}
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
          <p className="text-[9px] text-muted-foreground/50 font-sans mt-0.5">Enterprise Build</p>
        </div>
      </div>
    </aside>
  );
}
