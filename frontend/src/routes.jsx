// frontend/src/routes.jsx
// Importa los componentes de página que se asignarán a las rutas
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterClientPage from './pages/Auth/RegisterClientPage';
import RegisterBarberPage from './pages/Auth/RegisterBarberPage';
import BarberProfilePage from './pages/BarberProfile/BarberProfilePage'; // Para ver perfiles públicos
import BookAppointmentPage from './pages/BookAppointment/BookAppointmentPage';
import ClientDashboardPage from './pages/ClientDashboard/ClientDashboardPage';
import BarberDashboardPage from './pages/BarberDashboard/BarberDashboardPage';
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Rutas Públicas (accesibles sin autenticación)
export const publicRoutes = [
    {
        path: '/',
        component: HomePage,
        exact: true,
        name: 'Home',
    },
    {
        path: '/login',
        component: LoginPage,
        name: 'Login',
    },
    {
        path: '/register-client',
        component: RegisterClientPage,
        name: 'Register Client',
    },
    {
        path: '/register-barber',
        component: RegisterBarberPage,
        name: 'Register Barber',
    },
    {
        path: '/barbershops', // Ruta para navegar por todas las barberías
        component: HomePage, // Puedes usar un componente de búsqueda de barberías aquí
        name: 'Barbershops',
    },
    {
        path: '/barbershops/:id', // Ruta para ver el perfil público de una barbería
        component: BarberProfilePage,
        name: 'Barber Profile',
    },
    {
        path: '/book/:barberId/:serviceId?', // Ruta para reservar una cita
        component: BookAppointmentPage,
        name: 'Book Appointment',
    },
    // Añade aquí más rutas públicas si es necesario
    {
        path: '/404',
        component: NotFoundPage,
        name: 'Not Found',
    },
];

// Rutas de Cliente (requieren autenticación como 'client')
export const clientRoutes = [
    {
        path: '/client/dashboard',
        component: ClientDashboardPage,
        name: 'Client Dashboard',
        roles: ['client'],
    },
    {
        path: '/client/bookings',
        component: ClientDashboardPage, // Puedes tener un sub-componente para bookings
        name: 'My Bookings',
        roles: ['client'],
    },
    {
        path: '/client/profile',
        component: ClientDashboardPage, // Puedes tener un sub-componente para perfil
        name: 'My Profile',
        roles: ['client'],
    },
    // Añade aquí más rutas específicas de cliente
];

// Rutas de Barbero (requieren autenticación como 'barber')
export const barberRoutes = [
    {
        path: '/barber/dashboard',
        component: BarberDashboardPage,
        name: 'Barber Dashboard',
        roles: ['barber'],
    },
    {
        path: '/barber/profile-management',
        component: BarberProfilePage, // Para que el barbero edite su propio perfil
        name: 'Manage Profile',
        roles: ['barber'],
    },
    {
        path: '/barber/appointments',
        component: BarberDashboardPage, // Puedes tener un sub-componente para citas
        name: 'Manage Appointments',
        roles: ['barber'],
    },
    {
        path: '/barber/services',
        component: BarberDashboardPage, // Puedes tener un sub-componente para servicios
        name: 'Manage Services',
        roles: ['barber'],
    },
    {
        path: '/barber/availability',
        component: BarberDashboardPage, // Puedes tener un sub-componente para disponibilidad
        name: 'Manage Availability',
        roles: ['barber'],
    },
    // Añade aquí más rutas específicas de barbero
];

// Rutas de Administrador (requieren autenticación como 'admin')
export const adminRoutes = [
    {
        path: '/admin/dashboard',
        component: AdminDashboardPage,
        name: 'Admin Dashboard',
        roles: ['admin'],
    },
    {
        path: '/admin/users',
        component: AdminDashboardPage, // Puedes tener un sub-componente para gestión de usuarios
        name: 'Manage Users',
        roles: ['admin'],
    },
    {
        path: '/admin/barbershops',
        component: AdminDashboardPage, // Puedes tener un sub-componente para gestión de barberías
        name: 'Manage Barbershops',
        roles: ['admin'],
    },
    {
        path: '/admin/bookings',
        component: AdminDashboardPage, // Puedes tener un sub-componente para gestión de todas las reservas
        name: 'Manage All Bookings',
        roles: ['admin'],
    },
    {
        path: '/admin/reviews',
        component: AdminDashboardPage, // Puedes tener un sub-componente para moderación de reseñas
        name: 'Moderate Reviews',
        roles: ['admin'],
    },
    // Añade aquí más rutas específicas de administrador
];

// Aquí podríamos añadir lógica para rutas protegidas o wrappers
// Por ahora, `App.jsx` manejará la protección básica con `AuthContext`
// Pero si necesitas un `PrivateRoute` componente, podrías crearlo aquí.
