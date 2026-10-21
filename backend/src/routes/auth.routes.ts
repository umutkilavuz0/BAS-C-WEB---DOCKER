import { Router } from 'express';
import { register, login, refreshToken, } from '../controllers/auth.controller';
import { getMe} from '../controllers/user.controller';
import { Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', authenticateToken, getMe);


export default router;