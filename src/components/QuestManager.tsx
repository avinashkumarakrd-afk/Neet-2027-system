import React, { useState } from 'react';
import { Quest, StatType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Beaker, Dna, FileText } from 'lucide-react';

interface QuestManagerProps {
  quests: Quest[];
  onAddQuest: (quest: Omit<Quest, 'id' | 'createdAt'>) => void;
  onToggleQuest: (id: string) => void;
  onDeleteQuest: (id: string) => void;
}

const STAT_ICONS: Record<StatType, React.ElementType> = {
  physics: Target,
  chemistry: Beaker,
  biology: Dna,
  mocks: FileText,
};

export default function QuestManager({ quests, onAddQuest, onToggleQuest, onDeleteQuest }: QuestManagerProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStat, setNewTaskStat] = useState<StatType>('physics');
  const [newTaskChapters, setNewTaskChapters] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    onAddQuest({
      title: newTaskTitle.trim(),
      stat: newTaskStat,
      chaptersValue: newTaskChapters,
      completed: false
    });
    
    setNewTaskTitle('');
  };

  const activeQuests = quests.filter(q => !q.completed).sort((a, b) => b.createdAt - a.createdAt);
  const completedQuests = quests.filter(q => q.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <div className="flex-1 flex flex-col bg-[#121212] border border-[#222] overflow-hidden min-h-0">
      <div className="p-4 md:p-5 border-b border-[#222] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <h2 className="text-[10px] md:text-xs uppercase tracking-widest font-bold border-l-2 border-[#00F0FF] pl-2 flex gap-4">
          <button 
            onClick={() => setActiveTab('active')} 
            className={`transition-colors ${activeTab === 'active' ? 'text-white' : 'text-[#555] hover:text-[#E0E0E0]'}`}
          >
            Daily Quests
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`transition-colors ${activeTab === 'history' ? 'text-white' : 'text-[#555] hover:text-[#E0E0E0]'}`}
          >
            History / Log
          </button>
        </h2>
      </div>

      {/* Add Task Form */}
      {activeTab === 'active' && (
      <form onSubmit={handleAdd} className="p-3 md:p-4 border-b border-[#222] bg-[#1A1A1A]/30 flex flex-col lg:flex-row gap-3 shrink-0">
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          placeholder="New Objective..."
          className="flex-1 bg-transparent border-b border-[#333] px-2 py-2 text-sm text-[#E0E0E0] placeholder-[#555] focus:outline-none focus:border-[#00F0FF] transition-colors min-w-0"
        />
        <div className="flex gap-2 lg:gap-3 items-center justify-between lg:justify-start">
          <div className="flex gap-2">
            <select 
              value={newTaskStat}
              onChange={e => setNewTaskStat(e.target.value as StatType)}
              className="bg-[#1A1A1A] border border-[#333] rounded-none px-2 md:px-3 py-1.5 text-[10px] md:text-[11px] font-mono text-[#E0E0E0] focus:outline-none focus:border-[#00F0FF] uppercase"
            >
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="mocks">Mocks</option>
            </select>
            <input 
              type="number" 
              step="0.1"
              value={newTaskChapters}
              onChange={e => setNewTaskChapters(Number(e.target.value))}
              min="0.1"
              max="100"
              className="w-16 bg-[#1A1A1A] border border-[#333] rounded-none px-2 md:px-3 py-1.5 text-[10px] md:text-[11px] font-mono text-[#E0E0E0] focus:outline-none focus:border-[#00F0FF]"
              placeholder="CH"
            />
          </div>
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-[#00F0FF] text-[#0A0A0B] px-3 md:px-4 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#00F0FF]/80 transition-colors whitespace-nowrap"
          >
            + Add Goal
          </button>
        </div>
      </form>
      )}

      {/* Quest List */}
      <div className="flex-1 overflow-y-auto flex flex-col p-3 md:p-6 space-y-3 md:space-y-4">
        <AnimatePresence>
          {activeTab === 'active' && activeQuests.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-[#555] text-xs uppercase tracking-widest font-mono"
            >
              No active quests. The System is waiting.
            </motion.div>
          )}
          
          {activeTab === 'active' && activeQuests.map((quest) => {
            return (
              <motion.div
                key={quest.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="group bg-[#1A1A1A] border border-[#333] hover:border-[#00F0FF]/50 p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-colors shrink-0"
              >
                <button 
                  onClick={() => onToggleQuest(quest.id)}
                  className="w-5 h-5 border-2 border-[#444] group-hover:border-[#00F0FF] flex items-center justify-center shrink-0 transition-colors"
                >
                </button>
                
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="text-sm font-bold uppercase tracking-wide truncate text-[#E0E0E0]">{quest.title}</div>
                  <div className="text-[9px] md:text-[10px] text-[#00F0FF]/60 font-mono mt-0.5 flex items-center gap-1 uppercase truncate">
                    <span>REWARD: +{quest.chaptersValue} {quest.stat} CH</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => onDeleteQuest(quest.id)}
                  className="text-[9px] md:text-[10px] text-[#555] group-hover:text-red-500 px-2 py-1 md:px-3 md:py-1 border border-[#333] group-hover:border-red-500/30 shrink-0 transition-colors uppercase tracking-widest"
                >
                  Delete
                </button>
              </motion.div>
            );
          })}

          {activeTab === 'history' && completedQuests.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-[#555] text-xs uppercase tracking-widest font-mono"
            >
              No history found. Complete quests to populate the log.
            </motion.div>
          )}

          {activeTab === 'history' && completedQuests.map((quest) => {
            return (
              <motion.div
                key={quest.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group bg-[#1A1A1A] border border-[#333] hover:border-[#00F0FF]/50 p-3 md:p-4 flex items-start sm:items-center gap-3 md:gap-4 transition-colors shrink-0"
              >
                <button 
                  onClick={() => onToggleQuest(quest.id)}
                  className="w-4 h-4 border border-[#00F0FF] flex items-center justify-center bg-[#00F0FF]/20 shrink-0 mt-0.5 sm:mt-0"
                >
                  <div className="w-1.5 h-1.5 bg-[#00F0FF]"></div>
                </button>
                
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="text-sm font-bold uppercase tracking-wide truncate text-[#555] line-through group-hover:text-[#E0E0E0] transition-colors">{quest.title}</div>
                  <div className="text-[9px] md:text-[10px] text-[#00F0FF]/40 font-mono mt-0.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 uppercase">
                    <span>REWARD: +{quest.chaptersValue} {quest.stat} CH</span>
                    {quest.completedAt && (
                      <span className="text-[#555]">Finished: {new Date(quest.completedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => onDeleteQuest(quest.id)}
                  className="text-[9px] md:text-[10px] text-[#555] group-hover:text-red-500 px-2 py-1 border border-[#333] group-hover:border-red-500/30 shrink-0 transition-colors uppercase tracking-widest sm:self-center"
                >
                  Delete
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
                                               }
