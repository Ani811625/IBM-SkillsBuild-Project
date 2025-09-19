import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, Bell, Timer } from 'lucide-react';

const CookingTimer = ({ recipe }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerName, setTimerName] = useState('');

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished
      setIsActive(false);
      playNotificationSound();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
    audio.play().catch(() => {
      // Fallback: use browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Finished!', {
          body: `${timerName || 'Cooking timer'} is done!`,
          icon: '/favicon.ico'
        });
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (minutes, name = '') => {
    setTimeLeft(minutes * 60);
    setTimerName(name);
    setIsActive(true);
    setShowTimer(true);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setTimerName('');
  };

  const quickTimers = [
    { name: 'Boil Water', time: 5 },
    { name: 'Prep Time', time: 10 },
    { name: 'Cook Pasta', time: 12 },
    { name: 'Saute Vegetables', time: 8 },
    { name: 'Bake Cookies', time: 15 },
    { name: 'Grill Chicken', time: 20 }
  ];

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
          <Timer className="w-6 h-6 text-emerald-500" />
          <span>Cooking Timer</span>
        </h3>
        <motion.button
          onClick={() => setShowTimer(!showTimer)}
          className="btn-secondary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Clock className="w-4 h-4" />
          <span>{showTimer ? 'Hide' : 'Show'} Timer</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showTimer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-emerald-500 mb-2 font-mono">
                {formatTime(timeLeft)}
              </div>
              {timerName && (
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  {timerName}
                </p>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              <motion.button
                onClick={toggleTimer}
                className={`btn-primary flex items-center space-x-2 ${
                  isActive ? 'bg-red-500 hover:bg-red-600' : ''
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isActive ? 'Pause' : 'Start'}</span>
              </motion.button>

              <motion.button
                onClick={resetTimer}
                className="btn-secondary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </motion.button>
            </div>

            {/* Quick Timer Buttons */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Quick Timers
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickTimers.map((timer, index) => (
                  <motion.button
                    key={timer.name}
                    onClick={() => startTimer(timer.time, timer.name)}
                    className="btn-secondary text-sm py-2 px-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {timer.name} ({timer.time}m)
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Timer Input */}
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="Minutes"
                min="1"
                max="120"
                className="input-field flex-1"
                id="customMinutes"
              />
              <motion.button
                onClick={() => {
                  const minutes = document.getElementById('customMinutes').value;
                  if (minutes) {
                    startTimer(parseInt(minutes), 'Custom Timer');
                    document.getElementById('customMinutes').value = '';
                  }
                }}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Set Timer
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe-specific timers */}
      {recipe && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Recipe Timers
          </h4>
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => startTimer(recipe.readyInMinutes || 30, recipe.title)}
              className="btn-accent flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-4 h-4" />
              <span>Cook Time ({recipe.readyInMinutes || 30}m)</span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookingTimer;
