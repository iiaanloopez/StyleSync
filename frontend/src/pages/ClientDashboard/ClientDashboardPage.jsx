// frontend/src/pages/ClientDashboard/ClientDashboardPage.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Para obtener información del usuario
import styles from './DashboardPages.module.css'; // Estilos comunes para los dashboards

function ClientDashboardPage() {
  const { user } = useAuth(); // Obtiene la información del usuario autenticado

  if (!user) {
    // Esto debería ser manejado por la protección de ruta, pero es un buen fallback
    return <div className={styles.dashboardContainer}>Cargando o no autorizado...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Bienvenido al Dashboard del Cliente, {user.name}!</h1>
      <p className={styles.dashboardSubtitle}>Aquí podrás gestionar tus citas y perfil.</p>

      <div className={styles.dashboardContent}>
        {/* Aquí se añadirán los componentes del dashboard del cliente */}
        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Tus Próximas Citas</h2>
          <p>Citas pendientes y confirmadas aparecerán aquí.</p>
          {/* Componente para listar próximas citas (futuro) */}
        </section>

        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Tu Perfil</h2>
          <p>Edita tu información personal.</p>
          {/* Componente para editar perfil (futuro) */}
        </section>

        <section className={styles.dashboardSection}>
          <h2 className={styles.sectionTitle}>Explorar Barberías</h2>
          <p>Busca nuevas barberías y servicios.</p>
          {/* Enlace o componente de búsqueda de barberías (futuro) */}
        </section>
      </div>
    </div>
  );
}

export default ClientDashboardPage;
