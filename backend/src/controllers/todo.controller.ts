import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const todoSchema = z.object({
  title: z.string().min(1, 'Not başlığı boş olamaz.'),
  description: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
});

// Kullanıcının notlarını getir
export const getTodos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ todos });
  } catch (error) {
    return res.status(500).json({ message: 'Notlar getirilirken hata oluştu.', error });
  }
};

// Yeni not ekle
export const createTodo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const parsedData = todoSchema.parse(req.body);

    const newTodo = await prisma.todo.create({
      data: {
        title: parsedData.title,
        description: parsedData.description,
        category: parsedData.category || 'Genel',
        dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : undefined,
        userId: userId!,
      },
    });

    return res.status(201).json({ todo: newTodo });
  } catch (error) {
    return res.status(400).json({ message: 'Geçersiz veri.', error });
  }
};

// Notu sil
// Notu sil
export const deleteTodo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const todo = await prisma.todo.findFirst({
      where: { id: id as string, userId },
    });

    if (!todo) {
      return res.status(404).json({ message: 'Not bulunamadı veya yetkiniz yok.' });
    }

    // Doğrusu burası olacak (userIdi yerine id):
    await prisma.todo.delete({ 
  where: { id: id as string } 
});

    return res.json({ message: 'Not başarıyla silindi.' });
  } catch (error) {
    return res.status(500).json({ message: 'Not silinirken hata oluştu.', error });
  }
};