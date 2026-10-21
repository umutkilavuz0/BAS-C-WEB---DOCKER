import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Todo {
  id: string;
  title: string;
  description?: string;
  category: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

// Axios instance yardımı
const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
});

export default function TodoList() {
  const queryClient = useQueryClient();

  // Form State'leri
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Genel');

  // 1. Notları Çekme (Query)
  const { data: todos = [], isLoading, isError } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/todos', getAuthHeader());
      return response.data.todos;
    },
  });

  // 2. Yeni Not Ekleme (Mutation)
  const createMutation = useMutation({
    mutationFn: async (newTodo: { title: string; description?: string; category: string }) => {
      const response = await axios.post('http://localhost:5000/api/todos', newTodo, getAuthHeader());
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setTitle('');
      setDescription('');
      setCategory('Genel');
    },
  });

  // 3. Not Silme (Mutation)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:5000/api/todos/${id}`, getAuthHeader());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title, description, category });
  };

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>📋 Notlarım / Todo Listesi</h2>

      {/* Not Ekleme Formu */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Not başlığı giriniz..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <textarea
          placeholder="Açıklama (isteğe bağlı)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Genel">Genel</option>
            <option value="İş">İş</option>
            <option value="Kişisel">Kişisel</option>
            <option value="Yazılım">Yazılım</option>
          </select>
          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            {createMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
      </form>

      {/* Yüklenme ve Harta Durumları */}
      {isLoading && <p>Notlar yükleniyor...</p>}
      {isError && <p style={{ color: 'red' }}>Notlar alınırken bir hata oluştu.</p>}

      {/* Not Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {todos.map((todo) => (
          <div
            key={todo.id}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9f9f9',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>
                {todo.category}
              </span>
              <strong style={{ fontSize: '16px' }}>{todo.title}</strong>
              {todo.description && <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>{todo.description}</p>}
            </div>
            <button
              onClick={() => deleteMutation.mutate(todo.id)}
              disabled={deleteMutation.isPending}
              style={{ padding: '6px 12px', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Sil
            </button>
          </div>
        ))}

        {!isLoading && todos.length === 0 && <p style={{ color: '#888' }}>Henüz eklenmiş bir not yok.</p>}
      </div>
    </div>
  );
}