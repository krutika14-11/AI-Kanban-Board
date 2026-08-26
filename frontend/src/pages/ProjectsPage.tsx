import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Trash2, ArrowRight, Cpu } from 'lucide-react';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import { formatDate, formatRelative } from '../utils/format';
import { cn } from '../utils/cn';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    await deleteProject.mutateAsync(id);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-64 mb-3" />
              <div className="h-4 bg-slate-800 rounded w-full mb-2" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderKanban className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Create a project with a goal in plain English and let AI generate a complete project plan with tasks, priorities, and deadlines.
          </p>
          <button onClick={() => navigate('/projects/new')} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-2" />
            Create First Project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => {
            const tasks = project.tasks ?? [];
            const done = tasks.filter(t => t.status === 'DONE').length;
            const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
            const completion = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
            const hasAI = (project._count?.aiExecutions ?? 0) > 0;

            return (
              <div
                key={project.id}
                className="card p-6 cursor-pointer hover:border-slate-700 transition-all group"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {project.name}
                      </h2>
                      <span className={cn(
                        'badge',
                        project.status === 'active' ? 'bg-green-900/40 text-green-400' :
                        project.status === 'completed' ? 'bg-blue-900/40 text-blue-400' :
                        'bg-slate-700 text-slate-400'
                      )}>
                        {project.status}
                      </span>
                      {hasAI && (
                        <span className="badge bg-purple-900/40 text-purple-400">
                          <Cpu className="w-3 h-3 mr-1" />
                          AI
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.goal}</p>

                    {project.summary && (
                      <p className="text-slate-500 text-xs mb-4 line-clamp-1 italic">{project.summary}</p>
                    )}

                    {/* Tech stack */}
                    {project.technologyStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.technologyStack.slice(0, 6).map(tech => (
                          <span key={tech} className="badge bg-slate-800 text-slate-400">{tech}</span>
                        ))}
                      </div>
                    )}

                    {/* Progress */}
                    {tasks.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span>{tasks.length} tasks · {inProgress} in progress</span>
                          <span>{completion}% complete</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full">
                          <div
                            className="h-full bg-primary-600 rounded-full transition-all"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-6 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => handleDelete(e, project.id)}
                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <div className="text-xs text-slate-500 text-right">
                      {project.deadline && <div>Due {formatDate(project.deadline)}</div>}
                      <div>Created {formatRelative(project.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
