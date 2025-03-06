// api/get-vacation-rentals.js
const fetchVacationRentals = async (location) => {
  console.log('Starting fetchVacationRentals...');
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
      'https://real-time-tripadvisor-scraper-api.p.rapidapi.com/tripadvisor_vacation_rentals_search_v2'
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
    let rentals = [];
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      rentals = data.data.map((item) => {
        console.log('Mapping rental item:', item);

        // Format price per night
        let pricePerNight = 'N/A';
        if (item.price) {
          if (typeof item.price === 'object') {
            pricePerNight = `${item.price.currency || '$'} ${item.price.amount || item.price.perNight || 'N/A'}/noche`;
          } else if (typeof item.price === 'string') {
            pricePerNight = item.price;
          }
        }

        return {
          name: item.name || item.title || 'N/A',
          price: pricePerNight,
          rating: item.rating || 'N/A',
          bedrooms: item.bedrooms || 'N/A',
          bathrooms: item.bathrooms || 'N/A',
          capacity: item.maxOccupancy || item.capacity || 'N/A',
          link: item.web_url || item.url || 'N/A',
          image:
            item.photo?.images?.medium?.url ||
            item.photo?.images?.original?.url ||
            item.image ||
            'N/A',
          address: item.location || item.address || 'N/A',
        };
      });
    } else if (data && typeof data === 'object') {
      console.warn('data.data is not an array, checking alternatives');
      const possibleArrays = [
        'results',
        'items',
        'rentals',
        'vacation_rentals',
      ];
      for (const key of possibleArrays) {
        if (Array.isArray(data[key])) {
          rentals = data[key].map((item) => {
            console.log('Mapping rental from alternative key:', item);

            // Format price per night
            let pricePerNight = 'N/A';
            if (item.price) {
              if (typeof item.price === 'object') {
                pricePerNight = `${item.price.currency || '$'} ${item.price.amount || item.price.perNight || 'N/A'}/noche`;
              } else if (typeof item.price === 'string') {
                pricePerNight = item.price;
              }
            }

            return {
              name: item.name || item.title || 'N/A',
              price: pricePerNight,
              rating: item.rating || 'N/A',
              bedrooms: item.bedrooms || 'N/A',
              bathrooms: item.bathrooms || 'N/A',
              capacity: item.maxOccupancy || item.capacity || 'N/A',
              link: item.web_url || item.url || 'N/A',
              image:
                item.photo?.images?.medium?.url ||
                item.photo?.images?.original?.url ||
                item.image ||
                'N/A',
              address: item.location || item.address || 'N/A',
            };
          });
          break;
        }
      }
    }

    console.log('Mapped vacation rentals:', rentals);
    return rentals;
  } catch (error) {
    console.error('Error in fetchVacationRentals:', {
      message: error.message,
      stack: error.stack,
    });
    return [];
  }
};

export default fetchVacationRentals;
