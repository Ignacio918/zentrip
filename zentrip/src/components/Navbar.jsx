'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import logoSmall from '../assets/logo_small.svg';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

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

  // Manejar la navegación directamente
  const handleNavigation = (path, e) => {
    e.preventDefault();
    navigate(path);
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
          <div className="container mx-auto px-8">
            <nav className="hidden lg:flex justify-between items-center py-2">
              <div className="flex items-center gap-12">
                <Link to="/" className="flex items-center gap-2">
                  <img
                    src={logoSmall}
                    className="w-20 h-20"
                    alt="zentrip logo"
                  />
                </Link>
                <div className="flex items-center space-x-6">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.link}
                      onClick={(e) => handleNavigation(item.link, e)}
                      className="inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium text-[#3B325B] hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <a
                  href={auth.login.url}
                  onClick={(e) => handleNavigation(auth.login.url, e)}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-[#2E2E2E] hover:bg-[#4A4A4A] hover:text-white"
                >
                  {auth.login.text}
                </a>
                <a
                  href={auth.signup.url}
                  onClick={(e) => handleNavigation(auth.signup.url, e)}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-[#2E2E2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A4A4A]"
                >
                  {auth.signup.text}
                </a>
              </div>
            </nav>
            <div className="block lg:hidden">
              <div className="flex items-center justify-between py-2">
                <Link to="/" className="flex items-center gap-2">
                  <img
                    src={logoSmall}
                    className="w-20 h-20"
                    alt="zentrip logo"
                  />
                </Link>
                <button
                  ref={buttonRef}
                  className="p-2 bg-transparent border border-transparent hover:border-gray-300 rounded-full"
                  onClick={toggleMenu}
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6 text-[#3B325B]" />
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
                    className="fixed inset-y-0 right-0 w-[300px] bg-white border-l border-gray-100 shadow-md p-6"
                  >
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="w-6 h-6 text-[#3B325B]"
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
                    <div className="mt-12 flex flex-col gap-6">
                      {navItems.map((item) => (
                        <a
                          key={item.name}
                          href={item.link}
                          onClick={(e) => {
                            handleNavigation(item.link, e);
                            setIsMenuOpen(false);
                          }}
                          className="text-base font-medium text-[#3B325B] hover:text-[#3B325B]/80 hover:bg-gray-100 rounded-md py-2 px-3"
                        >
                          {item.name}
                        </a>
                      ))}
                      <div className="border-t pt-4 border-[#3B325B]/20">
                        <div className="flex flex-col gap-3">
                          <a
                            href={auth.login.url}
                            onClick={(e) => {
                              handleNavigation(auth.login.url, e);
                              setIsMenuOpen(false);
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-full border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-[#2E2E2E] hover:bg-[#4A4A4A] hover:text-white"
                          >
                            {auth.login.text}
                          </a>
                          <a
                            href={auth.signup.url}
                            onClick={(e) => {
                              handleNavigation(auth.signup.url, e);
                              setIsMenuOpen(false);
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-full bg-[#2E2E2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A4A4A]"
                          >
                            {auth.signup.text}
                          </a>
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
