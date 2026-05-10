'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AdminMobileDock from '@/components/layout/AdminMobileDock';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background p-0 md:p-3 md:gap-3 overflow-hidden" style={{ maxWidth: '100vw' }}>

      {/* Floating sidebar — only on desktop, with gap from edges */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 overflow-hidden relative min-w-0 md:rounded-2xl"
        style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>

        <div className="z-50 relative">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10 pb-28 md:pb-8 lg:pb-10 custom-scrollbar relative z-0">
          <div className="absolute top-0 right-0 w-full h-96 bg-accent/5 blur-[120px] pointer-events-none -z-10 rounded-full mix-blend-screen translate-x-1/3 -translate-y-1/2" />
          {children}
        </main>
      </div>

      {/* Mobile floating dock */}
      <AdminMobileDock />
    </div>
  );
}
