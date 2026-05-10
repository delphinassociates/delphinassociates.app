'use client';

import { useEffect, useState } from 'react';
import { getAdminReports, deleteReport, restoreReport } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronRight, FileText, MapPin, User, Users, Trash2, Wallet, Hammer, Clock, TrendingUp, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';
import { ConfirmationDialog } from '@/components/ui/custom/ConfirmationDialog';
import { createClient } from '@/lib/supabase/client';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => { 
    fetchReports(); 
    
    const supabase = createClient();
    const channel = supabase
      .channel('reports_list_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_reports' },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getAdminReports();
      setReports(data as any);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setReportToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      const id = reportToDelete;
      await deleteReport(id);
      
      const deletedReport = reports.find((r: any) => r.reportId === id);
      setReports(reports.filter((r: any) => r.reportId !== id));

      toast.success('Report deleted', {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await restoreReport(id);
              toast.success('Report restored');
              if (deletedReport) {
                setReports(prev => [deletedReport, ...prev].sort((a, b) => b.reportId - a.reportId));
              } else {
                fetchReports();
              }
            } catch {
              toast.error('Failed to restore report');
            }
          }
        }
      });
    } catch {
      toast.error('Failed to delete report');
    } finally {
      setReportToDelete(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="md:px-10">
        <PageHeader
          title="Intelligence Log"
          description="Historical log of all daily site submissions."
          breadcrumbs={['Intelligence', 'Daily Reports']}
        />
        <SectionHeading title="Recent Submissions" />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-panel rounded-xl border border-border p-4 md:p-5 h-32 md:h-36 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-panel rounded-xl border border-border p-16 text-center">
            <FileText size={40} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-display uppercase tracking-widest text-sm">No reports recorded in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {reports.map((report: any) => {
              const totalLabour = (report.labourEntries || []).reduce((sum: number, e: any) => sum + (e.count || 0), 0);
              const materialExpense = (report.materialExpenses || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
              const labourAdvance = (report.labourAdvances || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
              const timestamp = report.updatedAt || report.updated_at || report.createdAt;
              const lastModified = timestamp 
                ? new Date(timestamp).toLocaleString([], { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  })
                : '';

              const remainingStockCount = (report.remainingStocks || []).length;

              return (
                <div
                  key={report.reportId}
                  onClick={() => router.push(`/admin/reports/${report.reportId}`)}
                  className="glass-panel rounded-xl border border-border p-5 cursor-pointer hover:border-accent/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-all duration-300 group flex flex-col gap-5 relative overflow-hidden"
                >
                  {/* Decorative background accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-3xl -mr-12 -mt-12 rounded-full" />

                  {/* Top row: date + site */}
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border/50 w-fit">
                        {report.reportDate}
                      </span>
                      {lastModified && (
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 font-medium ml-1">
                          <Clock size={10} />
                          <span>Modified at {lastModified}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 truncate max-w-[50%] text-right shadow-sm">
                      {report.site?.siteName}
                    </span>
                  </div>

                  {/* Supervisor */}
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground transition-colors relative z-10">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center border border-border/50 group-hover:border-accent/30 group-hover:bg-accent/5 transition-all">
                      <User className="w-4 h-4 text-muted-foreground/60 group-hover:text-accent" />
                    </div>
                    <span className="font-medium truncate">{report.supervisor?.fullName}</span>
                  </div>

                  {/* Field Intel Snippet */}
                  {report.workProgress && (
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/30 relative z-10">
                      <p className="text-[11px] text-muted-foreground line-clamp-2 italic leading-relaxed">
                        "{report.workProgress}"
                      </p>
                    </div>
                  )}

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="bg-background/40 border border-border/50 rounded-lg p-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[8px] font-display font-bold uppercase tracking-wider text-muted-foreground/70">
                        <Hammer size={10} className="text-blue-400" />
                        Cost
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground">₹{materialExpense.toLocaleString()}</span>
                    </div>
                    <div className="bg-background/40 border border-border/50 rounded-lg p-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[8px] font-display font-bold uppercase tracking-wider text-muted-foreground/70">
                        <Wallet size={10} className="text-emerald-400" />
                        Adv
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground">₹{labourAdvance.toLocaleString()}</span>
                    </div>
                    <div className="bg-background/40 border border-border/50 rounded-lg p-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[8px] font-display font-bold uppercase tracking-wider text-muted-foreground/70">
                        <Package size={10} className="text-amber-400" />
                        Stock
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground">{remainingStockCount} items</span>
                    </div>
                  </div>

                  {/* Divider + Workforce + Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/40 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-accent/10 rounded-md border border-accent/20">
                        <Users className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-display font-bold uppercase tracking-tighter text-muted-foreground/60">Workforce</span>
                        <span className="text-sm font-mono font-black text-foreground leading-none">
                          {totalLabour}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button 
                        variant="ghost" size="icon" 
                        onClick={(e) => handleDeleteClick(e, report.reportId)}
                        className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent border border-accent/10 group-hover:bg-accent group-hover:text-background transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Intelligence Log?"
        description="This action will permanently remove this report and all its associated data from the system. This cannot be undone."
        confirmText="Delete Permanently"
      />
    </div>
  );
}
