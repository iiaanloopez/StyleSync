// frontend/src/pages/Auth/RegisterClientPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthPages.module.css'; // Estilos comunes

function RegisterClientPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerClient } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      // Llama a la función `registerClient` del contexto para registrar al usuario
      const userData = await registerClient({ name, email, phone, password });
      console.log('Registro de cliente exitoso:', userData);
      navigate('/client/dashboard'); // Redirige al dashboard del cliente
    } catch (err) {
      setError(err || 'Error al registrarse como cliente. Por favor, inténtalo de nuevo.');
      console.error('Error de registro de cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <h3 className={styles.authFormTitle}>Registrarse como Cliente</h3>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <InputField
          label="Nombre Completo"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu Nombre"
          required
        />
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
          label="Número de Teléfono"
          type="tel" // Usa 'tel' para números de teléfono
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: 612345678"
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
        <InputField
          label="Confirmar Contraseña"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Registrando...' : 'Registrarse como Cliente'}
        </Button>
      </form>
      <p className={styles.authLinkText}>
        ¿Ya tienes una cuenta? <Link to="/login" className={styles.authLink}>Iniciar Sesión</Link>
      </p>
    </div>
  );
}

export default RegisterClientPage;
