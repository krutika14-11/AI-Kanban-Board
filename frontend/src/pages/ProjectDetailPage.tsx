import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Cpu, RefreshCw, Code2, Brain,
  BarChart3, Clock, CheckCircle2, AlertCircle,
  Loader2, ChevronDown, ChevronRight, Plus
} from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useGeneratePlan, useAIExecutionHistory } from '../hooks/useAI';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskModal } from '../components/kanban/TaskModal';
import { JSONViewer } from '../components/ai/JSONViewer';
import { RAGInspector } from '../components/ai/RAGInspector';
import { Task, TaskStatus } from '../types';
import { formatDate } from '../utils/format';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

type Tab = 'kanban' | 'json' | 'rag' | 'history';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(id!);
  const { data: executions = [] } = useAIExecutionHistory(id!);
  const createTask = useCreateTask(id!);
  const updateTask = useUpdateTask(id!);
  const deleteTask = useDeleteTask(id!);
  const generatePlan = useGeneratePlan(id!);

  const [activeTab, setActiveTab] = useState<Tab>('kanban');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultModalStatus, setDefaultModalStatus] = useState<TaskStatus>('TODO');
  const [lastResult, setLastResult] = useState<{
    plan: unknown;
    retrievedDocs: Array<{ title: string; category: string; score: number }>;
    modelUsed: string;
    executionTimeMs: number;
    retryCount: number;
    repaired: boolean;
  } | null>(null);
  const [showStats, setShowStats] = useState(true);

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Project not found</h2>
        <button onClick={() => navigate('/projects')} className="btn-primary">Back to Projects</button>
      </div>
    );
  }

  // Stats
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours ?? 0), 0);
  const completion = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  async function handleGeneratePlan() {
    try {
      const result = await generatePlan.mutateAsync({
        projectId: project!.id,
        goal: project!.goal,
        deadline: project!.deadline ?? undefined,
        teamSize: project!.teamSize,
        experienceLevel: project!.experienceLevel,
        technologyStack: project!.technologyStack,
      });
      setLastResult(result);
      setActiveTab('json');
      toast.success(`Generated ${result.plan.tasks.length} tasks!`);
    } catch {
      // error handled by hook
    }
  }

  function openNewTask(status: TaskStatus) {
    setEditingTask(null);
    setDefaultModalStatus(status);
    setIsModalOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setIsModalOpen(true);
  }

  async function handleSaveTask(data: Partial<Task>) {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...data });
    } else {
      await createTask.mutateAsync({ title: data.title!, ...data, status: defaultModalStatus });
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return;
    await deleteTask.mutateAsync(taskId);
  }

  const latestExecution = executions[0];
  const parsedLatestPlan = latestExecution?.parsedJson
    ? JSON.parse(latestExecution.parsedJson)
    : null;
  const latestDocs = latestExecution?.retrievedDocs
    ? JSON.parse(latestExecution.retrievedDocs)
    : [];

  const tabs: Array<{ id: Tab; icon: typeof BarChart3; label: string }> = [
    { id: 'kanban', icon: BarChart3, label: 'Kanban' },
    { id: 'json', icon: Code2, label: 'AI JSON' },
    { id: 'rag', icon: Brain, label: 'RAG Inspector' },
    { id: 'history', icon: Clock, label: 'AI History' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="mt-1 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              <p className="text-sm text-slate-400 mt-0.5 max-w-xl line-clamp-2">{project.goal}</p>
              {project.deadline && (
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  Deadline: {formatDate(project.deadline)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePlan}
              disabled={generatePlan.isPending}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {generatePlan.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Cpu className="w-4 h-4" />
              )}
              {executions.length > 0 ? 'Regenerate Plan' : '✨ Generate AI Plan'}
            </button>
            <button
              onClick={() => openNewTask('TODO')}
              className="btn-secondary flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Progress + Stats */}
        <div
          className="mt-4 cursor-pointer"
          onClick={() => setShowStats(s => !s)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">{tasks.length} tasks</span>
              <span className="text-yellow-400">{inProgress} in progress</span>
              <span className="text-green-400">{doneTasks} done</span>
              {totalHours > 0 && <span className="text-slate-500">{totalHours.toFixed(0)}h estimated</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{completion}%</span>
              {showStats ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </div>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-6 border-b border-slate-800 bg-slate-900/50">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'kanban' && (
          <div className="p-6 h-full overflow-auto">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BarChart3 className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-white font-medium mb-2">No tasks yet</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-md">
                  Generate an AI plan to automatically create tasks, or add tasks manually.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleGeneratePlan} disabled={generatePlan.isPending} className="btn-primary flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Generate AI Plan
                  </button>
                  <button onClick={() => openNewTask('TODO')} className="btn-secondary">Add Task Manually</button>
                </div>
              </div>
            ) : (
              <KanbanBoard
                tasks={tasks}
                projectId={id!}
                onEditTask={openEditTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={openNewTask}
              />
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="p-6 space-y-4 overflow-auto h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-sm text-slate-400 flex-1">
                Natural Language Goal → Retrieved Context → <span className="text-primary-400">AI JSON</span> → Kanban Tasks
              </div>
              {lastResult && (
                <button
                  onClick={() => setActiveTab('rag')}
                  className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300"
                >
                  <Brain className="w-3.5 h-3.5" />
                  View RAG details
                </button>
              )}
            </div>

            {lastResult ? (
              <JSONViewer data={lastResult.plan} title="Latest AI Plan (JSON)" />
            ) : parsedLatestPlan ? (
              <JSONViewer data={parsedLatestPlan} title="Saved AI Plan (JSON)" />
            ) : (
              <div className="card p-12 text-center">
                <Code2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">No AI plan generated yet.</p>
                <button onClick={handleGeneratePlan} className="btn-primary mt-4">
                  Generate AI Plan
                </button>
              </div>
            )}

            {lastResult && (
              <div className="card p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Pipeline: Goal → Tasks</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-slate-800/40 p-3 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Natural Language Goal</div>
                    <div className="text-slate-300">{project.goal}</div>
                  </div>
                  <div className="text-center text-slate-600">↓ Embedding + RAG Retrieval</div>
                  <div className="bg-slate-800/40 p-3 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Retrieved {lastResult.retrievedDocs.length} knowledge documents</div>
                    <div className="flex flex-wrap gap-2">
                      {lastResult.retrievedDocs.map((doc, i) => (
                        <span key={i} className="badge bg-purple-900/40 text-purple-300">
                          {doc.title} ({doc.score.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-center text-slate-600">↓ LLM Generation ({lastResult.modelUsed})</div>
                  <div className="bg-slate-800/40 p-3 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Generated JSON → Validated → {tasks.length} Kanban tasks</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Valid JSON · {lastResult.executionTimeMs}ms · {lastResult.retryCount + 1} attempt(s)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rag' && (
          <div className="p-6 space-y-4 overflow-auto h-full">
            <RAGInspector
              retrievedDocs={lastResult?.retrievedDocs ?? latestDocs}
              projectGoal={project.goal}
              modelUsed={lastResult?.modelUsed ?? latestExecution?.model}
              executionTimeMs={lastResult?.executionTimeMs ?? latestExecution?.executionTimeMs ?? undefined}
              retryCount={lastResult?.retryCount ?? latestExecution?.retryCount}
              repaired={lastResult?.repaired}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6 space-y-4 overflow-auto h-full">
            <h2 className="text-lg font-semibold text-white">AI Execution History</h2>
            {executions.length === 0 ? (
              <div className="card p-12 text-center">
                <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">No AI executions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {executions.map(exec => (
                  <div key={exec.id} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'badge',
                          exec.validationStatus === 'success' ? 'bg-green-900/40 text-green-400' :
                          exec.validationStatus === 'failed' ? 'bg-red-900/40 text-red-400' :
                          'bg-slate-700 text-slate-400'
                        )}>
                          {exec.validationStatus}
                        </span>
                        <span className="text-sm font-medium text-white">{exec.model}</span>
                        <span className="text-xs text-slate-500">v{exec.promptVersion}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(exec.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">Execution Time</div>
                        <div className="text-slate-300">{exec.executionTimeMs ? `${exec.executionTimeMs}ms` : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Retries</div>
                        <div className="text-slate-300">{exec.retryCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Retrieved Docs</div>
                        <div className="text-slate-300">
                          {exec.retrievedDocs ? JSON.parse(exec.retrievedDocs).length : 0}
                        </div>
                      </div>
                    </div>

                    {exec.parsedJson && (
                      <div className="mt-3">
                        <JSONViewer data={JSON.parse(exec.parsedJson)} title="Parsed Plan" compact />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        task={editingTask}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        projectId={id!}
        defaultStatus={defaultModalStatus}
        onSave={handleSaveTask}
      />
    </div>
  );
}
