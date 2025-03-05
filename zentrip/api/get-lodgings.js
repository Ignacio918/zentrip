import axios from 'axios';

export default async function handler(req, res) {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    const response = await axios.get(
      'https://airbnb19.p.rapidapi.com/api/v1/searchPropertyByLocationV2',
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'airbnb19.p.rapidapi.com',
        },
        params: {
          location: location,
          totalRecords: '5',
          currency: 'USD',
          adults: '1',
        },
      }
    );

    const lodgings = response.data.data.list.map((item) => ({
      name: item.listing.name,
      price: item.pricingQuote.structuredStayDisplayPrice.primaryLine.price,
      location: item.listing.localizedCityName,
      link: item.listing.webURL,
    }));

    return res.status(200).json({
      status: true,
      message: `Found ${lodgings.length} lodgings in ${location}`,
      timestamp: Date.now(),
      data: {
        list: lodgings,
      },
    });
  } catch (error) {
    console.error('Error fetching Airbnb data:', error.message);
    return res.status(500).json({ error: 'Failed to fetch lodgings' });
  }
}
