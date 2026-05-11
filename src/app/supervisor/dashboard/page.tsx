'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FilePlus, FileText, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { getProfile } from '@/app/actions/auth';
import { getSupervisorReportCount } from '@/app/actions/supervisor';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [reportCount, setReportCount] = useState(0);
  const [holiday, setHoliday] = useState<{ isHoliday: boolean; name?: string; description?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await getProfile();
      }
      
      if (!activeUser) return;

      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch holiday via client (Public read is fine)
        const { data: holData } = await supabase
          .from('holidays')
          .select('name, description')
          .eq('date', today)
          .maybeSingle();

        if (holData) {
          setHoliday({ isHoliday: true, ...holData });
        }

        // Fetch count via server action to bypass RLS issues
        const count = await getSupervisorReportCount(activeUser.id);
        setReportCount(count);
        
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Enable real-time updates for report count
    if (user?.id) {
      const channel = supabase
        .channel('supervisor_dashboard_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'daily_reports', filter: `supervisor_id=eq.${user.id}` },
          () => {
            fetchData();
          }
        )
        .subscribe(() => {
          // Channel active
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, supabase]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 animate-in fade-in duration-500">
      <div className="mb-8">
        <PageHeader
          title={`Welcome back, ${user?.fullName || 'Supervisor'}`}
          description="Log today's operations or review your historical submissions."
          breadcrumbs={['Field Operations', 'Dashboard']}
        />
      </div>

      {/* ── Holiday banner ── */}
      {holiday?.isHoliday && (
        <div className="flex items-center gap-4 glass-panel rounded-xl border border-accent/40 bg-accent/5 px-6 py-5 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
            <PartyPopper size={22} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-display font-bold text-accent uppercase tracking-widest">
              Today is a Holiday — {holiday.name}
            </p>
            {holiday.description && (
              <p className="text-xs text-muted-foreground mt-1 font-sans">{holiday.description}</p>
            )}
            <p className="text-xs text-muted-foreground/70 mt-1 font-sans">
              No report submission is required today. Enjoy your day off!
            </p>
          </div>
          <span className="hidden sm:flex text-[10px] font-display uppercase tracking-widest px-3 py-1.5 rounded-full bg-accent/15 text-accent border border-accent/25 flex-shrink-0">
            Day Off
          </span>
        </div>
      )}

      {/* ── Action Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Log Report */}
        <Link href="/supervisor/report/new" className="block">
          <div className="glass-panel p-5 md:p-8 rounded-2xl border border-accent/20 cursor-pointer group hover:border-accent transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 text-accent">
              <FilePlus size={80} className="md:hidden" />
              <FilePlus size={120} className="hidden md:block" />
            </div>
            <div className="bg-accent/10 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center border border-accent/20 mb-4 md:mb-6 group-hover:scale-105 transition-transform">
              <FilePlus size={24} className="md:hidden text-accent" />
              <FilePlus size={32} className="hidden md:block text-accent" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">Log Daily Report</h3>
            <p className="text-sm md:text-base text-muted-foreground font-sans">
              Submit today's labour counts, material inward, financial outlays, and field progress notes.
              {holiday?.isHoliday && (
                <span className="block mt-2 text-amber-400 text-xs font-display font-bold uppercase tracking-wide">
                  ⚠ Today is a holiday — submission is optional
                </span>
              )}
            </p>
            <div className="mt-5 md:mt-8 flex items-center text-sm font-display font-bold uppercase tracking-widest text-accent group-hover:translate-x-2 transition-transform">
              Initialize Form &rarr;
            </div>
          </div>
        </Link>

        {/* My Submissions */}
        <Link href="/supervisor/reports" className="block">
          <div className="glass-panel p-5 md:p-8 rounded-2xl border border-border cursor-pointer group hover:border-accent/30 transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 text-foreground">
              <FileText size={80} className="md:hidden" />
              <FileText size={120} className="hidden md:block" />
            </div>
            <div className="bg-muted w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center border border-border mb-4 md:mb-6 group-hover:scale-105 transition-transform">
              <FileText size={24} className="md:hidden text-muted-foreground group-hover:text-foreground transition-colors" />
              <FileText size={32} className="hidden md:block text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">My Submissions</h3>
            <p className="text-sm md:text-base text-muted-foreground font-sans">
              Review your historical operational logs. You have submitted{' '}
              <span className="text-accent font-bold">{loading ? '...' : reportCount}</span> reports so far.
            </p>
            <div className="mt-5 md:mt-8 flex items-center text-sm font-display font-bold uppercase tracking-widest text-muted-foreground group-hover:text-accent group-hover:translate-x-2 transition-all">
              Access Logs &rarr;
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
