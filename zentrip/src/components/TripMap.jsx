import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/TripMap.css';

const TripMap = ({
  locations,
  selectedDay,
  onLocationClick,
  weatherInfo = null,
}) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Depuración: Mostrar las ubicaciones recibidas
    console.log('TripMap - locations recibidas:', locations);

    // Inicializar el mapa si no existe, con todas las animaciones desactivadas
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [-34.6037, -58.3816], // Centrado en Buenos Aires (puedes ajustar)
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
        zoomAnimation: false, // Desactivar animación de zoom
        fadeAnimation: false, // Desactivar animación de fade
        markerZoomAnimation: false, // Desactivar animación de marcadores
        bounceAtZoomLimits: false, // Evitar rebotes al alcanzar límites de zoom
        inertia: false, // Desactivar inercia para evitar movimientos automáticos
        bounceOnAdd: false, // Desactivar rebotes al añadir marcadores
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Limpiar marcadores previos
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });
    }

    // Filtrar ubicaciones por día seleccionado
    const filteredLocations = selectedDay
      ? locations.filter((loc) => loc.day === selectedDay)
      : locations;

    // Asegurarnos de que haya ubicaciones válidas
    if (filteredLocations.length > 0) {
      // Agregar marcadores para cada ubicación, sin animaciones ni movimientos automáticos
      filteredLocations.forEach((location) => {
        const marker = L.marker(location.coordinates, {
          riseOnHover: false, // Desactivar movimiento al pasar el ratón
          bounceOnAdd: false, // Desactivar animación al añadir
          autoPan: false, // Desactivar autopan al abrir popup
        }).addTo(mapRef.current);
        marker
          .bindPopup(
            `
            <div class="popup-content">
              <h3>${location.name}</h3>
              <p>Día ${location.day}</p>
              <p>${location.description || 'Sin descripción'}</p>
              ${weatherInfo && weatherInfo.location === location.name ? `<p>Clima: ${weatherInfo.weather}</p>` : ''}
            </div>
          `,
            { autoPan: false }
          ) // Mostrar nombre, día, descripción y clima si está disponible
          .on('click', () => onLocationClick(location));
      });

      // Ajustar vista solo una vez, sin animaciones ni movimientos automáticos
      const bounds = L.latLngBounds(
        filteredLocations.map((loc) => loc.coordinates)
      );
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50], // Añadir padding para evitar zoom excesivo
          maxZoom: 14, // Limitar zoom máximo
          animate: false, // Desactivar animación para evitar titileos
          duration: 0, // Desactivar duración para evitar animaciones problemáticas
          noMoveStart: true, // Evitar eventos de movimiento inicial
          pan: { animate: false }, // Desactivar animación de pan
        });
      }
    } else if (mapRef.current) {
      // Si no hay ubicaciones, centrar en coordenadas iniciales
      mapRef.current.setView([-34.6037, -58.3816], 13, { animate: false });
    }

    // Limpiar el mapa cuando el componente se desmonte
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations, selectedDay, onLocationClick, weatherInfo]); // Añadimos weatherInfo como dependencia

  return <div id="map" className="h-full w-full" />;
};

export default TripMap;
