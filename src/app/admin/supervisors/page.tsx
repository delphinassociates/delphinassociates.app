'use client';

import { useEffect, useState } from 'react';
import { getSupervisors, createSupervisor, updateSupervisor, deleteSupervisor, toggleUserStatus } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Phone, Calendar, User, Eye, EyeOff, CheckCircle2, XCircle, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import { SectionHeading } from '@/components/ui/custom/SectionHeading';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pwRules = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One symbol (!@#$...)', valid: /[^A-Za-z0-9]/.test(password) },
  ];
  const passwordValid = pwRules.every(r => r.valid);

  useEffect(() => { fetchSupervisors(); }, []);

  const fetchSupervisors = async () => {
    try {
      const data = await getSupervisors();
      setSupervisors(data as any);
    } catch {
      toast.error('Failed to load supervisors');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sup: any) => {
    setEditingId(sup.id);
    setFullName(sup.fullName);
    setUsername(sup.username);
    setPassword(''); // Don't show old password
    setMobileNumber(sup.mobileNumber || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Warning: Deleting a supervisor account is permanent. Proceed?')) return;
    try {
      await deleteSupervisor(id);
      toast.success('Personnel record removed');
      fetchSupervisors();
    } catch (error: any) {
      toast.error('Failed to remove supervisor');
    }
  };

  const handleToggleStatus = async (id: number, current: boolean) => {
    try {
      await toggleUserStatus(id, current);
      toast.success('Account status updated');
      fetchSupervisors();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFullName(''); setUsername(''); setPassword(''); setMobileNumber('');
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate password if it's a new account OR if user is trying to change it
    if (!editingId || (password.length > 0)) {
      if (!passwordValid) {
        toast.error('Password does not meet security requirements');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = { fullName, username, password: password || null, mobileNumber };
      if (editingId) {
        const result = await updateSupervisor(editingId, payload);
        if (result.error) throw new Error(result.error);
        toast.success('Supervisor profile updated');
      } else {
        const result = await createSupervisor(payload);
        if (result.error) throw new Error(result.error);
        toast.success('New supervisor provisioned');
      }
      resetForm();
      fetchSupervisors();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate a deterministic avatar color from name
  const avatarColor = (name: string) => {
    const colors = ['bg-violet-500/20 text-violet-400 border-violet-500/20',
                    'bg-sky-500/20 text-sky-400 border-sky-500/20',
                    'bg-rose-500/20 text-rose-400 border-rose-500/20',
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
                    'bg-amber-500/20 text-amber-400 border-amber-500/20'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="md:px-10">
        <PageHeader
          title="Field Supervisors"
          description="Manage personnel credentials and contact information."
          breadcrumbs={['Management', 'Supervisors']}
        />
        <SectionHeading
          title="Active Personnel"
          action={
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-background font-bold tracking-wide shadow-lg shadow-accent/20"
            >
              <UserPlus size={16} className="mr-2" />
              Provision Account
            </Button>
          }
        />

        {/* ── Provision Form ── */}
        {showForm && (
          <div className="glass-panel p-6 rounded-xl border border-accent/30 mb-8 accent-glow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
            <h4 className="text-lg font-display uppercase tracking-widest text-foreground mb-6">
              {editingId ? 'Modify Personnel Profile' : 'New Supervisor Provisioning'}
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
                <Input className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Username</Label>
                <Input className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">
                  {editingId ? 'Change Password (Optional)' : 'Security Password'}
                </Label>
                <div className="relative">
                  <Input
                    className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent pr-10 md:pr-12"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required={!editingId}
                    placeholder={editingId ? 'Leave blank to keep current' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-10 md:h-12 w-10 md:w-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  </button>
                </div>
                {/* Strength rules */}
                {password.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 md:pt-1.5">
                    {pwRules.map(rule => (
                      <div key={rule.label} className={`flex items-center gap-1 text-[9px] md:text-[10px] transition-colors ${rule.valid ? 'text-emerald-400' : 'text-muted-foreground/60'}`}>
                        {rule.valid
                          ? <CheckCircle2 className="w-2.5 h-2.5 md:w-[11px] md:h-[11px] flex-shrink-0" />
                          : <XCircle className="w-2.5 h-2.5 md:w-[11px] md:h-[11px] flex-shrink-0" />}
                        {rule.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2 md:space-y-3">
                <Label className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Mobile Number</Label>
                <Input className="bg-background/50 border-border h-10 md:h-12 text-sm md:text-base focus:border-accent" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 mt-4 pt-4 border-t border-border/30">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm} 
                  className="text-muted-foreground hover:text-foreground h-11 md:h-12 px-6 border-border/50 hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="bg-accent text-background hover:bg-accent/90 px-10 h-11 md:h-12 font-bold uppercase tracking-widest text-xs shadow-lg shadow-accent/10"
                >
                  {submitting ? 'Processing...' : (editingId ? 'Update Profile' : 'Confirm Provisioning')}
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-panel rounded-xl border border-border p-4 md:p-5 h-32 md:h-36 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : supervisors.length === 0 ? (
          <div className="glass-panel rounded-xl border border-border p-16 text-center">
            <User size={40} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-display uppercase tracking-widest text-sm">No personnel records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {supervisors.map((sup: any) => {
              const initials = sup.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={sup.id}
                  className="glass-panel rounded-xl border border-border p-4 md:p-5 flex flex-col gap-3 md:gap-4 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.07)] transition-all duration-200"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl border flex items-center justify-center font-display font-bold text-xs md:text-sm flex-shrink-0 ${avatarColor(sup.fullName)}`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs md:text-sm font-semibold truncate ${sup.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{sup.fullName}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">@{sup.username}</p>
                    </div>
                    <span className={`text-[8px] md:text-[9px] font-display uppercase tracking-widest px-2 py-0.5 rounded-md border flex-shrink-0 ${
                      sup.enabled 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {sup.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col gap-1.5 md:gap-2 pt-2 md:pt-2.5 border-t border-border/50 text-[10px] md:text-xs text-muted-foreground">
                    {sup.mobileNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-2.5 h-2.5 md:w-3 md:h-3 text-muted-foreground/50 flex-shrink-0" />
                        <span>{sup.mobileNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 text-muted-foreground/50 flex-shrink-0" />
                      <span>Joined {new Date(sup.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 md:gap-2 pt-2 md:pt-3 border-t border-border/30">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleToggleStatus(sup.id, sup.enabled)}
                      className={`h-7 md:h-8 px-2.5 md:px-3 text-[10px] md:text-xs rounded-lg gap-1 md:gap-1.5 transition-colors ${
                        sup.enabled 
                          ? 'text-rose-400 hover:text-rose-500 hover:bg-rose-500/10' 
                          : 'text-emerald-400 hover:text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                    >
                      {sup.enabled ? <PowerOff className="w-[11px] h-[11px] md:w-[12px] md:h-[12px]" /> : <Power className="w-[11px] h-[11px] md:w-[12px] md:h-[12px]" />}
                      {sup.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleEdit(sup)}
                      className="h-7 md:h-8 px-2.5 md:px-3 text-[10px] md:text-xs text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg gap-1 md:gap-1.5"
                    >
                      <Edit2 className="w-[11px] h-[11px] md:w-[12px] md:h-[12px]" /> Edit
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleDelete(sup.id)}
                      className="h-7 md:h-8 px-2.5 md:px-3 text-[10px] md:text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg gap-1 md:gap-1.5"
                    >
                      <Trash2 className="w-[11px] h-[11px] md:w-[12px] md:h-[12px]" /> Remove
                    </Button>
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
