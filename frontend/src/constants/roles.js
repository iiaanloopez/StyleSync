// frontend/src/constants/roles.js

export const USER_ROLES = {
    CLIENT: 'client',
    BARBER: 'barber',
    ADMIN: 'admin',
};

// Puedes usar esto para mapear roles a nombres más amigables si es necesario
export const ROLE_NAMES = {
    [USER_ROLES.CLIENT]: 'Cliente',
    [USER_ROLES.BARBER]: 'Barbero',
    [USER_ROLES.ADMIN]: 'Administrador',
};
