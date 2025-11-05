'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Loading() {
  // Default to English for loading state since we can't determine locale client-side
  const loadingMessage = 'Loading...';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <LoadingSpinner
        size="lg"
        message={loadingMessage}
        fullScreen={false}
      />
    </div>
  );
}

