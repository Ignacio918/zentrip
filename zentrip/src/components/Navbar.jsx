// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import logoSmall from "../assets/logo_small.svg";
import logoIcon from "../assets/zentrip-logo-navegador.svg"; // Importamos el nuevo logo
import "../styles/Navbar.css";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const navItems = [
    { name: "Inicio", link: "/" },
    { name: "Cómo Funciona", link: "/como-funciona" },
    { name: "Beneficios", link: "/beneficios" },
  ];

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
          className="floating-nav-container"
        >
          <div className="floating-nav-content">
            <div className="floating-nav-inner">
              {/* Logo */}
              <div className="logo-container">
                <img src={logoIcon} alt="Logo Icon" className="logo-icon" />
                <img src={logoSmall} alt="zentrip logo" className="logo" />
              </div>

              {/* Desktop Navigation */}
              <div className="nav-links-desktop">
                {navItems.map((item) => (
                  <Link key={item.name} to={item.link} className="nav-link">
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Desktop Auth Buttons */}
              <div className="auth-buttons-desktop">
                <Link to="/login" className="login-link">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="register-button">
                  Registrarse
                </Link>
              </div>

              {/* Hamburger Menu Button */}
              <button
                ref={buttonRef}
                className="hamburger-button"
                onClick={toggleMenu}
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Mobile Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="mobile-menu"
                  >
                    <div className="mobile-nav-links">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.link}
                          className="mobile-nav-link"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mobile-auth-buttons">
                      <Link
                        to="/login"
                        className="login-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/register"
                        className="register-button"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Registrarse
                      </Link>
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
