'use client';

import React, { useEffect, useState } from 'react';
import { getSupervisorSites, getReportDetails, updateDailyReport } from '@/app/actions/supervisor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Send, ChevronRight, ArrowLeft, CheckCircle, Timer, Camera, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [freezeTime, setFreezeTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  // Form State
  const [siteId, setSiteId] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [labourEntries, setLabourEntries] = useState<any[]>([]);
  const [materialInwards, setMaterialInwards] = useState<any[]>([]);
  const [labourAdvances, setLabourAdvances] = useState<any[]>([]);
  const [materialExpenses, setMaterialExpenses] = useState<any[]>([]);
  const [workProgress, setWorkProgress] = useState('');
  const [remainingStocks, setRemainingStocks] = useState<any[]>([]);
  const [remarks, setRemarks] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteData, reportData] = await Promise.all([
          getSupervisorSites(),
          getReportDetails(parseInt(id))
        ]);
        
        setSites(siteData || []);
        
        const report = reportData;
        if (!report) throw new Error('Report not found');
        
        // Check if report is frozen (Refined Policy)
        const reportDateStr = report.reportDate;
        const createdAt = new Date(report.createdAt);
        const freezeAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now > freezeAt) {
          toast.error('Reporting window expired. Reports are frozen 24 hours after submission.');
          router.push('/supervisor/reports');
          return;
        }

        setFreezeTime(freezeAt);

        setSiteId(report.site.siteId.toString());
        setReportDate(report.reportDate);
        setLabourEntries(report.labourEntries || []);
        setMaterialInwards(report.materialInwards || []);
        setLabourAdvances(report.labourAdvances || []);
        setMaterialExpenses(report.materialExpenses || []);
        setWorkProgress(report.workProgress || '');
        setRemainingStocks(report.remainingStocks || []);
        setRemarks(report.remarks || '');
        setPhotos(report.photos?.map((p: any) => p.photo_url) || []);
        
      } catch (error) {
        toast.error('Failed to load report data');
        router.push('/supervisor/reports');
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id, router]);

  useEffect(() => {
    if (!freezeTime) return;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = freezeTime.getTime() - now;
      
      if (distance < 0) {
        setTimeLeft('EXPIRED');
        router.push('/supervisor/reports');
        return false;
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        return true;
      }
    };

    updateTimer();
    const interval = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [freezeTime, router]);

  const handleAddLabourEntry = () => {setLabourEntries([...labourEntries, { labourType: '', count: 0 }]);}
  const handleRemoveLabourEntry = (index: number) => setLabourEntries(labourEntries.filter((_, i) => i !== index));
  const handleLabourEntryChange = (index: number, field: string, value: string) => {
    const updated = [...labourEntries];
    (updated[index] as any)[field] = field === 'count' ? parseInt(value) || 0 : value;
    setLabourEntries(updated);
  };

  const handleAddMaterialInward = () => setMaterialInwards([...materialInwards, { materialName: '', quantity: '' }]);
  const handleRemoveMaterialInward = (index: number) => setMaterialInwards(materialInwards.filter((_, i) => i !== index));
  const handleMaterialInwardChange = (index: number, field: string, value: string) => {
    const updated = [...materialInwards];
    (updated[index] as any)[field] = value;
    setMaterialInwards(updated);
  };

  const handleAddLabourAdvance = () => setLabourAdvances([...labourAdvances, { labourName: '', amount: '' }]);
  const handleRemoveLabourAdvance = (index: number) => setLabourAdvances(labourAdvances.filter((_, i) => i !== index));
  const handleLabourAdvanceChange = (index: number, field: string, value: string) => {
    const updated = [...labourAdvances];
    (updated[index] as any)[field] = value;
    setLabourAdvances(updated);
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
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      labourEntries: labourEntries.filter(e => e.labourType && e.count > 0).map(e => ({
        labour_type: e.labourType,
        count: e.count
      })),
      materialInwards: materialInwards.filter(mi => mi.materialName && mi.quantity).map(mi => ({
        material_name: mi.materialName,
        quantity: parseInt(mi.quantity.toString()) || 0
      })),
      workProgress,
      remarks,
      labourAdvances: labourAdvances.filter(la => la.labourName && la.amount).map(la => ({
        labour_name: la.labourName,
        amount: parseFloat(la.amount.toString())
      })),
      materialExpenses: materialExpenses.filter(me => me.materialName && me.amount).map(me => ({
        material_name: me.materialName,
        amount: parseFloat(me.amount.toString())
      })),
      remainingStocks: remainingStocks.filter(rs => rs.materialName && rs.quantity).map(rs => ({
        material_name: rs.materialName,
        quantity: rs.quantity.toString()
      })),
      photos
    };

    try {
      const result = await updateDailyReport(parseInt(id), payload);
      if (result?.error) throw new Error(result.error);

      // Play success sound
      const audio = new Audio('/success.wav');
      audio.play().catch(e => console.error("Audio playback failed:", e));

      setShowSuccess(true);
      setTimeout(() => {
        router.push('/supervisor/reports');
      }, 3000);
    } catch (error: any) {
      toast.error('Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center opacity-50">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-display uppercase tracking-widest text-xs">Initializing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 animate-in fade-in duration-500 pb-20 relative">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/supervisor/reports')} className="text-muted-foreground hover:text-white px-0 hover:bg-transparent">
          <ArrowLeft size={16} className="mr-2" /> Back to History
        </Button>
      </div>

      <PageHeader 
        title={`Edit Report #${id}`} 
        description={`Modifying entry for ${reportDate}`}
        breadcrumbs={['Field Operations', 'My Submissions', 'Edit Log']}
      />

      {timeLeft && (
        <div className="mt-6 glass-panel rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-3">
            <Timer className="text-amber-400 animate-pulse" size={20} />
            <div>
              <p className="text-sm font-display font-bold text-amber-400 uppercase tracking-widest">Modification Window Active</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-sans">This log will be permanently sealed when the timer expires.</p>
            </div>
          </div>
          <div className="bg-background/80 border border-border px-4 py-2 rounded-lg">
            <span className="font-mono font-bold text-xl text-foreground tracking-widest">{timeLeft}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-16 md:space-y-24 mt-12 md:mt-16">
        {/* Step 1: Location */}
        <section>
          <SectionHeading title="01. Location Configuration" helpId="daily-mob" />
          <div className="glass-panel p-5 md:p-8 rounded-xl border border-accent/20 accent-glow">
            <Label className="text-xs uppercase tracking-widest text-accent mb-3 block">Designated Site</Label>
            <Select value={siteId} onValueChange={(val) => setSiteId(val || '')}>
              <SelectTrigger className="bg-background/80 border-border h-14 text-lg focus:border-accent">
                <SelectValue placeholder="Select operation site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site: any) => (
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
                ))}
              </SelectContent>
            </Select>

            {/* Exemption Message (Only for Today's Reports) */}
            {reportDate === new Date().toISOString().split('T')[0] && sites.find((s: any) => s.siteId.toString() === siteId)?.exemptedToday && (
              <div className="mt-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 flex gap-3 animate-in slide-in-from-top-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-xs font-bold">i</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Site Exempted for Today</p>
                  <p className="text-xs text-muted-foreground mt-0.5">This site has been marked as "No Work Allocated" for today. This report cannot be modified.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Form Content - disable if site is exempted TODAY and report is TODAY */}
        <div className={reportDate === new Date().toISOString().split('T')[0] && sites.find((s: any) => s.siteId.toString() === siteId)?.exemptedToday ? 'pointer-events-none grayscale opacity-50 select-none' : ''}>
          <div className="space-y-16 md:space-y-24">

        {/* Step 2: Workforce */}
        <section>
          <SectionHeading title="02. Workforce Census" helpId="data-entry" />
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
          <SectionHeading title="03. Material Inward Logistics" helpId="data-entry" />
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
          <SectionHeading title="04. Capital Outlay" helpId="data-entry" />
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

        {/* Step 5: Inventory & Outlay */}
        <section>
          <SectionHeading title="05. Inventory & Financial Outlay" description="Record remaining material stock and capital expenditure details." helpId="data-entry" />
          <div className="space-y-6">
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
          </div>
        </section>

        {/* Step 6: Photos */}
        <section>
          <SectionHeading title="06. Visual Verification" description="Upload photos from the site to verify progress and logistics." helpId="data-entry" />
          <div className="glass-panel p-6 rounded-xl border border-border">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                  <img src={photo} alt="Site" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all flex flex-col items-center justify-center cursor-pointer group">
                <Camera size={24} className="text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mt-2 group-hover:text-accent">Add Photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
        </section>

        {/* Step 7: Remarks */}
        <section>
          <SectionHeading title="07. Field Intelligence" helpId="data-entry" />
          <div className="glass-panel p-5 md:p-8 rounded-xl border border-border space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-display font-bold uppercase tracking-widest text-accent/70">Work Progress Description</Label>
              <Textarea 
                placeholder="Ex: Completed shuttering..." 
                className="min-h-[120px] bg-background/40 border-border focus:border-accent text-sm md:text-base leading-relaxed"
                value={workProgress}
                onChange={e => setWorkProgress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-display font-bold uppercase tracking-widest text-accent/70">Operational Blockers / Remarks</Label>
              <Textarea 
                placeholder="Ex: Delay in delivery..." 
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
            <p className="text-sm font-medium text-foreground mt-0.5">Updating an existing log will overwrite previous data.</p>
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-background rounded-xl px-10 h-14 text-sm font-bold tracking-widest uppercase shadow-lg shadow-accent/20 transition-all" disabled={loading}>
            {loading ? 'Updating Log...' : (
              <>
                Save Changes <ChevronRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
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
            <h2 className="text-2xl font-display font-bold text-foreground mb-2 uppercase tracking-widest">Update Successful</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              The report modifications have been synchronized with the central database.
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
