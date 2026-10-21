import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Erişim yetkisi yok, token bulunamadı.' });
  }

  const secret = process.env.JWT_ACCESS_SECRET || 'super_gizli_access_secret_key_123456';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş access token.' });
    }

    req.user = user as { id: string; email: string };
    next();
  });
};