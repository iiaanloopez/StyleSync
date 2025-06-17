// frontend/src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField/InputField'; // Importa el componente InputField
import Button from '../../components/Button/Button'; // Importa el componente Button
import { useAuth } from '../../contexts/AuthContext'; // Importa el hook de autenticación
import styles from './AuthPages.module.css'; // Estilos comunes para las páginas de autenticación

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carga para el botón

  const { login } = useAuth(); // Obtiene la función login del contexto de autenticación
  const navigate = useNavigate(); // Hook para navegar programáticamente

  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)
    setError(''); // Limpia errores previos
    setLoading(true); // Activa el estado de carga

    try {
      // Intenta iniciar sesión usando la función `login` del contexto
      const userData = await login(email, password);
      console.log('Login exitoso:', userData);

      // Redirige al usuario según su rol después del login exitoso
      if (userData.role === 'client') {
        navigate('/client/dashboard');
      } else if (userData.role === 'barber') {
        navigate('/barber/dashboard');
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/'); // Redirige a la página de inicio por defecto
      }

    } catch (err) {
      // Captura y muestra el mensaje de error del backend
      setError(err || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      console.error('Error de login:', err);
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <h3 className={styles.authFormTitle}>Iniciar Sesión</h3>
      {error && <p className={styles.errorMessage}>{error}</p>} {/* Muestra el error si existe */}
      <form onSubmit={handleSubmit}>
        <InputField
          label="Correo Electrónico"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@ejemplo.com"
          required
        />
        <InputField
          label="Contraseña"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>
      <p className={styles.authLinkText}>
        ¿No tienes una cuenta? <Link to="/register-client" className={styles.authLink}>Regístrate como Cliente</Link>
      </p>
      <p className={styles.authLinkText}>
        ¿Eres Barbero? <Link to="/register-barber" className={styles.authLink}>Regístrate como Barbero</Link>
      </p>
    </div>
  );
}

export default LoginPage;
