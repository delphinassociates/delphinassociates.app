'use client';

import React, { useEffect, useState } from 'react';
import { getReportDetails, deleteReport, restoreReport } from '@/app/actions/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Users, Package, Wallet, FileText, Calendar, Building2, Trash2, Camera, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { ConfirmationDialog } from '@/components/ui/custom/ConfirmationDialog';
import { createClient } from '@/lib/supabase/client';

export default function ReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      try {
        const data = await getReportDetails(parseInt(id));
        if (!isMounted) return;
        if (!data) throw new Error('Not found');
        setReport(data);
      } catch {
        if (!isMounted) return;
        toast.error('Failed to load report data');
        router.push('/admin/reports');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();

    // Realtime subscription — only re-fetches when THIS report actually changes
    const supabase = createClient();
    const channel = supabase
      .channel(`report_detail_${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'daily_reports', filter: `report_id=eq.${id}` },
        () => { if (isMounted) fetchReport(); }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [id, router]);

  const confirmDelete = async () => {
    try {
      await deleteReport(parseInt(id));
      router.push('/admin/reports');
      
      toast.success('Report deleted', {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await restoreReport(parseInt(id));
              toast.success('Report restored');
              router.push(`/admin/reports/${id}`);
            } catch {
              toast.error('Failed to restore report');
            }
          }
        }
      });
    } catch {
      toast.error('Failed to delete report');
    }
  };

  const copyToClipboard = () => {
    if (!report) return;

    const labourTotal = report.labourEntries?.reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0) || 0;
    const intakeTotal = report.materialInwards?.reduce((acc: number, curr: any) => acc + Number(curr.quantity || 0), 0) || 0;
    const advanceTotal = report.labourAdvances?.reduce((a: any, b: any) => a + b.amount, 0) || 0;
    const expenseTotal = report.materialExpenses?.reduce((a: any, b: any) => a + b.amount, 0) || 0;
    const stockTotal = report.remainingStocks?.reduce((acc: number, curr: any) => acc + Number(curr.quantity || 0), 0) || 0;

    const text = `
CDSMS DAILY SITE REPORT
-----------------------
Site: ${report.site.siteName}
Date: ${report.reportDate}
Supervisor: ${report.supervisor.fullName}

WORKFORCE PRESENCE:
${report.labourEntries?.map((le: any) => `- ${le.labourType}: ${le.count}`).join('\n') || 'No entries'}
Total Strength: ${labourTotal}

MATERIAL INTAKE:
${report.materialInwards?.map((mi: any) => `- ${mi.materialName}: ${mi.quantity}`).join('\n') || 'No entries'}
Total Intake: ${intakeTotal}

FINANCIAL OUTLAY:
- Labour Advances: ₹ ${advanceTotal.toFixed(2)}
- Material Expenses: ₹ ${expenseTotal.toFixed(2)}
Total Outlay: ₹ ${(advanceTotal + expenseTotal).toFixed(2)}

INVENTORY STATUS:
${report.remainingStocks?.map((rs: any) => `- ${rs.materialName}: ${rs.quantity}`).join('\n') || 'No entries'}
Total Stock: ${stockTotal}

WORK PROGRESS:
${report.workProgress || 'No progress recorded.'}

REMARKS:
${report.remarks || 'No remarks recorded.'}

Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Report copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center opacity-50">
          <div className="loader mb-4" style={{ width: '40px', height: '40px', '--loader-thickness': '6px' } as React.CSSProperties}></div>
          <p className="font-display uppercase tracking-widest text-xs">Initializing</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-12">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/reports')} className="text-muted-foreground hover:text-accent px-0 hover:bg-transparent transition-colors self-start">
          <ArrowLeft size={16} className="mr-2" /> Back to Intelligence Log
        </Button>
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="ghost" 
            onClick={copyToClipboard}
            className="text-accent hover:text-accent/80 hover:bg-accent/10 text-xs h-9 px-4 rounded-full border border-accent/20"
          >
            {copied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
            {copied ? 'Copied!' : 'Copy Report'}
          </Button>
          <Button variant="ghost" onClick={async () => {
            setDeleteDialogOpen(true);
          }} className="text-red-400 hover:text-red-500 hover:bg-red-500/10 text-xs h-9 px-4 rounded-full border border-red-500/20">
            <Trash2 size={14} className="mr-2" /> Delete Log
          </Button>
        </div>
      </div>

      <PageHeader 
        title={`Report Ref: #${report.reportId}`} 
        description="Detailed breakdown of daily site operations."
        breadcrumbs={['Intelligence', 'Daily Reports', `Report #${report.reportId}`]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-xl border border-border flex items-center space-x-4">
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <Building2 className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Site Designation</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">{report.site.siteName}</h3>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-border flex items-center space-x-4">
          <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
            <Users className="text-amber-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Reporting Officer</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">{report.supervisor.fullName}</h3>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-border flex items-center space-x-4">
          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
            <Calendar className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Operation Date</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5 font-mono">{report.reportDate}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Labour Presence */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="bg-background/50 border-b border-border px-6 py-4 flex items-center">
            <Users className="text-accent mr-3" size={18} />
            <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Workforce Presence</h4>
          </div>
          <div className="p-0">
            <Table>
              <TableBody>
                {['Mason', 'Helper', 'Skilled Labour', 'Skilled Labour Helper'].map(type => {
                  const entry = report.labourEntries?.find((le: any) => le.labourType === type);
                  return (
                    <TableRow key={type} className="border-border/50 hover:bg-white/5">
                      <TableCell className="font-medium text-muted-foreground pl-6">{type}</TableCell>
                      <TableCell className="text-right pr-6 font-mono">{entry?.count || 0}</TableCell>
                    </TableRow>
                  );
                })}
                
                {/* Any other dynamic labour types not in the standard list */}
                {report.labourEntries?.filter((le: any) => !['Mason', 'Helper', 'Skilled Labour', 'Skilled Labour Helper'].includes(le.labourType)).map((le: any) => (
                  <TableRow key={le.labourType} className="border-border/50 hover:bg-white/5">
                    <TableCell className="font-medium text-muted-foreground pl-6">{le.labourType}</TableCell>
                    <TableCell className="text-right pr-6 font-mono">{le.count || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="bg-accent/5 border-t border-border/50 px-6 py-4 flex justify-between items-center mt-auto">
            <span className="font-display font-bold text-xs uppercase tracking-widest text-accent">Total Strength</span>
            <span className="font-mono font-bold text-accent text-xl">
              {report.labourEntries?.reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0) || 0}
            </span>
          </div>
        </div>

        {/* Material Inward */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="bg-background/50 border-b border-border px-6 py-4 flex items-center">
            <Package className="text-accent mr-3" size={18} />
            <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Material Intake</h4>
          </div>
          <div className="p-0">
            {report.materialInwards?.length > 0 ? (
              <Table>
                <TableBody>
                  {report.materialInwards.map((mi: any, index: number) => (
                    <TableRow key={index} className="border-border/50 hover:bg-white/5">
                      <TableCell className="font-medium text-muted-foreground pl-6">{mi.materialName}</TableCell>
                      <TableCell className="text-right pr-6 font-mono">{mi.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-sm text-muted-foreground/50 italic text-center">
                No material inwards logged.
              </div>
            )}
          </div>
          {report.materialInwards?.length > 0 && (
            <div className="bg-accent/5 border-t border-border/50 px-6 py-4 flex justify-between items-center mt-auto">
              <span className="font-display font-bold text-xs uppercase tracking-widest text-accent">Total Intake</span>
              <span className="font-mono font-bold text-accent text-xl">
                {report.materialInwards.reduce((acc: number, curr: any) => acc + Number(curr.quantity || 0), 0)}
              </span>
            </div>
          )}
        </div>

        {/* Financials */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden lg:col-span-2">
          <div className="bg-background/50 border-b border-border px-6 py-4 flex items-center">
            <Wallet className="text-accent mr-3" size={18} />
            <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Financial Outlay</h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h5 className="text-[11px] font-display font-bold text-accent uppercase tracking-widest mb-4 border-b border-border pb-2">Labour Advances</h5>
              {report.labourAdvances?.length > 0 ? (
                <div className="space-y-3">
                  {report.labourAdvances.map((adv: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{adv.labourName}</span>
                      <span className="font-mono text-foreground bg-white/5 px-2 py-1 rounded">₹ {adv.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-accent/20 mt-2">
                    <span className="font-display font-bold text-xs uppercase tracking-widest text-foreground">Total Advances</span>
                    <span className="font-mono font-bold text-accent text-xl">₹ {report.labourAdvances.reduce((a:any,b:any) => a+b.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">No advances logged.</p>
              )}
            </div>
            <div>
              <h5 className="text-[11px] font-display font-bold text-accent uppercase tracking-widest mb-4 border-b border-border pb-2">Material Expenses</h5>
              {report.materialExpenses?.length > 0 ? (
                <div className="space-y-3">
                  {report.materialExpenses.map((exp: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{exp.materialName}</span>
                      <span className="font-mono text-foreground bg-white/5 px-2 py-1 rounded">₹ {exp.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-blue-400/20 mt-2">
                    <span className="font-display font-bold text-xs uppercase tracking-widest text-foreground">Total Expenses</span>
                    <span className="font-mono font-bold text-blue-400 text-xl">₹ {report.materialExpenses.reduce((a:any,b:any) => a+b.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">No expenses logged.</p>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden lg:col-span-2">
          <div className="bg-background/50 border-b border-border px-6 py-4 flex items-center">
            <Package className="text-accent mr-3" size={18} />
            <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Remaining Material Stock</h4>
          </div>
          <div className="p-0">
            {report.remainingStocks?.length > 0 ? (
              <Table>
                <TableBody>
                  {report.remainingStocks.map((rs: any, i: number) => (
                    <TableRow key={i} className="border-border/50 hover:bg-white/5">
                      <TableCell className="font-medium text-muted-foreground pl-6 py-3">{rs.materialName}</TableCell>
                      <TableCell className="text-right pr-6 font-mono py-3">{rs.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-sm text-muted-foreground/50 italic text-center">
                No inventory data recorded.
              </div>
            )}
          </div>
          {report.remainingStocks?.length > 0 && (
            <div className="bg-accent/5 border-t border-border/50 px-6 py-4 flex justify-between items-center mt-auto">
              <span className="font-display font-bold text-xs uppercase tracking-widest text-accent">Total Stock</span>
              <span className="font-mono font-bold text-accent text-xl">
                {report.remainingStocks.reduce((acc: number, curr: any) => acc + Number(curr.quantity || 0), 0)}
              </span>
            </div>
          )}
        </div>

        {/* Remarks */}
        <div className="glass-panel rounded-xl border border-border overflow-hidden lg:col-span-2">
          <div className="bg-background/50 border-b border-border px-6 py-4 flex items-center">
            <FileText className="text-accent mr-3" size={18} />
            <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Operation Notes & Remarks</h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h5 className="text-[11px] font-display font-bold text-muted-foreground uppercase tracking-widest mb-3">Work Progress Log</h5>
              <div className="bg-black/20 border border-border rounded-lg p-4 min-h-[120px]">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{report.workProgress || 'No progress recorded.'}</p>
              </div>
            </div>
            <div>
              <h5 className="text-[11px] font-display font-bold text-muted-foreground uppercase tracking-widest mb-3">Field Issues / General Remarks</h5>
              <div className="bg-black/20 border border-border rounded-lg p-4 min-h-[120px]">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{report.remarks || 'No remarks recorded.'}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Photos */}
        {report.photos?.length > 0 && (
          <div className="glass-panel rounded-xl border border-border overflow-hidden lg:col-span-2">
            <div className="bg-background/50 border-b border-border px-6 py-4 flex items-center">
              <Camera className="text-accent mr-3" size={18} />
              <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Visual Verification</h4>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {report.photos.map((photo: any, index: number) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                    <img 
                      src={photo.photo_url} 
                      alt={`Site ${index + 1}`} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                      onClick={() => window.open(photo.photo_url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Permanently Delete Report?"
        description={`You are about to delete the daily report for ${report.site.siteName} on ${report.reportDate}. This will erase all labour presence, expenses, and site intelligence records associated with this log.`}
        confirmText="Yes, Delete Log"
      />
    </div>
  );
}
