import { useState, useEffect } from 'react';
import fetchRestaurants from '../../api/get-restaurants';

const RestaurantsSection = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [visibleRestaurants, setVisibleRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState('Madrid'); // Default location
  const [searchInput, setSearchInput] = useState('Madrid');
  const [displayLimit, setDisplayLimit] = useState(8);

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

  useEffect(() => {
    loadRestaurants(searchLocation);
  }, [searchLocation]);

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

  if (loading && restaurants.length === 0)
    return <p className="text-center py-8">Cargando restaurantes...</p>;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Restaurantes Recomendados
        </h2>

        {/* Buscador */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
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
                  {restaurant.cuisine && (
                    <p className="text-gray-600 mb-1 text-sm">
                      {restaurant.cuisine}
                    </p>
                  )}
                  <p className="text-gray-700 mb-1">
                    Precio: {restaurant.price}
                  </p>
                  <p className="text-gray-700 mb-3">
                    Rating: {restaurant.rating}
                  </p>
                  {restaurant.image !== 'N/A' && (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}
                  <a
                    href={restaurant.link}
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
