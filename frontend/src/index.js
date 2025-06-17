// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Importa el cliente de ReactDOM para React 18+
import App from './App'; // Importa el componente principal de la aplicación
import './assets/styles/global.css'; // Importa tus estilos CSS globales

// Crea el "root" de la aplicación React y renderiza el componente App dentro de él.
// Esto se conecta al elemento con id 'root' en tu archivo public/index.html.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* React.StrictMode ayuda a identificar posibles problemas en tu aplicación durante el desarrollo */}
    <App />
  </React.StrictMode>
);
