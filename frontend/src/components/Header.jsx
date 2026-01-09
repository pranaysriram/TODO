import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function Header({ onAddTask }) {
  const [taskText, setTaskText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask(taskText.trim());
      setTaskText('');
      toast.success('Task added successfully!');
    }
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

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="What needs to be done today?"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="flex-1 h-12 text-base"
          />
          <Button type="submit" size="lg" className="px-6">
            <Plus className="h-5 w-5 mr-2" />
            Add
          </Button>
        </form>
      </div>
    </header>
  );
}
