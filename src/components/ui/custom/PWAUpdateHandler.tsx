'use client';

import { useEffect, useState } from 'react';
import { RefreshCcw, X } from 'lucide-react';

export function PWAUpdateHandler() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.serwist !== undefined
    ) {
      const serwist = window.serwist;

      const onServiceWorkerUpdate = () => {
        setShow(true);
      };

      serwist.addEventListener('installed', (event: any) => {
        if (event.isUpdate) {
          onServiceWorkerUpdate();
        }
      });

      return () => {
        serwist.removeEventListener('installed', onServiceWorkerUpdate);
      };
    }
  }, []);

  if (!show) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-[999] animate-in fade-in slide-in-from-right-4 duration-500"
      style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.2))' }}
    >
      <div 
        className="flex items-center gap-4 px-4 py-3 rounded-xl border border-accent/30 bg-card/95 backdrop-blur-md"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      >
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-foreground">Update Available</p>
          <p className="text-xs text-muted-foreground">A newer version is ready.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <RefreshCcw size={14} />
            Update
          </button>
          
          <button
            onClick={() => setShow(false)}
            className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Global declaration for window.serwist (next-pwa uses serwist/workbox)
declare global {
  interface Window {
    serwist: any;
  }
}
