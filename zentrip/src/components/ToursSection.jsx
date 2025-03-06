import { useState, useEffect } from 'react';
import fetchTours from '../api/get-tours';

const ToursSection = ({ initialLocation }) => {
  const [tours, setTours] = useState([]);
  const [visibleTours, setVisibleTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState(
    initialLocation || 'Madrid'
  );
  const [searchInput, setSearchInput] = useState(initialLocation || 'Madrid');
  const [displayLimit, setDisplayLimit] = useState(8);

  const loadTours = async (location) => {
    try {
      setLoading(true);
      const toursData = await fetchTours(location);
      console.log('Tours data received in ToursSection:', toursData);
      if (Array.isArray(toursData)) {
        setTours(toursData);
        setVisibleTours(toursData.slice(0, displayLimit));
      } else {
        console.error('Tours data is not an array:', toursData);
        setTours([]);
        setVisibleTours([]);
      }
    } catch (error) {
      console.error('Error in ToursSection:', error);
      setError(error.message);
      setTours([]);
      setVisibleTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar tours cuando cambia searchLocation o initialLocation
  useEffect(() => {
    loadTours(searchLocation);
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
    setVisibleTours(tours.slice(0, newLimit));
  };

  if (loading && tours.length === 0)
    return <p className="text-center py-8">Cargando tours...</p>;

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Tours Recomendados
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
                placeholder="Buscar tours por localidad..."
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

        {visibleTours.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleTours.map((tour, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {tour.name}
                  </h3>
                  <p className="text-gray-700 mb-1">Precio: {tour.price}</p>
                  <p className="text-gray-700 mb-3">Rating: {tour.rating}</p>

                  {tour.image && tour.image !== 'N/A' && (
                    <div className="w-full overflow-hidden rounded mb-3">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://placehold.co/600x400/EEE/999?text=Tour';
                        }}
                      />
                    </div>
                  )}

                  <a
                    href={tour.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Ver detalles
                  </a>
                </div>
              ))}
            </div>

            {/* Botón "Ver más" */}
            {visibleTours.length < tours.length && (
              <div className="text-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Ver más tours
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">
            No hay tours disponibles para {searchLocation}. Intenta con otra
            localidad.
          </p>
        )}
      </div>
    </section>
  );
};

export default ToursSection;
