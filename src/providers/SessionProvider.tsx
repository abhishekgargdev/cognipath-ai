'use client';

import { SessionProvider } from 'next-auth/react';
import React, { ReactNode } from 'react';

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
