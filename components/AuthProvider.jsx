'use client';
/**
 * AuthProvider — initialises the Zustand auth store from the user_info cookie
 * once the component mounts on the client. Wrap the root layout with this.
 */
import { useEffect } from 'react';
import useAuthStore from '../lib/store/authStore';

export default function AuthProvider({ children }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return children;
}
