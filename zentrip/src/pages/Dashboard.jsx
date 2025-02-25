import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { motion } from "framer-motion";
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
        const userEmail = sessionData.session.user.email;

        console.log("User ID from session:", userId); // Depuración: loguea el userId
        console.log("User Email from session:", userEmail); // Depuración: loguea el email

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, trip_date")
          .eq("id", userId)
          .single();

        if (userError) throw new Error(`Error al obtener datos del usuario: ${userError.message}`);

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="error-container min-h-screen bg-[#F5F2FF] flex flex-col items-center justify-center p-8"
      >
        <h2 className="text-2xl font-bold text-[#3B325B] mb-4 font-['Archivo']">Error en el Dashboard:</h2>
        <p className="text-lg text-[#3B325B] mb-6 font-['Archivo']">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex h-9 items-center justify-center rounded-full bg-[#2E2E2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A4A4A] transition-colors font-['Archivo']"
        >
          Reintentar
        </button>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="loading min-h-screen bg-[#F5F2FF] flex items-center justify-center text-[#3B325B] text-lg font-['Archivo']"
      >
        Cargando...
      </motion.div>
    );
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
            <Menu className="w-6 h-6 text-[#3B325B]" />
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