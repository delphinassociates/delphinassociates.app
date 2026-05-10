'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyReports } from '@/app/actions/supervisor';
import { toast } from 'sonner';
import { FileText, MapPin, Users, AlignLeft, Lock, Package, IndianRupee, Timer } from 'lucide-react';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';

function CountdownTimer({ freezeAt, reportId, initialFrozen }: { freezeAt: Date, reportId: string, initialFrozen: boolean }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isFrozen, setIsFrozen] = useState(initialFrozen);

  useEffect(() => {
    if (initialFrozen) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = freezeAt.getTime() - now;

      if (difference <= 0) {
        setIsFrozen(true);
        return false;
      }
      
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      return true;
    };

    if (!calculateTime()) return;

    const interval = setInterval(() => {
      if (!calculateTime()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [freezeAt, initialFrozen]);

  if (isFrozen) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
        <Lock size={13} />
        Frozen
      </div>
    );
  }

  return (
    <Link 
      href={`/supervisor/report/edit/${reportId}`}
      className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
    >
      <Timer size={13} className="animate-pulse" />
      Edit Log ({timeLeft})
    </Link>
  );
}

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const data = await getMyReports();
      setReports(data as any);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 animate-in fade-in duration-500">
      <PageHeader
        title="My Log History"
        description="Historical view of your field submissions."
        breadcrumbs={['Field Operations', 'My Submissions']}
      />
      <SectionHeading title="Recent Submissions" />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel rounded-xl border border-border p-5 h-36 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel rounded-xl border border-border p-16 text-center">
          <FileText size={40} className="text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-display uppercase tracking-widest text-sm">No reports recorded in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report: any) => {
            const totalLabour = (report.labourEntries || []).reduce((sum: number, e: any) => sum + (e.count || 0), 0);
            const materialCount = (report.materialInwards || []).length;
            const totalOutlay = (report.labourAdvances || []).reduce((sum: number, la: any) => sum + (la.amount || 0), 0) +
                               (report.materialExpenses || []).reduce((sum: number, me: any) => sum + (me.amount || 0), 0);
            const reportDateStr = report.reportDate; // e.g. "2024-05-02"
            const updatedTime = new Date(report.updatedAt || report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const createdDate = new Date(report.createdAt);
            const now = new Date();
            
            // Convert reportDate string to Date object (start of that day)
            const reportDate = new Date(reportDateStr + 'T00:00:00');
            const createdDateOnly = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
            
            let isFrozen = false;
            let freezeAt: Date;
            if (createdDateOnly.getTime() === reportDate.getTime()) {
              // Case 1: On-time -> Freeze if today is AFTER reportDate
              freezeAt = new Date(createdDateOnly.getTime() + 24 * 60 * 60 * 1000);
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              isFrozen = today.getTime() > reportDate.getTime();
            } else {
              // Case 2: Delayed -> Freeze after 4 hours
              freezeAt = new Date(createdDate.getTime() + 4 * 60 * 60 * 1000);
              isFrozen = now.getTime() > freezeAt.getTime();
            }
            
            return (
              <div key={report.reportId} className="glass-panel rounded-xl border border-border flex flex-col hover:border-accent/30 transition-all duration-200 group">
                <Link href={`/supervisor/reports/${report.reportId}`} className="p-5 flex flex-col gap-4 flex-1">
                  {/* Date + Site */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border flex items-center gap-1.5">
                      {report.reportDate}
                      <span className="opacity-30">|</span>
                      <span className="text-accent/70">{updatedTime}</span>
                    </span>
                    <span className="text-[10px] font-display uppercase tracking-widest px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20 truncate max-w-[55%] text-right group-hover:bg-accent/20 transition-colors">
                      {report.site?.siteName}
                    </span>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Workforce */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/50">
                      <Users size={14} className="text-muted-foreground/60 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider opacity-60">Labour</span>
                        <span className="font-mono font-bold text-accent">{totalLabour} Pax</span>
                      </div>
                    </div>
                    {/* Materials */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/50">
                      <Package size={14} className="text-muted-foreground/60 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider opacity-60">Logistics</span>
                        <span className="font-mono font-bold text-foreground">{materialCount} Items</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  {totalOutlay > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 p-2 rounded-lg border border-accent/10">
                      <IndianRupee size={14} className="text-accent/60 flex-shrink-0" />
                      <div className="flex justify-between w-full items-center">
                        <span className="text-[9px] uppercase tracking-wider text-accent/60 font-bold">Total Field Outlay</span>
                        <span className="font-mono font-bold text-accent">₹{totalOutlay.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  {report.workProgress && (
                    <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                      <AlignLeft size={13} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{report.workProgress}</p>
                    </div>
                  )}
                </Link>

                {/* Footer Actions */}
                <div className="px-5 pb-5 pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/50">
                    <FileText size={12} />
                    <span>#{report.reportId}</span>
                  </div>
                  <CountdownTimer freezeAt={freezeAt} reportId={report.reportId.toString()} initialFrozen={isFrozen} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
