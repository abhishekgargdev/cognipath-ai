'use server';

import { auth } from '@/lib/auth';

export async function verifySession() {
  try {
    const session = await auth();
    return {
      isAuthenticated: !!session?.user,
      user: session?.user || null,
    };
  } catch (error) {
    console.error('[Server Action] Session verification failed:', error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
}
