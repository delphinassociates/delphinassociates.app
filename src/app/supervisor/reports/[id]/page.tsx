'use client';

import React, { useEffect, useState } from 'react';
import { getReportDetails } from '@/app/actions/supervisor';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Users, Package, Wallet, FileText, Calendar, Building2, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/custom/PageHeader';

export default function SupervisorReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReportDetails(parseInt(id));
        if (!data) throw new Error('Not found');
        setReport(data);
      } catch (error) {
        toast.error('Failed to load report data');
        router.push('/supervisor/reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center opacity-50">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-display uppercase tracking-widest text-xs">Accessing Archives</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 animate-in fade-in duration-500 pb-12">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/supervisor/reports')} className="text-muted-foreground hover:text-white px-0 hover:bg-transparent">
          <ArrowLeft size={16} className="mr-2" /> Back to My History
        </Button>
      </div>

      <PageHeader 
        title={`Log Review: #${report.reportId}`} 
        description="Historical operational data for this submission."
        breadcrumbs={['Field Operations', 'My Submissions', `Report #${report.reportId}`]}
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
        <div className="glass-panel p-6 rounded-xl border border-border flex items-center space-x-4 opacity-50">
          <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
            <Users className="text-amber-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Submitted By</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">Me</h3>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-border flex items-center space-x-4">
          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
            <Calendar className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Log Date</p>
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
              <tbody>
                {['Mason', 'Helper', 'Skilled Labour', 'Skilled Labour Helper'].map(type => {
                  const entry = report.labourEntries?.find((le: any) => le.labourType === type);
                  return (
                    <tr key={type} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-6 text-sm font-medium text-muted-foreground">{type}</td>
                      <td className="py-3 px-6 text-right font-mono text-foreground">{entry?.count || 0}</td>
                    </tr>
                  );
                })}
                
                {report.labourEntries?.filter((le: any) => !['Mason', 'Helper', 'Skilled Labour', 'Skilled Labour Helper'].includes(le.labourType)).map((le: any) => (
                  <tr key={le.labourType} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-6 text-sm font-medium text-muted-foreground">{le.labourType}</td>
                    <td className="py-3 px-6 text-right font-mono text-foreground">{le.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="bg-accent/5 border-t border-border/50 px-6 py-4 flex justify-between items-center mt-auto">
            <span className="font-display font-bold text-xs uppercase tracking-widest text-accent">Total Strength</span>
            <span className="font-mono font-bold text-accent text-xl">
              {report.labourEntries?.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0) || 0}
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
                <tbody>
                  {report.materialInwards.map((mi: any, index: number) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-6 text-sm font-medium text-muted-foreground">{mi.materialName}</td>
                      <td className="py-3 px-6 text-right font-mono text-foreground">{mi.quantity}</td>
                    </tr>
                  ))}
                </tbody>
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
        <div className="glass-panel rounded-xl border border-border overflow-hidden lg:col-span-2 flex flex-col">
          <div className="bg-background/50 border-b border-border px-6 py-4 flex items-center">
            <Package className="text-accent mr-3" size={18} />
            <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Remaining Material Stock</h4>
          </div>
          <div className="p-0">
            {report.remainingStocks?.length > 0 ? (
              <Table>
                <tbody>
                  {report.remainingStocks.map((rs: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-6 text-sm font-medium text-muted-foreground">{rs.materialName}</td>
                      <td className="py-3 px-6 text-right font-mono text-foreground">{rs.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic text-center p-6">No inventory data recorded.</p>
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
    </div>
  );
}
