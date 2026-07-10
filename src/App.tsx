import { useEffect, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PlayerStats, Quest } from './types';
import Dashboard from './components/Dashboard';
import QuestManager from './components/QuestManager';
import StudyTimer from './components/StudyTimer';
import { motion } from 'motion/react';

const INITIAL_STATS: PlayerStats = {
  physics: 0,
  chemistry: 0,
  biology: 0,
  mocks: 0,
  systemPoints: 0,
  streak: 0,
  lastLoginDate: undefined,
};

export default function App() {
  const [stats, setStats] = useLocalStorage<PlayerStats>('neet-system-stats', INITIAL_STATS);
  const [quests, setQuests] = useLocalStorage<Quest[]>('neet-system-quests', []);
  const [activeScreen, setActiveScreen] = useState<'status' | 'quests'>('status');

  useEffect(() => {
    // Check login streak
    const today = new Date().toISOString().split('T')[0];
    
    setStats(prev => {
      // Ensure prev has new fields if upgrading from older version
      const safePrev = {
        ...prev,
        systemPoints: prev.systemPoints || 0,
        streak: prev.streak || 0,
      };

      if (safePrev.lastLoginDate === today) {
        return safePrev; // Already logged in today
      }

      let newStreak = safePrev.streak;
      
      if (safePrev.lastLoginDate) {
        const lastDate = new Date(safePrev.lastLoginDate);
        const currentDate = new Date(today);
        // Reset time part to ensure only date diff is calculated
        lastDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const bonusSp = 10 + (newStreak - 1) * 2; // e.g., Day 1: 10, Day 2: 12, etc.

      return {
        ...safePrev,
        streak: newStreak,
        systemPoints: safePrev.systemPoints + bonusSp,
        lastLoginDate: today
      };
    });
  }, []);

  const handleAddQuest = (questData: Omit<Quest, 'id' | 'createdAt'>) => {
    const newQuest: Quest = {
      ...questData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setQuests(prev => [...prev, newQuest]);
  };

  const handleToggleQuest = (id: string) => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === id) {
        const isCompleting = !quest.completed;
        
        // Update stats
        setStats(currentStats => ({
          ...currentStats,
          [quest.stat]: Math.max(0, Number((currentStats[quest.stat] + (isCompleting ? quest.chaptersValue : -quest.chaptersValue)).toFixed(2)))
        }));

        return { ...quest, completed: isCompleting, completedAt: isCompleting ? Date.now() : undefined };
      }
      return quest;
    }));
  };

  const handleDeleteQuest = (id: string) => {
    setQuests(prev => {
      const questToDelete = prev.find(q => q.id === id);
      if (questToDelete && questToDelete.completed) {
        // Optionally reverse stats if deleting a completed quest
        // Here we choose to let them keep the XP if they delete it to keep it simple,
        // or reverse it. Let's reverse it to prevent cheat farming.
        setStats(currentStats => ({
          ...currentStats,
          [questToDelete.stat]: Math.max(0, Number((currentStats[questToDelete.stat] - questToDelete.chaptersValue).toFixed(2)))
        }));
      }
      return prev.filter(q => q.id !== id);
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] font-sans flex flex-col overflow-x-hidden selection:bg-[#00F0FF]/30 selection:text-[#00F0FF]">
      <header className="h-20 border-b border-[#00F0FF]/30 px-4 md:px-8 flex items-center justify-between bg-gradient-to-r from-[#121212] to-transparent">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-[#00F0FF] rotate-45 flex items-center justify-center bg-[#00F0FF]/5 shrink-0">
            <span className="-rotate-45 font-black text-[#00F0FF] text-lg md:text-xl">S</span>
          </div>
          <div>
            <h1 className="text-[10px] md:text-xs tracking-[0.3em] text-[#00F0FF] uppercase font-bold truncate">System Interface v2.0</h1>
            <div className="text-xl md:text-2xl font-black tracking-tight uppercase italic text-white">NEET <span className="text-[#00F0FF]/60">[2027]</span></div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveScreen('status')}
            className={`px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs uppercase tracking-widest font-bold border transition-colors ${activeScreen === 'status' ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#1A1A1A] border-[#333] text-[#555] hover:text-[#E0E0E0]'}`}
          >
            Status
          </button>
          <button 
            onClick={() => setActiveScreen('quests')}
            className={`px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs uppercase tracking-widest font-bold border transition-colors ${activeScreen === 'quests' ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]' : 'bg-[#1A1A1A] border-[#333] text-[#555] hover:text-[#E0E0E0]'}`}
          >
            Quests
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col">
        {activeScreen === 'status' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <aside className="lg:col-span-6 flex flex-col gap-6">
              <Dashboard stats={stats} />
            </aside>
            <section className="lg:col-span-6 flex flex-col gap-6">
              <StudyTimer />
            </section>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col"
          >
            <QuestManager 
              quests={quests}
              onAddQuest={handleAddQuest}
              onToggleQuest={handleToggleQuest}
              onDeleteQuest={handleDeleteQuest}
            />
          </motion.div>
        )}
      </main>

      <footer className="mt-auto h-10 bg-[#00F0FF]/5 border-t border-[#00F0FF]/20 px-4 md:px-6 flex items-center justify-between">
        <div className="flex gap-4 md:gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></div>
            <span className="text-[9px] uppercase tracking-widest text-[#00F0FF]">System Online / Offline Sync Active</span>
          </div>
        </div>
        <div className="text-[9px] text-[#555] uppercase tracking-widest italic hidden md:block">Persistence is the key to Awakening.</div>
      </footer>
    </div>
  );
                                                                                                                                          }
