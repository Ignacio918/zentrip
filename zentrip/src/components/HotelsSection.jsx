import { useState, useEffect } from 'react';
import fetchVacationRentals from '../../api/get-vacation-rentals';

const VacationRentalsSection = () => {
  const [rentals, setRentals] = useState([]);
  const [visibleRentals, setVisibleRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState('Madrid'); // Default location
  const [searchInput, setSearchInput] = useState('Madrid');
  const [displayLimit, setDisplayLimit] = useState(8);

  const loadRentals = async (location) => {
    try {
      setLoading(true);
      const rentalsData = await fetchVacationRentals(location);
      console.log('Vacation rentals data received:', rentalsData);
      if (Array.isArray(rentalsData)) {
        // Aseguramos que cada alquiler tenga valores string para todos los campos
        const formattedRentals = rentalsData.map((rental) => ({
          ...rental,
          // Convertir rating a string si es un objeto
          rating:
            typeof rental.rating === 'object'
              ? `${rental.rating.subRating || 0}/${rental.rating.total || 5}`
              : String(rental.rating || 'N/A'),
          // Asegurar que price es string
          price:
            typeof rental.price === 'object'
              ? `${rental.price.currency || '$'} ${rental.price.amount || rental.price.perNight || 0}`
              : String(rental.price || 'N/A'),
          // Asegurar que bedrooms es string
          bedrooms:
            typeof rental.bedrooms === 'object'
              ? String(rental.bedrooms.count || rental.bedrooms || 'N/A')
              : String(rental.bedrooms || 'N/A'),
          // Asegurar que bathrooms es string
          bathrooms:
            typeof rental.bathrooms === 'object'
              ? String(rental.bathrooms.count || rental.bathrooms || 'N/A')
              : String(rental.bathrooms || 'N/A'),
          // Asegurar que capacity es string
          capacity:
            typeof rental.capacity === 'object'
              ? String(rental.capacity.count || rental.capacity || 'N/A')
              : String(rental.capacity || rental.maxOccupancy || 'N/A'),
          // Asegurar que address es string
          address:
            typeof rental.address === 'object'
              ? rental.address.street
                ? `${rental.address.street}, ${rental.address.city || ''}`
                : JSON.stringify(rental.address)
              : String(rental.address || rental.location || 'N/A'),
        }));

        setRentals(formattedRentals);
        setVisibleRentals(formattedRentals.slice(0, displayLimit));
      } else {
        console.error('Vacation rentals data is not an array:', rentalsData);
        setRentals([]);
        setVisibleRentals([]);
      }
    } catch (error) {
      console.error('Error in VacationRentalsSection:', error);
      setError(error.message);
      setRentals([]);
      setVisibleRentals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals(searchLocation);
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
    setVisibleRentals(rentals.slice(0, newLimit));
  };

  if (loading && rentals.length === 0)
    return (
      <p className="text-center py-8">Cargando alquileres vacacionales...</p>
    );

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Alquileres Vacacionales
        </h2>

        {/* Buscador */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar alquileres por localidad..."
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

        {visibleRentals.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleRentals.map((rental, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {rental.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {rental.bedrooms && rental.bedrooms !== 'N/A' && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {rental.bedrooms} hab.
                      </span>
                    )}
                    {rental.bathrooms && rental.bathrooms !== 'N/A' && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {rental.bathrooms} baños
                      </span>
                    )}
                    {rental.capacity && rental.capacity !== 'N/A' && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        Hasta {rental.capacity} personas
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-1">Precio: {rental.price}</p>
                  <p className="text-gray-700 mb-3">Rating: {rental.rating}</p>
                  {rental.address && rental.address !== 'N/A' && (
                    <p className="text-gray-600 mb-2 text-sm truncate">
                      {rental.address}
                    </p>
                  )}
                  {rental.image && rental.image !== 'N/A' && (
                    <img
                      src={rental.image}
                      alt={rental.name}
                      className="w-full h-40 object-cover rounded mb-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <a
                    href={rental.link}
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
            {visibleRentals.length < rentals.length && (
              <div className="text-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Ver más alquileres
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">
            No hay alquileres vacacionales disponibles para {searchLocation}.
            Intenta con otra localidad.
          </p>
        )}
      </div>
    </section>
  );
};

export default VacationRentalsSection;
