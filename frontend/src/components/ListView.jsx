import React from 'react';
import TaskItem from './TaskItem';
import { Separator } from './ui/separator';

export default function ListView({ tasks, onUpdateTask, onDeleteTask, onToggleComplete }) {
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground">Add your first task above to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Active Tasks ({activeTasks.length})
                </h2>
                <div className="space-y-2">
                  {activeTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      onToggleComplete={onToggleComplete}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTasks.length > 0 && completedTasks.length > 0 && (
              <Separator className="my-6" />
            )}

            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Completed ({completedTasks.length})
                </h2>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      onToggleComplete={onToggleComplete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
