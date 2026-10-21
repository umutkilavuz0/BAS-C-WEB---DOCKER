import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_gizli_access_secret_key_123456';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_gizli_refresh_secret_key_789012';

// Token Üretici Yardımcılar
const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign({ id: userId, email }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId, email }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Şifre alanı boş bırakılamaz.'),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = generateTokens(String(user.id), user.email);

    // Refresh token'ı DB'ye kaydedelim
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu.',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    const { accessToken, refreshToken } = generateTokens(String(user.id), user.email);

    // Refresh token'ı güncelleyelim
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res.json({
      message: 'Giriş başarılı.',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};




// Refresh Token ile Yeni Access Token Alma Endpoint'i
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token bulunamadı.' });
    }

    // Token geçerli mi diye doğrula
    jwt.verify(token, REFRESH_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş refresh token.' });
      }

      // Kullanıcıyı ve DB'deki token'ı kontrol et
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.refreshToken !== token) {
        return res.status(403).json({ message: 'Yetkilendirme doğrulanamadı (Token eşleşmiyor).' });
      }

      // Yeni access token üret
      const newAccessToken = jwt.sign({ id: user.id, email: user.email }, ACCESS_SECRET, {
        expiresIn: '15m',
      });

      return res.json({ accessToken: newAccessToken });
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Sunucu hatası.', error: error.message });
  }
};
