import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import logoSmall from "../assets/logo_small.svg"; // Ajusta la ruta según tu archivo real (puede ser logo_small.svg o logo_medium.svg)
import TripMap, { Location } from "../components/TripMap";
import "../styles/Dashboard.css";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const location = useLocation();
  const pageName = getPageName(location.pathname);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Estado para las ubicaciones del mapa
  const locations = [
    {
      id: "1",
      name: "Hotel Central",
      coordinates: [-34.6037, -58.3816], // Buenos Aires
      day: 1,
      description: "Check-in en el hotel",
    },
    {
      id: "2",
      name: "Plaza de Mayo",
      coordinates: [-34.6083, -58.3712],
      day: 1,
      description: "Visita al centro histórico",
    },
    {
      id: "3",
      name: "Puerto Madero",
      coordinates: [-34.6037, -58.3632],
      day: 1,
      description: "Almuerzo y paseo",
    },
  ];

  // Obtener días únicos de las ubicaciones
  const uniqueDays = [...new Set(locations.map((loc) => loc.day))].sort((a, b) => a - b);

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

  const calculateDaysRemaining = (tripDate) => {
    const today = new Date();
    const timeDiff = tripDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const renderTripMessage = () => {
    if (!user.tripDate) {
      return (
        <p className="dashboard-header__subtitle">
          ¡Planea tu próxima aventura! <span className="highlight">Configura la fecha de tu viaje</span>
        </p>
      );
    }

    const daysRemaining = calculateDaysRemaining(user.tripDate);
    return (
      <p className="dashboard-header__subtitle">
        Faltan <span className="days-remaining">{daysRemaining}</span> días para tu viaje soñado.
      </p>
    );
  };

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
          {location.pathname === "/dashboard" && (
            <>
              <div className="dashboard-header">
                <h1 className="dashboard-header__title">
                  ¡Hola, <span className="user-name">{user.name}</span>!
                </h1>
                {renderTripMessage()}
              </div>

              <div className="trip-section mt-8 px-6">
                <h2 className="text-2xl font-bold mb-6 text-[#E61C5D]">Mi Itinerario</h2>
                
                {/* Filtros de días */}
                <div className="days-filter mb-6">
                  <div className="flex gap-3 flex-wrap">
                    {uniqueDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-w-[80px]
                          ${selectedDay === day 
                            ? "bg-[#E61C5D] text-white" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        Día {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid para mapa y lista de ubicaciones */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Mapa */}
                  <div className="lg:col-span-3">
                    <TripMap 
                      locations={locations}
                      selectedDay={selectedDay}
                      onLocationClick={(location) => {
                        console.log("Ubicación seleccionada:", location);
                      }}
                    />
                  </div>

                  {/* Lista de ubicaciones */}
                  <div className="locations-list">
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 sticky top-4">
                      <h3 className="text-lg font-semibold mb-4">
                        {selectedDay ? `Día ${selectedDay}` : "Todos los días"}
                      </h3>
                      
                      {(selectedDay ? locations.filter((loc) => loc.day === selectedDay) : locations)
                        .map((location) => (
                          <div 
                            key={location.id}
                            className="location-item"
                          >
                            <h4 className="font-medium text-gray-800">{location.name}</h4>
                            {location.time ? (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Hora:</span> {location.time}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500 mt-2">Hora no especificada</p>
                            )}
                            {location.description && (
                              <p className="text-sm text-gray-500 mt-2">{location.description}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

const getPageName = (pathname) => {
  const path = pathname.split("/").pop() || "";
  switch (path) {
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