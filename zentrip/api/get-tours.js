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

  // Fechas actuales (basadas en 5 de marzo de 2025)
  const today = new Date('2025-03-05');
  const checkIn = today.toISOString().split('T')[0]; // "2025-03-05"
  const checkOut = new Date(today.setDate(today.getDate() + 1))
    .toISOString()
    .split('T')[0]; // "2025-03-06"

  try {
    const url = new URL(
      'https://real-time-tripadvisor-scraper-api.p.rapidapi.com/tripadvisor_tours_search_v2'
    );
    url.searchParams.append('location', location);
    url.searchParams.append('checkIn', checkIn);
    url.searchParams.append('checkOut', checkOut);
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
      console.error('Error response text:', errorText);
      throw new Error(`RapidAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw data from RapidAPI:', JSON.stringify(data, null, 2)); // JSON completo

    // Depuración de la estructura
    console.log('Data structure:', {
      isObject: typeof data === 'object' && data !== null,
      isArray: Array.isArray(data),
      hasData: !!data.data,
      dataIsArray: Array.isArray(data.data),
      dataKeys: data.data ? Object.keys(data.data) : [],
    });

    // Extraer tours del array 'data'
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
    } else {
      console.warn('data.data is not an array, checking alternatives');
      // Intentar con otras claves posibles
      const possibleKeys = ['results', 'items', 'tours'];
      for (const key of possibleKeys) {
        if (Array.isArray(data[key])) {
          tours = data[key].map((item) => {
            console.log('Mapping item from alternative key:', item);
            return {
              name: item.name || item.title || 'N/A',
              price:
                item.price ||
                item.pricePerPerson ||
                item.pricing?.adult ||
                'N/A',
              rating: item.rating || item.ratingScore || 'N/A',
              link: item.link || item.url || 'N/A',
              image: item.thumbnail || item.images?.[0] || 'N/A',
            };
          });
          break;
        }
      }
      if (tours.length === 0 && data.data) {
        tours = Object.values(data.data).map((item) => {
          console.log('Mapping item from Object.values:', item);
          return {
            name: item.name || item.title || 'N/A',
            price:
              item.price || item.pricePerPerson || item.pricing?.adult || 'N/A',
            rating: item.rating || item.ratingScore || 'N/A',
            link: item.link || item.url || 'N/A',
            image: item.thumbnail || item.images?.[0] || 'N/A',
          };
        });
      }
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
