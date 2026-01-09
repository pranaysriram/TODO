import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { LayoutList, Calendar, LayoutGrid } from 'lucide-react';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import KanbanView from './components/KanbanView';
import Header from './components/Header';
import { Toaster } from './components/ui/sonner';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [activeView, setActiveView] = useState('list');

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

  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('todoTasks')) {
      localStorage.setItem('todoTasks', JSON.stringify(tasks));
      console.log('Saved tasks to localStorage:', tasks);
    }
  }, [tasks]);

  const addTask = (taskText) => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
      status: 'todo'
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

  return (
    <div className="min-h-screen bg-background">
      <Header onAddTask={addTask} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
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
              tasks={tasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onToggleComplete={toggleComplete}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <CalendarView
              tasks={tasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onToggleComplete={toggleComplete}
            />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            <KanbanView
              tasks={tasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onToggleComplete={toggleComplete}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  );
}

