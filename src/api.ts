import axios from 'axios';

export const TOKEN_KEY = 'token';

const api = axios.create({ baseURL: 'http://localhost:8080' });

// Adjunta el JWT guardado en localStorage a cada solicitud.
api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Los endpoints protegidos responden 403 si falta el token o es inválido:
// se limpia la sesión y se vuelve al login.
api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(error);
  },
);

/** Extrae el mensaje legible de un error del backend (ProblemDetail.detail). */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string' && detail.length > 0) return detail;
    if (!err.response) return 'Error de conexión con el servidor';
    return `Error del servidor (${err.response.status})`;
  }
  return 'Error inesperado';
}

export default api;
