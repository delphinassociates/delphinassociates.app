import { BookOpen } from 'lucide-react';
import Link from 'next/link';

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  helpId?: string;
}

export function SectionHeading({ title, description, action, helpId }: SectionHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 pb-6 border-b border-border">
      <div className="flex items-start gap-4">
        <div>
          <h3 className="text-lg md:text-xl text-foreground m-0">{title}</h3>
          {description && <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 font-sans">{description}</p>}
        </div>
        {helpId && (
          <Link 
            href={`/supervisor/help#${helpId}`}
            className="mt-1 p-1 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
            title="View Handbook Guidance"
          >
            <BookOpen size={16} />
          </Link>
        )}
      </div>
      {action && <div className="mt-3 sm:mt-0">{action}</div>}
    </div>
  );
}
