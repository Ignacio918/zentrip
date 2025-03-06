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
      console.error('Error response text:', errorText);
      throw new Error(`RapidAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(
      'Raw data from RapidAPI (before mapping):',
      JSON.stringify(data, null, 2)
    );

    // Verificación estricta de la estructura
    let tours = [];
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      tours = data.data.map((item) => {
        console.log('Mapping item:', item);

        // Formato correcto para el precio (convertir objeto a string)
        let formattedPrice = 'N/A';
        if (
          item.price &&
          typeof item.price === 'object' &&
          item.price.currency &&
          item.price.total
        ) {
          formattedPrice = `${item.price.currency} ${item.price.total}`;
        } else if (typeof item.price === 'string') {
          formattedPrice = item.price;
        }

        return {
          name: item.name || item.title || 'N/A',
          price: formattedPrice,
          rating: item.rating || item.ratingScore || 'N/A',
          link: item.link || item.url || 'N/A',
          image: item.thumbnail || item.image || item.photos?.[0] || 'N/A',
        };
      });
    } else if (data && typeof data === 'object') {
      console.warn('data.data is not an array, checking alternatives');
      const possibleArrays = ['results', 'items', 'tours'];
      for (const key of possibleArrays) {
        if (Array.isArray(data[key])) {
          tours = data[key].map((item) => {
            console.log('Mapping item from alternative key:', item);

            // Formato correcto para el precio (convertir objeto a string)
            let formattedPrice = 'N/A';
            if (
              item.price &&
              typeof item.price === 'object' &&
              item.price.currency &&
              item.price.total
            ) {
              formattedPrice = `${item.price.currency} ${item.price.total}`;
            } else if (typeof item.price === 'string') {
              formattedPrice = item.price;
            }

            return {
              name: item.name || item.title || 'N/A',
              price: formattedPrice,
              rating: item.rating || item.ratingScore || 'N/A',
              link: item.link || item.url || 'N/A',
              image: item.thumbnail || item.image || item.photos?.[0] || 'N/A',
            };
          });
          break;
        }
      }
      if (tours.length === 0 && data.data) {
        tours = Object.values(data.data).map((item) => {
          console.log('Mapping item from Object.values:', item);

          // Formato correcto para el precio (convertir objeto a string)
          let formattedPrice = 'N/A';
          if (
            item.price &&
            typeof item.price === 'object' &&
            item.price.currency &&
            item.price.total
          ) {
            formattedPrice = `${item.price.currency} ${item.price.total}`;
          } else if (typeof item.price === 'string') {
            formattedPrice = item.price;
          }

          return {
            name: item.name || item.title || 'N/A',
            price: formattedPrice,
            rating: item.rating || item.ratingScore || 'N/A',
            link: item.link || item.url || 'N/A',
            image: item.thumbnail || item.image || item.photos?.[0] || 'N/A',
          };
        });
      }
    } else {
      console.warn('Invalid data structure, returning empty array');
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
