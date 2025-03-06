// api/get-restaurants.js
const fetchRestaurants = async (location) => {
  console.log('Starting fetchRestaurants... (MOCK MODE)');
  console.log('Location:', location || 'Not provided');

  // Datos de ejemplo para simular una respuesta de restaurantes
  const mockRestaurants = [
    {
      name: 'Restaurante Madrid',
      price: '$$',
      rating: '4.5/5',
      cuisine: 'Española, Mediterránea',
      link: 'https://www.tripadvisor.com/Restaurante-Madrid',
      image: 'https://placehold.co/600x400/EEE/999?text=Restaurante+Madrid',
      address: 'Calle Gran Vía, Madrid, España',
    },
    {
      name: 'Tapas Bar El Centro',
      price: '$',
      rating: '4.2/5',
      cuisine: 'Tapas, Española',
      link: 'https://www.tripadvisor.com/Tapas-Bar-Centro',
      image: 'https://placehold.co/600x400/EEE/999?text=Tapas+Bar',
      address: 'Plaza Mayor, Madrid, España',
    },
    {
      name: 'Restaurante Gourmet',
      price: '$$$',
      rating: '4.8/5',
      cuisine: 'Gourmet, Internacional',
      link: 'https://www.tripadvisor.com/Gourmet-Restaurante',
      image: 'https://placehold.co/600x400/EEE/999?text=Gourmet',
      address: 'Paseo del Prado, Madrid, España',
    },
    {
      name: 'Casa de Paella',
      price: '$$',
      rating: '4.4/5',
      cuisine: 'Paella, Española',
      link: 'https://www.tripadvisor.com/Casa-Paella',
      image: 'https://placehold.co/600x400/EEE/999?text=Casa+Paella',
      address: 'Calle de Alcalá, Madrid, España',
    },
    {
      name: 'Bistro Moderno',
      price: '$$',
      rating: '4.6/5',
      cuisine: 'Fusión, Internacional',
      link: 'https://www.tripadvisor.com/Bistro-Moderno',
      image: 'https://placehold.co/600x400/EEE/999?text=Bistro+Moderno',
      address: 'Barrio de Salamanca, Madrid, España',
    },
  ];

  // Filtrar restaurantes basados en la ubicación (simulado)
  const filteredRestaurants = mockRestaurants.filter((restaurant) =>
    location
      ? restaurant.address.toLowerCase().includes(location.toLowerCase())
      : true
  );

  // Añadir un pequeño delay para simular llamada de API
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Returning mock restaurants:', filteredRestaurants);
  return filteredRestaurants;
};

export default fetchRestaurants;
