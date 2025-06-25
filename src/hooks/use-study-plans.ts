
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import type { StudyPlan } from '@/lib/types';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

export function useStudyPlans() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load plans from localStorage
  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDY_PLANS);
      if (storedPlans) {
        setPlans(JSON.parse(storedPlans));
      }
    } catch (error) {
        console.error("Failed to load study plans from localStorage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // Save plans to localStorage with debounce
  const savePlansToStorage = useDebounceCallback((plansToSave: StudyPlan[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.STUDY_PLANS, JSON.stringify(plansToSave));
    } catch (error) {
        console.error("Failed to save study plans to localStorage", error);
    }
  }, 500);
  
  useEffect(() => {
    if (!isLoading) {
        savePlansToStorage(plans);
    }
  }, [plans, isLoading, savePlansToStorage]);

  const addPlan = useCallback((newPlan: StudyPlan) => {
    setPlans(prevPlans => {
      // Avoid adding duplicates
      if (prevPlans.some(p => p.id === newPlan.id)) {
        return prevPlans;
      }
      return [newPlan, ...prevPlans];
    });
  }, []);

  const updatePlan = useCallback((planId: string, updatedPlan: StudyPlan) => {
    setPlans(prevPlans =>
      prevPlans.map(plan =>
        plan.id === planId ? updatedPlan : plan
      )
    );
  }, []);
  
  const deletePlan = useCallback((planId: string) => {
    setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
  }, []);
  
  const importPlans = useCallback((importedPlans: StudyPlan[]) => {
    // A more robust merge strategy: update existing plans and add new ones.
    setPlans(prevPlans => {
      const planMap = new Map(prevPlans.map(p => [p.id, p]));
      importedPlans.forEach(p => planMap.set(p.id, p));
      return Array.from(planMap.values());
    });
  }, []);


  return {
    plans,
    isLoading,
    addPlan,
    updatePlan,
    deletePlan,
    importPlans,
    setPlans
  };
}
