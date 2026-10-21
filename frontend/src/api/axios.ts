import axios from 'axios';

// Backend sunucumuzun adresi (Backend 5000'de çalışıyordu)
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. İstek (Request) Interceptor: Her giden isteğe Access Token ekleyelim
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Cevap (Response) Interceptor: Token süresi biterse (403/401) arka planda tazeleme yapalım
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Eğer hata 403 (veya 401) döndüyse ve bu istek daha önce tekrar denenmediyse
    if (
      (error.response?.status === 403 || error.response?.status === 401) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Refresh token bulunamadı.');
        }

        // Backend'deki refresh endpoint'ine gizli istek atıyoruz
        const response = await axios.post('http://localhost:5000/api/auth/refresh', {
          token: refreshToken,
        });

        const { accessToken } = response.data;

        // Yeni access token'ı localStorage'a kaydet
        localStorage.setItem('accessToken', accessToken);

        // Başarısız olan orijinal isteği yeni token ile tekrar tetikle
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token da patladıysa (süresi dolmuş/geçersiz), oturumu tamamen düşür
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Kullanıcıyı giriş sayfasına postalıyoruz
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);