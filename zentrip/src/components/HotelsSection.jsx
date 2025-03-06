import { useState, useEffect } from 'react';
import fetchHotels from '../../api/get-hotels';

const HotelsSection = () => {
  const [hotels, setHotels] = useState([]);
  const [visibleHotels, setVisibleHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState('Madrid'); // Default location
  const [searchInput, setSearchInput] = useState('Madrid');
  const [displayLimit, setDisplayLimit] = useState(8);

  const loadHotels = async (location) => {
    try {
      setLoading(true);
      const hotelsData = await fetchHotels(location);
      console.log('Hotels data received:', hotelsData);
      if (Array.isArray(hotelsData)) {
        // Aseguramos que cada hotel tenga valores string para rating, stars y price
        const formattedHotels = hotelsData.map((hotel) => ({
          ...hotel,
          // Convertir rating a string si es un objeto
          rating:
            typeof hotel.rating === 'object'
              ? hotel.rating.subRating
                ? `${hotel.rating.subRating}/${hotel.rating.total || 5}`
                : '4/5'
              : typeof hotel.rating === 'number'
                ? `${hotel.rating}/5`
                : '4/5',
          // Asegurar que stars es string
          stars:
            typeof hotel.stars === 'object'
              ? String(hotel.stars.value || '4')
              : typeof hotel.stars === 'number'
                ? String(hotel.stars)
                : '4',
          // Asegurar que price es string
          price:
            typeof hotel.price === 'object'
              ? `${hotel.price.currency || 'USD'} ${hotel.price.amount || hotel.price.from || '100'}`
              : typeof hotel.price === 'string'
                ? hotel.price
                : 'USD N/A',
          // Extraer dirección del JSON si es un objeto, o crear una dirección visible
          address:
            typeof hotel.address === 'object'
              ? hotel.address.street
                ? `${hotel.address.street}, ${hotel.address.city || 'Madrid'}`
                : typeof hotel.address === 'string'
                  ? hotel.address
                  : 'Madrid, España'
              : typeof hotel.address === 'string'
                ? hotel.address
                : 'Madrid, España',
        }));

        setHotels(formattedHotels);
        setVisibleHotels(formattedHotels.slice(0, displayLimit));
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

  useEffect(() => {
    loadHotels(searchLocation);
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

        {/* Buscador */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
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
                      : 'Madrid, España'}
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
                        : `https://www.tripadvisor.com/Search?q=${encodeURIComponent(hotel.name + ' Madrid')}`
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
