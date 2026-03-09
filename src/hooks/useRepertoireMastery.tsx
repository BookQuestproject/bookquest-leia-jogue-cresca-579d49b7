import { useState, useEffect, useCallback } from 'react';
import { MasteryLevel, RepertoireMasteryState } from '@/types/repertoire';
import { repertoriosCompletos } from '@/data/repertorios';

const STORAGE_KEY = 'bookquest-repertoire-mastery';

export function useRepertoireMastery() {
  const [masteryStates, setMasteryStates] = useState<Record<string, RepertoireMasteryState>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMasteryStates(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse mastery states:', e);
      }
    }
  }, []);

  const saveMasteryStates = useCallback((states: Record<string, RepertoireMasteryState>) => {
    setMasteryStates(states);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  }, []);

  const getMasteryLevel = useCallback((repertoireId: string): MasteryLevel => {
    const state = masteryStates[repertoireId];
    if (!state) return 'novo';
    
    const progress = state.sectionsExplored.length + (state.challengesCompleted.length * 2);
    
    if (progress >= 10) return 'dominado';
    if (progress >= 6) return 'entendido';
    if (progress >= 3) return 'conhecido';
    return 'novo';
  }, [masteryStates]);

  const markSectionExplored = useCallback((repertoireId: string, sectionId: string) => {
    const current = masteryStates[repertoireId] || {
      repertoireId,
      level: 'novo',
      sectionsExplored: [],
      challengesCompleted: [],
      lastAccessed: new Date().toISOString()
    };

    if (!current.sectionsExplored.includes(sectionId)) {
      const updated = {
        ...current,
        sectionsExplored: [...current.sectionsExplored, sectionId],
        lastAccessed: new Date().toISOString()
      };
      updated.level = getMasteryLevel(repertoireId);
      
      saveMasteryStates({
        ...masteryStates,
        [repertoireId]: updated
      });
    }
  }, [masteryStates, getMasteryLevel, saveMasteryStates]);

  const markChallengeCompleted = useCallback((repertoireId: string, challengeId: string) => {
    const current = masteryStates[repertoireId] || {
      repertoireId,
      level: 'novo',
      sectionsExplored: [],
      challengesCompleted: [],
      lastAccessed: new Date().toISOString()
    };

    if (!current.challengesCompleted.includes(challengeId)) {
      const updated = {
        ...current,
        challengesCompleted: [...current.challengesCompleted, challengeId],
        lastAccessed: new Date().toISOString()
      };
      updated.level = getMasteryLevel(repertoireId);
      
      saveMasteryStates({
        ...masteryStates,
        [repertoireId]: updated
      });
    }
  }, [masteryStates, getMasteryLevel, saveMasteryStates]);

  const getProgressPercentage = useCallback((repertoireId: string): number => {
    const state = masteryStates[repertoireId];
    if (!state) return 0;
    
    const progress = state.sectionsExplored.length + (state.challengesCompleted.length * 2);
    return Math.min((progress / 10) * 100, 100);
  }, [masteryStates]);

  const getCategoryProgress = useCallback((category: string): number => {
    const repertoires = repertoriosCompletos.filter(r => r.categoria === category);
    if (repertoires.length === 0) return 0;
    
    const totalProgress = repertoires.reduce((sum, r) => {
      return sum + getProgressPercentage(r.id);
    }, 0);
    
    return Math.round(totalProgress / repertoires.length);
  }, [getProgressPercentage]);

  const getTotalProgress = useCallback((): number => {
    if (repertoriosCompletos.length === 0) return 0;
    
    const totalProgress = repertoriosCompletos.reduce((sum, r) => {
      return sum + getProgressPercentage(r.id);
    }, 0);
    
    return Math.round(totalProgress / repertoriosCompletos.length);
  }, [getProgressPercentage]);

  const getDailyChallenge = useCallback(() => {
    const today = new Date().toDateString();
    const repertoireIndex = new Date().getDate() % repertoriosCompletos.length;
    const repertoire = repertoriosCompletos[repertoireIndex];
    
    return {
      repertoire,
      challengeId: `daily-${today}`,
      prompt: `Use a obra "${repertoire.titulo}" para argumentar sobre ${repertoire.temasAplicaveis[0]}.`,
      completed: masteryStates[repertoire.id]?.challengesCompleted.includes(`daily-${today}`) || false
    };
  }, [masteryStates]);

  return {
    getMasteryLevel,
    getProgressPercentage,
    getCategoryProgress,
    getTotalProgress,
    markSectionExplored,
    markChallengeCompleted,
    getDailyChallenge,
    masteryStates
  };
}
