// frontend/src/components/Navbar/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importa el hook de autenticación
import Button from '../Button/Button'; // Importa el componente Button
import { APP_NAME } from '../../constants/app'; // Importa el nombre de la app
import { USER_ROLES } from '../../constants/roles'; // Importa los roles de usuario
import styles from './Navbar.module.css'; // Estilos específicos para la Navbar

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth(); // Obtiene el estado de autenticación
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
    navigate('/login'); // Redirige a la página de login después de cerrar sesión
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link to="/" className={styles.navbarLogo}>
          {APP_NAME}
        </Link>
      </div>
      <ul className={styles.navbarNav}>
        {/* Enlaces siempre visibles */}
        <li className={styles.navItem}>
          <Link to="/" className={styles.navLink}>Inicio</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/barbershops" className={styles.navLink}>Barberías</Link>
        </li>

        {/* Enlaces condicionales basados en autenticación */}
        {isAuthenticated ? (
          <>
            {/* Enlaces específicos por rol */}
            {user.role === USER_ROLES.CLIENT && (
              <li className={styles.navItem}>
                <Link to="/client/dashboard" className={styles.navLink}>Mi Dashboard</Link>
              </li>
            )}
            {user.role === USER_ROLES.BARBER && (
              <li className={styles.navItem}>
                <Link to="/barber/dashboard" className={styles.navLink}>Dashboard Barbero</Link>
              </li>
            )}
            {user.role === USER_ROLES.ADMIN && (
              <li className={styles.navItem}>
                <Link to="/admin/dashboard" className={styles.navLink}>Dashboard Admin</Link>
              </li>
            )}
            <li className={styles.navItem}>
              {/* Muestra el nombre del usuario y un botón de logout */}
              <span className={styles.welcomeText}>Hola, {user.name}</span>
              <Button onClick={handleLogout} variant="danger" className={styles.logoutButton}>
                Cerrar Sesión
              </Button>
            </li>
          </>
        ) : (
          <>
            {/* Enlaces de Login y Registro si no está autenticado */}
            <li className={styles.navItem}>
              <Link to="/login" className={styles.navLink}>Iniciar Sesión</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/register-client" className={styles.navLink}>Registrarse</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
