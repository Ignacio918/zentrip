// api/get-hotels.js
const fetchHotels = async (location) => {
  console.log('Starting fetchHotels... (MOCK MODE)');
  console.log('Location:', location || 'Not provided');

  // Datos de ejemplo para simular una respuesta de API
  const mockHotels = [
    {
      name: 'Hotel Example Madrid',
      price: 'USD 120',
      rating: '4.5/5',
      stars: '4',
      link: 'https://www.tripadvisor.com/Hotel-Example-Madrid',
      image: 'https://placehold.co/600x400/EEE/999?text=Hotel+Madrid',
      address: 'Calle Gran Vía, Madrid, España',
    },
    {
      name: 'Madrid Plaza Hotel',
      price: 'USD 95',
      rating: '4.2/5',
      stars: '3',
      link: 'https://www.tripadvisor.com/Madrid-Plaza-Hotel',
      image: 'https://placehold.co/600x400/EEE/999?text=Plaza+Hotel',
      address: 'Calle Mayor, Madrid, España',
    },
    {
      name: 'Luxury Suites Madrid',
      price: 'USD 199',
      rating: '4.8/5',
      stars: '5',
      link: 'https://www.tripadvisor.com/Luxury-Suites-Madrid',
      image: 'https://placehold.co/600x400/EEE/999?text=Luxury+Suites',
      address: 'Paseo del Prado, Madrid, España',
    },
    {
      name: 'Boutique Hotel Centro',
      price: 'USD 85',
      rating: '4.3/5',
      stars: '3',
      link: 'https://www.tripadvisor.com/Boutique-Hotel-Centro',
      image: 'https://placehold.co/600x400/EEE/999?text=Boutique+Centro',
      address: 'Plaza de la Puerta del Sol, Madrid, España',
    },
    {
      name: 'Gran Hotel Moderno',
      price: 'USD 150',
      rating: '4.6/5',
      stars: '4',
      link: 'https://www.tripadvisor.com/Gran-Hotel-Moderno',
      image: 'https://placehold.co/600x400/EEE/999?text=Gran+Hotel',
      address: 'Avenida de la Castellana, Madrid, España',
    },
  ];

  // Filtrar hoteles basados en la ubicación (simulado)
  const filteredHotels = mockHotels.filter((hotel) =>
    location
      ? hotel.address.toLowerCase().includes(location.toLowerCase())
      : true
  );

  // Añadir un pequeño delay para simular llamada de API
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Returning mock hotels:', filteredHotels);
  return filteredHotels;
};

export default fetchHotels;
