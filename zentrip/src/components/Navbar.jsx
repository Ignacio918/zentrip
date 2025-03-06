'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import logoSmall from '../assets/logo_small.svg';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Definimos los elementos de navegación manteniendo la estructura original
  const navItems = [
    { name: 'Inicio', link: '/' },
    { name: 'Hoteles', link: '/hoteles' },
    { name: 'Restaurantes', link: '/restaurantes' },
    { name: 'Tours', link: '/tours' },
    { name: 'Cómo Funciona', link: '/como-funciona' },
    { name: 'Beneficios', link: '/beneficios' },
  ];

  const auth = {
    login: { text: 'Iniciar Sesión', url: '/login' },
    signup: { text: 'Registrarse', url: '/register' },
  };

  // Manejo del clic fuera del menú móvil
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Manejo del scroll para ocultar/mostrar la navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // Cerrar el menú móvil al redimensionar a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="navbar-container"
        >
          <div className="container">
            <nav className="desktop-nav">
              <div className="nav-logo-links">
                <Link to="/" className="logo-link">
                  <img src={logoSmall} className="logo" alt="zentrip logo" />
                </Link>
                <div className="nav-links">
                  {navItems.map((item) => (
                    <motion.Link
                      key={item.name}
                      to={item.link}
                      className="nav-link"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.name}
                    </motion.Link>
                  ))}
                </div>
              </div>
              <div className="auth-buttons">
                <Link to={auth.login.url} className="login-button">
                  {auth.login.text}
                </Link>
                <Link to={auth.signup.url} className="signup-button">
                  {auth.signup.text}
                </Link>
              </div>
            </nav>
            <div className="mobile-container">
              <div className="mobile-top">
                <Link to="/" className="mobile-logo-link">
                  <img
                    src={logoSmall}
                    className="mobile-logo"
                    alt="zentrip logo"
                  />
                </Link>
                <button
                  ref={buttonRef}
                  className="mobile-menu-button"
                  onClick={toggleMenu}
                  aria-label="Menu"
                >
                  <Menu className="menu-icon" />
                </button>
              </div>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{
                      duration: 0.2,
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                    className="mobile-menu"
                  >
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="close-button"
                    >
                      <svg
                        className="close-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="mobile-links-container">
                      {navItems.map((item) => (
                        <motion.Link
                          key={item.name}
                          to={item.link}
                          className="mobile-link"
                          onClick={() => setIsMenuOpen(false)}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.name}
                        </motion.Link>
                      ))}
                      <div className="mobile-auth-container">
                        <div className="mobile-auth-buttons">
                          <Link
                            to={auth.login.url}
                            className="mobile-login"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {auth.login.text}
                          </Link>
                          <Link
                            to={auth.signup.url}
                            className="mobile-signup"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {auth.signup.text}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Navbar;
