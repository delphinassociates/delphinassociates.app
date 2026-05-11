'use client';

import { useEffect, useState } from 'react';
import { getAllSites, createSite, updateSite, deleteSite, getExemptedSites, markNoWork, restoreWork } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, MapPin, Building, User, AlertTriangle, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';
import { motion, AnimatePresence } from 'framer-motion';

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [exemptedIds, setExemptedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchSites(); }, []);

  const fetchSites = async () => {
    try {
      const [siteData, exData] = await Promise.all([
        getAllSites(),
        getExemptedSites()
      ]);
      setSites(siteData as any);
      setExemptedIds(exData.map((s: any) => s.siteId));
    } catch {
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const handleExemptToday = async (siteId: number) => {
    try {
      await markNoWork(siteId, new Date().toISOString().split('T')[0], 'Marked as no work from Site Management');
      setExemptedIds(prev => [...prev, siteId]);
      toast.success('Site exempted from today\'s reports');
    } catch {
      toast.error('Failed to exempt site');
    }
  };

  const handleRestoreToday = async (siteId: number) => {
    try {
      await restoreWork(siteId, new Date().toISOString().split('T')[0]);
      setExemptedIds(prev => prev.filter(id => id !== siteId));
      toast.success('Site restored to active monitoring');
    } catch {
      toast.error('Failed to restore site');
    }
  };

  const handleEdit = (site: any) => {
    setEditingId(site.siteId);
    setSiteName(site.siteName);
    setSiteLocation(site.siteLocation);
    setClientName(site.clientName);
    setProjectType(site.projectType || '');
    setStatus(site.status);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<any>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const handleDeleteClick = (site: any) => {
    setSiteToDelete(site);
    setDeleteConfirmInput('');
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!siteToDelete || deleteConfirmInput !== siteToDelete.siteName) return;
    
    try {
      await deleteSite(siteToDelete.siteId);
      toast.success('Site and associated data removed');
      setIsDeleteDialogOpen(false);
      fetchSites();
    } catch {
      toast.error('Failed to remove site');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSiteName(''); setSiteLocation(''); setClientName(''); setProjectType(''); setStatus('ACTIVE');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { siteName, siteLocation, clientName, projectType, status };
    try {
      if (editingId) {
        await updateSite(editingId, payload);
        toast.success('Site configuration updated');
      } else {
        await createSite(payload);
        toast.success('New site commissioned');
      }
      resetForm();
      fetchSites();
    } catch (error: any) {
      toast.error('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (s: string) =>
    s === 'ACTIVE'     ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
    s === 'COMPLETED'  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                         'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="md:px-10">
        <PageHeader
          title="Construction Sites"
          description="Manage active projects, locations, and client assignments."
          breadcrumbs={['Management', 'Sites']}
        />
        <SectionHeading
          title="Project Portfolio"
          action={
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-background font-bold tracking-wide shadow-lg shadow-accent/20"
            >
              <Plus size={16} className="mr-2" />
              Commission New Site
            </Button>
          }
        />

        {/* ── Commission / Edit Form ── */}
        {showForm && (
          <div className="glass-panel p-5 md:p-6 rounded-xl border border-accent/30 mb-8 accent-glow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
            <h4 className="text-base md:text-lg font-display uppercase tracking-widest text-foreground mb-6">
              {editingId ? 'Modify Site Configuration' : 'Site Commissioning Form'}
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Site Name</Label>
                <Input className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent" value={siteName} onChange={e => setSiteName(e.target.value)} required />
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Location</Label>
                <Input className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent" value={siteLocation} onChange={e => setSiteLocation(e.target.value)} required />
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Client Name</Label>
                <Input className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent" value={clientName} onChange={e => setClientName(e.target.value)} required />
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Project Classification</Label>
                <Input className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent" value={projectType} onChange={e => setProjectType(e.target.value)} placeholder="e.g. Commercial High-rise" />
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Operational Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val || '')}>
                  <SelectTrigger className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active Deployment</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold / Suspended</SelectItem>
                    <SelectItem value="COMPLETED">Project Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 mt-2">
                <Button type="button" variant="ghost" onClick={resetForm} className="text-muted-foreground hover:text-foreground h-10 md:h-auto">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-accent text-background hover:bg-accent/90 px-8 h-12 md:h-auto font-bold sm:font-normal">
                  {submitting ? 'Processing...' : 'Confirm Configuration'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Site Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-panel rounded-xl border border-border p-5 h-44 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="glass-panel rounded-xl border border-border p-16 text-center">
            <MapPin size={40} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-display uppercase tracking-widest text-sm">No sites commissioned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site: any) => (
              <div
                key={site.siteId}
                className="glass-panel rounded-xl border border-border p-4 md:p-5 flex flex-col gap-3 md:gap-4 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.07)] transition-all duration-200 group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-[13px] h-[13px] md:w-[15px] md:h-[15px] text-accent" />
                    </div>
                    <span className="text-xs md:text-sm font-display font-bold text-foreground truncate leading-tight">{site.siteName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[8px] md:text-[9px] font-display uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 rounded-md border flex-shrink-0 ${statusStyle(site.status)}`}>
                      {site.status?.replace('_', ' ')}
                    </span>
                    {exemptedIds.includes(site.siteId) && (
                      <span className="text-[8px] md:text-[9px] font-display uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 rounded-md border flex-shrink-0 bg-blue-500/10 text-blue-400 border-blue-500/20">
                        No Work Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata rows */}
                <div className={`flex flex-col gap-1.5 md:gap-2 text-[11px] md:text-xs ${exemptedIds.includes(site.siteId) ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-2">
                    <MapPin size={11} className="text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-muted-foreground/60 font-display uppercase tracking-widest text-[8px] md:text-[9px] w-12 md:w-14 flex-shrink-0">Location</span>
                    <span className={`truncate text-foreground/80 ${exemptedIds.includes(site.siteId) ? 'line-through' : ''}`}>{site.siteLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={11} className="text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-muted-foreground/60 font-display uppercase tracking-widest text-[8px] md:text-[9px] w-12 md:w-14 flex-shrink-0">Client</span>
                    <span className="truncate text-foreground/80">{site.clientName}</span>
                  </div>
                  {site.projectType && (
                    <div className="flex items-center gap-2">
                      <Building size={11} className="text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-muted-foreground/60 font-display uppercase tracking-widest text-[8px] md:text-[9px] w-12 md:w-14 flex-shrink-0">Type</span>
                      <span className="truncate text-foreground/80">{site.projectType}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2.5 md:pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    {exemptedIds.includes(site.siteId) ? (
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleRestoreToday(site.siteId)}
                        className="h-7 md:h-8 px-2 md:px-2.5 text-[9px] md:text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg border border-transparent hover:border-emerald-400/20"
                      >
                        Restore Today
                      </Button>
                    ) : (
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleExemptToday(site.siteId)}
                        className="h-7 md:h-8 px-2 md:px-2.5 text-[9px] md:text-[10px] text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 rounded-lg border border-transparent hover:border-amber-400/20"
                      >
                        Exempt Today
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleEdit(site)}
                      className="h-7 md:h-8 px-2 md:px-2.5 text-[10px] md:text-xs text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg gap-1 md:gap-1.5"
                    >
                      <Edit2 className="w-[11px] h-[11px] md:w-[12px] md:h-[12px]" /> Edit
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleDeleteClick(site)}
                      className="h-7 md:h-8 px-2 md:px-2.5 text-[10px] md:text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg gap-1 md:gap-1.5"
                    >
                      <Trash2 className="w-[11px] h-[11px] md:w-[12px] md:h-[12px]" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDeleteDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl border border-red-500/20 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-500" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground uppercase tracking-wider">Confirm Removal</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Dangerous Action</p>
                </div>
                <button 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="ml-auto p-2 text-muted-foreground hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                  <p className="text-xs text-red-200/70 leading-relaxed">
                    This action is <span className="font-bold text-red-400 underline">permanent</span>. Removing this site will immediately purge all associated daily reports, material logs, and workforce data from the central database.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Type <span className="text-foreground font-bold normal-case px-1 bg-white/5 rounded border border-white/10">{siteToDelete?.siteName}</span> to confirm
                  </Label>
                  <Input 
                    placeholder="Enter site name"
                    className="bg-background/40 border-border focus:border-red-500 h-12 text-sm font-medium"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-12 text-xs font-bold uppercase tracking-widest"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={deleteConfirmInput !== siteToDelete?.siteName}
                    onClick={handleConfirmDelete}
                  >
                    Delete Site
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
