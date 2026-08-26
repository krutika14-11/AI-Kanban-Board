import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { cn } from '../../utils/cn';

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
}

export function KanbanColumn({ id, label, color, tasks, onEditTask, onDeleteTask, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-2.5 h-2.5 rounded-full', color)} />
          <span className="text-sm font-semibold text-slate-200">{label}</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        id={id}
        className={cn(
          'flex-1 rounded-xl p-2 min-h-[100px] space-y-2 transition-colors',
          isOver ? 'bg-slate-800/60 border border-slate-600 border-dashed' : 'bg-slate-900/40'
        )}
      >
        {tasks.length === 0 && (
          <div className={cn(
            'h-20 flex items-center justify-center text-xs text-slate-600 rounded-lg border border-dashed transition-colors',
            isOver ? 'border-primary-600 text-primary-600' : 'border-slate-800'
          )}>
            {isOver ? 'Drop here' : 'No tasks'}
          </div>
        )}

        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
