import { useState, useEffect, useCallback } from 'react';
import { getDestinationProducts, searchDestinations } from '../viatorClient.js';

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

  // Lista de destinos populares para recomendaciones
  const popularDestinations = [
    { id: 732, name: 'Paris' },
    { id: 60763, name: 'New York' },
    { id: 287437, name: 'Tokyo' },
    { id: 2579, name: 'Rome' },
    { id: 56662, name: 'Sydney' },
  ];

  // Función con debounce para buscar destinos
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

  // Cargar tours recomendados al inicio
  useEffect(() => {
    const fetchRecommendedTours = async () => {
      try {
        const recommendations = await Promise.all(
          popularDestinations.map(async (dest) => {
            const products = await getDestinationProducts({
              destinationId: dest.id,
              destinationName: dest.name,
              limit: 1,
            });
            return products[0]; // Tomar el primer tour de cada destino
          })
        );
        setRecommendedTours(recommendations.filter(Boolean));
      } catch (error) {
        console.error('Error fetching recommended tours:', error);
      }
    };
    fetchRecommendedTours();
  }, []);

  // Cargar tours según búsqueda o filtros
  const fetchTours = async (
    destinationId = null,
    destinationName = 'Global'
  ) => {
    setLoading(true);
    try {
      const products = await getDestinationProducts({
        destinationId,
        destinationName,
        priceRange: filters.priceRange,
        duration: filters.duration,
        rating: filters.rating,
      });
      setTours(products);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setError(
        `No se pudieron cargar los tours: ${error.message}. Revisá la consola.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Actualizar búsqueda
  useEffect(() => {
    fetchDestinations(searchTerm);
  }, [searchTerm, fetchDestinations]);

  // Manejar selección de destino
  const handleDestinationSelect = (dest) => {
    setSearchTerm(dest.name);
    setDestinations([]);
    fetchTours(dest.destinationId, dest.name);
  };

  // Manejar filtros
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    fetchTours(); // Aplicar filtros inmediatamente (puedes ajustar esto)
  };

  if (loading) return <p className="text-center">Cargando tours...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Explorá actividades increíbles
      </h2>

      {/* Buscador */}
      <div className="mb-6 px-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Busca un destino (ej. París, Nueva York)"
          className="w-full p-2 border rounded"
        />
        {destinations.length > 0 && (
          <ul className="absolute bg-white border rounded mt-1 max-h-40 overflow-y-auto w-full">
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

      {/* Filtros */}
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
            <option value="1-4">1-4 horas</option>
            <option value="4-8">4-8 horas</option>
            <option value="8+">8+ horas</option>
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
      </div>

      {/* Tours Recomendados */}
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

      {/* Tours Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {tours.length > 0 ? (
          tours.map((tour) => (
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
          ))
        ) : (
          <p className="text-center">No hay tours disponibles.</p>
        )}
      </div>
    </section>
  );
};

export default ToursSection;
