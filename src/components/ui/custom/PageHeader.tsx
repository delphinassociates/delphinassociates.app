import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumbs: string[];
}

export function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-5 md:mb-8">
      <nav className="flex items-center text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 font-sans">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1.5 md:mx-2 opacity-50" />}
            <span className={index === breadcrumbs.length - 1 ? "text-accent" : ""}>
              {crumb}
            </span>
          </div>
        ))}
      </nav>
      <h1 className="text-xl md:text-3xl font-bold uppercase tracking-tight text-foreground mb-1 md:mb-2">{title}</h1>
      <p className="text-xs md:text-base text-muted-foreground font-sans leading-relaxed">{description}</p>
    </div>
  );
}
