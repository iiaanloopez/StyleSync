// frontend/src/pages/BarberProfile/BarberProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import barberService from '../../services/barberService'; // Importa el servicio de barberos
import styles from './BarberProfilePage.module.css'; // Estilos específicos
import { API_BASE_URL } from '../../constants/api'; // Para construir la URL de la imagen

function BarberProfilePage() {
  const { id } = useParams(); // Obtiene el ID del barbero de la URL
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBarberProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await barberService.getBarberById(id);
        setBarber(data);
      } catch (err) {
        setError(err || 'Error al cargar el perfil del barbero.');
        console.error('Error fetching barber profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBarberProfile();
    }
  }, [id]);

  if (loading) {
    return <div className={styles.loadingContainer}>Cargando perfil del barbero...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>Error: {error}</div>;
  }

  if (!barber) {
    return <div className={styles.notFoundContainer}>Perfil de barbero no encontrado.</div>;
  }

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/600x400/FFF/000?text=Barber+Shop'; // Default placeholder
    if (imagePath.startsWith('http')) return imagePath; // Already a full URL
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`; // Construct full URL
  };


  return (
    <div className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <img
          src={getFullImageUrl(barber.profileImage)}
          alt={`Profile of ${barber.shopName}`}
          className={styles.profileImage}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/FFF/000?text=Barber+Shop'; }} // Fallback
        />
        <div className={styles.headerInfo}>
          <h1 className={styles.shopName}>{barber.shopName}</h1>
          <p className={styles.address}>{barber.address}</p>
          <p className={styles.phone}>Teléfono: {barber.phone}</p>
          {barber.averageRating > 0 && (
            <p className={styles.rating}>
              Calificación: {barber.averageRating.toFixed(1)} ⭐ ({barber.numReviews} reseñas)
            </p>
          )}
          <p className={styles.description}>{barber.description || 'No hay descripción disponible.'}</p>
        </div>
      </header>

      <section className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
        {barber.services && barber.services.length > 0 ? (
          <div className={styles.servicesGrid}>
            {barber.services.map((service) => (
              <div key={service._id} className={styles.serviceCard}>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <p className={styles.servicePrice}>Precio: {service.price}€</p>
                <p className={styles.serviceDuration}>Duración: {service.duration} min</p>
                {/* Puedes añadir un botón para reservar este servicio específico */}
                {/* <Button variant="primary">Reservar</Button> */}
              </div>
            ))}
          </div>
        ) : (
          <p>Este barbero aún no ha listado servicios.</p>
        )}
      </section>

      {/* Sección de Reseñas (futuro - cuando implementemos el servicio de reseñas en frontend) */}
      <section className={styles.reviewsSection}>
        <h2 className={styles.sectionTitle}>Reseñas de Clientes</h2>
        <p>Las reseñas se mostrarán aquí. (Próximamente)</p>
        {/* Aquí se cargará y mostrará el componente de Reseñas */}
      </section>

      {/* Sección de Disponibilidad (futuro - cuando la necesites para la UI de reserva) */}
      <section className={styles.availabilitySection}>
        <h2 className={styles.sectionTitle}>Disponibilidad</h2>
        <p>La disponibilidad del barbero se mostrará aquí para reservar. (Próximamente)</p>
        {/* Aquí se mostrará la disponibilidad del barbero, quizá con un calendario */}
      </section>
    </div>
  );
}

export default BarberProfilePage;
