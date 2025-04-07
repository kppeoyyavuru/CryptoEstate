'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // This prevents hydration mismatch errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render children when the component has mounted on the client
  if (!mounted) {
    return null;
  }

  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
} 