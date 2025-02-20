// src/components/DashboardNavbar.jsx
import React from "react";
import "../styles/DashboardNavbar.css";
import notificationIcon from "../assets/icons/icon-notification.svg";

const DashboardNavbar = ({ pageName, userName = "U" }) => {
  return (
    <nav className="dashboard-navbar">
      <div className="dashboard-navbar__title">{pageName}</div>
      <div className="dashboard-navbar__actions">
        <button className="dashboard-navbar__notification-btn">
          <img src={notificationIcon} alt="Notificaciones" className="dashboard-navbar__notification-icon" />
        </button>
        <div className="dashboard-navbar__avatar">{userName.charAt(0).toUpperCase()}</div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
