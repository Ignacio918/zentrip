// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import TripMap from "../components/TripMap"; // Asegúrate de que este archivo existe o coméntalo
import "../styles/Dashboard.css";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const location = useLocation();
  const pageName = getPageName(location.pathname);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw new Error(`Error de sesión: ${sessionError.message}`);
        if (!sessionData.session) throw new Error("No hay sesión activa");

        const userId = sessionData.session.user.id;
        const userEmail = sessionData.session.user.email;

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

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <DashboardNavbar pageName={pageName} userName={user.name || "Usuario"} />
        <div className="dashboard-content__main">
          <Outlet />
        </div>
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