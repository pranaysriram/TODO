import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = [...Array(7)].map((_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const goToPreviousWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const goToNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const getAllTasksForDate = (date) => {
    return tasks.filter(task => {
      const when = task.dueDate || task.createdAt;
      if (!when) return false;
      return new Date(when).toDateString() === date.toDateString();
    });
  };

  const isToday = (date) =>
    date.toDateString() === new Date().toDateString();

  /* ==================================
     LABEL-WISE COMPLETION CALCULATION
     (THIS IS THE IMPORTANT PART)
  =================================== */
  const calculateLabelProgress = () => {
    const stats = {
      study: { total: 0, completed: 0 },
      workout: { total: 0, completed: 0 },
      health: { total: 0, completed: 0 },
    };

    tasks.forEach(task => {
      if (!Array.isArray(task.labels)) return;

      if (task.labels.includes('study')) {
        stats.study.total++;
        if (task.completed) stats.study.completed++;
      }

      if (task.labels.includes('workout')) {
        stats.workout.total++;
        if (task.completed) stats.workout.completed++;
      }

      if (task.labels.includes('health')) {
        stats.health.total++;
        if (task.completed) stats.health.completed++;
      }
    });

    return {
      study: stats.study.total
        ? Math.round((stats.study.completed / stats.study.total) * 100)
        : 0,
      workout: stats.workout.total
        ? Math.round((stats.workout.completed / stats.workout.total) * 100)
        : 0,
      health: stats.health.total
        ? Math.round((stats.health.completed / stats.health.total) * 100)
        : 0,
      total:
        stats.study.total +
        stats.workout.total +
        stats.health.total,
    };
  };

  const labelStats = calculateLabelProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {weekDays[0].toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar */}
      <div className="flex md:grid md:grid-cols-7 gap-4 overflow-x-auto py-2">
        {weekDays.map((day, index) => {
          const dayTasks = getAllTasksForDate(day);
          return (
            <Card
              key={index}
              className={`${isToday(day) ? 'ring-2 ring-primary' : ''} min-w-[220px]`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-center">
                  <div className="text-xs uppercase text-muted-foreground">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-2xl font-semibold">
                    {day.getDate()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                {dayTasks.length} task(s)
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* LABEL-WISE COMPLETION GRAPH */}
      {labelStats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Progress by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar label="📚 Study" value={labelStats.study} color="bg-blue-500" />
            <ProgressBar label="💪 Workout" value={labelStats.workout} color="bg-purple-500" />
            <ProgressBar label="❤️ Health" value={labelStats.health} color="bg-pink-500" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* =========================
   REUSABLE PROGRESS BAR
========================= */
function ProgressBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
        <div
          className={`${color} h-full flex items-center justify-center text-white text-xs font-semibold transition-all`}
          style={{ width: `${value}%` }}
        >
          {value > 5 && `${value}%`}
        </div>
      </div>
    </div>
  );
}
