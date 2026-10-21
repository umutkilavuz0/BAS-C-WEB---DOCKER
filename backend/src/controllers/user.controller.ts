import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';



export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Token'dan gelen id

    if (!userId) {
      return res.status(401).json({ message: 'Yetkilendirme hatası.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }, // Şifreyi asla dönmüyoruz
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Sunucu hatası', error });
  }
};