'use client';

import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import React, { useState } from 'react';
import { LogOut, User, HelpCircle, ChevronDown, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpDialog from './HelpDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const router = useRouter();

  const handleHelpClick = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin/help');
    } else {
      router.push('/supervisor/help');
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <header className="h-20 md:h-16 bg-transparent flex items-center justify-between px-4 md:px-6 z-[100] sticky top-0 font-sans gap-3 backdrop-blur-sm">
      {/* Brand / system title */}
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="w-16 h-16 md:hidden flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <p className="text-[10px] text-muted-foreground/50 hidden lg:block uppercase tracking-widest font-display font-bold">
          {today}
        </p>
      </div>

      {/* Right: user dropdown */}
      <div className="flex items-center gap-2 md:gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/60 transition-all outline-none group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30 flex-shrink-0 group-hover:scale-110 transition-transform">
              <User size={16} className="text-accent" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-none">{user?.fullName}</span>
              <span className="text-[9px] text-accent font-display uppercase tracking-wider mt-0.5">{user?.role}</span>
            </div>
            <ChevronDown size={14} className="text-muted-foreground/50 group-data-[state=open]:rotate-180 transition-transform duration-200" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[calc(100vw-32px)] sm:w-64 p-0 overflow-hidden">
            {/* Identity card */}
            <div className="px-4 py-3.5 bg-muted/30 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/25 flex-shrink-0">
                <User size={18} className="text-accent" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-display font-bold text-foreground leading-tight truncate">{user?.fullName}</p>
                <p className="text-[10px] text-accent font-display uppercase tracking-widest mt-0.5">{user?.role}</p>
              </div>
            </div>
            {/* Actions */}
            <div className="p-1.5">
              <DropdownMenuItem className="gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer" onClick={logout}>
                <LogOut size={14} />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border hidden lg:block" />

        {/* Real-time Notifications */}
        {user?.role === 'ADMIN' && (
          <DropdownMenu onOpenChange={(open) => open && markAllAsRead()}>
            <DropdownMenuTrigger
              className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all relative outline-none"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse flex items-center justify-center" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="z-[200] w-[calc(100vw-32px)] sm:w-85 p-0 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] bg-background/100"
            >
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-foreground">Operational Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[8px] px-2 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20 font-bold">{unreadCount} NEW</span>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                <div className="p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-display">No recent alerts</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <DropdownMenuItem
                        key={notif.id}
                        className="flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer hover:bg-accent/5 focus:bg-accent/5"
                        onClick={() => router.push('/admin/notifications')}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold font-display uppercase tracking-wider ${notif.unread ? 'text-accent' : 'text-foreground'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{notif.time}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {notif.description}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </div>
              <div className="p-1.5 border-t border-border bg-muted/10">
                <Button
                  variant="ghost"
                  className="w-full h-8 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent hover:text-accent hover:bg-accent/10"
                  onClick={() => router.push('/admin/notifications')}
                >
                  View All Alerts
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="ghost" size="icon"
          className="text-muted-foreground hover:text-foreground flex"
          onClick={handleHelpClick}
        >
          <HelpCircle size={18} />
        </Button>
      </div>
    </header>
  );
}
