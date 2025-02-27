import React, { Suspense, lazy } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import '../styles/LandingPage.css';
import ToursSection from '../components/ToursSection'; // Importamos el componente

const Chat = lazy(() => import('../components/Chat')); // Carga diferida
import generateItinerary from '../cohereClient'; // Importamos la función

const Landing = () => {
  return (
    <section className="hero-section">
      <Navbar />
      <div className="hero-content container mx-auto px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hero-title text-center"
          exit={{ opacity: 0 }}
        >
          Descubre la manera <span className="serif-highlight">más fácil</span>{' '}
          de planificar
          <br /> tu próxima aventura
        </motion.h1>
        <Suspense fallback={<div>Loading Chat...</div>}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="chat-container mt-12"
          >
            <Chat onSubmit={generateItinerary} />
          </motion.div>
        </Suspense>
        <div className="mt-16">
          {' '}
          {/* Espaciado prudencial de 16 unidades */}
          <ToursSection />
        </div>
      </div>
    </section>
  );
};

export default Landing;
