// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Importa el proveedor de autenticación
import { ThemeProvider } from './contexts/ThemeContext'; // Importa el proveedor de tema (futuro)

// Importa tus definiciones de rutas
import { clientRoutes, barberRoutes, adminRoutes, publicRoutes } from './routes';

// Importa los componentes de diseño (layouts)
import MainLayout from './layouts/MainLayout/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Importa la página de 404
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    // Envuelve toda la aplicación con los proveedores de contexto globales
    <AuthProvider>
      <ThemeProvider> {/* Este proveedor puede ser implementado más adelante para temas */}
        <Router>
          {/* Aquí puedes decidir qué layout usar basado en la ruta o el estado de autenticación */}
          {/* Para simplificar, tendremos un layout principal y uno para autenticación */}
          <Routes>
            {/* Rutas de autenticación usan AuthLayout */}
            {publicRoutes.map((route, index) => (
              (route.path === '/login' || route.path === '/register-client' || route.path === '/register-barber') ? (
                <Route
                  key={index}
                  path={route.path}
                  element={<AuthLayout>{<route.component />}</AuthLayout>} // Envuelve con AuthLayout
                />
              ) : null // Otras rutas públicas se manejan en el MainLayout o tienen su propio manejo
            ))}

            {/* Todas las demás rutas usan MainLayout (o uno específico para dashboards) */}
            <Route path="/" element={<MainLayout />}>
              {/* Rutas públicas generales */}
              {publicRoutes.map((route, index) => (
                // Excluir rutas de auth que ya se manejaron
                (route.path !== '/login' && route.path !== '/register-client' && route.path !== '/register-barber') ? (
                  <Route key={index} path={route.path} element={<route.component />} />
                ) : null
              ))}

              {/* Rutas de Cliente */}
              {clientRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={<route.component />} />
              ))}

              {/* Rutas de Barbero */}
              {barberRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={<route.component />} />
              ))}

              {/* Rutas de Administrador */}
              {adminRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={<route.component />} />
              ))}
            </Route>

            {/* Ruta 404 (Not Found) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
