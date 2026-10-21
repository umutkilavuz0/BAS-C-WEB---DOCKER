import { Router } from 'express';
import { getTodos, createTodo, deleteTodo } from '../controllers/todo.controller';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getTodos);
router.post('/', createTodo);
router.delete('/:id', deleteTodo);

export default router;