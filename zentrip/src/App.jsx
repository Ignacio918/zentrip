import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('isLoggedIn') === 'true'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;
    const checkSession = async () => {
      console.log('Iniciando checkSession en ruta protegida...');
      try {
        timeoutId = setTimeout(() => {
          console.warn('Tiempo de espera agotado para getSession');
          setLoading(false);
          setIsLoggedIn(false);
        }, 3000);

        console.log('Llamando a supabase.auth.getSession...');
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log('Respuesta de getSession:', { session, sessionError });

        if (sessionError) {
          console.error('Error al obtener sesión:', sessionError.message);
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(!!session);
          localStorage.setItem('isLoggedIn', !!session);
        }
      } catch (error) {
        console.error('Error en checkSession:', error.message);
        setError('Error al inicializar la sesión: ' + error.message);
        setIsLoggedIn(false);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        console.log('checkSession finalizado, loading=false');
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Cambio de estado de autenticación:', event);
        try {
          setIsLoggedIn(!!session);
          localStorage.setItem('isLoggedIn', !!session);
          if (event === 'SIGNED_IN' && session) {
            const { data: refreshedSession } = await supabase.auth.getSession();
            console.log('Sesión refreshed:', refreshedSession);
            setIsLoggedIn(!!refreshedSession.session);
            localStorage.setItem('isLoggedIn', !!refreshedSession.session);
          }
        } catch (error) {
          console.error('Error en onAuthStateChange:', error.message);
          setIsLoggedIn(false);
        }
      }
    );

    return () => {
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>Loading...</p>
        {error && (
          <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>
        )}
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" />;
};

const NavbarFooterWrapper = ({ children }) => {
  const location = useLocation();
  const hideNavbarFooter =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/dashboard');

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      {children}
      {!hideNavbarFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <NavbarFooterWrapper>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <RegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </NavbarFooterWrapper>
  );
};

export default App;
