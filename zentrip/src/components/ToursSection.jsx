import { useState, useEffect, useCallback } from 'react';
import {
  getDestinationProducts,
  searchDestinations,
  getTopToursFromDestinations,
} from '../viatorClient.js';

const ToursSection = () => {
  const [tours, setTours] = useState([]);
  const [recommendedTours, setRecommendedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: null,
    duration: null,
    rating: null,
  });
  const [visibleTours, setVisibleTours] = useState(8);
  const [reload, setReload] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Lista actualizada de destinos principales con IDs correctos de Viator
  const diverseDestinations = [
    { id: 732, name: 'Paris' }, // Francia
    { id: 687, name: 'London' }, // Reino Unido
    { id: 684, name: 'Barcelona' }, // España
    { id: 662, name: 'Madrid' }, // España
    { id: 546, name: 'Rome' }, // Italia
    { id: 712, name: 'New York' }, // Estados Unidos
    { id: 10812, name: 'Tokyo' }, // Japón
    { id: 357, name: 'Sydney' }, // Australia
  ];

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchDestinations = useCallback(
    debounce(async (term) => {
      if (!term || term.length < 2) {
        setDestinations([]);
        return;
      }
      try {
        setLoading(true);
        const results = await searchDestinations(term);
        console.log(
          `Search for "${term}" returned ${results.length} destinations:`,
          results
        );
        setDestinations(results);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Cargar tours recomendados desde destinos
  useEffect(() => {
    const fetchRecommendedTours = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching recommended tours from diverse destinations...');
        const topTours = await getTopToursFromDestinations(
          diverseDestinations,
          3 // Aumentamos para tener más variedad
        );

        console.log(`Received ${topTours.length} recommended tours`);

        if (topTours.length === 0) {
          setError(
            'No se encontraron tours recomendados. Por favor, inténtalo de nuevo más tarde.'
          );
        } else {
          setRecommendedTours(topTours);
        }
      } catch (error) {
        console.error('Error fetching recommended tours:', error);
        setError(
          'Error al cargar tours recomendados. Por favor, inténtalo de nuevo más tarde.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (!searchPerformed) {
      fetchRecommendedTours();
    }
  }, [reload, searchPerformed]);

  // Manejar la selección de destino y buscar tours
  const handleDestinationSelect = async (dest) => {
    setSearchTerm(dest.name);
    setDestinations([]);
    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      console.log(
        `Fetching tours for selected destination ${dest.name} (ID: ${dest.destinationId})`
      );
      const products = await getDestinationProducts({
        destinationId: dest.destinationId,
        destinationName: dest.name,
        priceRange: filters.priceRange,
        duration: filters.duration,
        rating: filters.rating,
        limit: 50,
      });

      if (products.length === 0) {
        setError(
          `No se encontraron tours para ${dest.name} con los filtros seleccionados.`
        );
        // Try without filters as fallback
        if (filters.priceRange || filters.duration || filters.rating) {
          console.log('Retrying without filters');
          const productsWithoutFilters = await getDestinationProducts({
            destinationId: dest.destinationId,
            destinationName: dest.name,
            limit: 50,
          });

          if (productsWithoutFilters.length > 0) {
            setTours(productsWithoutFilters);
            setError(
              `No se encontraron tours para ${dest.name} con los filtros actuales. Mostrando todos los tours disponibles.`
            );
          } else {
            setTours([]);
          }
        } else {
          setTours([]);
        }
      } else {
        setTours(products);
        setError(null);
      }
    } catch (err) {
      console.error(`Error fetching tours for ${dest.name}:`, err);
      setError(
        `Error al cargar tours para ${dest.name}. Por favor, inténtalo de nuevo.`
      );
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar búsqueda explícita cuando el usuario presiona Enter
  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchTerm || searchTerm.length < 2) {
      setError(
        'Por favor, ingresa al menos 2 caracteres para buscar un destino.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      // First search for destinations matching the term
      const searchResults = await searchDestinations(searchTerm);

      if (!searchResults || searchResults.length === 0) {
        setError(`No se encontraron destinos para "${searchTerm}"`);
        setTours([]);
        setLoading(false);
        return;
      }

      // Use the first result
      const selectedDest = searchResults[0];
      console.log(
        `Searching tours for ${selectedDest.name} (ID: ${selectedDest.destinationId})`
      );

      // Fetch tours for this destination with filters
      const products = await getDestinationProducts({
        destinationId: selectedDest.destinationId,
        destinationName: selectedDest.name,
        priceRange: filters.priceRange,
        duration: filters.duration,
        rating: filters.rating,
        limit: 50,
      });

      if (products.length === 0) {
        setError(
          `No se encontraron tours para ${selectedDest.name} con los filtros seleccionados.`
        );

        // Try without filters as fallback
        if (filters.priceRange || filters.duration || filters.rating) {
          const productsWithoutFilters = await getDestinationProducts({
            destinationId: selectedDest.destinationId,
            destinationName: selectedDest.name,
            limit: 50,
          });

          if (productsWithoutFilters.length > 0) {
            setTours(productsWithoutFilters);
            setError(
              `No se encontraron tours para ${selectedDest.name} con los filtros actuales. Mostrando todos los tours disponibles.`
            );
          } else {
            setTours([]);
          }
        } else {
          setTours([]);
        }
      } else {
        setTours(products);
        setError(null);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setError('Error al buscar tours. Por favor, inténtalo de nuevo.');
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleLoadMore = () => {
    setVisibleTours((prev) => Math.min(prev + 8, tours.length));
  };

  const handleReload = () => {
    setReload((prev) => !prev);
    setSearchPerformed(false);
    setSearchTerm('');
    setTours([]);
    setError(null);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchPerformed(false);
    setTours([]);
    setDestinations([]);
    setError(null);
  };

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Explorá actividades increíbles
      </h2>

      <div className="mb-6 px-4 relative">
        <form onSubmit={handleSearch} className="flex w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchDestinations(e.target.value);
            }}
            placeholder="Busca un destino (ej. París, Barcelona, Roma)"
            className="w-full p-2 border rounded-l"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-r hover:bg-blue-600"
          >
            Buscar
          </button>
        </form>

        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-8 top-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}

        {destinations.length > 0 && (
          <ul className="absolute bg-white border rounded mt-1 max-h-60 overflow-y-auto w-full z-10">
            {destinations.map((dest) => (
              <li
                key={dest.destinationId}
                onClick={() => handleDestinationSelect(dest)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {dest.name}{' '}
                {dest.location?.city &&
                  `(${dest.location.city}, ${dest.location.country})`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6 px-4 flex flex-wrap gap-4">
        <div>
          <label className="mr-1">Precio máx:</label>
          <input
            type="range"
            min="0"
            max="1000"
            defaultValue="1000"
            onChange={(e) =>
              handleFilterChange('priceRange', {
                min: 0,
                max: parseInt(e.target.value),
              })
            }
            className="ml-2"
          />
          <span className="ml-2">${filters.priceRange?.max || 1000}</span>
        </div>
        <div>
          <label>Duración:</label>
          <select
            onChange={(e) =>
              handleFilterChange('duration', e.target.value || null)
            }
            className="ml-2 p-1 border rounded"
          >
            <option value="">Todas</option>
            <option value="PT1H-PT4H">1-4 horas</option>
            <option value="PT4H-PT8H">4-8 horas</option>
            <option value="PT8H">8+ horas</option>
          </select>
        </div>
        <div>
          <label>Rating mínimo:</label>
          <select
            onChange={(e) =>
              handleFilterChange('rating', parseInt(e.target.value) || null)
            }
            className="ml-2 p-1 border rounded"
          >
            <option value="">Cualquiera</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
        <button
          onClick={handleReload}
          className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
        >
          Recargar recomendados
        </button>
      </div>

      {error && (
        <div className="text-center text-amber-600 mb-4 bg-amber-50 p-2 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Cargando tours...</p>
        </div>
      ) : (
        <>
          {recommendedTours.length > 0 && !searchPerformed && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-center mb-4">
                Tours Recomendados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {recommendedTours.map((tour) => (
                  <div
                    key={`rec-${tour.productCode}`}
                    className="border rounded-lg overflow-hidden shadow-lg flex flex-col"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={
                          tour.photoUrl ||
                          'https://via.placeholder.com/300x200?text=No+Image'
                        }
                        alt={tour.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                        {tour.title}
                      </h3>
                      <div className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Destino:</span>{' '}
                        {tour.destinationName}
                      </div>
                      <div className="text-sm text-gray-700 mb-1">
                        {tour.duration && (
                          <span>
                            <span className="font-medium">Duración:</span>{' '}
                            {tour.duration}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 mb-1 flex items-center">
                        <span className="font-medium mr-1">Rating:</span>
                        <span className="text-yellow-500">★</span>{' '}
                        {tour.rating.toFixed(1)}
                        <span className="text-gray-500 text-xs ml-1">
                          ({tour.reviewCount})
                        </span>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="text-lg font-bold text-blue-700">
                          ${tour.price.amount.toFixed(2)} {tour.price.currency}
                        </span>
                        <a
                          href={tour.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                        >
                          Ver detalles
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchPerformed && (
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-center mb-4">
                {searchTerm
                  ? `Tours para "${searchTerm}"`
                  : 'Tours encontrados'}
              </h3>

              {tours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                  {tours.slice(0, visibleTours).map((tour, index) => (
                    <div
                      key={`search-${tour.productCode}-${index}`}
                      className="border rounded-lg overflow-hidden shadow-lg flex flex-col"
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={
                            tour.photoUrl ||
                            'https://via.placeholder.com/300x200?text=No+Image'
                          }
                          alt={tour.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                          onError={(e) => {
                            e.target.src =
                              'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                          {tour.title}
                        </h3>
                        {tour.location && (
                          <div className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Ubicación:</span>{' '}
                            {tour.location}
                          </div>
                        )}
                        {tour.duration && (
                          <div className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Duración:</span>{' '}
                            {tour.duration}
                          </div>
                        )}
                        <div className="text-sm text-gray-700 mb-1 flex items-center">
                          <span className="font-medium mr-1">Rating:</span>
                          <span className="text-yellow-500">★</span>{' '}
                          {tour.rating.toFixed(1)}
                          <span className="text-gray-500 text-xs ml-1">
                            ({tour.reviewCount})
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <span className="text-lg font-bold text-blue-700">
                            ${tour.price.amount.toFixed(2)}{' '}
                            {tour.price.currency}
                          </span>
                          <a
                            href={tour.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                          >
                            Ver detalles
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4">
                  No se encontraron tours para esta búsqueda.
                </p>
              )}

              {visibleTours < tours.length && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
                  >
                    Cargar más tours
                  </button>
                </div>
              )}
            </div>
          )}

          {!searchPerformed && tours.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Tours Destacados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {tours.slice(0, visibleTours).map((tour, index) => (
                  <div
                    key={`featured-${tour.productCode}-${index}`}
                    className="border rounded-lg overflow-hidden shadow-lg flex flex-col"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={
                          tour.photoUrl ||
                          'https://via.placeholder.com/300x200?text=No+Image'
                        }
                        alt={tour.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                        {tour.title}
                      </h3>
                      {tour.location && (
                        <div className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Ubicación:</span>{' '}
                          {tour.location}
                        </div>
                      )}
                      {tour.duration && (
                        <div className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Duración:</span>{' '}
                          {tour.duration}
                        </div>
                      )}
                      <div className="text-sm text-gray-700 mb-1 flex items-center">
                        <span className="font-medium mr-1">Rating:</span>
                        <span className="text-yellow-500">★</span>{' '}
                        {tour.rating.toFixed(1)}
                        <span className="text-gray-500 text-xs ml-1">
                          ({tour.reviewCount})
                        </span>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="text-lg font-bold text-blue-700">
                          ${tour.price.amount.toFixed(2)} {tour.price.currency}
                        </span>
                        <a
                          href={tour.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                        >
                          Ver detalles
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {visibleTours < tours.length && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition"
                  >
                    Cargar más tours
                  </button>
                </div>
              )}
            </div>
          )}

          {!searchPerformed &&
            tours.length === 0 &&
            recommendedTours.length === 0 &&
            !loading && (
              <p className="text-center py-8">
                No se encontraron tours disponibles. Por favor, intenta recargar
                la página o busca otro destino.
              </p>
            )}
        </>
      )}
    </section>
  );
};

export default ToursSection;
