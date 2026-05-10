import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

interface KpiStripProps {
  items: KpiItem[];
  className?: string;
}

export function KpiStrip({ items, className }: KpiStripProps) {
  return (
    <div className={cn("mb-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6", className)}>
      {items.map((item, index) => (
        <div 
          key={index} 
          className="group relative flex flex-col sm:flex-row items-start sm:items-center p-3 md:p-6 rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
        >
          {/* Main Background with Glassmorphism and Gradients */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-white/[0.02] backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] md:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)]" />
          
          {/* Subtle Inner Glow */}
          <div className="absolute inset-px rounded-[15px] bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

          {/* Decorative Corner Accent */}
          <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 bg-accent/10 blur-2xl md:blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Icon Container */}
          <div className="relative z-10 mb-3 sm:mb-0 sm:mr-4 md:mr-5 flex-shrink-0">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <item.icon className="w-5 h-5 md:w-7 md:h-7 text-accent drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
            </div>
            
            {/* Animated Ring around icon */}
            <div className="absolute -inset-1 rounded-xl border border-accent/20 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-none" />
          </div>

          {/* Text Content */}
          <div className="relative z-10 min-w-0 flex-1">
            <p className="text-[8px] md:text-[10px] font-display font-bold text-muted-foreground/60 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-0.5 md:mb-1 group-hover:text-accent/70 transition-colors truncate">
              {item.label}
            </p>
            <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
              <h2 className={cn(
                "m-0 font-display font-black tracking-tight leading-none text-foreground drop-shadow-sm transition-all duration-500",
                item.value.toString().length > 10 ? 'text-sm md:text-xl' :
                item.value.toString().length > 7 ? 'text-base md:text-2xl' :
                'text-lg md:text-3xl'
              )}>
                {item.value}
              </h2>
              {item.trend && (
                <div className={cn(
                  "flex items-center gap-0.5 text-[8px] md:text-[10px] font-display font-bold uppercase tracking-wider px-1.5 md:px-2 py-0.5 rounded-full border",
                  item.trendUp 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {item.trend}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
