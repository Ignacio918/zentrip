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
    url.searchParams.append('currency', 'USD');
    url.searchParams.append('lang', 'en_US');
    url.searchParams.append('limit', '5');

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
      throw new Error(`RapidAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw data from RapidAPI:', JSON.stringify(data, null, 2)); // JSON completo y legible

    // Depuración de la estructura
    console.log('Data structure:', {
      isArray: Array.isArray(data),
      hasData: !!data.data,
      dataKeys: Object.keys(data),
    });

    // Ajustar el mapeo según la estructura real
    let tours = [];
    if (Array.isArray(data.data)) {
      tours = data.data.map((item) => {
        console.log('Mapping item:', item);
        return {
          name: item.name || item.title || 'N/A',
          price:
            item.price || item.pricePerPerson || item.pricing?.adult || 'N/A',
          rating: item.rating || item.ratingScore || 'N/A',
          link: item.link || item.url || 'N/A',
          image: item.thumbnail || item.images?.[0] || 'N/A',
        };
      });
    } else if (data.data && typeof data.data === 'object') {
      // Si data.data es un objeto, intentamos extraer un array de resultados (ajustar según el JSON)
      tours = Object.values(data.data).map((item) => ({
        name: item.name || item.title || 'N/A',
        price:
          item.price || item.pricePerPerson || item.pricing?.adult || 'N/A',
        rating: item.rating || item.ratingScore || 'N/A',
        link: item.link || item.url || 'N/A',
        image: item.thumbnail || item.images?.[0] || 'N/A',
      }));
    } else {
      console.warn('No valid data array found in response');
    }

    console.log('Mapped tours:', tours);
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
