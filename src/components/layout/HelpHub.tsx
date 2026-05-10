'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  UserCog, 
  ClipboardCheck, 
  MapPin, 
  CalendarDays, 
  Settings,
  Activity,
  AlertCircle,
  FileText,
  Target,
  HardHat,
  Lock,
  Clock,
  Package,
  Wallet,
  Trash2,
  RefreshCcw,
  BarChart3,
  Search,
  ChevronRight,
  Info,
  Plus,
  User,
  Users,
  PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface HelpHubProps {
  role: 'ADMIN' | 'SUPERVISOR';
}

export default function HelpHub({ role }: HelpHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = role === 'ADMIN';

  const adminHandbook = [
    {
      id: "env-config",
      step: "01",
      title: "System Initialization",
      description: "Establishing the digital perimeter and project ecosystem.",
      icon: Settings,
      color: "text-accent",
      bg: "bg-accent/10",
      content: [
        {
          title: "Site Architecture",
          details: "Navigate to 'Management > Sites'. Each site is a distinct data container. Ensure the 'Client Name' matches official contracts as it is used for high-level financial filtering. Locations should be precise for geographical intelligence.",
          procedure: "1. Create Site -> 2. Assign Client -> 3. Define Project Type -> 4. Map Location.",
          tip: "Use the 'Search' bar to quickly manage sites across large-scale projects."
        },
        {
          title: "Supervisor Provisioning",
          details: "In 'Management > Supervisors', grant access to field personnel. Credentials are encrypted and unique. Each supervisor can manage multiple sites, but their digital signature is tied to their username for every submission.",
          caution: "Do not reuse passwords across supervisors. Audit trails depend on unique identity verification."
        }
      ]
    },
    {
      id: "intel-ops",
      step: "02",
      title: "Intelligence Oversight",
      description: "Harnessing real-time data for project velocity monitoring.",
      icon: Activity,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      content: [
        {
          title: "Executive Dashboard",
          details: "The 'Executive Overview' is your command center. It visualizes workforce density, financial burn rates, and material inventory. Charts are real-time; any report saved in the field updates your dashboard instantly.",
          features: [
            "Workforce Trend: Identifies mobilization peaks and troughs.",
            "Inventory Intelligence: Aggregated stock levels across all active sites.",
            "Compliance Gauge: Percentage of sites that have filed on-time logs."
          ]
        },
        {
          title: "Inventory Intelligence (Stock Tracking)",
          details: "The system automatically parses natural language entries from supervisors (e.g., '50 bags', '2.5 tons'). It extracts the numeric volume and aggregates it into a central chart. This allows you to monitor global resource availability without reading hundreds of logs.",
          metric: "Monitor 'Remaining Stock' charts daily to anticipate supply chain bottlenecks."
        }
      ]
    },
    {
      id: "policy-ctrl",
      step: "03",
      title: "Compliance Protocols",
      description: "Managing deadlines, freezes, and operational exceptions.",
      icon: ShieldCheck,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      content: [
        {
          title: "The Freeze Mechanism (Data Integrity)",
          details: "To ensure an immutable historical record, reports are 'Frozen' based on submission timing. Once frozen, they cannot be edited by supervisors.",
          logic: [
            "On-Time: Frozen at 00:00 (Midnight) the following day.",
            "Delayed: Frozen exactly 4 hours after submission time."
          ],
          note: "Admins can view frozen logs but supervisors see them as read-only with a lock icon."
        },
        {
          title: "Sunday & Holiday Policy",
          details: "CDSMS treats Sundays as optional workdays. Sites not reporting on Sundays are NOT flagged as 'Pending'. Similarly, the 'Holiday Registry' waives all reporting requirements globally for declared dates.",
          tip: "Use 'Exempt Today' for localized site-specific shutdowns (e.g., weather or material delay)."
        }
      ]
    },
    {
      id: "data-mgmt",
      step: "04",
      title: "Log Management & Recovery",
      description: "Maintaining a clean audit trail and handling accidental deletions.",
      icon: Trash2,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      content: [
        {
          title: "Intelligence Log Auditing",
          details: "Browse 'Intelligence Log' for granular detail. You can filter by date or site. Every entry (Labour, Expenses, Inventory) is preserved for post-project auditing.",
          action: "Trash Icon: Removes a report from active views and dashboard metrics."
        },
        {
          title: "The Undo Safety Net",
          details: "CDSMS uses a 'Soft-Delete' architecture. When a report is deleted, an 'Undo' button appears in the snackbar. Clicking this instantly restores the log, its workforce entries, and its financial data.",
          caution: "Deleted logs are hidden from all intelligence charts immediately."
        }
      ]
    },
    {
      id: "ui-vocab",
      step: "05",
      title: "UI Systems & Visual Vocabulary",
      description: "Visual guide to the management interface elements.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      content: [
        {
          title: "Intelligence & Audit Cards",
          details: "Standardized cards used to display site-specific intelligence logs and supervisor activity.",
          demonstration: (
            <div className="flex flex-wrap gap-4 p-6 bg-muted/40 rounded-2xl border border-border/50">
              <div className="w-full max-w-sm glass-panel rounded-xl border border-border p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">2026-05-03</span>
                  <span className="text-[10px] font-display uppercase tracking-widest px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20">Site Alpha</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Supervisor John Doe</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[11px] text-muted-foreground">Workforce</span>
                    <span className="text-xs font-mono font-bold text-accent px-2 py-0.5 bg-accent/5 rounded border border-accent/20">42</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Operational Status Indicators",
          details: "Visual badges that communicate system-wide states and data freezes.",
          demonstration: (
            <div className="flex flex-wrap gap-4 p-6 bg-muted/40 rounded-2xl border border-border/50">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Data Lock</p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
                  <Lock size={12} /> Freezed
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Exception State</p>
                <span className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest font-bold">Exempted Today</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">System Holiday</p>
                <span className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest font-bold">Global Holiday</span>
              </div>
            </div>
          )
        },
        {
          title: "Management Controls",
          details: "Standardized controls for data modification and recovery.",
          demonstration: (
            <div className="flex flex-wrap gap-6 p-6 bg-muted/40 rounded-2xl border border-border/50">
              <div className="space-y-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Soft-Delete</p>
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-rose-400/50 hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer border border-white/5"><Trash2 size={18} /></div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Recovery Action</p>
                <Button size="sm" variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-accent/40 text-accent bg-accent/5">Undo Delete</Button>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  const supervisorHandbook = [
    {
      id: "daily-mob",
      step: "01",
      title: "Shift Initiation",
      description: "Digital check-in and site status verification.",
      icon: HardHat,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      content: [
        {
          title: "Operational Dashboard",
          details: "Check your 'Quick Stats' upon arrival. It shows your reporting streak and site status. If your site is 'Exempted' by management, the 'New Report' button will be disabled for that day.",
          tip: "Ensure your mobile signal is stable before opening the 'New Report' form to avoid data desync."
        }
      ]
    },
    {
      id: "data-entry",
      step: "02",
      title: "Precision Reporting",
      description: "Detailed breakdown of field intelligence logging.",
      icon: FileText,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      content: [
        {
          title: "Workforce Census",
          details: "Enter exact headcounts for Masons, Helpers, and Skilled Labour. This data is critical for management to calculate project velocity and efficiency.",
          procedure: "Add Row -> Select Category -> Enter Count -> Repeat for all groups."
        },
        {
          title: "Material Stock (Remaining)",
          details: "Record what is left on-site at the end of the shift. Use descriptive units (e.g., '120 bags', '15 cubic meters'). The system will automatically aggregate these into the Admin's inventory chart.",
          metric: "Accurate remaining stock prevents double-ordering and site downtime."
        },
        {
          title: "Financial Outlay",
          details: "Log any 'Labour Advances' or 'Material Expenses' paid on-site. These are added to the daily project burn rate for real-time financial monitoring.",
          caution: "Ensure currency values are entered as numbers only. Remarks can be used for extra detail."
        }
      ]
    },
    {
      id: "deadlines",
      step: "03",
      title: "The Freeze Protocol",
      description: "Understanding your editing window and deadlines.",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      content: [
        {
          title: "Standard Deadline (On-Time)",
          details: "If you write a log on the same day the work happened, you can edit it as many times as needed. At 00:00 (Midnight), the log is 'Freezed' and becomes read-only.",
        },
        {
          title: "Backdated Window (Delayed)",
          details: "If you are submitting a report for a previous day (late entry), you are granted exactly 4 hours from the moment you click 'Save' to make any corrections. After 4 hours, the log is 'Freezed'.",
          tip: "Look for the 'Freezed' badge and Lock icon in your History Log to see which entries are finalized."
        }
      ]
    },
    {
      id: "ui-vocab",
      step: "04",
      title: "UI Systems & Visual Vocabulary",
      description: "Visual guide to the field interface elements used in your daily logs.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      content: [
        {
          title: "Precision Input Fields",
          details: "Inputs designed for rapid field data entry with automatic units.",
          demonstration: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/40 rounded-2xl border border-border/50">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Labour Headcount</Label>
                <div className="relative">
                  <Input readOnly placeholder="0" className="bg-background/50 border-border h-12 text-base font-mono pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest text-muted-foreground">Pax</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Financial Outlay</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">₹</span>
                  <Input readOnly placeholder="0" className="bg-background/50 border-border h-12 pl-8 text-base font-mono" />
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Operational Status Banners",
          details: "Real-time indicators of site-specific and global operational states.",
          demonstration: (
            <div className="space-y-4 p-6 bg-muted/40 rounded-2xl border border-border/50">
              <div className="flex items-center gap-4 p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-[10px]">i</div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Site Exempted</p>
                  <p className="text-[9px] text-muted-foreground">Reporting disabled for today by administrator.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <PartyPopper size={16} className="text-amber-400" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Today is a Holiday</p>
                  <p className="text-[9px] text-muted-foreground">Submission is optional; no pending flags today.</p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Action Controls",
          details: "Standard buttons for log submission and form management.",
          demonstration: (
            <div className="flex flex-wrap gap-4 p-6 bg-muted/40 rounded-2xl border border-border/50">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Commit Data</p>
                <Button size="sm" className="bg-accent text-background font-bold text-[10px] uppercase tracking-widest">Submit Log <ChevronRight size={12} className="ml-1" /></Button>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Expand List</p>
                <Button variant="outline" size="sm" className="border-border text-[10px] uppercase tracking-widest h-8"><Plus size={12} className="mr-2" /> Add Row</Button>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  const currentHandbook = isAdmin ? adminHandbook : supervisorHandbook;

  const filteredHandbook = currentHandbook.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      {/* Compact Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-accent/20 bg-muted/20 p-8 md:p-12 text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none overflow-hidden">
          <Activity className="absolute -top-20 -right-20 text-accent" size={300} />
          <ShieldCheck className="absolute -bottom-20 -left-20 text-accent" size={250} />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <BookOpen size={12} className="text-accent" />
            <span className="text-[9px] font-display font-bold uppercase tracking-[0.2em] text-accent">Field Intelligence Handbook</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
            {isAdmin ? 'Administrative Control Manual' : 'Field Operations Protocol'}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 font-light">
            Step-by-step framework for mastering CDSMS. Covers site commissioning to automated freeze logic.
          </p>

          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
            <Input 
              placeholder="Search handbook topics..." 
              className="pl-12 h-12 bg-background/50 border-border rounded-xl focus:border-accent text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table of Contents / Anchors */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-4 border-y border-border/50">
        {currentHandbook.map(section => (
          <Button 
            key={section.id}
            variant="ghost" 
            size="sm" 
            className="text-[10px] font-display font-bold uppercase tracking-widest text-muted-foreground hover:text-accent"
            onClick={() => {
              const el = document.getElementById(section.id);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            {section.title}
          </Button>
        ))}
      </div>

      {/* Manual Content */}
      <div className="max-w-5xl mx-auto space-y-24">
        {filteredHandbook.map((section, idx) => (
          <div key={section.id} id={section.id} className="relative group scroll-mt-24">
            <div className="flex items-start gap-8">
              {/* Step Counter Overlay */}
              <div className="hidden lg:flex flex-col items-center gap-4 flex-shrink-0 sticky top-24">
                <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center shadow-lg group-hover:border-accent/40 transition-colors">
                  <span className="text-2xl font-display font-black text-muted-foreground/30 group-hover:text-accent/30">{section.step}</span>
                </div>
                <div className="w-px h-32 bg-gradient-to-b from-border to-transparent" />
              </div>

              <div className="flex-1 space-y-10">
                {/* Section Header */}
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.25rem] ${section.bg} flex items-center justify-center flex-shrink-0 shadow-inner`}>
                    <section.icon className={section.color} size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-2">{section.title}</h2>
                    <p className="text-muted-foreground text-lg">{section.description}</p>
                  </div>
                </div>

                {/* Sub-sections */}
                <div className="grid grid-cols-1 gap-8">
                  {section.content.map((item, i) => (
                    <div key={i} className="glass-panel rounded-[2rem] border border-border p-8 md:p-12 hover:border-accent/20 transition-all duration-500">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-2 h-8 rounded-full bg-accent/40" />
                        <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">{item.title}</h3>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed mb-8 text-base md:text-lg">
                        {item.details}
                      </p>

                      {/* Visual Demonstration Render */}
                      {(item as any).demonstration && (
                        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
                          <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 ml-2">Visual Walkthrough</p>
                          {(item as any).demonstration}
                        </div>
                      )}

                      {/* Technical Callouts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(item as any).procedure && (
                          <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10 space-y-3">
                            <div className="flex items-center gap-2 text-accent">
                              <Target size={16} />
                              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">SOP Workflow</span>
                            </div>
                            <p className="text-sm text-foreground font-medium leading-relaxed">{(item as any).procedure}</p>
                          </div>
                        )}
                        {(item as any).logic && (
                          <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                            <div className="flex items-center gap-2 text-blue-400">
                              <Lock size={16} />
                              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">Freeze Parameters</span>
                            </div>
                            <ul className="space-y-1.5">
                              {(item as any).logic.map((l: any, li: number) => (
                                <li key={li} className="text-xs text-muted-foreground flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-blue-400" /> {l}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(item as any).features && (
                          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3 col-span-full">
                            <div className="flex items-center gap-2 text-emerald-400">
                              <BarChart3 size={16} />
                              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">Platform Intelligence</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {(item as any).features.map((f: any, fi: number) => (
                                <div key={fi} className="text-[11px] text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                                  {f}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(item as any).tip && (
                          <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                            <div className="flex items-center gap-2 text-amber-500">
                              <Zap size={16} />
                              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">Optimization Tip</span>
                            </div>
                            <p className="text-xs text-muted-foreground italic leading-relaxed">{(item as any).tip}</p>
                          </div>
                        )}
                        {(item as any).caution && (
                          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-3">
                            <div className="flex items-center gap-2 text-rose-500">
                              <AlertCircle size={16} />
                              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">Critical Warning</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{(item as any).caution}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredHandbook.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-3xl border border-dashed border-border">
            <Search className="mx-auto text-muted-foreground/20 mb-4" size={48} />
            <p className="text-muted-foreground font-display uppercase tracking-widest text-sm">No topics found matching "{searchQuery}"</p>
            <Button variant="link" className="text-accent mt-2" onClick={() => setSearchQuery('')}>Clear Search</Button>
          </div>
        )}
      </div>

      {/* Support Section Removed */}
      <div className="mt-12 text-center space-y-4">
        <p className="text-[10px] text-muted-foreground font-display uppercase tracking-[0.5em] opacity-40">
          CDSMS Intelligence Systems • Enterprise Field Handbook • 1
        </p>
      </div>
    </div>
  );
}
