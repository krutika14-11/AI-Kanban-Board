import { Router } from 'express';
import { aiController } from './ai.controller';

const router = Router();

router.get('/status', aiController.getStatus);
router.post('/generate-plan', aiController.generatePlan);
router.post('/chat', aiController.chat);
router.post('/rag/search', aiController.ragSearch);
router.get('/executions/:projectId', aiController.getExecutionHistory);
router.get('/execution/:id', aiController.getExecution);

export default router;
