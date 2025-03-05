export default async function handler(req, res) {
  const { location } = req.query;

  console.log(
    'API Key in use:',
    process.env.RAPIDAPI_KEY_TRIPADVISOR ? 'Present' : 'Missing'
  );

  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    const url = new URL(
      'https://real-time-tripadvisor-scraper.p.rapidapi.com/api/v1/tours'
    );
    url.searchParams.append('location', location);
    url.searchParams.append('currency', 'USD');
    url.searchParams.append('lang', 'en_US');
    url.searchParams.append('limit', '5');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY_TRIPADVISOR,
        'X-RapidAPI-Host': 'real-time-tripadvisor-scraper.p.rapidapi.com',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    const data = await response.json();
    const tours = data.data.map((item) => ({
      name: item.name,
      price: item.price || 'N/A',
      rating: item.rating || 'N/A',
      link: item.url || 'N/A',
      image: item.images?.[0] || 'N/A',
    }));

    return res.status(200).json({
      status: true,
      message: `Found ${tours.length} tours in ${location}`,
      timestamp: Date.now(),
      data: { list: tours },
    });
  } catch (error) {
    console.error('Error fetching tours:', {
      message: error.message,
      status: error.response?.status || 'N/A',
    });
    return res.status(500).json({
      error: 'Failed to fetch tours',
      details: error.message,
      status: error.response?.status || 'N/A',
    });
  }
}
