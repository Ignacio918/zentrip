// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import logoIcon from "../assets/zentrip-logo-navegador.svg";
import logoText from "../assets/logo_small.svg";
import miViajeIcon from "../assets/icons/mi-viaje.svg";
import itinerarioIcon from "../assets/icons/icon-calendar.svg";
import transportesIcon from "../assets/icons/icon-airplane.svg";
import presupuestoIcon from "../assets/icons/icon-graph.svg";
import lugaresIcon from "../assets/icons/icon-map-sidebar.svg";
import cerrarSesionIcon from "../assets/icons/icon-logout.svg";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mobile-header">
        <button onClick={() => setIsOpen(!isOpen)} className="toggle-button">
          {isOpen ? "✖" : "☰"}
        </button>
        <div className="logo-container-mobile">
          <img src={logoIcon} alt="Zentrip Icon" className="logo-icon" />
          <img src={logoText} alt="Zentrip" className="logo-text-img" />
        </div>
      </div>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo-container hidden md:flex">
          <NavLink to="/dashboard" className="logo-wrapper">
            <img src={logoIcon} alt="Zentrip Icon" className="logo-icon" />
            <img src={logoText} alt="Zentrip" className="logo-text-img" />
          </NavLink>
        </div>
        <nav className="menu">
          <NavLink to="/dashboard" className="dashboard-menu-item">
            <img src={miViajeIcon} alt="Mi Viaje icon" className="menu-icon" />
            <span className="menu-text">Mi Viaje</span>
          </NavLink>
          <NavLink to="/dashboard/itinerario" className="dashboard-menu-item">
            <img src={itinerarioIcon} alt="Itinerario icon" className="menu-icon" />
            <span className="menu-text">Itinerario</span>
          </NavLink>
          <NavLink to="/dashboard/transportes" className="dashboard-menu-item">
            <img src={transportesIcon} alt="Transportes icon" className="menu-icon" />
            <span className="menu-text">Transportes</span>
          </NavLink>
          <NavLink to="/dashboard/presupuesto" className="dashboard-menu-item">
            <img src={presupuestoIcon} alt="Presupuesto icon" className="menu-icon" />
            <span className="menu-text">Presupuesto y Gastos</span>
          </NavLink>
          <NavLink to="/dashboard/lugares" className="dashboard-menu-item">
            <img src={lugaresIcon} alt="Lugares icon" className="menu-icon" />
            <span className="menu-text">Lugares y Actividades</span>
          </NavLink>
        </nav>
        <div className="logout">
          <NavLink to="/logout" className="dashboard-menu-item">
            <img src={cerrarSesionIcon} alt="Cerrar Sesión icon" className="menu-icon" />
            <span className="menu-text">Cerrar Sesión</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
