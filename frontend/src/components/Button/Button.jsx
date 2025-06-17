// frontend/src/components/Button/Button.jsx
import React from 'react';
import styles from './Button.module.css'; // Estilos específicos para el botón

/**
 * @desc Componente de botón reutilizable con propiedades personalizables.
 * @param {Object} props - Propiedades del componente.
 * @param {string} [props.type='button'] - Tipo de botón (ej. 'submit', 'button', 'reset').
 * @param {function} [props.onClick] - Función a ejecutar cuando se hace clic en el botón.
 * @param {boolean} [props.disabled=false] - Si el botón está deshabilitado.
 * @param {string} [props.variant='primary'] - Variación de estilo del botón ('primary', 'secondary', 'danger', etc.).
 * @param {React.ReactNode} props.children - El contenido a mostrar dentro del botón (texto, iconos, etc.).
 * @param {string} [props.className] - Clases CSS adicionales para personalizar.
 */
const Button = ({ type = 'button', onClick, disabled = false, variant = 'primary', children, className = '' }) => {
  // Combina las clases CSS base con las clases de variante y las clases adicionales
  const buttonClasses = `${styles.button} ${styles[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
};

export default Button;
