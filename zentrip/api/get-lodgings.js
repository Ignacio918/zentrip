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

    const lodgings = response.data.data.list.map((item) => {
      const pricing =
        item.pricingQuote?.structuredStayDisplayPrice?.primaryLine || {};
      return {
        name: item.listing.name,
        price: pricing.price || 'N/A',
        location: item.listing.localizedCityName || item.listing.city || 'N/A',
        link: item.listing.webURL || 'N/A',
        rating: item.listing.avgRatingLocalized || 'N/A',
        coordinate: {
          longitude: item.listing.coordinate?.longitude || 'N/A',
          latitude: item.listing.coordinate?.latitude || 'N/A',
        },
        pictures: item.listing.contextualPictures
          ? item.listing.contextualPictures
              .map((pic) => pic.picture)
              .slice(0, 3)
          : ['N/A'],
      };
    });

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
