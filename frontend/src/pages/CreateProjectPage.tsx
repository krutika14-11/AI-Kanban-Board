import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ArrowLeft, Plus, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useCreateProject } from '../hooks/useProjects';
import { useGeneratePlan, useAIStatus } from '../hooks/useAI';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const EXAMPLE_GOALS = [
  'Build an e-commerce platform with React and Node.js including authentication, product catalog, shopping cart, payment integration with Stripe, and an admin dashboard within 30 days.',
  'Create a SaaS project management tool with team collaboration, real-time updates, file sharing, and subscription billing.',
  'Develop a social media analytics dashboard with data visualization, multi-platform integration, and automated reporting.',
];

const TECH_PRESETS = ['React', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'Redis', 'GraphQL', 'Next.js'];

type GenerationStage = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
};

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const generatePlan = useGeneratePlan('');
  const { data: aiStatus } = useAIStatus();

  const [form, setForm] = useState({
    name: '',
    goal: '',
    deadline: '',
    teamSize: 1,
    experienceLevel: 'intermediate' as const,
    technologyStack: [] as string[],
    customTech: '',
  });

  const [stages, setStages] = useState<GenerationStage[]>([
    { id: 'analyze', label: 'Analyzing project goal', status: 'pending' },
    { id: 'embed', label: 'Generating embeddings', status: 'pending' },
    { id: 'retrieve', label: 'Retrieving relevant knowledge', status: 'pending' },
    { id: 'generate', label: 'Generating AI task plan', status: 'pending' },
    { id: 'validate', label: 'Validating JSON output', status: 'pending' },
    { id: 'persist', label: 'Creating Kanban board', status: 'pending' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  function updateStage(id: string, status: GenerationStage['status']) {
    setStages(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  function addTech(tech: string) {
    const t = tech.trim();
    if (!t || form.technologyStack.includes(t)) return;
    setForm(f => ({ ...f, technologyStack: [...f.technologyStack, t], customTech: '' }));
  }

  function removeTech(tech: string) {
    setForm(f => ({ ...f, technologyStack: f.technologyStack.filter(t => t !== tech) }));
  }

  async function handleSubmit(withAI: boolean) {
    if (!form.name.trim() || !form.goal.trim()) {
      toast.error('Name and goal are required');
      return;
    }

    try {
      // Create project first
      const project = await createProject.mutateAsync({
        name: form.name.trim(),
        goal: form.goal.trim(),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        teamSize: form.teamSize,
        experienceLevel: form.experienceLevel,
        technologyStack: form.technologyStack,
      });

      if (!withAI) {
        navigate(`/projects/${project.id}`);
        return;
      }

      // Run AI generation with staged updates
      setIsGenerating(true);
      const stageOrder = ['analyze', 'embed', 'retrieve', 'generate', 'validate', 'persist'];

      for (let i = 0; i < stageOrder.length - 1; i++) {
        updateStage(stageOrder[i], 'active');
        await delay(600 + Math.random() * 400);
        updateStage(stageOrder[i], 'done');
      }
      updateStage('persist', 'active');

      await generatePlan.mutateAsync({
        projectId: project.id,
        goal: form.goal.trim(),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        teamSize: form.teamSize,
        experienceLevel: form.experienceLevel,
        technologyStack: form.technologyStack,
      });

      updateStage('persist', 'done');
      await delay(500);
      navigate(`/projects/${project.id}`);
    } catch {
      setStages(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'error' } : s));
      setIsGenerating(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Create New Project</h1>
        <p className="text-slate-400 mt-1">Describe your project and let AI generate a complete task plan</p>
      </div>

      <div className="space-y-6">
        {/* Project name */}
        <div>
          <label className="label">Project Name *</label>
          <input
            className="input"
            placeholder="E.g., E-Commerce Platform"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Goal */}
        <div>
          <label className="label">Project Goal * <span className="text-slate-500 font-normal">(plain English)</span></label>
          <textarea
            className="input min-h-[120px] resize-y"
            placeholder="Describe what you want to build, the features needed, and any constraints..."
            value={form.goal}
            onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
          />
          <div className="mt-2 space-y-1">
            <p className="text-xs text-slate-500">Examples:</p>
            {EXAMPLE_GOALS.map((eg, i) => (
              <button
                key={i}
                className="text-xs text-slate-500 hover:text-primary-400 transition-colors text-left w-full truncate"
                onClick={() => setForm(f => ({ ...f, goal: eg }))}
              >
                → {eg.slice(0, 100)}...
              </button>
            ))}
          </div>
        </div>

        {/* Row: Deadline + Team size + Experience */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Deadline</label>
            <input
              type="date"
              className="input"
              value={form.deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Team Size</label>
            <input
              type="number"
              className="input"
              min={1}
              max={100}
              value={form.teamSize}
              onChange={e => setForm(f => ({ ...f, teamSize: parseInt(e.target.value) || 1 }))}
            />
          </div>
          <div>
            <label className="label">Experience Level</label>
            <select
              className="input"
              value={form.experienceLevel}
              onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value as typeof form.experienceLevel }))}
            >
              <option value="junior">Junior</option>
              <option value="intermediate">Intermediate</option>
              <option value="senior">Senior</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="label">Technology Stack</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TECH_PRESETS.map(tech => (
              <button
                key={tech}
                type="button"
                onClick={() => form.technologyStack.includes(tech) ? removeTech(tech) : addTech(tech)}
                className={cn(
                  'badge cursor-pointer transition-colors',
                  form.technologyStack.includes(tech)
                    ? 'bg-primary-600/40 text-primary-300 border border-primary-600/50'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                )}
              >
                {tech}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add custom technology..."
              value={form.customTech}
              onChange={e => setForm(f => ({ ...f, customTech: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(form.customTech); } }}
            />
            <button
              type="button"
              onClick={() => addTech(form.customTech)}
              className="btn-secondary flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.technologyStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.technologyStack.map(tech => (
                <span key={tech} className="badge bg-primary-600/20 text-primary-300">
                  {tech}
                  <button onClick={() => removeTech(tech)} className="ml-1 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Generation stages (shown when generating) */}
        {isGenerating && (
          <div className="card p-5 animate-fade-in">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary-400 animate-pulse" />
              Generating AI Plan...
            </h3>
            <div className="space-y-3">
              {stages.map(stage => (
                <div key={stage.id} className="flex items-center gap-3">
                  {stage.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : stage.status === 'active' ? (
                    <Loader2 className="w-4 h-4 text-primary-400 animate-spin flex-shrink-0" />
                  ) : stage.status === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                  )}
                  <span className={cn(
                    'text-sm',
                    stage.status === 'done' ? 'text-green-400' :
                    stage.status === 'active' ? 'text-white' :
                    stage.status === 'error' ? 'text-red-400' :
                    'text-slate-500'
                  )}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {!isGenerating && (
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={createProject.isPending || !form.name || !form.goal}
              className="btn-primary flex items-center gap-2 flex-1 justify-center"
            >
              <Cpu className="w-4 h-4" />
              ✨ Generate AI Plan
              {aiStatus && (
                <span className="text-xs opacity-75">({aiStatus.provider})</span>
              )}
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={createProject.isPending || !form.name || !form.goal}
              className="btn-secondary"
            >
              Create Without AI
            </button>
          </div>
        )}

        {/* AI notice */}
        {aiStatus && !aiStatus.llmAvailable && (
          <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-800/50 rounded-lg text-sm text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Ollama not detected.</strong> Using mock AI mode which generates a sample plan.
              To use a real local LLM, install Ollama and run: <code className="font-mono text-xs">ollama pull llama3.2</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
