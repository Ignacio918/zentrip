// api/get-hotels.js
const fetchHotels = async (location) => {
  console.log('Starting fetchHotels...');
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
      'https://real-time-tripadvisor-scraper-api.p.rapidapi.com/tripadvisor_hotels_search_v2'
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
      console.error('Error response text:', errorText);
      throw new Error(`RapidAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(
      'Raw data from RapidAPI (before mapping):',
      JSON.stringify(data, null, 2)
    );

    // Verificación estricta de la estructura
    let hotels = [];
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      hotels = data.data.map((item) => {
        console.log('Mapping hotel item:', item);

        // Format price range
        let priceRange = 'N/A';
        if (item.price) {
          if (typeof item.price === 'object') {
            priceRange = `${item.price.currency || '$'} ${item.price.from || item.price.amount || 'N/A'}`;
          } else if (typeof item.price === 'string') {
            priceRange = item.price;
          }
        }

        return {
          name: item.name || 'N/A',
          price: priceRange,
          rating: item.rating || 'N/A',
          stars: item.hotel_class || 'N/A',
          link: item.web_url || item.website || 'N/A',
          image:
            item.photo?.images?.medium?.url ||
            item.photo?.images?.original?.url ||
            item.image ||
            'N/A',
          address: item.address || 'N/A',
        };
      });
    } else if (data && typeof data === 'object') {
      console.warn('data.data is not an array, checking alternatives');
      const possibleArrays = ['results', 'items', 'hotels'];
      for (const key of possibleArrays) {
        if (Array.isArray(data[key])) {
          hotels = data[key].map((item) => {
            console.log('Mapping hotel from alternative key:', item);

            // Format price range
            let priceRange = 'N/A';
            if (item.price) {
              if (typeof item.price === 'object') {
                priceRange = `${item.price.currency || '$'} ${item.price.from || item.price.amount || 'N/A'}`;
              } else if (typeof item.price === 'string') {
                priceRange = item.price;
              }
            }

            return {
              name: item.name || 'N/A',
              price: priceRange,
              rating: item.rating || 'N/A',
              stars: item.hotel_class || 'N/A',
              link: item.web_url || item.website || 'N/A',
              image:
                item.photo?.images?.medium?.url ||
                item.photo?.images?.original?.url ||
                item.image ||
                'N/A',
              address: item.address || 'N/A',
            };
          });
          break;
        }
      }
    }

    console.log('Mapped hotels:', hotels);
    return hotels;
  } catch (error) {
    console.error('Error in fetchHotels:', {
      message: error.message,
      stack: error.stack,
    });
    return [];
  }
};

export default fetchHotels;
