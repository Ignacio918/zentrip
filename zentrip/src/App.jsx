import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

const NavbarFooterWrapper = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;
    const checkSession = async () => {
      console.log('Iniciando checkSession...');
      try {
        timeoutId = setTimeout(() => {
          console.warn('Tiempo de espera agotado para getSession');
          setLoading(false);
          setIsLoggedIn(false);
        }, 10000);

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
          if (event === 'SIGNED_IN' && session) {
            const { data: refreshedSession } = await supabase.auth.getSession();
            console.log('Sesión refreshed:', refreshedSession);
            setIsLoggedIn(!!refreshedSession.session);
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

  const hideNavbarFooter =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/dashboard');

  if (loading) {
    return (
      <div>
        Loading...
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
    );
  }

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />
        <Route
          path="/dashboard/*"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
      {!hideNavbarFooter && <Footer />}
    </>
  );
};

const App = () => {
  return <NavbarFooterWrapper />;
};

export default App;
