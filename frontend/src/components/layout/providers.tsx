'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { ApiClientError } from '@/lib/client-api';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: (count, error) => {
              if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) return false;
              return count < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextTopLoader
        color="linear-gradient(90deg, #7c3aed, #c026d3)"
        height={3}
        showSpinner={false}
        shadow="0 0 12px #a855f7"
        easing="cubic-bezier(0.22, 1, 0.36, 1)"
      />
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{ className: 'font-sans', style: { borderRadius: 14 } }}
      />
    </QueryClientProvider>
  );
}
