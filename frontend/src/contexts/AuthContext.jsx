// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService'; // Importa el servicio de autenticación

// Crea el contexto de autenticación
const AuthContext = createContext();

/**
 * @desc    Custom Hook para acceder al contexto de autenticación.
 * @returns {Object} El valor del AuthContext (user, token, login, logout).
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * @desc    Proveedor del contexto de autenticación.
 * Envuelve los componentes que necesitan acceder al estado de autenticación.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Almacena la información del usuario logueado
  const [token, setToken] = useState(null); // Almacena el token JWT
  const [loading, setLoading] = useState(true); // Para saber si la autenticación inicial está cargando

  useEffect(() => {
    // Al cargar la aplicación, intenta recuperar el usuario y el token del almacenamiento local
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Intenta parsear la información del usuario
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        // Si hay un error, limpia los datos corruptos
        authService.logout();
      }
    }
    setLoading(false); // La carga inicial ha terminado
  }, []);

  /**
   * @desc    Función para manejar el login de un usuario.
   * @param   {string} email - Correo electrónico del usuario.
   * @param   {string} password - Contraseña del usuario.
   * @returns {Promise<Object>} Datos del usuario.
   * @throws  {Error} Si el login falla.
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      setToken(userData.token);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  /**
   * @desc    Función para manejar el registro de un cliente.
   * @param   {Object} userData - Datos del cliente.
   * @returns {Promise<Object>} Datos del cliente registrado.
   * @throws  {Error} Si el registro falla.
   */
  const registerClient = async (userData) => {
    setLoading(true);
    try {
      const newUserData = await authService.registerClient(userData);
      setUser(newUserData);
      setToken(newUserData.token);
      return newUserData;
    } finally {
      setLoading(false);
    }
  };

  /**
   * @desc    Función para manejar el registro de un barbero.
   * @param   {Object} userData - Datos del barbero.
   * @returns {Promise<Object>} Datos del barbero registrado.
   * @throws  {Error} Si el registro falla.
   */
  const registerBarber = async (userData) => {
    setLoading(true);
    try {
      const newUserData = await authService.registerBarber(userData);
      setUser(newUserData);
      setToken(newUserData.token);
      return newUserData;
    } finally {
      setLoading(false);
    }
  };

  /**
   * @desc    Función para cerrar la sesión del usuario.
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user, // Booleano para saber si hay un usuario logueado
    login,
    registerClient,
    registerBarber,
    logout,
  };

  // Renderiza los componentes hijos, proporcionándoles el valor del contexto
  return (
    <AuthContext.Provider value={value}>
      {/* Solo renderiza los hijos una vez que el estado de carga inicial ha terminado */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
