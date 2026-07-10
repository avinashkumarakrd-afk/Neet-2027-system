import { useEffect, useState } from 'react';
import { PlayerStats, getRank, getLevel, getNextLevelChapters, MAX_STATS } from '../types';
import { motion } from 'motion/react';
import { Target, Beaker, Dna, FileText } from 'lucide-react';

interface DashboardProps {
  stats: PlayerStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number }>({
    days: 0, hours: 0, mins: 0, secs: 0
  });

  useEffect(() => {
    const targetDate = new Date('2027-05-02T00:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalChapters = stats.physics + stats.chemistry + stats.biology + stats.mocks;
  const currentLevel = getLevel(totalChapters);
  const nextLevelChapters = getNextLevelChapters(currentLevel);
  const prevLevelChapters = getNextLevelChapters(currentLevel - 1);
  const chaptersIntoCurrentLevel = totalChapters - prevLevelChapters;
  const chaptersNeededForLevel = nextLevelChapters - prevLevelChapters;
  const progressPercent = Math.min(100, Math.max(0, (chaptersIntoCurrentLevel / chaptersNeededForLevel) * 100));

  const statConfig = [
    { key: 'physics', label: 'Physics', value: stats.physics, icon: Target, color: 'text-blue-400' },
    { key: 'chemistry', label: 'Chemistry', value: stats.chemistry, icon: Beaker, color: 'text-green-400' },
    { key: 'biology', label: 'Biology', value: stats.biology, icon: Dna, color: 'text-emerald-400' },
    { key: 'mocks', label: 'Mock Tests', value: stats.mocks, icon: FileText, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Player Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#121212] border border-[#222] p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-2 text-[10px] md:text-xs font-mono text-[#00F0FF]/30">LVL: {currentLevel.toString().padStart(2, '0')}</div>
        <h2 className="text-xs uppercase tracking-widest mb-4 font-bold border-l-2 border-[#00F0FF] pl-2">Character Status</h2>
        
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xl font-black text-white italic">{getRank(totalChapters)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-[#1A1A1A] border border-[#333] p-3 text-center">
              <div className="text-[10px] text-[#555] uppercase tracking-widest mb-1">Login Streak</div>
              <div className="text-xl font-mono text-[#00F0FF]">{stats.streak || 0} <span className="text-xs text-[#00F0FF]/60">Days</span></div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333] p-3 text-center">
              <div className="text-[10px] text-[#555] uppercase tracking-widest mb-1">System Points</div>
              <div className="text-xl font-mono text-[#00F0FF]">{stats.systemPoints || 0} <span className="text-xs text-[#00F0FF]/60">SP</span></div>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-[11px] font-mono text-[#555] uppercase mb-1">
              <span>Progress: {totalChapters} CH</span>
              <span>Next Lvl: {nextLevelChapters} CH</span>
            </div>
            <div className="h-1.5 w-full bg-[#1A1A1A] border border-[#333] overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              />
            </div>
            <div className="mt-3 p-3 bg-[#00F0FF]/5 border border-[#00F0FF]/20 text-[10px] text-[#555] italic">
              {Math.max(0, chaptersNeededForLevel - chaptersIntoCurrentLevel).toFixed(1)} Chapters remaining until Level {currentLevel + 1}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#121212] border border-[#222] p-5"
      >
        <h2 className="text-xs uppercase tracking-widest mb-4 font-bold border-l-2 border-[#00F0FF] pl-2">Attributes</h2>
        <div className="space-y-4">
          {statConfig.map((stat, idx) => {
            const maxForStat = MAX_STATS[stat.key as keyof typeof MAX_STATS];
            const statProgress = Math.min(100, (stat.value / maxForStat) * 100) || 0;
            
            return (
              <div key={stat.key} className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono uppercase">
                  <span className="text-[#E0E0E0]">{stat.label}</span>
                  <span className="text-[#00F0FF]">{stat.value} / {maxForStat} CH</span>
                </div>
                <div className="h-1.5 w-full bg-[#1A1A1A] border border-[#333] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${statProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (idx * 0.05) }}
                    className="h-full bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Countdown Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#121212] border border-[#222] p-5"
      >
        <h2 className="text-xs uppercase tracking-widest mb-4 font-bold border-l-2 border-[#00F0FF] pl-2">Awakening Countdown</h2>
        <div className="flex justify-center gap-4 text-center">
          {[
            { label: 'D', value: timeLeft.days },
            { label: 'H', value: timeLeft.hours },
            { label: 'M', value: timeLeft.mins },
            { label: 'S', value: timeLeft.secs },
          ].map((item, idx) => (
            <div key={idx} className="flex items-baseline">
              <span className="text-2xl md:text-3xl font-mono font-bold text-[#00F0FF] tabular-nums">
                {item.value.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs text-[#00F0FF]/60 ml-1">{item.label}</span>
              {idx < 3 && <span className="text-[#00F0FF]/20 mx-2 text-xl">:</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
