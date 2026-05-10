'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSupervisorSites, getTodayHoliday, submitDailyReport, getPendingDates, skipDate, revokeSkipDate } from '@/app/actions/supervisor';
import { getHolidays } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Send, ChevronRight, PartyPopper, CheckCircle, Camera, X, RefreshCw, CalendarDays, Ban, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentISTDateString } from '@/lib/date-utils';

export default function SubmitReportPage() {
  const router = useRouter();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSites, setFetchingSites] = useState(true);
  const [holiday, setHoliday] = useState<{ isHoliday: boolean; name?: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const supabase = createClient();

  // Get Local IST Date as ISO string YYYY-MM-DD
  const getLocalDate = () => {
    return getCurrentISTDateString();
  };

  // Form State
  const [siteId, setSiteId] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [fetchingDates, setFetchingDates] = useState(false);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [togglingSkip, setTogglingSkip] = useState(false);
  
  // Labour Entries (dynamic)
  const [labourEntries, setLabourEntries] = useState([
    { labourType: 'Mason', count: 0 },
    { labourType: 'Helper', count: 0 },
    { labourType: 'Skilled Labour', count: 0 },
    { labourType: 'Skilled Labour Helper', count: 0 },
  ]);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetchingSites(true);
    try {
      const localDate = getLocalDate();
      const [siteData, holData, holidayData] = await Promise.all([
        getSupervisorSites(localDate),
        getTodayHoliday(),
        getHolidays(),
      ]);
      setSites(siteData);
      setHoliday(holData);
      setHolidays(holidayData.map((h: any) => h.date));
    } catch (err) {
      console.error('Failed to sync site data:', err);
    } finally {
      setFetchingSites(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Realtime Synchronization
    const channel = supabase
      .channel('report-form-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => {
        fetchData(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_allocations' }, () => {
        fetchData(true);
        if (siteId) loadPendingDates();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'holidays' }, () => {
        fetchData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, supabase, siteId]);

  const loadPendingDates = useCallback(() => {
    if (!siteId) return;
    setFetchingDates(true);
    const localDate = getLocalDate();
    getPendingDates(parseInt(siteId), localDate)
      .then(dates => {
        setPendingDates(dates);
        if (dates.length > 0 && !reportDate) {
          setReportDate(dates[0]);
        }
      })
      .finally(() => setFetchingDates(false));
  }, [siteId, reportDate]);

  // Fetch pending dates when site changes
  useEffect(() => {
    if (!siteId) {
      setPendingDates([]);
      setReportDate('');
      return;
    }
    loadPendingDates();
  }, [siteId]);

  const isSundayOrHoliday = (dateStr: string) => {
    if (!dateStr) return false;
    const isSun = new Date(dateStr).getDay() === 0;
    const isHol = holidays.includes(dateStr);
    return isSun || isHol;
  };

  const handleToggleSkip = async () => {
    if (!siteId || !reportDate) return;
    
    setTogglingSkip(true);
    try {
      const result = await skipDate(parseInt(siteId), reportDate);
      if (result.error) {
        const revokeRes = await revokeSkipDate(parseInt(siteId), reportDate);
        if (revokeRes.error) {
          toast.error(revokeRes.error);
        } else {
          toast.success("Work status restored. You can now log your report.");
          loadPendingDates();
        }
      } else {
        toast.success("Date marked as No Work.");
        loadPendingDates();
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    } finally {
      setTogglingSkip(false);
    }
  };

  const handleAddLabourEntry = () => setLabourEntries([...labourEntries, { labourType: '', count: 0 }]);
  const handleRemoveLabourEntry = (index: number) => setLabourEntries(labourEntries.filter((_, i) => i !== index));
  const handleLabourEntryChange = (index: number, field: string, value: string) => {
    const updated = [...labourEntries];
    (updated[index] as any)[field] = field === 'count' ? parseInt(value) || 0 : value;
    setLabourEntries(updated);
  };

  const [materialInwards, setMaterialInwards] = useState<any[]>([{ materialName: '', quantity: '' }]);
  const [labourAdvances, setLabourAdvances] = useState<any[]>([{ labourName: '', amount: '' }]);
  const [materialExpenses, setMaterialExpenses] = useState<any[]>([{ materialName: '', amount: '' }]);
  const [workProgress, setWorkProgress] = useState('');
  const [remainingStocks, setRemainingStocks] = useState<any[]>([{ materialName: '', quantity: '' }]);
  const [remarks, setRemarks] = useState('');

  const handleAddLabourAdvance = () => setLabourAdvances([...labourAdvances, { labourName: '', amount: '' }]);
  const handleRemoveLabourAdvance = (index: number) => setLabourAdvances(labourAdvances.filter((_, i) => i !== index));
  const handleLabourAdvanceChange = (index: number, field: string, value: string) => {
    const updated = [...labourAdvances];
    (updated[index] as any)[field] = value;
    setLabourAdvances(updated);
  };

  const handleAddMaterialInward = () => setMaterialInwards([...materialInwards, { materialName: '', quantity: '' }]);
  const handleRemoveMaterialInward = (index: number) => setMaterialInwards(materialInwards.filter((_, i) => i !== index));
  const handleMaterialInwardChange = (index: number, field: string, value: string) => {
    const updated = [...materialInwards];
    (updated[index] as any)[field] = value;
    setMaterialInwards(updated);
  };

  const handleAddMaterialExpense = () => setMaterialExpenses([...materialExpenses, { materialName: '', amount: '' }]);
  const handleRemoveMaterialExpense = (index: number) => setMaterialExpenses(materialExpenses.filter((_, i) => i !== index));
  const handleMaterialExpenseChange = (index: number, field: string, value: string) => {
    const updated = [...materialExpenses];
    (updated[index] as any)[field] = value;
    setMaterialExpenses(updated);
  };

  const handleAddRemainingStock = () => setRemainingStocks([...remainingStocks, { materialName: '', quantity: '' }]);
  const handleRemoveRemainingStock = (index: number) => setRemainingStocks(remainingStocks.filter((_, i) => i !== index));
  const handleRemainingStockChange = (index: number, field: string, value: string) => {
    const updated = [...remainingStocks];
    (updated[index] as any)[field] = value;
    setRemainingStocks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) {
      toast.error('Please assign a site location first');
      return;
    }
    if (!reportDate) {
      toast.error('Please select a report date');
      return;
    }

    setLoading(true);
    
    const payload = {
      siteId: parseInt(siteId),
      reportDate,
      labourEntries: labourEntries.filter(e => e.labourType && e.count > 0).map(e => ({
        labour_type: e.labourType,
        count: e.count
      })),
      materialInwards: materialInwards.filter(mi => mi.materialName && mi.quantity).map(mi => ({
        material_name: mi.materialName,
        quantity: parseInt(mi.quantity.toString()) || 0
      })),
      workProgress,
      remainingStocks: remainingStocks.filter(rs => rs.materialName && rs.quantity).map(rs => ({
        material_name: rs.materialName,
        quantity: rs.quantity.toString()
      })),
      remarks,
      labourAdvances: labourAdvances.filter(la => la.labourName && la.amount).map(la => ({
        labour_name: la.labourName,
        amount: parseFloat(la.amount.toString())
      })),
      materialExpenses: materialExpenses.filter(me => me.materialName && me.amount).map(me => ({
        material_name: me.materialName,
        amount: parseFloat(me.amount.toString())
      }))
    };

    try {
      const result = await submitDailyReport(payload);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      const audio = new Audio('/success.wav');
      audio.play().catch(e => console.error("Audio playback failed:", e));

      setShowSuccess(true);
      setTimeout(() => {
        router.push('/supervisor/reports');
      }, 3000);
    } catch (error: any) {
      toast.error('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = getLocalDate();
    if (dateStr === today) return "Today's Log (Current Date)";
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + " (Missing Day)";
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 animate-in fade-in duration-500 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Field Operations Log" 
          description="Submit accurate EOD metrics. All fields are audited."
          breadcrumbs={['Field Operations', 'Log Daily Report']}
        />
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-border self-start md:self-auto">
          <div className={`w-2 h-2 rounded-full ${fetchingSites ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">
            {fetchingSites ? 'Synchronizing' : 'Live Connection'}
          </span>
          {!fetchingSites && (
            <button onClick={() => fetchData()} className="ml-2 p-1 hover:bg-muted rounded transition-colors">
              <RefreshCw size={10} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {holiday?.isHoliday && (
        <div className="flex items-center gap-4 glass-panel rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 mb-12">
          <PartyPopper size={20} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-display font-bold text-amber-400 uppercase tracking-widest">
              Today is a Holiday — {holiday.name}
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-sans">
              Submission is not required today, but you may still log a report if work was carried out.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-16 md:space-y-24 mt-12 md:mt-16">
        
        {/* Step 1: Configuration */}
        <section>
          <SectionHeading title="01. Operational Configuration" helpId="daily-mob" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Site Selection */}
            <div className="glass-panel p-5 md:p-8 rounded-xl border border-accent/20 accent-glow">
              <Label className="text-xs uppercase tracking-widest text-accent mb-3 block">Designated Site</Label>
              <Select value={siteId} onValueChange={(val) => setSiteId(val || '')}>
                <SelectTrigger className="bg-background/80 border-border h-14 text-lg focus:border-accent">
                  <SelectValue placeholder={fetchingSites && sites.length === 0 ? "Synchronizing..." : "Select operation site"} />
                </SelectTrigger>
                <SelectContent>
                  {sites.length === 0 && !fetchingSites ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">No active sites found</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Contact administrator to assign sites.</p>
                    </div>
                  ) : (
                    sites.map((site: any) => (
                      <SelectItem key={site.siteId} value={site.siteId.toString()}>
                        <div className="flex flex-col items-start py-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${site.exemptedToday ? 'line-through opacity-50' : ''}`}>{site.siteName}</span>
                            {site.exemptedToday && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-tighter">Exempted</span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground/70 font-display uppercase tracking-wider">{site.clientName}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className={`glass-panel p-5 md:p-8 rounded-xl border border-border ${!siteId ? 'opacity-30 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Reporting Log Date</Label>
                {reportDate && isSundayOrHoliday(reportDate) && (
                  <button 
                    type="button"
                    onClick={handleToggleSkip}
                    disabled={togglingSkip}
                    className="text-[10px] font-display font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors flex items-center gap-1.5 bg-accent/5 px-2 py-1 rounded border border-accent/10"
                  >
                    <RotateCcw size={12} /> {togglingSkip ? 'Processing...' : 'Toggle Work Status'}
                  </button>
                )}
              </div>
              <Select value={reportDate} onValueChange={(val) => setReportDate(val || '')} disabled={fetchingDates}>
                <SelectTrigger className="bg-background/80 border-border h-14 text-lg focus:border-accent">
                  <CalendarDays size={18} className="mr-3 text-accent" />
                  <SelectValue placeholder={fetchingDates ? "Retrieving pending logs..." : "Select date"} />
                </SelectTrigger>
                <SelectContent>
                  {pendingDates.length === 0 && !fetchingDates ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-emerald-400 uppercase tracking-widest font-display">All logs up to date</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">No missing reports found for this site.</p>
                    </div>
                  ) : (
                    pendingDates.map(date => (
                      <SelectItem key={date} value={date}>
                        <div className="flex flex-col items-start py-0.5">
                          <span className="font-semibold">{formatDate(date)}</span>
                          <span className="text-[10px] text-muted-foreground/70 font-display uppercase tracking-wider">
                            {date === getLocalDate() ? 'Editable until 00:00 tonight' : '4-hour edit window applies'}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exemption Message */}
          {sites.find((s: any) => s.siteId.toString() === siteId)?.exemptedToday && reportDate === getLocalDate() && (
            <div className="mt-8 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 flex gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-xs font-bold">i</span>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Site Exempted for Today</p>
                <p className="text-xs text-muted-foreground mt-0.5">The administrator has marked this site as "No Work Allocated" for today. Report submission is disabled for the current date.</p>
              </div>
            </div>
          )}
        </section>

        <div className={`space-y-16 md:space-y-24 transition-all duration-500 ${(!siteId || !reportDate || (sites.find((s: any) => s.siteId.toString() === siteId)?.exemptedToday && reportDate === getLocalDate())) ? 'pointer-events-none grayscale opacity-30 select-none' : ''}`}>
          {/* Step 2: Workforce */}
          <section>
            <SectionHeading title="02. Workforce Census" description="Record accurate headcount for today's shift." helpId="data-entry" />
            <div className="glass-panel p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Labour Headcount</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddLabourEntry} className="border-border hover:bg-white/5 text-xs h-8">
                  <Plus size={14} className="mr-2" /> Add Row
                </Button>
              </div>
              <div className="space-y-3">
              {labourEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Labour Type"
                      className="bg-background/40 border-border h-11 md:h-12 text-xs md:text-sm focus:border-accent px-3"
                      value={entry.labourType}
                      onChange={e => handleLabourEntryChange(index, 'labourType', e.target.value)}
                    />
                  </div>
                  <div className="w-20 md:w-32 relative flex-shrink-0">
                    <Input
                      type="number" min="0" placeholder="0"
                      className="bg-background/40 border-border h-11 md:h-12 text-xs md:text-sm font-mono focus:border-accent pl-3 pr-8 md:pr-10"
                      value={entry.count === 0 ? '' : entry.count}
                      onChange={e => handleLabourEntryChange(index, 'count', e.target.value)}
                    />
                    <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] uppercase tracking-widest text-accent/60 font-bold">Pax</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLabourEntry(index)} className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step 3: Logistics */}
        <section>
          <SectionHeading title="03. Material Inward Logistics" description="Record materials received on-site today." helpId="data-entry" />
          <div className="glass-panel p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Material Intake</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMaterialInward} className="border-border hover:bg-white/5 text-xs h-8">
                <Plus size={14} className="mr-2" /> Add Row
              </Button>
            </div>
            <div className="space-y-3">
              {materialInwards.map((mi, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className="flex-1 min-w-0">
                    <Input placeholder="Material Name" className="bg-background/40 border-border h-11 md:h-12 text-xs md:text-sm focus:border-accent px-3" value={mi.materialName} onChange={e => handleMaterialInwardChange(index, 'materialName', e.target.value)} />
                  </div>
                  <div className="w-20 md:w-32 relative flex-shrink-0">
                    <Input type="number" min="0" placeholder="Qty" className="bg-background/40 border-border h-11 md:h-12 text-xs md:text-sm font-mono focus:border-accent px-3" value={mi.quantity} onChange={e => handleMaterialInwardChange(index, 'quantity', e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMaterialInward(index)} className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step 4: Financials */}
        <section>
          <SectionHeading title="04. Capital Outlay" description="Log field expenses and advances." helpId="data-entry" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Labour Advances</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddLabourAdvance} className="border-border hover:bg-white/5 text-xs h-8">
                  <Plus size={14} className="mr-2" /> Add Row
                </Button>
              </div>
              <div className="space-y-3">
                  {labourAdvances.map((adv, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <div className="flex-1 min-w-0">
                        <Input placeholder="Labour Name" className="bg-background/40 border-border h-11 md:h-12 text-xs md:text-sm focus:border-accent px-3" value={adv.labourName} onChange={e => handleLabourAdvanceChange(index, 'labourName', e.target.value)} />
                      </div>
                      <div className="w-20 md:w-32 relative flex-shrink-0">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-accent/60 text-[10px] md:text-sm font-mono font-bold">₹</span>
                        <Input type="number" min="0" placeholder="0" className="bg-background/40 border-border h-11 md:h-12 pl-5 md:pl-8 text-xs md:text-sm font-mono focus:border-accent pr-2" value={adv.amount} onChange={e => handleLabourAdvanceChange(index, 'amount', e.target.value)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLabourAdvance(index)} className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/40 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Material Expenses</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMaterialExpense} className="border-border hover:bg-white/5 text-xs h-8">
                  <Plus size={14} className="mr-2" /> Add Row
                </Button>
              </div>
              <div className="space-y-3">
                  {materialExpenses.map((exp, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <div className="flex-1 min-w-0">
                        <Input placeholder="Expense Details" className="bg-background/40 border-border h-11 md:h-12 text-xs md:text-sm focus:border-accent px-3" value={exp.materialName} onChange={e => handleMaterialExpenseChange(index, 'materialName', e.target.value)} />
                      </div>
                      <div className="w-20 md:w-32 relative flex-shrink-0">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-accent/60 text-[10px] md:text-sm font-mono font-bold">₹</span>
                        <Input type="number" min="0" placeholder="0" className="bg-background/40 border-border h-11 md:h-12 pl-5 md:pl-8 text-xs md:text-sm font-mono focus:border-accent pr-2" value={exp.amount} onChange={e => handleMaterialExpenseChange(index, 'amount', e.target.value)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMaterialExpense(index)} className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/40 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </section>

        {/* Step 5: Inventory */}
        <section>
          <SectionHeading title="05. Inventory Management" description="Record remaining material stock details." helpId="data-entry" />
          <div className="glass-panel p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h4 className="text-sm font-display font-bold uppercase tracking-widest text-foreground">Remaining Material Stock</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRemainingStock} className="border-border hover:bg-white/5 text-xs h-8">
                <Plus size={14} className="mr-2" /> Add Row
              </Button>
            </div>
            <div className="space-y-3">
              {remainingStocks.map((rs, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className="flex-1 min-w-0">
                    <Input placeholder="Material Name" className="bg-background/40 border-border h-11 md:h-12 text-xs md:text-sm focus:border-accent px-3" value={rs.materialName} onChange={e => handleRemainingStockChange(index, 'materialName', e.target.value)} />
                  </div>
                  <div className="w-20 md:w-32 relative flex-shrink-0">
                    <Input placeholder="Qty" className="bg-background/40 border-border h-11 md:h-12 text-xs md:text-sm font-mono focus:border-accent px-3" value={rs.quantity} onChange={e => handleRemainingStockChange(index, 'quantity', e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRemainingStock(index)} className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step 6: Remarks */}
        <section>
          <SectionHeading title="06. Field Intelligence" description="Detail the work completed and any operational blockers." helpId="data-entry" />
          <div className="glass-panel p-5 md:p-8 rounded-xl border border-border space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-display font-bold uppercase tracking-widest text-accent/70">Work Progress Description</Label>
              <Textarea 
                placeholder="Ex: Completed shuttering for columns C1 to C5..." 
                className="min-h-[120px] bg-background/40 border-border focus:border-accent text-sm md:text-base leading-relaxed"
                value={workProgress}
                onChange={e => setWorkProgress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-display font-bold uppercase tracking-widest text-accent/70">Operational Blockers / Remarks</Label>
              <Textarea 
                placeholder="Ex: Delay in steel delivery by 2 hours..." 
                className="min-h-[100px] bg-background/40 border-border focus:border-accent text-sm md:text-base leading-relaxed"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Submit Bar */}
        <div className="mt-12 glass-panel border border-accent/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl accent-glow backdrop-blur-xl">
          <div className="px-2 text-center sm:text-left">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-display font-bold">Operational Protocol</p>
            <p className="text-sm font-medium text-foreground mt-0.5">Report Date: <span className="text-accent font-bold">{formatDate(reportDate)}</span></p>
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-background rounded-xl px-10 h-14 text-sm font-bold tracking-widest uppercase shadow-lg shadow-accent/20 transition-all" disabled={loading}>
            {loading ? 'Transmitting Data...' : (
              <>
                Confirm & Submit Log <ChevronRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
      </form>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="glass-panel p-10 rounded-[2.5rem] border border-accent/20 flex flex-col items-center text-center max-w-sm mx-4 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-6 border border-accent/30"
              >
                <CheckCircle size={40} className="text-accent" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2 uppercase tracking-widest">Report Committed</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Your field intelligence for {formatDate(reportDate)} has been securely transmitted.
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/supervisor/reports')}
                className="w-full border-accent/20 hover:bg-accent/10 text-accent font-display font-bold uppercase tracking-widest h-12"
              >
                Back to History
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
