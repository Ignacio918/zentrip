import { useState, useEffect } from 'react';

const ToursSection = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch('/api/viator-tours', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_VIATOR_API_KEY_PROD}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Accept-Language': 'en',
          },
        });
        if (!response.ok) {
          throw new Error(
            `Error HTTP: ${response.status} - ${response.statusText}`
          );
        }
        const data = await response.json();
        console.log('Respuesta completa de Viator:', data);
        setTours(data.products ? data.products.slice(0, 5) : []);
      } catch (error) {
        console.error('Detalles del error fetching tours:', error);
        setError(
          `No se pudieron cargar los tours: ${error.message}. Revisá la consola.`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  if (loading) return <p className="text-center">Cargando tours...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Explorá actividades increíbles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {tours.length > 0 ? (
          tours.map((tour) => (
            <div
              key={tour.productCode}
              className="border rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={tour.thumbnailUrl}
                alt={tour.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{tour.title}</h3>
                <p className="text-gray-600">
                  ${tour.price?.formattedPrice || 'N/A'}
                </p>
                <a
                  href={tour.webUrl}
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

// Proxy integrado como función de API dentro del mismo archivo (para Vercel)
export default ToursSection;

export async function getServerSideProps() {
  try {
    const body = {
      filtering: {
        destination: '732',
        tags: [21972],
        flags: ['LIKELY_TO_SELL_OUT', 'FREE_CANCELLATION'],
        lowestPrice: 5,
        highestPrice: 500,
        startDate: '2025-02-28', // Fecha futura válida
        endDate: '2025-03-28',
        includeAutomaticTranslations: true,
        confirmationType: 'INSTANT',
        durationInMinutes: {
          from: 20,
          to: 360,
        },
        rating: {
          from: 3,
          to: 5,
        },
      },
      sorting: {
        sort: 'TRAVELER_RATING',
        order: 'DESCENDING',
      },
      pagination: {
        start: 1,
        count: 5,
      },
      currency: 'USD',
    };

    const response = await fetch(
      'https://api.viator.com/partner/products/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VITE_VIATOR_API_KEY_PROD}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Accept-Language': 'en',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error HTTP: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('Respuesta completa de Viator desde proxy:', data);
    return { props: { initialTours: data.products || [] } };
  } catch (error) {
    console.error('Error en proxy de Viator:', error);
    return { props: { initialTours: [], error: error.message } };
  }
}
