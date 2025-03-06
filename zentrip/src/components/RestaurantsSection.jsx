import { useState, useEffect } from 'react';

const RestaurantsSection = ({ initialLocation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [visibleRestaurants, setVisibleRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState(
    initialLocation || 'Madrid'
  );
  const [searchInput, setSearchInput] = useState(initialLocation || 'Madrid');
  const [displayLimit, setDisplayLimit] = useState(8);

  // Función mock de fetchRestaurants para permitir que la aplicación compile
  const fetchRestaurants = async (location) => {
    // Simulamos una petición de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Creamos datos de ejemplo
    return [
      {
        name: 'DiverXO',
        price: '$$$',
        rating: '4.9/5',
        cuisine: 'Cocina creativa, Gastronomía de autor',
        image: 'https://placehold.co/600x400/EEE/999?text=DiverXO',
        link: 'https://www.tripadvisor.com/Search?q=DiverXO%20Madrid',
        address: 'Calle Padre Damián 23, Madrid, España',
      },
      {
        name: 'Botín',
        price: '$$',
        rating: '4.5/5',
        cuisine: 'Española, Cocina tradicional',
        image: 'https://placehold.co/600x400/EEE/999?text=Botin',
        link: 'https://www.tripadvisor.com/Search?q=Botin%20Madrid',
        address: 'Calle Cuchilleros 17, Madrid, España',
      },
      {
        name: 'El Paraguas',
        price: '$$$',
        rating: '4.6/5',
        cuisine: 'Mediterránea, Asturiana',
        image: 'https://placehold.co/600x400/EEE/999?text=El+Paraguas',
        link: 'https://www.tripadvisor.com/Search?q=El%20Paraguas%20Madrid',
        address: 'Calle Jorge Juan 16, Madrid, España',
      },
      {
        name: 'La Tasquita de Enfrente',
        price: '$$$',
        rating: '4.7/5',
        cuisine: 'Española, Innovadora',
        image: 'https://placehold.co/600x400/EEE/999?text=La+Tasquita',
        link: 'https://www.tripadvisor.com/Search?q=La%20Tasquita%20de%20Enfrente%20Madrid',
        address: 'Calle Ballesta 6, Madrid, España',
      },
    ];
  };

  const loadRestaurants = async (location) => {
    try {
      setLoading(true);
      const restaurantsData = await fetchRestaurants(location);
      console.log('Restaurants data received:', restaurantsData);
      if (Array.isArray(restaurantsData)) {
        setRestaurants(restaurantsData);
        setVisibleRestaurants(restaurantsData.slice(0, displayLimit));
      } else {
        console.error('Restaurants data is not an array:', restaurantsData);
        setRestaurants([]);
        setVisibleRestaurants([]);
      }
    } catch (error) {
      console.error('Error in RestaurantsSection:', error);
      setError(error.message);
      setRestaurants([]);
      setVisibleRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar restaurantes cuando cambia searchLocation
  useEffect(() => {
    loadRestaurants(searchLocation);
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
    setVisibleRestaurants(restaurants.slice(0, newLimit));
  };

  if (loading && restaurants.length === 0) {
    return <p className="text-center py-8">Cargando restaurantes...</p>;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Restaurantes Recomendados
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
                placeholder="Buscar restaurantes por localidad..."
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

        {visibleRestaurants.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleRestaurants.map((restaurant, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {restaurant.name}
                  </h3>

                  <p className="text-gray-600 mb-1 text-sm">
                    {typeof restaurant.cuisine === 'string' &&
                    !restaurant.cuisine.includes('{')
                      ? restaurant.cuisine
                      : 'Cocina Internacional'}
                  </p>

                  <p className="text-gray-700 mb-1">
                    Precio: {restaurant.price}
                  </p>

                  <p className="text-gray-700 mb-3">
                    Rating: {restaurant.rating}
                  </p>

                  <div className="w-full h-40 overflow-hidden rounded mb-3 bg-gray-200">
                    {restaurant.image &&
                    restaurant.image !== 'N/A' &&
                    typeof restaurant.image === 'string' &&
                    !restaurant.image.includes('{') ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://placehold.co/600x400/EEE/999?text=Restaurante';
                        }}
                      />
                    ) : (
                      <img
                        src={`https://placehold.co/600x400/EEE/999?text=${encodeURIComponent(restaurant.name.substring(0, 15))}`}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <a
                    href={
                      restaurant.link &&
                      restaurant.link !== 'N/A' &&
                      typeof restaurant.link === 'string' &&
                      !restaurant.link.includes('zentrip')
                        ? restaurant.link
                        : `https://www.tripadvisor.com/Search?q=${encodeURIComponent(restaurant.name + ' restaurante ' + searchLocation)}`
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
            {visibleRestaurants.length < restaurants.length && (
              <div className="text-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Ver más restaurantes
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">
            No hay restaurantes disponibles para {searchLocation}. Intenta con
            otra localidad.
          </p>
        )}
      </div>
    </section>
  );
};

export default RestaurantsSection;
