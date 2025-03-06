import { useState, useEffect } from 'react';

const HotelsSection = ({ initialLocation }) => {
  const [hotels, setHotels] = useState([]);
  const [visibleHotels, setVisibleHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState(
    initialLocation || 'Madrid'
  );
  const [searchInput, setSearchInput] = useState(initialLocation || 'Madrid');
  const [displayLimit, setDisplayLimit] = useState(8);

  // Función mock de fetchHotels para permitir que la aplicación compile
  const fetchHotels = async (location) => {
    // Simulamos una petición de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Creamos datos de ejemplo
    return [
      {
        name: 'Hotel Ritz Madrid',
        price: 'USD 350',
        rating: '4.8/5',
        stars: '5',
        image: 'https://placehold.co/600x400/EEE/999?text=Hotel+Ritz',
        link: 'https://www.tripadvisor.com/Search?q=Hotel%20Ritz%20Madrid',
        address: 'Plaza de la Lealtad 5, Madrid, España',
      },
      {
        name: 'NH Collection Madrid Suecia',
        price: 'USD 180',
        rating: '4.5/5',
        stars: '4',
        image: 'https://placehold.co/600x400/EEE/999?text=NH+Collection',
        link: 'https://www.tripadvisor.com/Search?q=NH%20Collection%20Madrid%20Suecia',
        address: 'Calle del Marqués de Casa Riera 4, Madrid, España',
      },
      {
        name: 'TÓTEM Madrid',
        price: 'USD 200',
        rating: '4.6/5',
        stars: '4',
        image: 'https://placehold.co/600x400/EEE/999?text=TOTEM+Madrid',
        link: 'https://www.tripadvisor.com/Search?q=TOTEM%20Madrid',
        address: 'Calle de Hermosilla 23, Madrid, España',
      },
      {
        name: 'Hotel Urban',
        price: 'USD 230',
        rating: '4.4/5',
        stars: '5',
        image: 'https://placehold.co/600x400/EEE/999?text=Hotel+Urban',
        link: 'https://www.tripadvisor.com/Search?q=Hotel%20Urban%20Madrid',
        address: 'Carrera de San Jerónimo 34, Madrid, España',
      },
    ];
  };

  const loadHotels = async (location) => {
    try {
      setLoading(true);
      const hotelsData = await fetchHotels(location);
      console.log('Hotels data received:', hotelsData);
      if (Array.isArray(hotelsData)) {
        setHotels(hotelsData);
        setVisibleHotels(hotelsData.slice(0, displayLimit));
      } else {
        console.error('Hotels data is not an array:', hotelsData);
        setHotels([]);
        setVisibleHotels([]);
      }
    } catch (error) {
      console.error('Error in HotelsSection:', error);
      setError(error.message);
      setHotels([]);
      setVisibleHotels([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar hoteles cuando cambia searchLocation
  useEffect(() => {
    loadHotels(searchLocation);
  }, [searchLocation]);

  // Efecto para actualizar searchLocation cuando cambia initialLocation
  useEffect(() => {
    if (initialLocation && initialLocation !== searchLocation) {
      setSearchLocation(initialLocation);
      setSearchInput(initialLocation);
    }
  }, [initialLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchLocation(searchInput);
      setDisplayLimit(8); // Reset display limit when searching new location
    }
  };

  const handleShowMore = () => {
    const newLimit = displayLimit + 8;
    setDisplayLimit(newLimit);
    setVisibleHotels(hotels.slice(0, newLimit));
  };

  if (loading && hotels.length === 0)
    return <p className="text-center py-8">Cargando hoteles...</p>;

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Hoteles Recomendados
        </h2>

        {/* Buscador - Solo mostrarlo si no está en una página específica */}
        {!initialLocation && (
          <div className="mb-8">
            <form
              onSubmit={handleSearch}
              className="flex gap-2 max-w-md mx-auto"
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar hoteles por localidad..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Buscar
              </button>
            </form>
          </div>
        )}

        {loading && <p className="text-center">Actualizando resultados...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {visibleHotels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleHotels.map((hotel, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {hotel.name}
                  </h3>
                  {hotel.stars &&
                    hotel.stars !== 'N/A' &&
                    !isNaN(parseFloat(hotel.stars)) && (
                      <p className="text-yellow-500 mb-1">
                        {'★'.repeat(Math.round(parseFloat(hotel.stars)) || 0)}
                      </p>
                    )}
                  <p className="text-gray-700 mb-1">Desde: {hotel.price}</p>
                  <p className="text-gray-700 mb-3">Rating: {hotel.rating}</p>

                  <p className="text-gray-600 mb-2 text-sm truncate">
                    {typeof hotel.address === 'string' &&
                    !hotel.address.includes('{') &&
                    !hotel.address.includes('[')
                      ? hotel.address
                      : `${searchLocation}, España`}
                  </p>

                  <div className="w-full h-40 overflow-hidden rounded mb-3 bg-gray-200">
                    {hotel.image &&
                    hotel.image !== 'N/A' &&
                    typeof hotel.image === 'string' &&
                    !hotel.image.includes('{') ? (
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://placehold.co/600x400/EEE/999?text=Hotel';
                        }}
                      />
                    ) : (
                      <img
                        src={`https://placehold.co/600x400/EEE/999?text=${encodeURIComponent(hotel.name.substring(0, 15))}`}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <a
                    href={
                      hotel.link &&
                      hotel.link !== 'N/A' &&
                      typeof hotel.link === 'string' &&
                      !hotel.link.includes('zentrip')
                        ? hotel.link
                        : `https://www.tripadvisor.com/Search?q=${encodeURIComponent(hotel.name + ' ' + searchLocation)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Ver detalles
                  </a>
                </div>
              ))}
            </div>

            {/* Botón "Ver más" */}
            {visibleHotels.length < hotels.length && (
              <div className="text-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Ver más hoteles
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">
            No hay hoteles disponibles para {searchLocation}. Intenta con otra
            localidad.
          </p>
        )}
      </div>
    </section>
  );
};

export default HotelsSection;
