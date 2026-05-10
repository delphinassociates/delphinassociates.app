'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  UserCog, 
  ClipboardCheck, 
  Zap, 
  Info,
  ChevronRight,
  BookOpen,
  LayoutDashboard,
  CalendarDays,
  MapPin
} from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'tips'>('overview');

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: BookOpen },
    { id: 'workflow', label: 'Workflows', icon: Zap },
    { id: 'tips', label: 'Expert Tips', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-2xl border border-accent/20 shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-muted/30 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <HelpCircle className="text-accent" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-foreground">Intelligence</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Help Center</p>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all whitespace-nowrap md:whitespace-normal flex-shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-accent/15 text-accent border border-accent/20 shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon size={16} />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={14} className="ml-auto hidden md:block" />}
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden md:block">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-[10px] text-accent font-display uppercase tracking-widest mb-1">Support</p>
              <p className="text-xs text-muted-foreground">Contact IT Support for technical assistance.</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-background/50">
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="text-lg font-display font-bold text-foreground capitalize">
              {activeTab} Guide
            </h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={16} className="text-accent" />
                    <h4 className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground">The CDSMS Ecosystem</h4>
                  </div>
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                    The Construction Daily Site Monitoring System (CDSMS) is an enterprise-grade intelligence platform designed to streamline operational oversight across multiple project deployments. It transforms raw field data into actionable mobilization metrics.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-border bg-muted/20 hover:border-accent/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                      <LayoutDashboard size={18} className="text-emerald-500" />
                    </div>
                    <h5 className="text-sm font-bold mb-2">Centralized Visibility</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">Real-time tracking of site mobilization, workforce counts, and submission compliance across the entire project portfolio.</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-border bg-muted/20 hover:border-accent/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                      <ClipboardCheck size={18} className="text-blue-500" />
                    </div>
                    <h5 className="text-sm font-bold mb-2">Compliance Engine</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">Automated monitoring of daily reports. System detects gaps and alerts management when critical data is missing.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="relative pl-8 border-l border-border space-y-8">
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                      <div className="flex items-center gap-2 mb-2">
                        <UserCog size={16} className="text-accent" />
                        <h5 className="text-sm font-bold uppercase tracking-widest text-foreground">Administrative Setup</h5>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Admin users provision sites and supervisors. This establishes the organizational framework for all monitoring activities.</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <li className="flex items-center gap-2 text-[11px] text-foreground/70"><ChevronRight size={10} className="text-accent" /> Commission project sites</li>
                        <li className="flex items-center gap-2 text-[11px] text-foreground/70"><ChevronRight size={10} className="text-accent" /> Provision supervisor accounts</li>
                        <li className="flex items-center gap-2 text-[11px] text-foreground/70"><ChevronRight size={10} className="text-accent" /> Define regional holidays</li>
                      </ul>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-background" />
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-blue-500" />
                        <h5 className="text-sm font-bold uppercase tracking-widest text-foreground">Operational Reporting</h5>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Supervisors submit daily mobilization data. Reports must be completed by the end of the shift to maintain compliance.</p>
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                        <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <MapPin size={12} className="text-blue-500" />
                        </div>
                        <p className="text-[11px] text-blue-300 italic">"Site reports cover workforce distribution, work completed, and any critical blockers or material logistics."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      title: "Standardized Exemptions",
                      text: "Use the 'Exempt Today' feature on the Site Management page for unexpected site shutdowns (e.g., severe weather). This prevents artificial drops in your compliance rate.",
                      icon: ShieldCheck,
                      color: "text-emerald-500",
                      bg: "bg-emerald-500/10"
                    },
                    {
                      title: "Bulk Holiday Declaration",
                      text: "When declaring holidays, you can select date ranges. This automatically waives reporting requirements for all sites during the specified period.",
                      icon: CalendarDays,
                      color: "text-amber-500",
                      bg: "bg-amber-500/10"
                    },
                    {
                      title: "Data Integrity",
                      text: "Ensure supervisors include all workforce categories. Accurate data allows the mobilization charts to provide better predictive insights into project velocity.",
                      icon: Info,
                      color: "text-blue-500",
                      bg: "bg-blue-500/10"
                    }
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-muted/20 border border-border group hover:border-accent/20 transition-all">
                      <div className={`w-10 h-10 rounded-xl ${tip.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <tip.icon size={20} className={tip.color} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold mb-1">{tip.title}</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border/50 bg-muted/10">
            <p className="text-center text-[10px] text-muted-foreground/60 font-sans uppercase tracking-[0.2em]">
              CDSMS Intelligence Framework • 1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
