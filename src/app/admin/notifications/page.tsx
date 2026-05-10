'use client';

import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2, Filter } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAllAsRead, deleteNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="text-amber-400" size={18} />;
      case 'success': return <CheckCircle className="text-emerald-400" size={18} />;
      default: return <Info className="text-blue-400" size={18} />;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="md:px-10">
        <PageHeader 
          title="Operational Alerts" 
          description="Stay informed about site activities and system events."
          breadcrumbs={['Intelligence', 'Notifications']}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:mb-8 mb-6">
          <SectionHeading title="Recent Activities" />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="flex-1 sm:flex-initial text-[10px] sm:text-xs font-display uppercase tracking-widest text-muted-foreground hover:text-accent border border-border/40 sm:border-transparent">
              Mark all as read
            </Button>
            <Button variant="outline" size="sm" className="h-9 border-border bg-background/50 text-[10px] sm:text-xs font-display uppercase tracking-widest px-4">
              <Filter size={14} className="mr-2" /> Filter
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="glass-panel rounded-2xl sm:p-16 p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-border">
                <Bell className="text-muted-foreground/30" size={24} />
              </div>
              <p className="text-muted-foreground font-display uppercase tracking-widest text-[11px] sm:text-sm leading-relaxed max-w-[240px] sm:max-w-none">
                All clear. No notifications at the moment.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`glass-panel sm:p-5 p-4 rounded-2xl border transition-all duration-300 flex items-start sm:gap-5 gap-3.5 group relative overflow-hidden ${
                  notif.unread ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-accent/20'
                }`}
              >
                {notif.unread && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                )}
                
                <div className={`sm:w-12 sm:h-12 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  notif.type === 'alert' ? 'bg-amber-500/10 border-amber-500/20' :
                  notif.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}>
                  {React.cloneElement(getIcon(notif.type) as React.ReactElement<any>, { 
                    size: typeof window !== 'undefined' && window.innerWidth < 640 ? 16 : 18 
                  })}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-display font-bold uppercase tracking-wider ${notif.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                      <Clock size={10} />
                      <span>{notif.time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.description}
                  </p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteNotification(notif.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
