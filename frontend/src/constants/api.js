// frontend/src/constants/api.js

// La URL base de tu API backend.
// En desarrollo, será algo como 'http://localhost:5000'.
// En producción, será la URL de tu API desplegada.
// Se recomienda usar una variable de entorno para esto.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Puedes definir endpoints específicos si lo deseas, pero Axios es flexible
// export const AUTH_ENDPOINTS = {
//     LOGIN: `${API_BASE_URL}/auth/login`,
//     REGISTER_CLIENT: `${API_BASE_URL}/auth/register/client`,
//     REGISTER_BARBER: `${API_BASE_URL}/auth/register/barber`,
// };
//
// export const BARBER_ENDPOINTS = {
//     GET_ALL: `${API_BASE_URL}/barbers`,
//     GET_BY_ID: (id) => `${API_BASE_URL}/barbers/${id}`,
//     PROFILE: `${API_BASE_URL}/barbers/profile`, // para crear/actualizar
//     MY_SERVICES: `${API_BASE_URL}/barbers/me/services`,
//     MY_AVAILABILITY: `${API_BASE_URL}/barbers/me/availability`,
// };
