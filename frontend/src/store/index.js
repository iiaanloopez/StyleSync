// frontend/src/store/index.js
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk'; // Middleware para acciones asíncronas
import { composeWithDevTools } from 'redux-devtools-extension'; // Para las herramientas de desarrollo de Redux

// Importa tus reducers
import authReducer from './reducers/authReducer';
// import barberReducer from './reducers/barberReducer'; // Futuro
// import bookingReducer from './reducers/bookingReducer'; // Futuro
// import reviewReducer from './reducers/reviewReducer';   // Futuro

// Combina todos tus reducers en uno solo
const rootReducer = combineReducers({
    auth: authReducer,
    // barbero: barberReducer, // Añade más reducers aquí
    // booking: bookingReducer,
    // review: reviewReducer,
});

// Define el estado inicial de tu aplicación (opcional)
const initialState = {};

// Define los middlewares que usarás (thunk es común para Redux con async)
const middleware = [thunk];

// Crea el store de Redux
// composeWithDevTools es útil para integrar Redux DevTools en el navegador
const store = createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;

/*
// Ejemplo de cómo envolver tu App con el Provider de Redux (en frontend/src/index.js o App.jsx)
import { Provider } from 'react-redux';
import store from './store';

// Dentro de tu renderización:
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
*/
