// api/get-restaurants.js
const fetchRestaurants = async (location) => {
    console.log('Starting fetchRestaurants...');
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
        'https://real-time-tripadvisor-scraper-api.p.rapidapi.com/tripadvisor_restaurants_search_v2'
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
      let restaurants = [];
      if (data && typeof data === 'object' && Array.isArray(data.data)) {
        restaurants = data.data.map((item) => {
          console.log('Mapping restaurant item:', item);
  
          // Format price level to a readable string
          let priceLevel = 'N/A';
          if (item.price_level) {
            priceLevel = '$'.repeat(parseInt(item.price_level) || 1);
          }
  
          return {
            name: item.name || 'N/A',
            price: priceLevel,
            rating: item.rating || 'N/A',
            cuisine: item.cuisine?.map(c => c.name).join(', ') || 'Variada',
            link: item.web_url || item.website || 'N/A',
            image: item.photo?.images?.medium?.url || item.photo?.images?.original?.url || 'N/A',
            address: item.address || 'N/A'
          };
        });
      } else if (data && typeof data === 'object') {
        console.warn('data.data is not an array, checking alternatives');
        const possibleArrays = ['results', 'items', 'restaurants'];
        for (const key of possibleArrays) {
          if (Array.isArray(data[key])) {
            restaurants = data[key].map((item) => {
              console.log('Mapping restaurant from alternative key:', item);
  
              // Format price level to a readable string
              let priceLevel = 'N/A';
              if (item.price_level) {
                priceLevel = '$'.repeat(parseInt(item.price_level) || 1);
              }
  
              return {
                name: item.name || 'N/A',
                price: priceLevel,
                rating: item.rating || 'N/A',
                cuisine: item.cuisine?.map(c => c.name).join(', ') || 'Variada',
                link: item.web_url || item.website || 'N/A',
                image: item.photo?.images?.medium?.url || item.photo?.images?.original?.url || 'N/A',
                address: item.address || 'N/A'
              };
            });
            break;
          }
        }
      }
  
      console.log('Mapped restaurants:', restaurants);
      return restaurants;
    } catch (error) {
      console.error('Error in fetchRestaurants:', {
        message: error.message,
        stack: error.stack,
      });
      return [];
    }
  };
  
  export default fetchRestaurants;