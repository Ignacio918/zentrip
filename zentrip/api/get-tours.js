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
      'https://real-time-tripadvisor-scraper-api.p.rapidapi.com/tripadvisor_restaurants_search_v2'
    );
    url.searchParams.append('location', location);

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
    console.log('Raw data from RapidAPI:', data);

    const tours = data.data.map((item) => ({
      name: item.name,
      price: item.priceTypes || 'N/A',
      rating: item.rating || 'N/A',
      link: item.link || 'N/A',
      image: item.thumbnail || 'N/A',
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
