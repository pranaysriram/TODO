import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { LayoutList, Calendar, LayoutGrid, Linkedin, Github } from 'lucide-react';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import KanbanView from './components/KanbanView';
import Header from './components/Header';
import MotivationModal from './components/MotivationModal';
import { Toaster } from './components/ui/sonner';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return token ? { token, user: user ? JSON.parse(user) : null } : null;
  });
  const [mode, setMode] = useState('all');
  const [activeView, setActiveView] = useState('list');
  const [showMotivation, setShowMotivation] = useState(false);

  useEffect(() => {
    // Show motivation modal on first visit
    const hasSeenMotivation = localStorage.getItem('hasSeenAppMotivation');
    if (!hasSeenMotivation) {
      setShowMotivation(true);
      localStorage.setItem('hasSeenAppMotivation', 'true');
    }
  }, []);

  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed);
        console.log('Loaded tasks from localStorage:', parsed);
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
      }
    }
  }, []);

  // If logged in, try to load tasks from server
  useEffect(() => {
    const tryLoad = async () => {
      if (!auth || !auth.token) return;
      try {
        const res = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${auth.token}` } });
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();
        if (data && Array.isArray(data.tasks) && data.tasks.length > 0) {
          setTasks(data.tasks);
          localStorage.setItem('todoTasks', JSON.stringify(data.tasks));
        }
      } catch (e) {
        console.warn('Could not load remote tasks', e);
      }
    };
    tryLoad();
  }, [auth]);

  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('todoTasks')) {
      localStorage.setItem('todoTasks', JSON.stringify(tasks));
      console.log('Saved tasks to localStorage:', tasks);
    }
  }, [tasks]);

  // Auto-sync to server when tasks change (debounced)
  useEffect(() => {
    if (!auth || !auth.token) return;
    const handler = setTimeout(async () => {
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
          body: JSON.stringify({ tasks })
        });
        console.log('Synced tasks to server');
      } catch (e) {
        console.warn('Task sync failed', e);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [tasks, auth]);

  // Check reminders periodically
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      tasks.forEach(task => {
        if (task.dueDate && task.reminder && task.reminder !== 'none' && !task.completed) {
          const dueDate = new Date(task.dueDate);
          const now = new Date();
          
          let reminderTime = new Date(dueDate);
          if (task.reminder === '15min') {
            reminderTime.setMinutes(reminderTime.getMinutes() - 15);
          } else if (task.reminder === '1hr') {
            reminderTime.setHours(reminderTime.getHours() - 1);
          } else if (task.reminder === '1day') {
            reminderTime.setDate(reminderTime.getDate() - 1);
          }
          
          // Check if we're within 1 minute of the reminder time
          const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
          if (timeDiff < 60000 && !sessionStorage.getItem(`reminded-${task.id}`)) {
            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
              new Notification('Task Reminder', {
                body: `${task.text} is due at ${new Date(task.dueDate).toLocaleTimeString()}`,
                icon: '⏰'
              });
            }
            sessionStorage.setItem(`reminded-${task.id}`, 'true');
          }
        }
      });
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(reminderInterval);
  }, [tasks]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addTask = (taskText, priority = 'medium', labels = [], dueDate = '', reminder = 'none') => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
      status: 'todo',
      priority: priority,
      labels: labels,
      dueDate: dueDate,
      reminder: reminder
    };
    setTasks([newTask, ...tasks]);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleLogin = (token, user) => {
    setAuth({ token, user });
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setAuth(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MotivationModal isOpen={showMotivation} onClose={() => setShowMotivation(false)} />
      <Header onAddTask={addTask} auth={auth} onLogin={handleLogin} onLogout={handleLogout} mode={mode} onModeChange={setMode} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 h-12 bg-muted/50">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0">
            <ListView
              tasks={mode === 'all' ? tasks : tasks.filter(t => {
                if (!Array.isArray(t.labels) || t.labels.length === 0) return true;
                return t.labels.includes(mode);
              })}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onToggleComplete={toggleComplete}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <CalendarView
              tasks={mode === 'all' ? tasks : tasks.filter(t => {
                if (!Array.isArray(t.labels) || t.labels.length === 0) return true;
                return t.labels.includes(mode);
              })}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onToggleComplete={toggleComplete}
            />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            <KanbanView
              tasks={mode === 'all' ? tasks : tasks.filter(t => {
                if (!Array.isArray(t.labels) || t.labels.length === 0) return true;
                return t.labels.includes(mode);
              })}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onToggleComplete={toggleComplete}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="mt-auto py-6 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Developed by pranaysriram • <a href="https://github.com/pranaysriram" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"><Github className="h-4 w-4 inline" /></a> • <a href="https://www.linkedin.com/in/sriram-pranay-kumar/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors"><Linkedin className="h-4 w-4 inline" /></a></p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}

