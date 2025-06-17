// frontend/src/layouts/AuthLayout.jsx
import React from 'react';
import styles from './AuthLayout.module.css'; // Estilos para el layout de autenticación
import { APP_NAME } from '../constants/app'; // Importa el nombre de la app

/**
 * @desc Componente de Layout para las páginas de autenticación (login, registro).
 * Proporciona un contenedor centrado y un fondo distintivo para estas páginas.
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que se renderizarán dentro de este layout.
 */
function AuthLayout({ children }) {
  return (
    <div className={styles.authLayoutContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>{APP_NAME}</h2>
        {/* Aquí se renderizarán los componentes de login o registro */}
        {children}
      </div>
      <footer className={styles.authFooter}>
        <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
      </footer>
    </div>
  );
}

export default AuthLayout;
