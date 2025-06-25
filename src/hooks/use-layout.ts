
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

type Layout = 'default' | 'top-nav';

interface LayoutContextProps {
  layout: Layout;
  setLayout: (layout: Layout) => void;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayoutState] = useState<Layout>('default');

  useEffect(() => {
    const storedLayout = localStorage.getItem(LOCAL_STORAGE_KEYS.LAYOUT) as Layout;
    if (storedLayout && ['default', 'top-nav'].includes(storedLayout)) {
      setLayoutState(storedLayout);
    }
  }, []);

  const setLayout = (newLayout: Layout) => {
    setLayoutState(newLayout);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAYOUT, newLayout);
  };

  const contextValue = useMemo(() => ({ layout, setLayout }), [layout]);

  return React.createElement(LayoutContext.Provider, { value: contextValue }, children);
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
