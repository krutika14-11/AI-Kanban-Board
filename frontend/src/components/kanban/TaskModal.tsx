import { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckSquare, Square, Pencil, Check } from 'lucide-react';
import { Task, TaskStatus, Priority } from '../../types';
import { cn } from '../../utils/cn';
import { tasksService } from '../../services/tasks.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultStatus?: TaskStatus;
  onSave: (data: Partial<Task>) => Promise<void>;
}

const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export function TaskModal({ task, isOpen, onClose, projectId, defaultStatus = 'TODO', onSave }: TaskModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    status: defaultStatus,
    estimatedHours: '',
    suggestedDeadline: '',
    category: '',
    tags: '',
  });
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        status: task.status,
        estimatedHours: task.estimatedHours?.toString() ?? '',
        suggestedDeadline: task.suggestedDeadline?.split('T')[0] ?? '',
        category: task.category ?? '',
        tags: task.tags.join(', '),
      });
    } else {
      setForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: defaultStatus,
        estimatedHours: '',
        suggestedDeadline: '',
        category: '',
        tags: '',
      });
    }
  }, [task, defaultStatus, isOpen]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        status: form.status,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
        suggestedDeadline: form.suggestedDeadline ? new Date(form.suggestedDeadline).toISOString() : undefined,
        category: form.category.trim() || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSubtask() {
    if (!newSubtask.trim() || !task) return;
    await tasksService.addSubtask(task.id, newSubtask.trim());
    qc.invalidateQueries({ queryKey: ['tasks', projectId] });
    setNewSubtask('');
    toast.success('Subtask added');
  }

  async function handleToggleSubtask(subtaskId: string, completed: boolean) {
    await tasksService.updateSubtask(subtaskId, { completed: !completed });
    qc.invalidateQueries({ queryKey: ['tasks', projectId] });
  }

  function startEditingSubtask(id: string, title: string) {
    setEditingSubtaskId(id);
    setEditingSubtaskTitle(title);
  }

  async function handleSaveSubtask() {
    if (!editingSubtaskId || !editingSubtaskTitle.trim()) return;
    await tasksService.updateSubtask(editingSubtaskId, { title: editingSubtaskTitle.trim() });
    qc.invalidateQueries({ queryKey: ['tasks', projectId] });
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
    toast.success('Subtask updated');
  }

  function cancelEditingSubtask() {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  }

  async function handleDeleteSubtask(subtaskId: string) {
    await tasksService.deleteSubtask(subtaskId);
    qc.invalidateQueries({ queryKey: ['tasks', projectId] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder="Task title..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Optional description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={cn(
                      'flex-1 py-1.5 text-xs rounded-lg border transition-all',
                      form.priority === p
                        ? p === 'CRITICAL' ? 'bg-red-600 border-red-500 text-white' :
                          p === 'HIGH' ? 'bg-orange-600 border-orange-500 text-white' :
                          p === 'MEDIUM' ? 'bg-blue-600 border-blue-500 text-white' :
                          'bg-slate-600 border-slate-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {p[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hours + Deadline + Category */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Est. Hours</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                min={0}
                step={0.5}
                value={form.estimatedHours}
                onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input
                type="date"
                className="input"
                value={form.suggestedDeadline}
                onChange={e => setForm(f => ({ ...f, suggestedDeadline: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Category</label>
              <input
                className="input"
                placeholder="Backend, Frontend..."
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags <span className="text-slate-500 font-normal">(comma-separated)</span></label>
            <input
              className="input"
              placeholder="react, api, database..."
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            />
          </div>

          {/* Subtasks (only for existing tasks) */}
          {task && (
            <div>
              <label className="label">Subtasks</label>
              <div className="space-y-2 mb-3">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => handleToggleSubtask(subtask.id, subtask.completed)}
                      className="flex-shrink-0"
                    >
                      {subtask.completed ? (
                        <CheckSquare className="w-4 h-4 text-green-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {editingSubtaskId === subtask.id ? (
                      <input
                        className="input flex-1 py-1 text-sm"
                        value={editingSubtaskTitle}
                        onChange={e => setEditingSubtaskTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') void handleSaveSubtask();
                          if (e.key === 'Escape') cancelEditingSubtask();
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className={cn(
                        'text-sm flex-1',
                        subtask.completed ? 'line-through text-slate-500' : 'text-slate-300'
                      )}>
                        {subtask.title}
                      </span>
                    )}
                    {editingSubtaskId === subtask.id ? (
                      <>
                        <button
                          onClick={() => void handleSaveSubtask()}
                          disabled={!editingSubtaskTitle.trim()}
                          className="text-slate-500 hover:text-green-400 disabled:opacity-40 transition-colors"
                          aria-label="Save subtask"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEditingSubtask}
                          className="text-slate-500 hover:text-slate-200 transition-colors"
                          aria-label="Cancel subtask edit"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditingSubtask(subtask.id, subtask.title)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-200 transition-all"
                        aria-label="Edit subtask"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="input flex-1 text-sm"
                  placeholder="Add subtask..."
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(); }}
                />
                <button
                  onClick={handleAddSubtask}
                  className="btn-secondary flex items-center gap-1 text-sm px-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="btn-primary flex-1"
          >
            {saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
