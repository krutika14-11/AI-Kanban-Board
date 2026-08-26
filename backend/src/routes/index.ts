import { Router } from 'express';
import projectRoutes from '../modules/projects/project.routes';
import taskRoutes from '../modules/tasks/task.routes';
import aiRoutes from '../modules/ai/ai.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/projects', projectRoutes);
router.use('/projects/:projectId/tasks', taskRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);

export default router;
