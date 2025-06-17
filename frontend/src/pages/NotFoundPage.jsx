// frontend/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button/Button'; // Importa el componente Button
import styles from './NotFoundPage.module.css'; // Estilos para la página 404

function NotFoundPage() {
  return (
    <div className={styles.notFoundContainer}>
      <h1 className={styles.errorCode}>404</h1>
      <h2 className={styles.errorMessage}>¡Página No Encontrada!</h2>
      <p className={styles.errorDescription}>
        Lo sentimos, la página que estás buscando no existe.
      </p>
      <Link to="/">
        <Button variant="primary" className={styles.homeButton}>
          Volver al Inicio
        </Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
