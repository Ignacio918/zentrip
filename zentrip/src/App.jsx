import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar"; // Asegúrate de que este es el nombre de tu navbar
import Footer from "./components/Footer"; // Asegúrate de que este es el nombre de tu footer
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";

// Componente para condicionar Navbar y Footer
const NavbarFooterWrapper = () => {
  const location = useLocation();
  const hideNavbarFooter = location.pathname === "/login" || location.pathname === "/register" || location.pathname.startsWith("/dashboard");

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
      {!hideNavbarFooter && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <NavbarFooterWrapper />
    </Router>
  );
};

export default App;