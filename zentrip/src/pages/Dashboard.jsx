import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardNavbar from '../components/DashboardNavbar';
import TripMap from '../components/TripMap';
import Chat from '../components/Chat';
import { motion } from 'framer-motion';
import '../styles/Dashboard.css';
import { supabase } from '../supabaseClient';
import generateItinerary from '../cohereClient';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = getPageName(location.pathname);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [locations, setLocations] = useState([]);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(
    JSON.parse(localStorage.getItem('zentripConversation')) || []
  );
  const [newLocation, setNewLocation] = useState({
    name: '',
    day: 1,
    description: '',
  });
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Esperar la sesión con un pequeño retraso para OAuth
        await new Promise((resolve) => setTimeout(resolve, 500));
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate('/login');
          return;
        }
        setUser({
          name:
            session.user.user_metadata?.full_name ||
            session.user.email.split('@')[0],
          tripDate: null,
        });
      } catch (error) {
        setError('Error al verificar sesión: ' + error.message);
        navigate('/login');
      }
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          navigate('/login');
        } else if (event === 'SIGNED_IN') {
          setUser({
            name:
              session.user.user_metadata?.full_name ||
              session.user.email.split('@')[0],
            tripDate: null,
          });
        }
      }
    );
    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const getUserData = async () => {
      try {
        if (window.location.hostname === 'localhost') {
          setUser({ name: 'Ignacio Campos', tripDate: new Date() });
          return;
        }
        const userId = supabase.auth.getUser().then(({ data }) => data.user.id);
        const { data, error } = await supabase
          .from('users')
          .select('name, trip_date')
          .eq('id', await userId)
          .single();
        if (error) throw error;
        setUser({
          ...user,
          name: data.name || user.name,
          tripDate: data.trip_date ? new Date(data.trip_date) : null,
        });
      } catch (error) {
        setError(error.message || 'Error desconocido');
      }
    };
    getUserData();
  }, [user]);

  useEffect(() => {
    if (chatMessages.length > 0) parseChatToSuggestions(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    const fetchTours = async () => {
      if (suggestedLocations.length > 0) {
        try {
          const tourPromises = suggestedLocations.map(async (loc) => {
            const destId = await getViatorDestinationId(loc.name);
            if (destId === 'invalid') return [];
            const response = await fetch(`https://api.viator.com/v1/products`, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'X-Partner-Key': import.meta.env.VITE_VIATOR_API_KEY_SANDBOX,
                mode: 'cors',
              },
              params: {
                destinationId: destId,
                language: 'es',
                currency: 'USD',
                sortBy: 'relevance',
              },
            });
            if (!response.ok)
              throw new Error(`Viator API error: ${response.status}`);
            const data = await response.json();
            return (
              data.data?.map((tour) => ({
                id: tour.productId,
                name: tour.name,
                price: tour.pricing?.adult || 'N/A',
                destination: loc.name,
                description: tour.shortDescription || 'Detalles no disponibles',
              })) || []
            );
          });
          const toursData = await Promise.all(tourPromises);
          setTours(toursData.flat());
        } catch (error) {
          setTours([]);
          console.error('Error en Viator:', error);
        }
      } else setTours([]);
    };
    fetchTours();
  }, [suggestedLocations]);

  const getViatorDestinationId = async (cityName, retries = 3) => {
    try {
      const response = await fetch(`https://api.viator.com/v1/destinations`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Partner-Key': import.meta.env.VITE_VIATOR_API_KEY_SANDBOX,
          mode: 'cors',
        },
        params: { query: cityName, language: 'es' },
      });
      if (!response.ok)
        throw new Error(`Viator destino error: ${response.status}`);
      const data = await response.json();
      return data.data?.[0]?.destinationId || 'invalid';
    } catch (error) {
      if (retries > 0) return getViatorDestinationId(cityName, retries - 1);
      return 'invalid';
    }
  };

  const parseChatToSuggestions = (messages) => {
    const aiMessages = messages.filter((msg) => msg.sender === 'ai');
    const suggestions = [];
    aiMessages.forEach((msg) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(msg.text, 'text/html');
      const items = doc.querySelectorAll('.list-disc, .message-text p');
      items.forEach((item, index) => {
        const text = item.textContent.trim();
        const dayMatch = text.match(/Día\s*(\d+)/i);
        const nameMatch =
          text.match(
            /(?:Llegada a|Visita al?|Explora el?)\s*([A-Za-z\s]+)(?=\s*(?:y|-|Día|\(|$))/i
          ) || text.match(/([A-Za-z\s]+)(?=\s*(?:- Día|\(|$))/i);
        if (nameMatch && nameMatch[1]) {
          const rawName = nameMatch[1]
            .trim()
            .replace(/^(Llegada a|Visita al?|Explora el?)\s*/i, '')
            .trim();
          const cleanName =
            rawName.replace(/y\s*check|check\s*y/i, '').trim() || rawName;
          const day = dayMatch ? parseInt(dayMatch[1]) : 1;
          suggestions.push({
            id: `${cleanName}-${day}-${index}`,
            name: cleanName,
            day,
            description: `Sugerido por Zen: ${text.replace(nameMatch[0], '').trim() || 'Sin descripción'}`,
            isPopular: Math.random() > 0.5,
            hasIdealWeather: true,
          });
        }
      });
    });
    setSuggestedLocations(suggestions);
  };

  const addSuggestedLocations = async () => {
    const geocoded = await Promise.all(
      suggestedLocations.map(async (loc) => {
        const coords = await fetchCoordinates(loc.name);
        return {
          ...loc,
          coordinates: coords,
          id: `${loc.name}-${loc.day}-${Date.now() + Math.random()}`,
        };
      })
    );
    setLocations([...locations, ...geocoded]);
    setSuggestedLocations([]);
  };

  const fetchCoordinates = async (cityName) => {
    try {
      let res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      let data = await res.json();
      if (!data[0] || !data[0].lat) {
        res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}, Reino Unido&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
        );
        data = await res.json();
      }
      return data[0] ? [data[0].lat, data[0].lon] : [-34.6037, -58.3816];
    } catch (error) {
      return [-34.6037, -58.3816];
    }
  };

  useEffect(() => {
    const loc = locations[0];
    if (loc) {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${loc.coordinates[0]}&lon=${loc.coordinates[1]}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric&lang=es`
      )
        .then((res) =>
          res.ok
            ? res.json()
            : Promise.reject(new Error(`HTTP error ${res.status}`))
        )
        .then(
          (data) =>
            data.weather?.length > 0 &&
            setWeatherInfo({
              location: loc.name,
              weather: `Clima: ${data.weather[0].description}, ${data.main.temp}°C`,
            })
        )
        .catch((error) =>
          setWeatherInfo({
            location: loc.name,
            weather: 'Error al cargar el clima',
          })
        );
    } else setWeatherInfo(null);
  }, [locations]);

  const calculateDaysRemaining = (tripDate) =>
    Math.ceil((new Date(tripDate) - new Date()) / (1000 * 3600 * 24));

  const renderTripMessage = () =>
    !user?.tripDate ? (
      <p className="dashboard-header__subtitle">
        ¡Planea tu próxima aventura!{' '}
        <span className="highlight">Configura la fecha de tu viaje</span>
      </p>
    ) : (
      <p className="dashboard-header__subtitle">
        Faltan{' '}
        <span className="days-remaining">
          {calculateDaysRemaining(user.tripDate)}
        </span>{' '}
        días para tu viaje soñado.
      </p>
    );

  const getLocationBadges = (location) => {
    const badges = [];
    if (location.isPopular) badges.push('Destino Popular');
    if (location.hasIdealWeather && weatherInfo?.location === location.name)
      badges.push('Clima Ideal');
    return badges;
  };

  if (error)
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  if (!user) return <div className="loading">Cargando...</div>;

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleLocationClick = (location) => console.log('Ubicación:', location);

  const handleChatSubmit = async (message) => {
    const context = chatMessages
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join('\n');
    const response = await generateItinerary(message, context);
    let finalResponse = response;

    if (message.toLowerCase().includes('tours')) {
      const destinationMatch = context.match(/([A-Za-z\s]+)(?=\s*[-,]|$)/i);
      if (destinationMatch) {
        const destination = destinationMatch[1].trim().toLowerCase();
        const destinationTours = await fetchViatorTours(destination);
        if (destinationTours.length > 0) {
          finalResponse += `
            <h4 class="text-sm font-semibold mt-2 text-[#3B325B]">Tours en ${destination.charAt(0).toUpperCase() + destination.slice(1)}:</h4>
            <ul class="list-disc ml-5">${destinationTours
              .slice(0, 3)
              .map(
                (t) =>
                  `<li>${t.name} - $${t.price || 'N/A'} - ${t.description || 'Detalles no disponibles'}</li>`
              )
              .join('')}</ul>`;
        } else
          finalResponse += `<p class="text-sm text-gray-600">No hay tours disponibles para ${destination} en este momento.</p>`;
      } else
        finalResponse +=
          '<p class="text-sm text-gray-600">Por favor, especifica un destino para los tours.</p>';
    }

    if (
      location.pathname === '/dashboard' &&
      (finalResponse.includes('Tu viaje está tomando forma') ||
        finalResponse.includes('Sigue en el dashboard'))
    ) {
      finalResponse = finalResponse
        .replace(
          /¡Tu viaje está tomando forma!.*Sigue en el dashboard para:.*/s,
          ''
        )
        .trim();
    }

    const newMessages = [
      ...chatMessages,
      { text: message, sender: 'user' },
      { text: finalResponse, sender: 'ai' },
    ];
    setChatMessages(newMessages);
    localStorage.setItem('zentripConversation', JSON.stringify(newMessages));
    parseChatToSuggestions(newMessages);
    return finalResponse;
  };

  const saveItinerary = async () => {
    try {
      const userId = await supabase.auth
        .getUser()
        .then(({ data }) => data.user.id);
      const { error } = await supabase
        .from('itineraries')
        .insert([
          {
            user_id: userId,
            locations: JSON.stringify(locations),
            created_at: new Date(),
          },
        ]);
      if (error) throw error;
      alert('Itinerario guardado en Zentrip');
    } catch (error) {
      alert('Error al guardar el itinerario');
    }
  };

  const addManualLocation = async () => {
    if (newLocation.name.trim()) {
      const coords = await fetchCoordinates(newLocation.name);
      setLocations([
        ...locations,
        {
          id: `${newLocation.name}-${newLocation.day}-${Date.now()}`,
          name: newLocation.name,
          coordinates: coords,
          day: newLocation.day,
          description: newLocation.description || 'Agregado manualmente',
          isPopular: Math.random() > 0.5,
          hasIdealWeather: true,
        },
      ]);
      setNewLocation({ name: '', day: 1, description: '' });
    }
  };

  const fetchViatorTours = async (destination) => {
    try {
      const destId = await getViatorDestinationId(destination);
      if (destId === 'invalid') return [];
      const response = await fetch(`https://api.viator.com/v1/products`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Partner-Key': import.meta.env.VITE_VIATOR_API_KEY_SANDBOX,
          mode: 'cors',
        },
        params: {
          destinationId: destId,
          language: 'es',
          currency: 'USD',
          sortBy: 'relevance',
        },
      });
      if (!response.ok) throw new Error(`Viator error: ${response.status}`);
      const data = await response.json();
      return (
        data.data?.map((t) => ({
          name: t.name,
          price: t.pricing?.adult || 'N/A',
          description: t.shortDescription || 'Detalles no disponibles',
        })) || []
      );
    } catch (error) {
      return [];
    }
  };

  const uniqueDays = [...new Set(locations.map((loc) => loc.day))].sort(
    (a, b) => a - b
  );

  return (
    <div className="dashboard">
      <motion.div
        initial={{ x: '-100%' }}
        animate={{
          x: isSidebarOpen ? '0%' : window.innerWidth >= 768 ? '0%' : '-100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sidebar"
      >
        <Sidebar isOpen={true} onClose={toggleSidebar} />
      </motion.div>
      <div className="dashboard-content">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mobile-header md:hidden"
        >
          <button
            onClick={toggleSidebar}
            className={`toggle-button ${isSidebarOpen ? 'open' : ''}`}
          >
            {isSidebarOpen ? '✖' : '☰'}
          </button>
          <div className="logo-container-mobile">
            <span>Zentrip</span>
          </div>
        </motion.div>
        <DashboardNavbar
          pageName={pageName}
          userName={user.name || 'Usuario'}
        />
        <div className="dashboard-content__main relative">
          {user && location.pathname === '/dashboard' && (
            <>
              <div className="dashboard-header">
                <h1 className="dashboard-header__title">
                  ¡Hola, <span className="user-name">{user.name}</span>!
                </h1>
                <p className="dashboard-header__subtitle">
                  {chatMessages.length > 0
                    ? 'Seguí armando tu viaje con Zen o ajustalo como quieras.'
                    : 'Empecemos tu viaje. ¿Qué tenés en mente? Pedile a Zen o agregá manualmente.'}
                </p>
              </div>
              <div className="trip-section">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/2">
                    <Chat
                      onSubmit={handleChatSubmit}
                      initialMessages={chatMessages}
                      forceExpanded={true}
                      tours={tours}
                    />
                    {suggestedLocations.length > 0 && (
                      <div className="suggestions-box">
                        <h3 className="text-lg font-semibold mb-2 text-[#3B325B]">
                          Sugerencias de Zen
                        </h3>
                        <ul className="list-disc ml-5">
                          {suggestedLocations.map((loc) => (
                            <li key={loc.id} className="text-sm text-gray-600">
                              {loc.name} (Día {loc.day}) - {loc.description}
                              {loc.isPopular && (
                                <span className="badge-security ml-2">
                                  Destino Popular
                                </span>
                              )}
                              {loc.hasIdealWeather && (
                                <span className="badge-security ml-2">
                                  Clima Ideal
                                </span>
                              )}
                              {tours
                                .filter((t) =>
                                  t.destination
                                    ?.toLowerCase()
                                    .includes(loc.name.toLowerCase())
                                )
                                .slice(0, 1)
                                .map((t) => (
                                  <span
                                    key={t.id}
                                    className="badge-security ml-2"
                                  >
                                    Tour: {t.name}
                                  </span>
                                ))}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={addSuggestedLocations}
                          className="action-button mt-2"
                        >
                          Agregar al Itinerario
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="lg:w-1/2">
                    <h2 className="text-2xl font-bold mb-6 text-[#E61C5D]">
                      Mi Itinerario
                    </h2>
                    <div className="days-filter mb-6">
                      <div className="flex gap-3 flex-wrap">
                        {uniqueDays.map((day) => (
                          <button
                            key={day}
                            onClick={() =>
                              setSelectedDay(
                                selectedDay === day ? undefined : day
                              )
                            }
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-w-[80px] ${selectedDay === day ? 'bg-[#E61C5D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            Día {day}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="manual-location-form">
                      <h3 className="text-lg font-semibold mb-4 text-[#3B325B]">
                        Agregar Ubicación Manualmente
                      </h3>
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          placeholder="Nombre del lugar (ej: París)"
                          value={newLocation.name}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              name: e.target.value,
                            })
                          }
                          className="border p-2 rounded text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Día"
                          min="1"
                          value={newLocation.day}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              day: parseInt(e.target.value) || 1,
                            })
                          }
                          className="border p-2 rounded text-sm w-20"
                        />
                        <input
                          type="text"
                          placeholder="Descripción (opcional)"
                          value={newLocation.description}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              description: e.target.value,
                            })
                          }
                          className="border p-2 rounded text-sm"
                        />
                        <button
                          onClick={addManualLocation}
                          className="action-button"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                    {locations.length > 0 && (
                      <div className="mt-6 bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-2 text-[#3B325B]">
                          Resumen de tu Viaje
                        </h3>
                        <p className="text-sm text-gray-600">
                          Días: {uniqueDays.length}
                        </p>
                        <p className="text-sm text-gray-600">
                          Destinos:{' '}
                          {locations.map((loc) => loc.name).join(', ')}
                        </p>
                        {weatherInfo && (
                          <p className="text-sm text-gray-600">
                            Clima Actual: {weatherInfo.weather}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">
                          Consejo: ¡Explora actividades locales con Zen y tours
                          para un viaje inolvidable!
                        </p>
                        {tours.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-sm font-semibold text-[#3B325B]">
                              Tours Sugeridos:
                            </h4>
                            <ul className="list-disc ml-5 text-sm text-gray-600">
                              {tours.slice(0, 3).map((tour) => (
                                <li key={tour.id}>
                                  {tour.name} - ${tour.price}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-8">
                      <div className="trip-map-container">
                        <TripMap
                          locations={locations}
                          selectedDay={selectedDay}
                          onLocationClick={handleLocationClick}
                          weatherInfo={weatherInfo}
                        />
                      </div>
                      <div className="locations-list">
                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 sticky top-4">
                          <h3 className="text-lg font-semibold mb-4">
                            {selectedDay
                              ? `Día ${selectedDay}`
                              : 'Todos los días'}
                          </h3>
                          {(selectedDay
                            ? locations.filter((loc) => loc.day === selectedDay)
                            : locations
                          ).map((location, index) => (
                            <div
                              key={location.id}
                              className="location-item"
                              style={{ '--order': index }}
                              onClick={() => handleLocationClick(location)}
                            >
                              <h4 className="font-medium text-gray-800">
                                {location.name}
                              </h4>
                              <p className="text-sm text-gray-500 mt-2">
                                {location.description}
                              </p>
                              {getLocationBadges(location).map((badge, i) => (
                                <span key={i} className="badge-security ml-2">
                                  {badge}
                                </span>
                              ))}
                              {tours
                                .filter((t) =>
                                  t.destination
                                    ?.toLowerCase()
                                    .includes(location.name.toLowerCase())
                                )
                                .slice(0, 1)
                                .map((t) => (
                                  <span
                                    key={t.id}
                                    className="badge-security ml-2"
                                  >
                                    Tour: {t.name}
                                  </span>
                                ))}
                            </div>
                          ))}
                          <button
                            onClick={saveItinerary}
                            className="action-button mt-4"
                          >
                            Guardar Itinerario
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <Outlet />
        </div>
        <div className="weather-widget fixed top-[88px] right-4 z-10">
          <h3 className="text-lg font-semibold mb-2 text-[#3B325B]">
            Clima Actual
          </h3>
          <p className="text-sm font-['Archivo'] text-[#666666]">
            {weatherInfo
              ? `${weatherInfo.location}: ${weatherInfo.weather}`
              : 'Selecciona un día o agrega ubicaciones para ver el clima'}
          </p>
        </div>
      </div>
    </div>
  );
};

const getPageName = (pathname) => {
  const path = pathname.split('/').pop() || '';
  switch (path) {
    case 'dashboard':
      return 'Mi Viaje';
    case 'itinerario':
      return 'Itinerario';
    case 'transportes':
      return 'Transportes';
    case 'presupuesto':
      return 'Presupuesto y Gastos';
    case 'lugares':
      return 'Lugares y Actividades';
    default:
      return 'Dashboard';
  }
};

export default Dashboard;