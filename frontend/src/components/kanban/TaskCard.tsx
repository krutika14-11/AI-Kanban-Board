import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Clock, Calendar, Tag, Link2, CheckSquare,
  Pencil, Trash2, GripVertical, AlertTriangle
} from 'lucide-react';
import { Task } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate, formatHours, PRIORITY_COLORS, isOverdue } from '../../utils/format';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const overdue = isOverdue(task.suggestedDeadline) && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-slate-900 border border-slate-800 rounded-xl p-3 group cursor-grab active:cursor-grabbing',
        'hover:border-slate-700 transition-all',
        (isSortableDragging || isDragging) && 'opacity-40 border-primary-600/50',
        'animate-fade-in'
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-2 mb-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 text-slate-600 hover:text-slate-400 flex-shrink-0 cursor-grab"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-100 leading-snug line-clamp-2 mb-2">
            {task.title}
          </h4>

          {/* Priority + category */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className={cn('badge text-xs', PRIORITY_COLORS[task.priority])}>
              {task.priority}
            </span>
            {task.category && (
              <span className="badge bg-slate-800 text-slate-400 text-xs">{task.category}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-slate-500 hover:text-slate-200 rounded transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Subtask progress */}
      {totalSubtasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              {completedSubtasks}/{totalSubtasks} subtasks
            </span>
            <span>{subtaskProgress}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full">
            <div
              className="h-full bg-green-600 rounded-full transition-all"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="flex items-center gap-0.5 text-xs text-slate-500">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
        <div className="flex items-center gap-2">
          {task.estimatedHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatHours(task.estimatedHours)}
            </span>
          )}
          {task.dependencies.length > 0 && (
            <span className="flex items-center gap-1" title={`Depends on: ${task.dependencies.join(', ')}`}>
              <Link2 className="w-3 h-3" />
              {task.dependencies.length}
            </span>
          )}
        </div>

        {task.suggestedDeadline && (
          <span className={cn(
            'flex items-center gap-1',
            overdue ? 'text-red-400' : 'text-slate-500'
          )}>
            {overdue && <AlertTriangle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            {formatDate(task.suggestedDeadline)}
          </span>
        )}
      </div>
    </div>
  );
}
