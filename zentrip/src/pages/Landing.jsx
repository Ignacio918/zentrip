import React from "react";
import Navbar from "../components/Navbar";
import Chat from "../components/Chat";
import { motion } from "framer-motion";
import "../styles/LandingPage.css";

const Landing = () => {
  return (
    <section className="hero-section">
      <Navbar />
      <div className="hero-content container mx-auto px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-title text-center"
        >
          Descubre la manera{" "}
          <span className="serif-highlight">más fácil</span> de planificar
          <br /> tu próxima aventura
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="chat-container mt-12"
        >
          <Chat />
        </motion.div>
      </div>
    </section>
  );
};

export default Landing;