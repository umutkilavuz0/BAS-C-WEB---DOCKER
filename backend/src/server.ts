import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';
import { errorHandler } from './middleware/error.middleware';
import cors from 'cors';
import helmet from 'helmet'; // 1. Helmet'i içe aktar
import rateLimit from 'express-rate-limit'; // 2. Rate Limit'i içe aktar
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, 
  standardHeaders: true, // Rate limit bilgilerini header olarak dön
  legacyHeaders: false,
  message: { error: 'Çok fazla istek attınız, lütfen biraz bekleyin.' }
});
app.use('/api/', globalLimiter); // Tüm /api/ rotalarına uygula

// D) Özel Auth Limiter: Login ve Register'a kısıt (Brute-force koruması için çok önemli!)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 15 dakikada en fazla 5 yanlış/başarılı deneme!
  message: { error: 'Çok fazla giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.' }
});

// JSON verilerini okuyabilmek için
app.use(express.json());
// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sunucu sorunsuz çalışıyor.' });
});


// ⚠️ DİKKAT: Global Error Middleware her zaman EN SONA yazılır!
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🔥 Sunucu http://localhost:${PORT} üzerinde çalışıyor.`);
});