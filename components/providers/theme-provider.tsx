'use client';

import { useEffect } from 'react';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const isDark = e.newValue === 'dark';
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    // Listen for class mutations from the toggle button
    const handleMutation = () => {
      // No-op: the toggle button handles its own state
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return <>{children}</>;
}
