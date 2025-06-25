
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Layouts, Layout } from 'react-grid-layout';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

export const defaultLayouts: Layouts = {
  lg: [
    { i: 'agenda', x: 0, y: 0, w: 7, h: 11, minH: 6, minW: 4 },
    { i: 'notes', x: 7, y: 0, w: 5, h: 11, minH: 6, minW: 3 },
    { i: 'progress', x: 0, y: 11, w: 4, h: 6, minH: 5, minW: 3 },
    { i: 'pomodoro', x: 4, y: 11, w: 4, h: 9, minH: 8, minW: 3 },
    { i: 'features', x: 8, y: 11, w: 4, h: 6, minH: 5, minW: 3 },
  ],
  md: [
    { i: 'agenda', x: 0, y: 0, w: 6, h: 11, minH: 6, minW: 4 },
    { i: 'notes', x: 6, y: 0, w: 4, h: 11, minH: 6, minW: 3 },
    { i: 'progress', x: 0, y: 11, w: 5, h: 6, minH: 5, minW: 3 },
    { i: 'pomodoro', x: 5, y: 11, w: 5, h: 9, minH: 8, minW: 3 },
    { i: 'features', x: 0, y: 17, w: 10, h: 6, minH: 5, minW: 3 },
  ],
  sm: [
    { i: 'agenda', x: 0, y: 0, w: 6, h: 9, minH: 6, minW: 4 },
    { i: 'pomodoro', x: 0, y: 9, w: 6, h: 9, minH: 8, minW: 3 },
    { i: 'notes', x: 0, y: 18, w: 6, h: 9, minH: 6, minW: 3 },
    { i: 'progress', x: 0, y: 27, w: 6, h: 6, minH: 5, minW: 3 },
    { i: 'features', x: 0, y: 33, w: 6, h: 6, minH: 5, minW: 3 },
  ],
   xs: [
    { i: 'agenda', x: 0, y: 0, w: 4, h: 9, minH: 6, minW: 2 },
    { i: 'pomodoro', x: 0, y: 9, w: 4, h: 9, minH: 8, minW: 2 },
    { i: 'notes', x: 0, y: 18, w: 4, h: 9, minH: 6, minW: 2 },
    { i: 'progress', x: 0, y: 27, w: 4, h: 6, minH: 5, minW: 2 },
    { i: 'features', x: 0, y: 33, w: 4, h: 6, minH: 5, minW: 2 },
  ],
   xxs: [
    { i: 'agenda', x: 0, y: 0, w: 2, h: 9, minH: 6, minW: 2 },
    { i: 'pomodoro', x: 0, y: 9, w: 2, h: 9, minH: 8, minW: 2 },
    { i: 'notes', x: 0, y: 18, w: 2, h: 9, minH: 6, minW: 2 },
    { i: 'progress', x: 0, y: 27, w: 2, h: 6, minH: 5, minW: 2 },
    { i: 'features', x: 0, y: 33, w: 2, h: 6, minH: 5, minW: 2 },
  ],
};

export function useDashboardLayout() {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    try {
      const savedLayouts = localStorage.getItem(LOCAL_STORAGE_KEYS.DASHBOARD_LAYOUT);
      // Ensure savedLayouts is a valid, non-empty, non-undefined string before parsing
      if (savedLayouts && savedLayouts !== 'undefined' && savedLayouts !== 'null') {
        const parsedLayouts = JSON.parse(savedLayouts);
        // Validate saved layout to prevent crashes from malformed data
        if (parsedLayouts && parsedLayouts.lg) {
          setLayouts(parsedLayouts);
        } else {
          setLayouts(defaultLayouts);
        }
      } else {
        setLayouts(defaultLayouts);
      }
    } catch (error) {
      console.error("Failed to load dashboard layout from localStorage, resetting to default.", error);
      setLayouts(defaultLayouts);
    }
  }, []);

  const onLayoutChange = useCallback((newLayout: Layout[], newLayouts: Layouts) => {
    // Only update state and localStorage if newLayouts is valid
    if (newLayouts) {
      setLayouts(newLayouts);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.DASHBOARD_LAYOUT, JSON.stringify(newLayouts));
      } catch (error) {
        console.error("Failed to save dashboard layout to localStorage", error);
      }
    }
  }, []);

  const resetLayouts = useCallback(() => {
    setLayouts(defaultLayouts);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DASHBOARD_LAYOUT);
  }, []);

  return {
    layouts,
    isCustomizing,
    setIsCustomizing,
    onLayoutChange,
    resetLayouts,
  };
}
