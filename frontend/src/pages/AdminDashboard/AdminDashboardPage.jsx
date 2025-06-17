// frontend/src/pages/AdminDashboard/AdminDashboardPage.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './DashboardPages.module.css'; // Estilos comunes para los dashboards

function AdminDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div className={styles.dashboardContainer}>Cargando o no autorizado...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Bienvenido al Dashboard de Administración, {user.name}!</h1>
      <p className={styles.dashboardSubtitle}>Gestiona usuarios, barberías, citas y reseñas de la plataforma.</p>

      <div className={styles.dashboardContent}>
        {/* Aquí se añadirán los componentes del dashboard del administrador */}
        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Gestión de Usuarios</h2>
          <p>Ver, editar o eliminar usuarios (clientes y barberos).</p>
          {/* Componente para gestión de usuarios (futuro) */}
        </section>

        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Gestión de Barberías</h2>
          <p>Aprobar, rechazar o editar información de barberías.</p>
          {/* Componente para gestión de barberías (futuro) */}
        </section>

        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Gestión de Citas y Reseñas</h2>
          <p>Monitorear todas las citas y moderar reseñas.</p>
          {/* Componente para gestión de citas y reseñas (futuro) */}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
