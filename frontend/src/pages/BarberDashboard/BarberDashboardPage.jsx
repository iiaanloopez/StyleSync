// frontend/src/pages/BarberDashboard/BarberDashboardPage.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './DashboardPages.module.css'; // Estilos comunes para los dashboards

function BarberDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div className={styles.dashboardContainer}>Cargando o no autorizado...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Bienvenido al Dashboard del Barbero, {user.name}!</h1>
      <p className={styles.dashboardSubtitle}>Gestiona tu barbería, servicios y citas.</p>

      <div className={styles.dashboardContent}>
        {/* Aquí se añadirán los componentes del dashboard del barbero */}
        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Tus Citas</h2>
          <p>Revisa y gestiona tus próximas citas.</p>
          {/* Componente para gestionar citas (futuro) */}
        </section>

        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Tu Perfil y Servicios</h2>
          <p>Actualiza la información de tu barbería y tus servicios.</p>
          {/* Componente para gestionar perfil/servicios (futuro) */}
        </section>

        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Tu Disponibilidad</h2>
          <p>Configura tus horarios de trabajo.</p>
          {/* Componente para gestionar disponibilidad (futuro) */}
        </section>
      </div>
    </div>
  );
}

export default BarberDashboardPage;
