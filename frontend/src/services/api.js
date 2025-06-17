// frontend/src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../constants/api'; // Importa la URL base de tu API

// Crea una instancia de Axios con la URL base de tu API.
// Esto evita tener que escribir la URL completa en cada petición.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // Por defecto, enviamos JSON
  },
});

// --- Interceptores de Petición ---
// Este interceptor se ejecuta ANTES de que se envíe cada petición.
api.interceptors.request.use(
  (config) => {
    // Intenta obtener el token JWT del almacenamiento local (localStorage).
    // Suponemos que el token se guarda bajo la clave 'token' o similar.
    const token = localStorage.getItem('token');

    // Si hay un token, lo adjunta al encabezado de autorización de la petición.
    // Esto es necesario para acceder a rutas protegidas en el backend.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Devuelve la configuración modificada
  },
  (error) => {
    // Maneja cualquier error que ocurra antes de enviar la petición
    return Promise.reject(error);
  }
);

// --- Interceptores de Respuesta ---
// Este interceptor se ejecuta DESPUÉS de que se recibe una respuesta.
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devuelve
    return response;
  },
  (error) => {
    // Maneja errores de respuesta
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('API Response Error:', error.response.status, error.response.data);
      // Aquí puedes manejar errores específicos, por ejemplo:
      if (error.response.status === 401 || error.response.status === 403) {
        // Si el token es inválido o el usuario no está autorizado,
        // puedes redirigir al login o limpiar el token.
        // Esto se manejará mejor en el AuthContext.
        console.log('Authentication/Authorization error. Consider redirecting to login.');
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta (ej. red caída)
      console.error('API Request Error: No response received', error.request);
    } else {
      // Algo pasó al configurar la petición que disparó un error
      console.error('API Error:', error.message);
    }
    // Devuelve una promesa rechazada con el error para que pueda ser capturado
    // en los componentes o servicios que llamen a esta API.
    return Promise.reject(error);
  }
);

export default api; // Exporta la instancia de Axios configurada
