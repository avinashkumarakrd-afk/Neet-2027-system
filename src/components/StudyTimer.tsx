import { useState, useEffect, useRef } from 'react';
import { Play, Square, BellRing, BellOff } from 'lucide-react';

export default function StudyTimer() {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 mins default
  const [isActive, setIsActive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number>(25 * 60);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      playAlarm();
      showNotification();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerDuration);
  };

  const setDuration = (mins: number) => {
    setIsActive(false);
    const secs = mins * 60;
    setTimerDuration(secs);
    setTimeLeft(secs);
  };

  const playAlarm = () => {
    if (!audioRef.current) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audioRef.current = audio;
    }
    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
  };

  const showNotification = () => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification('System Alert', {
        body: 'Study session completed. Time for a break.',
        icon: '/manifest-icon-192.maskable.png', // Add icon if available, otherwise default
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#121212] border border-[#222] p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs uppercase tracking-widest font-bold border-l-2 border-[#00F0FF] pl-2">Session Timer</h2>
        <button 
          onClick={requestNotificationPermission}
          className={`text-[10px] flex items-center gap-1 uppercase tracking-widest transition-colors ${notificationsEnabled ? 'text-[#00F0FF]' : 'text-[#555] hover:text-[#E0E0E0]'}`}
        >
          {notificationsEnabled ? <BellRing className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
          {notificationsEnabled ? 'Alerts On' : 'Alerts Off'}
        </button>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333] p-6 text-center mb-4 relative overflow-hidden">
        {isActive && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-50 animate-pulse" />
        )}
        <div className="text-5xl font-mono font-black text-[#00F0FF] tabular-nums tracking-tight">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[25, 45, 60].map(mins => (
          <button
            key={mins}
            onClick={() => setDuration(mins)}
            disabled={isActive}
            className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors ${timerDuration === mins * 60 ? 'bg-[#00F0FF]/10 border-[#00F0FF]/50 text-[#00F0FF]' : 'bg-[#1A1A1A] border-[#333] text-[#555] hover:border-[#00F0FF]/30 hover:text-[#E0E0E0]'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {mins}M
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button 
          onClick={toggleTimer}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-tighter flex items-center justify-center gap-2 transition-colors ${isActive ? 'bg-[#333] text-white hover:bg-[#444]' : 'bg-[#00F0FF] text-[#0A0A0B] hover:bg-[#00F0FF]/80'}`}
        >
          {isActive ? (
            <><Square className="w-4 h-4 fill-current" /> Pause</>
          ) : (
            <><Play className="w-4 h-4 fill-current" /> {timeLeft < timerDuration ? 'Resume' : 'Start'}</>
          )}
        </button>
        <button 
          onClick={resetTimer}
          className="px-4 py-2 bg-[#1A1A1A] border border-[#333] text-[#555] hover:text-white hover:border-[#555] text-xs font-bold uppercase tracking-tighter transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
