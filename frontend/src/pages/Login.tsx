import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios'
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
 const setAuth = useAuthStore((state) => state.setAuth);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Token'ları localStorage'a kaydedelim
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
setAuth(response.data.user, response.data.accessToken);
      // Başarılı giriş sonrası Dashboard'a yönlendir
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#1e293b', padding: '2rem', borderRadius: '8px', width: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Giriş Yap</h2>
        
        {error && <div style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label>E-posta</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label>Şifre</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
        </div>

        <button type="submit" style={{ padding: '0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>
          Giriş Yap
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Hesabın yok mu? <Link to="/register" style={{ color: '#34d399' }}>Kayıt Ol</Link>
        </p>
      </form>
    </div>
  );
}