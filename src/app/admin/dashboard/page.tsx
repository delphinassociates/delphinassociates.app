'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  getDashboardSummary, getPendingSites, getExemptedSites, 
  getRemainingStock, getAllSites, getLabourTrend, 
  getExpenseTrend, getMaterialTrend, getSiteReportCount, 
  getRangeSummary, markNoWork, restoreWork, exportAllDailyReports
} from '@/app/actions/admin';
import { createClient } from '@/lib/supabase/client';
import { getCurrentISTDateString } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Building2, Users, FileCheck, HardHat, Wallet, Hammer,
  TrendingUp, AlertTriangle, Info, MapPin, Package, BarChart2, PartyPopper,
  CalendarRange, RotateCcw, ChevronLeft, ChevronRight, Calendar, RefreshCw, BarChart3,
  FileDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { KpiStrip } from '@/components/ui/custom/KpiStrip';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--chart-tooltip-bg)',
    borderRadius: '10px',
    border: '1px solid var(--chart-tooltip-border)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    fontSize: '12px',
  },
  labelStyle: { color: 'var(--foreground)', fontWeight: 600 },
};
const GRID   = 'var(--border)';
const AXIS   = 'var(--muted-foreground)';
const SITE_COLORS = ['#D4AF37', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-muted-foreground/40 text-sm font-sans italic text-center px-4">
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  // ── date range state (default: last 30 days in IST) ──
  const today = getCurrentISTDateString();
  const todayDateObj = new Date(today);
  const defFromDate = new Date(todayDateObj);
  defFromDate.setDate(defFromDate.getDate() - 29);
  
  const fY = defFromDate.getFullYear();
  const fM = String(defFromDate.getMonth() + 1).padStart(2, '0');
  const fD = String(defFromDate.getDate()).padStart(2, '0');
  const defFrom = `${fY}-${fM}-${fD}`;

  const [fromDate, setFromDate] = useState(defFrom);
  const [toDate,   setToDate]   = useState(today);
  const [siteId,   setSiteId]   = useState<string>('all');

  const [appliedFromDate, setAppliedFromDate] = useState(defFrom);
  const [appliedToDate,   setAppliedToDate]   = useState(today);
  const [appliedSiteId,   setAppliedSiteId]   = useState<string>('all');
  const [allSites, setAllSites] = useState<any[]>([]);

  const [summary,        setSummary]        = useState<any>(null);
  const [rangeSummary,   setRangeSummary]   = useState<any>(null);
  const [labourTrend,    setLabourTrend]    = useState<any[]>([]);
  const [expenseTrend,   setExpenseTrend]   = useState<any[]>([]);
  const [materialTrend,  setMaterialTrend]  = useState<any[]>([]);
  const [siteReportCount,setSiteReportCount]= useState<any[]>([]);
  const [pendingSites,   setPendingSites]   = useState<any[]>([]);
  const [exemptedSites,  setExemptedSites]  = useState<any[]>([]);
  const [remainingStock, setRemainingStock] = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [chartsLoading,  setChartsLoading]  = useState(false);
  const [exporting,      setExporting]      = useState(false);
  const [pendingPage,    setPendingPage]    = useState(0);
  const PENDING_PAGE_SIZE = 5;

  const totalPendingPages = Math.ceil(pendingSites.length / PENDING_PAGE_SIZE);
  const paginatedPending = pendingSites.slice(
    pendingPage * PENDING_PAGE_SIZE,
    (pendingPage + 1) * PENDING_PAGE_SIZE
  );

  const handleMarkNoWork = async (siteId: number, date?: string) => {
    const targetDate = date || getCurrentISTDateString();
    try {
      await markNoWork(siteId, targetDate, 'Marked as no work by Admin');
      toast.success(`Site exempted for ${targetDate}`);
      refreshOperationalState();
    } catch {
      toast.error('Failed to exempt site');
    }
  };

  const handleUnexempt = async (siteId: number) => {
    const todayStr = getCurrentISTDateString();
    try {
      await restoreWork(siteId, todayStr);
      toast.success('Site restored to active monitoring');
      refreshOperationalState();
    } catch {
      toast.error('Failed to restore site');
    }
  };

  const refreshOperationalState = async () => {
    try {
      const [sum, pend, ex] = await Promise.all([
        getDashboardSummary(),
        getPendingSites(),
        getExemptedSites(),
      ]);
      setSummary(sum);
      setPendingSites(pend);
      setExemptedSites(ex);
    } catch (err) {
      toast.error('Real-time sync failed');
    }
  };

  // Full fetch
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [sum, pend, ex, stock, sites, siteCnt] = await Promise.all([
        getDashboardSummary(),
        getPendingSites(),
        getExemptedSites(),
        getRemainingStock(),
        getAllSites(),
        getSiteReportCount()
      ]);
      setSummary(sum);
      setPendingSites(pend);
      setExemptedSites(ex);
      setRemainingStock(stock);
      setAllSites(sites);
      setSiteReportCount(siteCnt);
    } catch (err) {
      toast.error('Dashboard data fetch failed');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Re-fetch only charts when date range or site changes
  const fetchCharts = useCallback(async (isSilent = false) => {
    if (!isSilent) setChartsLoading(true);
    try {
      const [lab, exp, mat, rangeSum] = await Promise.all([
        getLabourTrend(appliedFromDate, appliedToDate, appliedSiteId),
        getExpenseTrend(appliedFromDate, appliedToDate, appliedSiteId),
        getMaterialTrend(appliedFromDate, appliedToDate, appliedSiteId),
        getRangeSummary(appliedFromDate, appliedToDate, appliedSiteId),
      ]);
      setLabourTrend(lab);
      setExpenseTrend(exp);
      setMaterialTrend(mat);
      setRangeSummary(rangeSum);
    } catch (err) {
      toast.error('Chart filter failed');
    } finally {
      if (!isSilent) setChartsLoading(false);
    }
  }, [appliedFromDate, appliedToDate, appliedSiteId]);

  const fetchChartsRef = useRef(fetchCharts);
  useEffect(() => {
    fetchChartsRef.current = fetchCharts;
  }, [fetchCharts]);

  useEffect(() => {
    fetchData();
    
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_reports' },
        () => {
          fetchData(true);
          fetchChartsRef.current(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sites' },
        () => {
          fetchData(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_allocations' },
        () => {
          fetchData(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'holidays' },
        () => {
          fetchData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Automatic chart updates on filter change
  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  const handleApplyFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedSiteId(siteId);
  };

  const resetDates = () => {
    setFromDate(defFrom);
    setToDate(today);
    setSiteId('all');
    setAppliedFromDate(defFrom);
    setAppliedToDate(today);
    setAppliedSiteId('all');
  };

  const handleExportExcel = async () => {
    if (exporting) return;
    setExporting(true);
    const toastId = toast.loading('Extracting database...');
    try {
      const rawReports = await exportAllDailyReports();
      if (!rawReports || rawReports.length === 0) {
        toast.dismiss(toastId);
        toast.info('No daily reports found to export.');
        setExporting(false);
        return;
      }

      toast.loading('Formatting worksheets...', { id: toastId });

      // Sheet 1: Overview
      const overviewData = rawReports.map(r => {
        const totalLabour = r.labour_entries?.reduce((sum: number, le: any) => sum + (le.count || 0), 0) || 0;
        const totalMaterialExpense = r.material_expense_entries?.reduce((sum: number, me: any) => sum + Number(me.amount || 0), 0) || 0;
        const totalLabourAdvance = r.labour_advance_entries?.reduce((sum: number, la: any) => sum + Number(la.amount || 0), 0) || 0;
        
        const siteData = r.site as any;
        const siteName = Array.isArray(siteData) ? siteData[0]?.site_name : siteData?.site_name;

        const supervisorData = r.supervisor as any;
        const supervisorName = Array.isArray(supervisorData) ? supervisorData[0]?.full_name : supervisorData?.full_name;

        return {
          'Report ID': r.report_id,
          'Date': r.report_date,
          'Site Name': siteName || 'N/A',
          'Supervisor': supervisorName || 'N/A',
          'Work Progress': r.work_progress || '',
          'Remarks/Obstacles': r.remarks || '',
          'Total Labourers': totalLabour,
          'Material Expense (₹)': totalMaterialExpense,
          'Labour Advance (₹)': totalLabourAdvance
        };
      });

      // Sheet 2: Labour Entries
      const labourData: any[] = [];
      rawReports.forEach(r => {
        const siteData = r.site as any;
        const siteName = Array.isArray(siteData) ? siteData[0]?.site_name : siteData?.site_name;
        r.labour_entries?.forEach((le: any) => {
          labourData.push({
            'Report ID': r.report_id,
            'Date': r.report_date,
            'Site Name': siteName || 'N/A',
            'Labour Type': le.labour_type || 'N/A',
            'Count': le.count || 0
          });
        });
      });

      // Sheet 3: Material Inwards
      const inwardData: any[] = [];
      rawReports.forEach(r => {
        const siteData = r.site as any;
        const siteName = Array.isArray(siteData) ? siteData[0]?.site_name : siteData?.site_name;
        r.material_inward_entries?.forEach((mi: any) => {
          inwardData.push({
            'Report ID': r.report_id,
            'Date': r.report_date,
            'Site Name': siteName || 'N/A',
            'Material Name': mi.material_name || 'N/A',
            'Quantity': mi.quantity || 0
          });
        });
      });

      // Sheet 4: Material Expenses
      const expenseData: any[] = [];
      rawReports.forEach(r => {
        const siteData = r.site as any;
        const siteName = Array.isArray(siteData) ? siteData[0]?.site_name : siteData?.site_name;
        r.material_expense_entries?.forEach((me: any) => {
          expenseData.push({
            'Report ID': r.report_id,
            'Date': r.report_date,
            'Site Name': siteName || 'N/A',
            'Material/Item Name': me.material_name || 'N/A',
            'Amount (₹)': me.amount || 0
          });
        });
      });

      // Sheet 5: Labour Advances
      const advanceData: any[] = [];
      rawReports.forEach(r => {
        const siteData = r.site as any;
        const siteName = Array.isArray(siteData) ? siteData[0]?.site_name : siteData?.site_name;
        r.labour_advance_entries?.forEach((la: any) => {
          advanceData.push({
            'Report ID': r.report_id,
            'Date': r.report_date,
            'Site Name': siteName || 'N/A',
            'Labour/Worker Name': la.labour_name || 'N/A',
            'Amount (₹)': la.amount || 0
          });
        });
      });

      // Sheet 6: Remaining Stock
      const stockData: any[] = [];
      rawReports.forEach(r => {
        const siteData = r.site as any;
        const siteName = Array.isArray(siteData) ? siteData[0]?.site_name : siteData?.site_name;
        r.remaining_stock_entries?.forEach((rs: any) => {
          stockData.push({
            'Report ID': r.report_id,
            'Date': r.report_date,
            'Site Name': siteName || 'N/A',
            'Material Name': rs.material_name || 'N/A',
            'Quantity/Stock': rs.quantity || ''
          });
        });
      });

      toast.loading('Compiling workbook...', { id: toastId });

      const wb = XLSX.utils.book_new();

      const sheets = [
        { data: overviewData, name: 'Overview' },
        { data: labourData, name: 'Labour Entries' },
        { data: inwardData, name: 'Material Inwards' },
        { data: expenseData, name: 'Material Expenses' },
        { data: advanceData, name: 'Labour Advances' },
        { data: stockData, name: 'Remaining Stock' }
      ];

      sheets.forEach(sheet => {
        const ws = XLSX.utils.json_to_sheet(sheet.data);
        
        // Auto-fit column widths
        if (sheet.data.length > 0) {
          const keys = Object.keys(sheet.data[0]);
          ws['!cols'] = keys.map(key => {
            let maxLen = key.length;
            sheet.data.forEach((row: any) => {
              const val = row[key];
              if (val !== null && val !== undefined) {
                const valStr = String(val);
                if (valStr.length > maxLen) {
                  maxLen = valStr.length;
                }
              }
            });
            return { wch: maxLen + 3 };
          });
        }
        
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      });

      const todayStr = getCurrentISTDateString();
      XLSX.writeFile(wb, `CDSMS_Master_Daily_Reports_${todayStr}.xlsx`);

      toast.success('Export completed successfully!', { id: toastId });
    } catch (err: any) {
      console.error('[ExcelExport] Error:', err);
      toast.error('Export failed: ' + (err.message || 'Unknown error'), { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center opacity-50">
          <div className="loader mb-4" style={{ width: '40px', height: '40px', '--loader-thickness': '6px' } as React.CSSProperties} />
          <p className="font-display uppercase tracking-widest text-xs">Initializing</p>
        </div>
      </div>
    );
  }

  const statItems = [
    // Always-current (not date-dependent)
    { label: 'Active Sites',      value: summary?.totalActiveSites ?? 0,               icon: Building2 },
    { label: 'Supervisors',       value: summary?.totalSupervisors ?? 0,                icon: Users     },
    // Date-range dependent
    { label: 'Reports in Range',  value: rangeSummary?.totalReports ?? 0,              icon: FileCheck },
    { label: 'Labour Present',    value: rangeSummary?.totalLabourPresent ?? 0,         icon: HardHat   },
    { label: 'Material Expenses', value: `₹${rangeSummary?.totalMaterialExpense ?? 0}`, icon: Hammer    },
    { label: 'Labour Advances',   value: `₹${rangeSummary?.totalLabourAdvance ?? 0}`,   icon: Wallet    },
  ];

  const submissionRate = (() => {
    const submitted = summary?.submittedInWindow || 0;
    const total = submitted + pendingSites.length;
    return total === 0 ? 100 : Math.round((submitted * 100) / total);
  })();
  const sitesPending   = pendingSites.length;
  const isHoliday      = summary?.todayIsHoliday     ?? false;
  const holidayName    = summary?.holidayName;

  const ratePieData = [
    { name: 'Submitted', value: submissionRate },
    { name: 'Pending',   value: 100 - submissionRate },
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="md:px-10">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <PageHeader
              title="Executive Overview"
              description="Real-time operational intelligence and site metrics"
              breadcrumbs={['Intelligence', 'Command Center']}
            />
          </div>
          <div className="flex-shrink-0 pt-6 md:pt-8">
            <Button
              onClick={handleExportExcel}
              disabled={exporting}
              className="h-9 w-9 md:h-11 md:w-auto md:px-6 bg-gradient-to-r from-[#D4AF37] to-[#B89220] hover:from-[#E5C048] hover:to-[#C9A32F] text-black hover:text-black font-display text-[11px] font-black uppercase tracking-[0.15em] shadow-xl shadow-[#D4AF37]/15 rounded-lg md:rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 border border-[#D4AF37]/20"
              title="Export Master Excel"
            >
              {exporting ? (
                <RefreshCw className="w-4 h-4 md:w-[15px] md:h-[15px] animate-spin text-black" />
              ) : (
                <FileDown className="w-4 h-4 md:w-[15px] md:h-[15px] text-black" />
              )}
              <span className="hidden md:inline">
                {exporting ? 'Compiling...' : 'Export Master Excel'}
              </span>
            </Button>
          </div>
        </div>
        <KpiStrip items={statItems} />

        {/* ── Holiday banner (full width, below KPIs) ── */}
        {isHoliday && (
          <div className="flex items-center gap-3 md:gap-4 glass-panel rounded-xl border border-accent/40 bg-accent/5 px-4 md:px-6 py-3 md:py-4 mb-6">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
              <PartyPopper size={18} className="md:size-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs md:text-sm font-display font-bold text-accent uppercase tracking-widest">
                Today is a Holiday — {holidayName}
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 font-sans">
                Report submissions are not required today
              </p>
            </div>
            <span className="hidden sm:block text-[10px] font-display uppercase tracking-widest px-3 py-1.5 rounded-full bg-accent/15 text-accent border border-accent/25">
              No Reports Required
            </span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            Main 2-column layout
            Left  (xl:col-span-2) → all charts, stacked
            Right (xl:col-span-1) → alerts panel, pinned top-right
            ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* ── LEFT: Charts column ── */}
          <div className="xl:col-span-2 space-y-6 min-w-0">

            {/* ── Date Range Filter Bar ── */}
            <div className="glass-panel rounded-xl p-4 md:p-5 space-y-5 shadow-xl relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              {/* Row 1: Header */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <CalendarRange size={20} className="text-accent drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base md:text-lg font-display font-black uppercase tracking-[0.25em] text-foreground leading-none">Chart Intelligence</h3>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1.5 font-medium tracking-widest uppercase opacity-50">Filter executive dashboard data</p>
                </div>
                <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-border/40 to-transparent ml-6" />
              </div>
              
              {/* Row 2: Controls & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 relative z-10">
                {/* Filters Group (Left) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-2xl">
                  {/* Site Picker */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 ml-1">
                      <Building2 size={10} className="text-accent/60" />
                      <label className="text-[9px] font-display font-black uppercase tracking-[0.15em] text-muted-foreground/60">Location Site</label>
                    </div>
                    <div className="relative group">
                      <select 
                        value={siteId}
                        onChange={e => setSiteId(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-border bg-background/40 text-foreground text-[10px] font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent/40 transition-all cursor-pointer appearance-none shadow-sm hover:bg-background/60"
                      >
                        <option value="all">Global (All Sites)</option>
                        {allSites.map(site => (
                          <option key={site.siteId} value={site.siteId.toString()}>{site.siteName}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                        <ChevronRight size={12} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* From Date */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 ml-1">
                      <Calendar size={10} className="text-accent/60" />
                      <label className="text-[9px] font-display font-black uppercase tracking-[0.15em] text-muted-foreground/60">Range Start</label>
                    </div>
                    <input
                      type="date"
                      value={fromDate}
                      max={toDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background/40 text-foreground text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent/40 transition-all hover:bg-background/60"
                    />
                  </div>

                  {/* To Date */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 ml-1">
                      <Calendar size={10} className="text-accent/60" />
                      <label className="text-[9px] font-display font-black uppercase tracking-[0.15em] text-muted-foreground/60">Range End</label>
                    </div>
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      max={today}
                      onChange={e => setToDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background/40 text-foreground text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-accent/20 focus:border-accent/40 transition-all hover:bg-background/60"
                    />
                  </div>
                </div>

                {/* Actions Group (Right) */}
                <div className="flex items-center gap-3 lg:border-l lg:pl-5 border-border/30">
                  <Button
                    onClick={handleApplyFilter}
                    disabled={chartsLoading}
                    className="flex-1 lg:flex-none h-10 px-8 bg-accent text-background hover:bg-accent/90 font-display text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-accent/20 rounded-xl transition-all active:scale-[0.97]"
                  >
                    {chartsLoading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      'Apply Filter'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={resetDates}
                    className="h-10 w-10 p-0 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all rounded-xl border border-border/40 hover:border-accent/30 flex items-center justify-center bg-background/20"
                    title="Reset Filters"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4 md:p-6 ring-1 ring-white/10 dark:ring-white/5 shadow-2xl transition-all duration-300 hover:shadow-accent/5">
              <SectionHeading
                title="Workforce Mobilization Trend"
                description="Total field labour presence over time"
                action={
                  <div className="flex items-center text-xs font-display tracking-widest text-accent uppercase">
                    <TrendingUp className="w-4 h-4 mr-1.5" /> Live
                  </div>
                }
              />
              <div className="h-44 md:h-56 w-full mt-4">
                {labourTrend.length === 0
                  ? <EmptyChart message="No labour data yet. Submit reports to populate this chart." />
                  : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <AreaChart data={labourTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colLabour" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}    />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                        <XAxis dataKey="date" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} dy={8} />
                        <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                        <Tooltip {...TOOLTIP_STYLE} itemStyle={{ color: '#D4AF37' }} />
                        <Area type="monotone" dataKey="value" name="Workers" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colLabour)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
              </div>
              {/* Total Summary Footer */}
              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Range Mobilization</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-display font-black text-foreground">
                    {labourTrend.reduce((sum, item) => sum + (item.value || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-accent mt-0.5">Total Man-Days</span>
                </div>
              </div>
            </div>

            {/* Chart 2 & 3 – Material Inward + Expense side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              <div className="glass-panel rounded-xl p-6 ring-1 ring-white/10 dark:ring-white/5 shadow-xl transition-all duration-300 hover:shadow-accent/5 hover:-translate-y-0.5 min-w-0">
                <SectionHeading
                  title="Material Inward"
                  description="Units received by date"
                  action={<Package size={15} className="text-accent" />}
                />
                <div className="h-48 w-full mt-4">
                  {materialTrend.length === 0
                    ? <EmptyChart message="No material data yet." />
                    : (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={materialTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                          <XAxis dataKey="date" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} dy={8} />
                          <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} dx={-8} />
                          <Tooltip {...TOOLTIP_STYLE} itemStyle={{ color: '#10B981' }} />
                          <Line type="monotone" dataKey="value" name="Units" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                </div>
                {/* Total Summary Footer */}
                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Inward Volume</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-display font-black text-foreground">
                      {materialTrend.reduce((sum, item) => sum + (item.value || 0), 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-display font-bold uppercase tracking-widest text-emerald-500 mt-0.5">Total Units</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-6 ring-1 ring-white/10 dark:ring-white/5 shadow-xl transition-all duration-300 hover:shadow-accent/5 hover:-translate-y-0.5 min-w-0">
                <SectionHeading
                  title="Material Expenses"
                  description="₹ outlay by date"
                  action={<Hammer size={15} className="text-accent" />}
                />
                <div className="h-48 w-full mt-4">
                  {expenseTrend.length === 0
                    ? <EmptyChart message="No expense data yet." />
                    : (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={expenseTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                          <XAxis dataKey="date" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} dy={8} />
                          <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} dx={-8} />
                          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'var(--muted)' }} itemStyle={{ color: '#3B82F6' }} />
                          <Bar dataKey="amount" name="₹ Expenses" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                </div>
                {/* Total Summary Footer */}
                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">Expenditure</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-display font-black text-foreground leading-none">
                      ₹{expenseTrend.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-display font-bold uppercase tracking-widest text-blue-500 mt-0.5">Total Outlay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 4 – Reports per site */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              <div className="glass-panel rounded-xl p-6 ring-1 ring-white/10 dark:ring-white/5 shadow-xl transition-all duration-300 hover:shadow-accent/5 hover:-translate-y-0.5 min-w-0">
                <SectionHeading
                  title="Inventory Intelligence"
                  description="Aggregated remaining stock across all sites"
                  action={<Package size={15} className="text-accent" />}
                />
                <div className="h-56 w-full mt-4">
                  {remainingStock.length === 0
                    ? <EmptyChart message="No inventory data yet." />
                    : (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={remainingStock} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                          <XAxis dataKey="name" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} dy={8} />
                          <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} dx={-8} />
                          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'var(--muted)' }} itemStyle={{ color: '#F59E0B' }} />
                          <Bar dataKey="value" name="Qty" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                </div>
              </div>

              <div className="glass-panel rounded-xl p-6 ring-1 ring-white/10 dark:ring-white/5 shadow-xl transition-all duration-300 hover:shadow-accent/5 hover:-translate-y-0.5 min-w-0">
                <SectionHeading
                  title="Reports per Site"
                  description="Total historical submissions grouped by site"
                  action={<BarChart2 size={15} className="text-accent" />}
                />
                <div className="h-56 w-full mt-4">
                  {siteReportCount.length === 0
                    ? <EmptyChart message="No site report data yet." />
                    : (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={siteReportCount} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID} />
                          <XAxis type="number" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="siteName" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} width={130} />
                          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'var(--muted)' }} itemStyle={{ color: '#D4AF37' }} />
                          <Bar dataKey="reportCount" name="Reports" radius={[0, 4, 4, 0]} maxBarSize={20}>
                            {siteReportCount.map((_: any, i: number) => (
                              <Cell key={i} fill={SITE_COLORS[i % SITE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Alerts panel (sticky top) ── */}
          <div className="xl:col-span-1 space-y-4 xl:sticky xl:top-6 min-w-0">

            {/* Submission Rate Gauge */}
            <div className="glass-panel rounded-xl sm:p-6 p-4 ring-1 ring-white/10 dark:ring-white/5 shadow-xl">
              <h4 className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Operational Compliance
              </h4>
              <div className="flex flex-col items-center gap-2">
                <div className="relative sm:w-36 sm:h-36 w-28 h-28">
                  <PieChart width={112} height={112} className="sm:hidden block">
                    <Pie
                      data={ratePieData}
                      cx="50%" cy="50%"
                      innerRadius={36} outerRadius={48}
                      startAngle={90} endAngle={-270}
                      dataKey="value" strokeWidth={0}
                    >
                      <Cell fill="#D4AF37" />
                      <Cell fill="var(--muted)" />
                    </Pie>
                  </PieChart>
                  <PieChart width={144} height={144} className="hidden sm:block">
                    <Pie
                      data={ratePieData}
                      cx="50%" cy="50%"
                      innerRadius={44} outerRadius={60}
                      startAngle={90} endAngle={-270}
                      dataKey="value" strokeWidth={0}
                    >
                      <Cell fill="#D4AF37" />
                      <Cell fill="var(--muted)" />
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="sm:text-2xl text-xl font-display font-bold text-accent">{submissionRate}%</span>
                    <span className="text-[8px] font-display uppercase tracking-widest text-muted-foreground">Submitted</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-display uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                  isHoliday
                    ? 'bg-accent/10 text-accent border-accent/20'
                    : submissionRate < 100
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isHoliday
                    ? <><PartyPopper size={11} /> Holiday</>
                    : submissionRate < 100
                      ? <><AlertTriangle size={11} /> {sitesPending} pending</>
                      : <><FileCheck size={11} /> All submitted</>}
                </div>
              </div>
            </div>

            {/* Submission alert — hidden on holidays */}
            {!isHoliday && (
              <div className={`glass-panel sm:p-4 p-2.5 rounded-xl border flex sm:gap-3 gap-2 items-start transition-all ${
                submissionRate < 100
                  ? 'border-amber-500/20 bg-amber-500/5'
                  : 'border-emerald-500/20 bg-emerald-500/5'
              }`}>
                <div className={`mt-0.5 flex-shrink-0 ${submissionRate < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {submissionRate < 100 
                    ? <AlertTriangle className="sm:w-4 sm:h-4 w-3.5 h-3.5" /> 
                    : <Info className="sm:w-4 sm:h-4 w-3.5 h-3.5" />}
                </div>
                <div>
                  <p className={`text-xs font-display font-bold ${submissionRate < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {submissionRate < 100 ? 'Compliance Alerts' : 'Excellence in Reporting'}
                  </p>
                  <p className="sm:text-xs text-[10px] text-muted-foreground sm:mt-1 mt-0.5 font-sans leading-relaxed">
                    {submissionRate < 100
                      ? `Overall compliance at ${submissionRate}%. ${sitesPending} missing report${sitesPending !== 1 ? 's' : ''} detected.`
                      : 'All sites have maintained perfect reporting compliance since commissioning.'}
                  </p>
                </div>
              </div>
            )}

            {/* No sites info */}
            {summary?.totalActiveSites === 0 && (
              <div className="glass-panel p-4 rounded-xl border border-border flex gap-3 items-start">
                <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-display font-bold text-blue-400">No Sites Commissioned</p>
                  <p className="text-xs text-muted-foreground mt-1 font-sans leading-relaxed">
                    Add sites from the Sites panel to begin tracking
                  </p>
                </div>
              </div>
            )}

            <div className="glass-panel rounded-xl sm:p-5 p-3.5 border border-border flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground">
                  Missing Daily Reports
                </h4>
                {totalPendingPages > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-muted-foreground mr-1">
                      {pendingPage + 1} / {totalPendingPages}
                    </span>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" size="icon" 
                        onClick={() => setPendingPage(p => Math.max(0, p - 1))}
                        disabled={pendingPage === 0}
                        className="h-5 w-5 rounded-md border border-border/50 disabled:opacity-30"
                      >
                        <ChevronLeft size={10} />
                      </Button>
                      <Button 
                        variant="ghost" size="icon" 
                        onClick={() => setPendingPage(p => Math.min(totalPendingPages - 1, p + 1))}
                        disabled={pendingPage === totalPendingPages - 1}
                        className="h-5 w-5 rounded-md border border-border/50 disabled:opacity-30"
                      >
                        <ChevronRight size={10} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {pendingSites.length === 0 ? (
                <div className="py-8 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 border border-emerald-500/20">
                    <FileCheck size={18} className="text-emerald-400" />
                  </div>
                  <p className="text-xs font-medium text-emerald-400">Compliance Maintained</p>
                  <p className="text-[10px] text-muted-foreground mt-1">No pending reports for monitored dates</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {paginatedPending.map((site: any) => (
                    <div key={`${site.siteId}-${site.pendingDate}`} className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground truncate">{site.siteName}</p>
                          <span className="text-[8px] font-mono px-1.5 py-0.5 bg-muted text-muted-foreground rounded border border-border">
                            {site.pendingDate === getCurrentISTDateString() ? 'Today' : site.pendingDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={9} className="text-muted-foreground flex-shrink-0" />
                          <p className="text-[10px] text-muted-foreground truncate">{site.siteLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" size="sm" 
                          onClick={() => handleMarkNoWork(site.siteId, site.pendingDate)}
                          className="h-6 px-2 text-[9px] font-display uppercase tracking-widest text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 border border-transparent hover:border-amber-400/20"
                        >
                          Exempt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exempted sites list */}
            {exemptedSites.length > 0 && (
              <div className="glass-panel rounded-xl sm:p-5 p-3.5 border border-border">
                <h4 className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Exempted for Today
                </h4>
                <div className="space-y-3">
                  {exemptedSites.map((site: any) => (
                    <div key={site.siteId} className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="min-w-0 opacity-50">
                        <p className="text-xs font-medium text-foreground truncate line-through">{site.siteName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={9} className="text-muted-foreground flex-shrink-0" />
                          <p className="text-[10px] text-muted-foreground truncate">{site.siteLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-sans px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 whitespace-nowrap">
                          No Work
                        </span>
                        <Button 
                          variant="ghost" size="sm" 
                          onClick={() => handleUnexempt(site.siteId)}
                          className="h-6 px-2 text-[9px] font-display uppercase tracking-widest text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 border border-transparent hover:border-emerald-400/20"
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
