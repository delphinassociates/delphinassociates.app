'use client';

import SupervisorSidebar from '@/components/layout/SupervisorSidebar';
import Header from '@/components/layout/Header';
import SupervisorMobileDock from '@/components/layout/SupervisorMobileDock';

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background p-0 md:p-3 md:gap-3 overflow-hidden" style={{ maxWidth: '100vw' }}>

      {/* Floating sidebar — only on desktop */}
      <SupervisorSidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 overflow-hidden relative min-w-0 md:rounded-2xl"
        style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>

        <Header />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10 pb-28 md:pb-8 lg:pb-10 custom-scrollbar relative">
          <div className="absolute top-0 right-0 w-full h-96 bg-accent/5 blur-[120px] pointer-events-none -z-10 rounded-full mix-blend-screen translate-x-1/3 -translate-y-1/2" />
          {children}
        </main>
      </div>

      {/* Mobile floating dock */}
      <SupervisorMobileDock />
    </div>
  );
}
