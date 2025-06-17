// frontend/src/components/InputField/InputField.jsx
import React from 'react';
import styles from './InputField.module.css'; // Estilos específicos para el campo de entrada

/**
 * @desc Componente de campo de entrada de formulario reutilizable.
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.label - Etiqueta descriptiva del campo.
 * @param {string} props.name - Nombre del campo (para el atributo 'name' del input).
 * @param {string} [props.type='text'] - Tipo de input (ej. 'text', 'email', 'password', 'number', 'tel').
 * @param {string} [props.value] - Valor actual del campo.
 * @param {function} [props.onChange] - Función a ejecutar cuando el valor del campo cambia.
 * @param {string} [props.placeholder] - Texto de marcador de posición.
 * @param {boolean} [props.required=false] - Si el campo es obligatorio.
 * @param {string} [props.error] - Mensaje de error a mostrar (si existe).
 * @param {string} [props.className] - Clases CSS adicionales para personalizar el contenedor.
 * @param {Object} [props.inputProps] - Propiedades adicionales para pasar directamente al elemento <input>.
 */
const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  ...inputProps // Captura cualquier otra prop para pasarla al input
}) => {
  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {/* Etiqueta del campo */}
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>} {/* Muestra un asterisco si es requerido */}
      </label>
      {/* Campo de entrada */}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${styles.input} ${error ? styles.inputError : ''}`} // Aplica clase de error si existe
        {...inputProps} // Pasa todas las props restantes al input (ej. min, max, pattern)
      />
      {/* Mensaje de error */}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default InputField;
