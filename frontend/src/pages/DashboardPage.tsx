import { useNavigate } from 'react-router-dom';
import { FolderKanban, CheckCircle2, AlertCircle, Cpu, Plus, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { useProjects, useProjectStats } from '../hooks/useProjects';
import { useAIStatus } from '../hooks/useAI';
import { formatRelative, PRIORITY_COLORS } from '../utils/format';
import { cn } from '../utils/cn';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const { data: stats } = useProjectStats();
  const { data: aiStatus } = useAIStatus();

  const totalTasks = stats?.taskStats.reduce((s, t) => s + t._count._all, 0) ?? 0;
  const doneTasks = stats?.taskStats.find(t => t.status === 'DONE')?._count._all ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.total ?? 0,
      icon: FolderKanban,
      color: 'text-primary-400',
      bg: 'bg-primary-900/20',
    },
    {
      label: 'Active Projects',
      value: stats?.active ?? 0,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
    },
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: BarChart3,
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
    },
    {
      label: 'Completed Tasks',
      value: doneTasks,
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
    },
    {
      label: 'Overdue Tasks',
      value: stats?.overdue ?? 0,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
    },
    {
      label: 'AI Plans Generated',
      value: stats?.aiPlans ?? 0,
      icon: Cpu,
      color: 'text-purple-400',
      bg: 'bg-purple-900/20',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">AI-powered project management overview</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* AI Status Banner */}
      {aiStatus && (
        <div className={cn(
          'mb-6 p-3 rounded-lg border flex items-center gap-3 text-sm',
          aiStatus.llmAvailable
            ? 'bg-green-900/20 border-green-800 text-green-300'
            : 'bg-amber-900/20 border-amber-800 text-amber-300'
        )}>
          <Cpu className="w-4 h-4 flex-shrink-0" />
          <span>
            AI Provider: <strong>{aiStatus.provider}</strong> · Model: <strong>{aiStatus.model}</strong>
            {aiStatus.llmAvailable ? ' · Online' : ' · Offline (mock mode)'}
            {' '}· Vector DB: {aiStatus.vectorDbAvailable ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="card p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', card.bg)}>
              <card.icon className={cn('w-4 h-4', card.color)} />
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-xs text-slate-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      {totalTasks > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Overall Completion</span>
            <span className="text-sm font-bold text-white">{completionRate}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{doneTasks} done</span>
            <span>{totalTasks - doneTasks} remaining</span>
          </div>
        </div>
      )}

      {/* Projects list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-48 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-96" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderKanban className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No projects yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              Create your first AI-powered project and let the AI generate a complete task plan.
            </p>
            <button onClick={() => navigate('/projects/new')} className="btn-primary">
              Create First Project
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map(project => {
              const tasks = project.tasks ?? [];
              const done = tasks.filter(t => t.status === 'DONE').length;
              const completion = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

              return (
                <div
                  key={project.id}
                  className="card p-5 cursor-pointer hover:border-slate-700 transition-colors group"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors truncate">
                          {project.name}
                        </h3>
                        <span className={cn(
                          'badge flex-shrink-0',
                          project.status === 'active' ? 'bg-green-900/40 text-green-400' :
                          project.status === 'completed' ? 'bg-blue-900/40 text-blue-400' :
                          'bg-slate-700 text-slate-400'
                        )}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 truncate mb-3">{project.goal}</p>

                      {/* Progress bar */}
                      {tasks.length > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full">
                            <div
                              className="h-full bg-primary-600 rounded-full"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0">{completion}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 ml-6 text-sm text-slate-400 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5" />
                        {tasks.length} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatRelative(project.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
