'use client';

import { useEffect, useState } from 'react';
import { getHolidays, createHoliday, deleteHoliday } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CalendarDays, Plus, Trash2, PartyPopper, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';
import { createClient } from '@/lib/supabase/client';
import { getCurrentISTDateString } from '@/lib/date-utils';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    fetchHolidays(); 
    
    const supabase = createClient();
    const channel = supabase
      .channel('holidays_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'holidays' },
        () => {
          fetchHolidays();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHolidays = async () => {
    try {
      const data = await getHolidays();
      setHolidays(data);
    } catch {
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createHoliday({ date, toDate, name, description });
      if (result.error) throw new Error(result.error);
      toast.success(toDate ? `Holidays declared successfully` : `Holiday "${name}" declared successfully`);
      setShowForm(false);
      setDate(''); setToDate(''); setName(''); setDescription('');
      fetchHolidays();
    } catch (err: any) {
      toast.error(err.message || 'A holiday already exists on this date');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, hname: string) => {
    if (!confirm(`Remove holiday "${hname}"?`)) return;
    try {
      await deleteHoliday(id);
      toast.success('Holiday removed');
      fetchHolidays();
    } catch {
      toast.error('Failed to remove holiday');
    }
  };

  // Group holidays by year/month
  const grouped: Record<string, any[]> = {};
  holidays.forEach(h => {
    const d = new Date(h.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(h);
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="md:px-10">
        <PageHeader
          title="Holiday Calendar"
          description="Declare company holidays. Report requirements are waived on these dates."
          breadcrumbs={['Management', 'Holidays']}
        />
        <SectionHeading
          title="Declared Holidays"
          action={
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-accent hover:bg-accent/90 text-background font-bold tracking-wide shadow-lg shadow-accent/20"
            >
              <Plus size={16} className="mr-2" />
              Declare Holiday
            </Button>
          }
        />

        {/* ── Declare Form ── */}
        {showForm && (
          <div className="glass-panel p-6 rounded-xl border border-accent/30 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
            <h4 className="text-base font-display uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
              <CalendarDays size={18} className="text-accent" /> New Holiday Declaration
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">From Date</Label>
                <Input
                  type="date"
                  className="bg-background/50 border-border h-11 focus:border-accent"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">To Date (Optional Range)</Label>
                <Input
                  type="date"
                  className="bg-background/50 border-border h-11 focus:border-accent"
                  value={toDate}
                  min={date}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Holiday Name</Label>
                <Input
                  className="bg-background/50 border-border h-11 focus:border-accent"
                  placeholder="e.g. Diwali, Christmas, Republic Day"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description (optional)</Label>
                <Input
                  className="bg-background/50 border-border h-11 focus:border-accent"
                  placeholder="Additional details about this holiday..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-accent text-background hover:bg-accent/90 px-8">
                  {submitting ? 'Saving...' : 'Declare Holiday'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Holiday List ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-panel rounded-xl border border-border p-5 h-20 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : holidays.length === 0 ? (
          <div className="glass-panel rounded-xl border border-border p-16 text-center">
            <Calendar size={40} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-display uppercase tracking-widest text-sm">No holidays declared yet</p>
            <p className="text-muted-foreground/50 font-sans text-xs mt-2">Declare a holiday to waive report submission for that day</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(grouped).sort().map(groupKey => {
              const d = new Date(grouped[groupKey][0].date);
              const monthLabel = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
              return (
                <div key={groupKey}>
                  <p className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">{monthLabel}</p>
                  <div className="space-y-2">
                    {grouped[groupKey].map((h: any) => {
                      const hDate = new Date(h.date);
                      const dayNum = hDate.getDate();
                      const dayName = hDate.toLocaleDateString('en-US', { weekday: 'short' });
                      const isToday = h.date === getCurrentISTDateString();
                      return (
                        <div
                          key={h.id}
                          className={`glass-panel rounded-xl border p-4 flex items-center gap-4 transition-all ${isToday ? 'border-accent/40 bg-accent/5' : 'border-border hover:border-accent/20'
                            }`}
                        >
                          {/* Day pill */}
                          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border flex-shrink-0 ${isToday ? 'bg-accent/15 border-accent/30' : 'bg-muted border-border'
                            }`}>
                            <span className={`text-[10px] font-display uppercase tracking-widest ${isToday ? 'text-accent' : 'text-muted-foreground'}`}>{dayName}</span>
                            <span className={`text-lg font-bold leading-none ${isToday ? 'text-accent' : 'text-foreground'}`}>{dayNum}</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">{h.name}</span>
                              {isToday && (
                                <span className="text-[9px] font-display uppercase tracking-widest px-2 py-0.5 bg-accent/15 text-accent border border-accent/25 rounded-full flex items-center gap-1">
                                  <PartyPopper size={9} /> Today
                                </span>
                              )}
                            </div>
                            {h.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">{h.date}</p>
                          </div>

                          {/* Delete */}
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleDelete(h.id, h.name)}
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-400/10 flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
