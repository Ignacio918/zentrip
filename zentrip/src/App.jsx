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

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setLoading(false);
    };

    // Ejecutar inmediatamente y esperar la sincronización
    checkSession();

    // Listener para cambios de estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session);
        if (event === 'SIGNED_IN' && session) {
          // Forzar recarga de sesión tras OAuth
          const { data: refreshedSession } = await supabase.auth.getSession();
          setIsLoggedIn(!!refreshedSession.session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const hideNavbarFooter =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/dashboard');

  if (loading) {
    return <div>Loading...</div>;
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
