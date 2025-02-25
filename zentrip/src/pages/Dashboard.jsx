import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import logoSmall from "../assets/logo_small.svg"; // Ajusta la ruta según tu proyecto (por ejemplo, logo_small.svg o logo_medium.svg)
import "../styles/Dashboard.css";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const location = useLocation();
  const pageName = getPageName(location.pathname);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw new Error(`Error de sesión: ${sessionError.message}`);
        if (!sessionData.session) throw new Error("No hay sesión activa");

        const userId = sessionData.session.user.id;
        console.log("User ID from session:", userId); // Depuración temporal

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, trip_date")
          .eq("id", userId)
          .single();

        if (userError) {
          if (userError.status === 406) {
            console.error("Error 406: Not Acceptable - Verifica permisos o datos en users:", userError.message);
          }
          throw new Error(`Error al obtener datos del usuario: ${userError.message}`);
        }

        setUser({
          name: userData.name,
          tripDate: userData.trip_date ? new Date(userData.trip_date) : null,
        });
      } catch (error) {
        setError(error.message);
      }
    };

    getUserData();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <h2>Error en el Dashboard:</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (!user) {
    return <div className="loading">Cargando...</div>;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
      >
        <Sidebar />
      </motion.div>
      <div className="dashboard-content">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mobile-header"
        >
          <button
            onClick={toggleSidebar}
            className="toggle-button"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="logo-container-mobile">
            <img src={logoSmall} className="w-8 h-8" alt="zentrip logo" />
          </div>
        </motion.div>
        <DashboardNavbar pageName={pageName} userName={user.name || "Usuario"} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="dashboard-content__main"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

const getPageName = (pathname) => {
  switch (pathname.split("/").pop()) {
    case "dashboard":
      return "Mi Viaje";
    case "itinerario":
      return "Itinerario";
    case "transportes":
      return "Transportes";
    case "presupuesto":
      return "Presupuesto y Gastos";
    case "lugares":
      return "Lugares y Actividades";
    default:
      return "Dashboard";
  }
};

export default Dashboard;