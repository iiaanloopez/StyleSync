// frontend/src/layouts/MainLayout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet para renderizar rutas hijas
import Navbar from '../../components/Navbar/Navbar'; // Importa el componente de la barra de navegación
import styles from './MainLayout.module.css'; // Importa los estilos CSS Module

// Este componente define el diseño principal de la aplicación.
// Incluye una barra de navegación, el contenido de la página (Outlet) y un pie de página.
function MainLayout() {
  return (
    <div className={styles.mainLayoutContainer}>
      {/* Barra de Navegación */}
      <Navbar />

      {/* Contenido principal de la página */}
      {/* Outlet renderiza el componente de la ruta hija que coincida */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Pie de Página (un simple placeholder por ahora) */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} StyleSync Barber Booking. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default MainLayout;
