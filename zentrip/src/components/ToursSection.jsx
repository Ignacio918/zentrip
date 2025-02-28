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
  const [visibleTours, setVisibleTours] = useState(8); // Limitar a 8 tours inicialmente
  const [reload, setReload] = useState(false);

  // Lista de 8 destinos variados para variedad global
  const diverseDestinations = [
    { id: 732, name: 'Paris' }, // Francia
    { id: 60763, name: 'New York' }, // EE.UU.
    { id: 287437, name: 'Tokyo' }, // Japón
    { id: 2579, name: 'Rome' }, // Italia
    { id: 56662, name: 'Sydney' }, // Australia
    { id: 1291, name: 'London' }, // Reino Unido
    { id: 29303, name: 'Rio de Janeiro' }, // Brasil
    { id: 510, name: 'Cape Town' }, // Sudáfrica
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
      if (!term) {
        setDestinations([]);
        return;
      }
      try {
        const results = await searchDestinations(term);
        setDestinations(results);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      }
    }, 300),
    []
  );

  // Cargar tours recomendados desde destinos variados
  useEffect(() => {
    const fetchRecommendedTours = async () => {
      setLoading(true);
      try {
        const topTours = await getTopToursFromDestinations(
          diverseDestinations,
          1
        ); // 1 tour por destino
        setRecommendedTours(topTours);
      } catch (error) {
        console.error('Error fetching recommended tours:', error);
        setError('Error al cargar tours recomendados.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendedTours();
  }, [reload]);

  // Cargar tours iniciales desde destinos variados
  useEffect(() => {
    const fetchInitialTours = async () => {
      setLoading(true);
      try {
        const topTours = await getTopToursFromDestinations(
          diverseDestinations,
          2
        ); // 2 tours por destino
        setTours(topTours);
      } catch (error) {
        console.error('Error fetching initial tours:', error);
        setError('Error al cargar tours iniciales.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialTours();
  }, []);

  // Cargar tours según búsqueda o filtros
  useEffect(() => {
    const fetchSearchedTours = async () => {
      if (!searchTerm) return;
      setLoading(true);
      try {
        const selectedDest = destinations.find(
          (dest) => dest.name.toLowerCase() === searchTerm.toLowerCase()
        );
        const products = await getDestinationProducts({
          destinationId: selectedDest?.destinationId || 732,
          destinationName: selectedDest?.name || 'Paris',
          priceRange: filters.priceRange,
          duration: filters.duration,
          rating: filters.rating,
          limit: 50,
        });
        setTours(products);
        setVisibleTours(8); // Resetear a 8 al buscar
      } catch (error) {
        console.error('Error fetching searched tours:', error);
        setError('Error al cargar tours buscados.');
      } finally {
        setLoading(false);
      }
    };
    fetchSearchedTours();
  }, [searchTerm, filters, destinations]);

  const handleDestinationSelect = (dest) => {
    setSearchTerm(dest.name);
    setDestinations([]);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleLoadMore = () => {
    setVisibleTours((prev) => Math.min(prev + 8, tours.length)); // Cargar 8 más, sin superar el total
  };

  const handleReload = () => {
    setReload((prev) => !prev);
  };

  if (loading) return <p className="text-center">Cargando tours...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Explorá actividades increíbles
      </h2>

      <div className="mb-6 px-4 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Busca un destino (ej. París, Nueva York)"
          className="w-full p-2 border rounded"
        />
        {destinations.length > 0 && (
          <ul className="absolute bg-white border rounded mt-1 max-h-40 overflow-y-auto w-full z-10">
            {destinations.map((dest) => (
              <li
                key={dest.destinationId}
                onClick={() => handleDestinationSelect(dest)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {dest.name} ({dest.location.city}, {dest.location.country})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6 px-4 flex flex-wrap gap-4">
        <div>
          <label>Precio:</label>
          <input
            type="range"
            min="0"
            max="1000"
            onChange={(e) =>
              handleFilterChange('priceRange', {
                min: 0,
                max: parseInt(e.target.value),
              })
            }
            className="ml-2"
          />
        </div>
        <div>
          <label>Duración (horas):</label>
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
          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
        >
          Recargar
        </button>
      </div>

      {recommendedTours.length > 0 && !searchTerm && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-center mb-4">
            Tours Recomendados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            {recommendedTours.map((tour) => (
              <div
                key={tour.productCode}
                className="border rounded-lg overflow-hidden shadow-lg"
              >
                <img
                  src={tour.photoUrl || 'https://via.placeholder.com/150'}
                  alt={tour.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{tour.title}</h3>
                  <p className="text-gray-600">${tour.price.amount}</p>
                  <a
                    href={tour.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Ver más
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {tours.length > 0 ? (
          <>
            {tours.slice(0, visibleTours).map((tour) => (
              <div
                key={tour.productCode}
                className="border rounded-lg overflow-hidden shadow-lg"
              >
                <img
                  src={tour.photoUrl || 'https://via.placeholder.com/150'}
                  alt={tour.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{tour.title}</h3>
                  <p className="text-gray-600">${tour.price.amount}</p>
                  <a
                    href={tour.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Ver más
                  </a>
                </div>
              </div>
            ))}
            {visibleTours < tours.length && (
              <button
                onClick={handleLoadMore}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Ver más
              </button>
            )}
          </>
        ) : (
          <p className="text-center">No hay tours disponibles.</p>
        )}
      </div>
    </section>
  );
};

export default ToursSection;
