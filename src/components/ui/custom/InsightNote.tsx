import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface InsightNoteProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title: string;
  content: string;
  className?: string;
}

export function InsightNote({ type = 'info', title, content, className = '' }: InsightNoteProps) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
  };

  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2,
    error: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <div className={`p-4 rounded-lg border flex items-start space-x-3 font-sans ${styles[type]} ${className}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <h5 className="font-semibold text-sm mb-1 text-foreground !font-sans !normal-case !tracking-normal">{title}</h5>
        <p className="text-sm opacity-90 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
