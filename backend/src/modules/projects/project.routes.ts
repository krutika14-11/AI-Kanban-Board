import { Router } from 'express';
import { projectController } from './project.controller';

const router = Router();

router.get('/stats', projectController.getStats);
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

export default router;
