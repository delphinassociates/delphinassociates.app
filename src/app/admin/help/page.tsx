'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import HelpHub from '@/components/layout/HelpHub';

export default function AdminHelpPage() {
  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="md:px-10">
        <PageHeader
          title="Knowledge Center"
          description="Operational documentation and system protocols for administrators."
          breadcrumbs={['Intelligence', 'Help Center']}
        />
        <HelpHub role="ADMIN" />
      </div>
    </div>
  );
}
