"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSignInPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the root which will show the landing page
    router.push('/');
  }, [router]);

  return null; // This page will immediately redirect
}
