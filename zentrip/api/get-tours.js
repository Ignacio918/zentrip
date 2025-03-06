// api/get-tours.js
const fetchTours = async (location) => {
  console.log('Starting fetchTours... (MOCK MODE)');
  console.log('Location:', location || 'Not provided');

  // Datos de ejemplo para simular una respuesta de tours
  const mockTours = [
    {
      name: 'Tour del Palacio Real',
      price: 'USD 45',
      rating: '4.7/5',
      link: 'https://www.tripadvisor.com/Tour-Palacio-Real',
      image: 'https://placehold.co/600x400/EEE/999?text=Palacio+Real+Tour',
    },
    {
      name: 'Madrid City Highlights',
      price: 'USD 60',
      rating: '4.5/5',
      link: 'https://www.tripadvisor.com/Madrid-City-Highlights',
      image: 'https://placehold.co/600x400/EEE/999?text=City+Highlights',
    },
    {
      name: 'Tapas and Wine Walking Tour',
      price: 'USD 75',
      rating: '4.9/5',
      link: 'https://www.tripadvisor.com/Tapas-Wine-Tour',
      image: 'https://placehold.co/600x400/EEE/999?text=Tapas+Wine+Tour',
    },
    {
      name: 'Museo del Prado Skip-the-Line Tour',
      price: 'USD 50',
      rating: '4.6/5',
      link: 'https://www.tripadvisor.com/Prado-Museum-Tour',
      image: 'https://placehold.co/600x400/EEE/999?text=Prado+Museum+Tour',
    },
    {
      name: 'Evening Flamenco Show',
      price: 'USD 65',
      rating: '4.8/5',
      link: 'https://www.tripadvisor.com/Flamenco-Show',
      image: 'https://placehold.co/600x400/EEE/999?text=Flamenco+Show',
    },
  ];

  // Filtrar tours basados en la ubicación (simulado)
  const filteredTours = mockTours.filter((tour) =>
    location ? tour.name.toLowerCase().includes(location.toLowerCase()) : true
  );

  // Añadir un pequeño delay para simular llamada de API
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Returning mock tours:', filteredTours);
  return filteredTours;
};

export default fetchTours;
