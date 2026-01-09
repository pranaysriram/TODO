import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export default function TaskItem({
  task,
  onUpdate,
  onDelete,
  onToggleComplete,
  onStatusChange,
  showStatusDropdown = false,
  compact = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(task.id, { text: editText.trim() });
      setIsEditing(false);
      toast.success('Task updated!');
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    toast.success('Task deleted!');
  };

  const handleStatusUpdate = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
      toast.success('Status updated!');
    }
  };

  const getStatusBadge = () => {
    if (task.completed) return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Done</Badge>;
    if (task.status === 'inProgress') return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">In Progress</Badge>;
    return <Badge variant="outline" className="bg-muted text-muted-foreground">To Do</Badge>;
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <Input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="flex-1"
          autoFocus
        />
        <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 text-success hover:text-success">
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleCancel} className="h-8 w-8 text-destructive hover:text-destructive">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-3 ${compact ? 'p-2' : 'p-4'} bg-card hover:bg-muted/30 rounded-lg border border-border transition-colors`}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="mt-0.5 flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <p className={`${compact ? 'text-sm' : 'text-base'} ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'} break-words`}>
          {task.text}
        </p>
        {!compact && showStatusDropdown && (
          <div className="mt-1">
            {getStatusBadge()}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {showStatusDropdown && !task.completed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <span className="text-xs">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusUpdate('todo')}>
                Move to To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate('inProgress')}>
                Move to In Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDelete}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
