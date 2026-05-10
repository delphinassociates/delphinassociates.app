'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/custom/PageHeader';
import HelpHub from '@/components/layout/HelpHub';

export default function SupervisorHelpPage() {
  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="md:px-10">
        <PageHeader
          title="Field Handbook"
          description="Detailed guidance for field operations and reporting protocols."
          breadcrumbs={['System', 'Help Center']}
        />
        <HelpHub role="SUPERVISOR" />
      </div>
    </div>
  );
}
