import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, CheckSquare, ChevronDown, Clock, Calendar, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import GoogleAuthButton from './GoogleAuthButton';

export default function Header({ onAddTask, onLogin, onLogout, auth, mode, onModeChange }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  }, [isDark]);

  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [labels, setLabels] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState('none');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskText.trim()) {
      const dueDatetime = dueDate && dueTime ? `${dueDate}T${dueTime}` : dueDate;
      // Auto-add current mode as label if mode is selected
      const taskLabels = mode && mode !== 'all' ? [mode, ...labels] : labels;
      onAddTask(taskText.trim(), priority, taskLabels, dueDatetime, reminder);
      setTaskText('');
      setPriority('medium');
      setLabels([]);
      setDueDate('');
      setDueTime('');
      setReminder('none');
      toast.success('Task added successfully!');
    }
  };

  const toggleLabel = (label) => {
    setLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Daily Tasks</h1>
              <p className="text-sm text-muted-foreground">Stay organized, stay productive</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap items-center">
          <Input
            type="text"
            placeholder="What needs to be done today?"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="flex-1 min-w-[160px] h-12 text-base"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12">
                {priority === 'high' && '🔴'} 
                {priority === 'medium' && '🟡'} 
                {priority === 'low' && '🟢'}
                <span className="ml-1">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPriority('high')}>
                🔴 High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority('medium')}>
                🟡 Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority('low')}>
                🟢 Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12">
                <span className="capitalize">{mode && mode !== 'all' ? mode : 'Mode'}</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onModeChange && onModeChange('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModeChange && onModeChange('study')}>📚 Study</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModeChange && onModeChange('work')}>💪 Workout</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModeChange && onModeChange('health')}>❤️ Health</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Labels UI removed */}

          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-12 px-3 rounded-md border border-input bg-background text-sm"
              title="Set due date"
            />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="h-12 px-3 rounded-md border border-input bg-background text-sm"
              title="Set due time"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12">
                <Clock className="h-4 w-4 mr-1" />
                {reminder === 'none' ? 'Reminder' : reminder}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setReminder('none')}>
                No Reminder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setReminder('15min')}>
                ⏰ 15 minutes before
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReminder('1hr')}>
                ⏰ 1 hour before
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReminder('1day')}>
                ⏰ 1 day before
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button type="submit" size="lg" className="px-6 h-12">
            <Plus className="h-5 w-5 mr-2" />
            Add
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsDark(prev => !prev)}
            className="h-12 w-12 flex items-center justify-center"
            title="Toggle dark mode"
            aria-pressed={isDark}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-foreground" />
            )}
          </Button>

          <div className="ml-2">
            <GoogleAuthButton onLogin={onLogin} />
          </div>
        </form>
      </div>
    </header>
  );
}
