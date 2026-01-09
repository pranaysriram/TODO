import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

export default function ProgressTracker({ tasks }) {
  const [streak, setStreak] = useState(0);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [motivation, setMotivation] = useState('');

  const motivationalMessages = {
    0: '🎯 Start your day with one task!',
    25: '💪 Great start! Keep it going!',
    50: '🚀 Halfway there! You\'re doing amazing!',
    75: '⭐ Almost there! Push a little more!',
    100: '🎉 Perfect! You crushed it today!'
  };

  useEffect(() => {
    // Calculate today's completion percentage
    const today = new Date().toDateString();
    const todaysTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt).toDateString();
      return taskDate === today;
    });

    if (todaysTasks.length > 0) {
      const completed = todaysTasks.filter(t => t.completed).length;
      const percent = Math.round((completed / todaysTasks.length) * 100);
      setCompletionPercent(percent);

      // Set motivation message
      if (percent === 0) {
        setMotivation(motivationalMessages[0]);
      } else if (percent < 50) {
        setMotivation(motivationalMessages[25]);
      } else if (percent < 100) {
        setMotivation(motivationalMessages[percent >= 75 ? 75 : 50]);
      } else {
        setMotivation(motivationalMessages[100]);
      }
    } else {
      setCompletionPercent(0);
      setMotivation(motivationalMessages[0]);
    }

    // Calculate streak
    calculateStreak();
  }, [tasks]);

  const calculateStreak = () => {
    const streakData = localStorage.getItem('taskStreak');
    let streakInfo = streakData ? JSON.parse(streakData) : { 
      count: 0, 
      lastDate: null,
      dates: []
    };

    const today = new Date().toDateString();
    const todaysTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt).toDateString();
      return taskDate === today;
    });

    // Check if there are completed tasks today
    const hasCompletedTasksToday = todaysTasks.some(t => t.completed);

    if (hasCompletedTasksToday) {
      if (streakInfo.lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        // Check if we completed tasks yesterday to maintain streak
        if (streakInfo.lastDate === yesterdayStr) {
          streakInfo.count += 1;
        } else if (streakInfo.lastDate === null) {
          streakInfo.count = 1;
        } else {
          streakInfo.count = 1;
        }

        streakInfo.lastDate = today;
        streakInfo.dates = [...(streakInfo.dates || []), today];
        if (streakInfo.dates.length > 30) {
          streakInfo.dates.shift();
        }
      }
    }

    localStorage.setItem('taskStreak', JSON.stringify(streakInfo));
    setStreak(streakInfo.count);
  };

  const getStreakEmoji = (count) => {
    if (count === 0) return '🔒';
    if (count === 1) return '🔥';
    if (count <= 3) return '🔥🔥';
    if (count <= 7) return '🔥🔥🔥';
    return '🔥🔥🔥🔥';
  };

  const getStreakMessage = (count) => {
    if (count === 0) return 'Start your streak!';
    if (count === 1) return '1 day streak!';
    if (count === 3) return '3 days in a row! 🎉';
    if (count === 7) return '1 week streak! 🏆';
    if (count === 14) return '2 weeks! Unstoppable! 👑';
    if (count === 30) return '1 month! You\'re a legend! 👑✨';
    return `${count} days in a row!`;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Completion */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">📊 Today's Progress</h3>
            <span className="text-2xl font-bold text-indigo-600">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-3 bg-indigo-100" />
          <p className="text-sm text-muted-foreground mt-3">{motivation}</p>
        </div>

        {/* Weekly Streak */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{getStreakEmoji(streak)}</span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Weekly Streak</h3>
              <p className="text-xl font-bold text-orange-600">{getStreakMessage(streak)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Complete tasks daily to build your streak!</p>
        </div>
      </div>
    </Card>
  );
}
