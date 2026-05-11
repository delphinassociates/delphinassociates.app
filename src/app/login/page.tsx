'use client';

import { useState } from 'react';
// Removed AuthContext and axios imports
// import { useAuth } from '@/context/AuthContext';
// import api from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, ShieldAlert, ArrowRight, Eye, EyeOff, User, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const result = await login(formData);
      
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      // Next.js redirect() throws a special error that should NOT be caught as a generic error
      // In server actions, we usually don't catch redirects, but if we do, we check if it's a redirect
      if (err.message === 'NEXT_REDIRECT') {
        throw err;
      }
      
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans">
      
      {/* ── LEFT PANEL: Authentication ── */}
      <div className="w-full lg:w-[45%] xl:w-[40%] min-h-screen flex flex-col justify-start lg:justify-center pt-12 lg:pt-0 px-8 sm:px-16 lg:px-20 xl:px-24 relative z-10 border-r border-border bg-background">
        
        {/* Mobile Logo (hidden on desktop) */}
        <div className="lg:hidden mb-0 text-center animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <div className="w-48 h-48 mx-auto mb-2 drop-shadow-[0_0_30px_rgba(212,175,55,0.25)]">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full max-w-md mx-auto animate-in zoom-in-95 duration-500 fade-in">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-display font-bold tracking-tight text-foreground mb-2">Secure Gateway</h2>
            <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
              Enter your credentials to proceed
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border border-red-500/20 text-red-400">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="ml-2 font-sans text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  id="username" 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  className="bg-muted/30 border-border h-12 lg:h-14 pl-11 text-sm lg:text-base focus:border-accent transition-colors focus:bg-background shadow-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="bg-muted/30 border-border h-12 lg:h-14 pl-11 pr-12 text-sm lg:text-base focus:border-accent transition-colors focus:bg-background shadow-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-12 lg:h-14 w-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="pt-6">
              <Button type="submit" className="w-full bg-foreground hover:bg-foreground/90 text-background font-display font-bold tracking-widest uppercase h-12 lg:h-14 transition-all shadow-xl group" disabled={loading}>
                {loading ? 'Authenticating...' : (
                  <span className="flex items-center text-xs lg:text-sm">
                    Log in
                    <ArrowRight className="ml-3 h-3 w-3 lg:h-4 lg:w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-10 lg:mt-16 pt-6 lg:pt-8 border-t border-border text-center lg:text-left">
            <p className="text-[9px] lg:text-[10px] text-muted-foreground/60 font-display uppercase tracking-widest">
              CDSMS 1 &bull; Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Branding / Hero (Hidden on Mobile) ── */}
      <div className="hidden lg:flex lg:flex-1 relative bg-card items-center justify-center overflow-hidden">
        
        {/* Architectural / Tech Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Glow ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 px-12 text-center max-w-2xl animate-in slide-in-from-right-8 duration-1000 fade-in">
          <div className="w-[450px] h-[450px] mx-auto mb-4 drop-shadow-[0_0_80px_rgba(212,175,55,0.35)]">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="max-w-lg mx-auto text-center relative group">
            <h3 className="text-xl xl:text-2xl font-display font-black uppercase tracking-[0.2em] text-foreground mb-3 leading-none">
              Construction Daily<br />Site Monitoring System
            </h3>
            <p className="text-muted-foreground/80 font-display text-sm xl:text-base tracking-wide leading-relaxed">
              Real-time operational intelligence and logistics tracking
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
