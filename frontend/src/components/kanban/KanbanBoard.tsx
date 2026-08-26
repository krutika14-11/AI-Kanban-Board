import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useUpdateTaskStatus } from '../../hooks/useTasks';

const COLUMNS: Array<{ id: TaskStatus; label: string; color: string }> = [
  { id: 'BACKLOG', label: 'Backlog', color: 'bg-slate-600' },
  { id: 'TODO', label: 'To Do', color: 'bg-blue-600' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-600' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-600' },
  { id: 'DONE', label: 'Done', color: 'bg-green-600' },
];

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanBoard({ tasks, projectId, onEditTask, onDeleteTask, onAddTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateStatus = useUpdateTaskStatus(projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const getTasksByStatus = useCallback((status: TaskStatus) =>
    tasks.filter(t => t.status === status).sort((a, b) => a.position - b.position),
    [tasks]
  );

  function onDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function onDragOver(_event: DragOverEvent) {
    // Allow visual feedback during drag
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // If dropped on a column header
    const targetColumn = COLUMNS.find(c => c.id === overId);
    if (targetColumn) {
      const task = tasks.find(t => t.id === activeTaskId);
      if (task && task.status !== targetColumn.id) {
        updateStatus.mutate({ id: activeTaskId, status: targetColumn.id });
      }
      return;
    }

    // If dropped on another task
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      const activeTask = tasks.find(t => t.id === activeTaskId);
      if (activeTask && activeTask.status !== overTask.status) {
        updateStatus.mutate({ id: activeTaskId, status: overTask.status });
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <SortableContext
              key={column.id}
              items={columnTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                label={column.label}
                color={column.color}
                tasks={columnTasks}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onAddTask={() => onAddTask(column.id)}
              />
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 rotate-2 scale-105">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
