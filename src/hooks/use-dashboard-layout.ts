
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Layouts } from 'react-grid-layout';

const LAYOUT_STORAGE_KEY = 'flowfocus_dashboard_layout';

const defaultLayouts: Layouts = {
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
      const savedLayouts = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayouts) {
        setLayouts(JSON.parse(savedLayouts));
      }
    } catch (error) {
      console.error("Failed to load dashboard layout from localStorage", error);
      setLayouts(defaultLayouts);
    }
  }, []);

  const onLayoutChange = useCallback((layout: any, newLayouts: Layouts) => {
    setLayouts(newLayouts);
    try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayouts));
    } catch (error) {
        console.error("Failed to save dashboard layout to localStorage", error);
    }
  }, []);

  const resetLayouts = useCallback(() => {
    setLayouts(defaultLayouts);
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
  }, []);

  return {
    layouts,
    isCustomizing,
    setIsCustomizing,
    onLayoutChange,
    resetLayouts,
  };
}
