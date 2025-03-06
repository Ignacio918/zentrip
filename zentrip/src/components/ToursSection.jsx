import { useState, useEffect } from 'react';
import fetchTours from '../../api/get-tours';

const ToursSection = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTours = async () => {
      try {
        const toursData = await fetchTours('Madrid');
        setTours(toursData);
      } catch (error) {
        console.error('Error in ToursSection:', error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    getTours();
  }, []);

  if (loading) return <p>Cargando tours...</p>;

  return (
    <section className="py-12 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8">
        Tours Recomendados
      </h2>
      {tours.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          {tours.map((tour, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold">{tour.name}</h3>
              <p>Precio: {tour.price}</p>
              <p>Rating: {tour.rating}</p>
              {tour.image !== 'N/A' && (
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-40 object-cover rounded mt-2"
                />
              )}
              <a
                href={tour.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 block"
              >
                Ver más
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No hay tours disponibles en este momento.
        </p>
      )}
    </section>
  );
};

export default ToursSection;
