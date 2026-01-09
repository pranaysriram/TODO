import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import TaskItem from './TaskItem';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/badge';

export default function KanbanView({ tasks, onUpdateTask, onDeleteTask, onToggleComplete }) {
  const todoTasks = tasks.filter(task => task.status === 'todo' && !task.completed);
  const inProgressTasks = tasks.filter(task => task.status === 'inProgress' && !task.completed);
  const doneTasks = tasks.filter(task => task.completed);

  const handleStatusChange = (taskId, newStatus) => {
    onUpdateTask(taskId, { status: newStatus });
  };

  const KanbanColumn = ({ title, tasks, status, icon: Icon, color, compactItems = false }) => (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="text-base font-semibold">{title}</span>
          </div>
          <Badge variant="secondary" className="ml-2">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onToggleComplete={onToggleComplete}
                onStatusChange={handleStatusChange}
                showStatusDropdown={!compactItems}
                compact={compactItems}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KanbanColumn
        title="To Do"
        tasks={todoTasks}
        status="todo"
        icon={Circle}
        color="text-muted-foreground"
      />
      <KanbanColumn
        title="In Progress"
        tasks={inProgressTasks}
        status="inProgress"
        icon={Clock}
        color="text-primary"
      />
      <KanbanColumn
        title="Done"
        tasks={doneTasks}
        status="done"
        icon={CheckCircle2}
        color="text-success"
        compactItems={true}
      />
    </div>
  );
}
