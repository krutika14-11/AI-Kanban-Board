import { formatDistanceToNow, format, isPast, parseISO } from 'date-fns';
import { Priority, TaskStatus } from '../types';

export function formatDate(date: string | undefined): string {
  if (!date) return 'No deadline';
  try {
    return format(parseISO(date), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

export function formatRelative(date: string): string {
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return '';
  }
}

export function isOverdue(date: string | undefined): boolean {
  if (!date) return false;
  try {
    return isPast(parseISO(date));
  } catch {
    return false;
  }
}

export function formatHours(hours: number | undefined): string {
  if (!hours) return '';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours === Math.floor(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'text-slate-400 bg-slate-800',
  MEDIUM: 'text-blue-400 bg-blue-900/40',
  HIGH: 'text-orange-400 bg-orange-900/40',
  CRITICAL: 'text-red-400 bg-red-900/40',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  BACKLOG: 'bg-slate-700',
  TODO: 'bg-blue-700',
  IN_PROGRESS: 'bg-yellow-600',
  IN_REVIEW: 'bg-purple-700',
  DONE: 'bg-green-700',
};
