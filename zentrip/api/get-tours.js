// api/get-tours.js
const fetchTours = async (location) => {
  console.log('Starting fetchTours...');
  console.log(
    'API Key:',
    import.meta.env.RAPIDAPI_KEY_TRIPADVISOR || 'Missing'
  );
  console.log('Location:', location || 'Not provided');

  if (!location) {
    console.error('Location is required');
    return [];
  }

  try {
    const url = new URL(
      'https://real-time-tripadvisor-scraper-api.p.rapidapi.com/tripadvisor_tours_search_v2'
    );
    url.searchParams.append('location', location);
    url.searchParams.append('currency', 'USD'); // Opcional, ajusta según necesites
    url.searchParams.append('lang', 'en_US'); // Opcional, ajusta según necesites
    url.searchParams.append('limit', '5'); // Opcional, limita a 5 resultados

    console.log('Requesting URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': import.meta.env.RAPIDAPI_KEY_TRIPADVISOR,
        'X-RapidAPI-Host': 'real-time-tripadvisor-scraper-api.p.rapidapi.com',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429 && retries > 0) {
        console.log(`429 detected, waiting ${delay}ms before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchTours(location, retries - 1, delay * 2);
      }
      throw new Error(`RapidAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw data from RapidAPI:', data);

    // Mapeo ajustado para tours según la documentación
    const tours = data.data.map((item) => ({
      name: item.name || item.title || 'N/A', // 'name' o 'title' según el JSON
      price: item.price || item.pricePerPerson || item.pricing?.adult || 'N/A', // Ajusta según el campo
      rating: item.rating || item.ratingScore || 'N/A', // Ajusta según el campo
      link: item.link || item.url || 'N/A', // Ajusta según el campo
      image: item.thumbnail || item.images?.[0] || 'N/A', // Ajusta según el campo
    }));

    return tours;
  } catch (error) {
    console.error('Error in fetchTours:', {
      message: error.message,
      stack: error.stack,
    });
    return [];
  }
};

export default fetchTours;
