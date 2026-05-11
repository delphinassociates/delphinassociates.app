'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';

export type NotificationType = 'alert' | 'success' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  site?: string;
  createdAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const lastIdRef = useRef<string | null>(null);
  const previousCountRef = useRef<number>(0);
  // Single Supabase client instance for the lifetime of this context
  const supabase = useMemo(() => createClient(), []);

  const fetchNotifications = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return;

    try {
      const { data: responseData, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const mappedData = responseData.map((n: any) => ({
        id: n.id.toString(),
        type: n.type,
        title: n.title,
        description: n.description,
        site: n.site,
        unread: n.unread,
        time: formatTime(n.created_at),
        createdAt: n.created_at
      }));

      // Check for new unread notifications to show toast
      const newestUnread = mappedData.find((n: any) => n.unread);
      if (newestUnread && newestUnread.id !== lastIdRef.current) {
        toast(newestUnread.title, {
          description: newestUnread.description,
          action: {
            label: 'View',
            onClick: () => window.location.href = '/admin/notifications'
          }
        });
        lastIdRef.current = newestUnread.id;
      }

      setNotifications(mappedData);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ unread: false }).eq('id', parseInt(id));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      previousCountRef.current = Math.max(0, previousCountRef.current - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase.from('notifications').update({ unread: false }).eq('unread', true);
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      previousCountRef.current = 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', parseInt(id));
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Supabase Realtime Listener
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    fetchNotifications();

    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new as any;
          const mapped: Notification = {
            id: n.id.toString(),
            type: n.type,
            title: n.title,
            description: n.description,
            site: n.site,
            unread: n.unread,
            time: 'Just now',
            createdAt: n.created_at
          };
          
          setNotifications(prev => [mapped, ...prev]);
          
          if (mapped.unread) {
            toast(mapped.title, {
              description: mapped.description,
              action: {
                label: 'View',
                onClick: () => window.location.href = '/admin/notifications'
              }
            });
            lastIdRef.current = mapped.id;
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new as any;
          setNotifications(prev => prev.map(old => old.id === n.id.toString() ? { ...old, unread: n.unread } : old));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => prev.filter(old => old.id !== (payload.old as any).id.toString()));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, supabase]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      refreshNotifications: fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
