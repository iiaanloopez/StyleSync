// frontend/src/constants/app.js

export const APP_NAME = "StyleSync Barber Booking";
export const DEFAULT_PROFILE_PICTURE = "https://via.placeholder.com/150";
export const APP_VERSION = "1.0.0";

// Mensajes de usuario comunes
export const MESSAGES = {
    SUCCESS: "Operación realizada con éxito.",
    ERROR: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
    NETWORK_ERROR: "Problema de conexión. Por favor, revisa tu internet.",
    UNAUTHORIZED: "No autorizado. Por favor, inicia sesión.",
    FORBIDDEN: "No tienes permiso para realizar esta acción."
};

// Duración de las notificaciones (en milisegundos)
export const NOTIFICATION_DURATION = 3000;

// Opciones de duración de servicio predefinidas (ej. para un select)
export const SERVICE_DURATIONS_MINUTES = [
    15, 30, 45, 60, 75, 90, 120
];
