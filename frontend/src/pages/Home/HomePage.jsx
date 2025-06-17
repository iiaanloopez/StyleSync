// frontend/src/pages/Home/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button'; // Importa el componente Button
import styles from './HomePage.module.css'; // Estilos específicos para la página de inicio
import { APP_NAME } from '../../constants/app'; // Importa el nombre de la app

function HomePage() {
  return (
    <div className={styles.homeContainer}>
      <header className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Bienvenido a {APP_NAME}</h1>
        <p className={styles.heroSubtitle}>
          Encuentra tu próximo corte perfecto. Reserva citas con los mejores barberos.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/barbershops">
            <Button variant="primary" className={styles.heroButton}>
              Explorar Barberías
            </Button>
          </Link>
          <Link to="/register-client">
            <Button variant="secondary" className={styles.heroButton}>
              Regístrate como Cliente
            </Button>
          </Link>
        </div>
      </header>

      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>¿Por qué elegirnos?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>Reserva Fácil</h3>
            <p>Encuentra y reserva tu cita en segundos, desde cualquier lugar.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Barberos Top</h3>
            <p>Accede a una red de barberos profesionales y altamente calificados.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Reseñas Reales</h3>
            <p>Lee opiniones de otros clientes para tomar la mejor decisión.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Gestión Total</h3>
            <p>Barberos, gestionen sus horarios, servicios y citas fácilmente.</p>
          </div>
        </div>
      </section>

      <section className={styles.callToActionSection}>
        <h2 className={styles.sectionTitle}>¿Eres Barbero?</h2>
        <p className={styles.sectionSubtitle}>
          Únete a nuestra plataforma y haz crecer tu negocio. Gestiona tus citas, servicios y visibilidad.
        </p>
        <Link to="/register-barber">
          <Button variant="primary" className={styles.callToActionBtn}>
            Regístrate como Barbero
          </Button>
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
