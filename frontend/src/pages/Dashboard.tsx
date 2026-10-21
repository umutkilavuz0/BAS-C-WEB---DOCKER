import { useNavigate } from 'react-router-dom'; // Eğer React Router kullanıyorsan yönlendirme için
import { useAuthStore } from '../store/useAuthStore';
import TodoList from '../components/TodoList';

export default function Dashboard() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // 1. Zustand state'i ve localStorage'daki token'ı siler
    navigate('/login'); // 2. Kullanıcıyı Login sayfasına yönlendirir
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Üst Bar / Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          🚪 Çıkış Yap
        </button>
      </div>

      <hr style={{ marginBottom: '20px' }} />

      {/* Todo List Bileşeni */}
      <TodoList />
    </div>
  );
}