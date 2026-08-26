import { Router } from 'express';
import { taskController } from './task.controller';

const router = Router({ mergeParams: true });

// Subtask routes
router.patch('/subtasks/:id', taskController.updateSubtask);
router.delete('/subtasks/:id', taskController.deleteSubtask);
router.post('/:taskId/subtasks', taskController.addSubtask);

// Task CRUD
router.get('/', taskController.getByProject);
router.post('/', taskController.create);
router.get('/:id', taskController.getById);
router.put('/:id', taskController.update);
router.patch('/:id/status', taskController.updateStatus);
router.delete('/:id', taskController.delete);

export default router;
