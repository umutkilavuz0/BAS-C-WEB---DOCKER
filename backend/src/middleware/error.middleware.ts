import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🔥 Global Hata Yakalandı:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu taraflı beklenmeyen bir hata oluştu.';

  return res.status(statusCode).json({
    success: false,
    message,
    // Hata detayını sadece geliştirme ortamında (development) gösterelim ki dışarıya güvenliksiz bilgi sızmasın
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};