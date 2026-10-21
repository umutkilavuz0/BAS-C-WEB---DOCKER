// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore'; // Zustand store'unun olduğu yol

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);

  // Eğer token yoksa ana ekrana veya login'e postala
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token varsa içeri al
  return <Outlet />;
};