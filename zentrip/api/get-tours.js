import axios from "axios";

export default async function handler(req, res) {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    const response = await axios.get(
      "https://real-time-tripadvisor-scraper.p.rapidapi.com/api/v1/tours",
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY_TRIPADVISOR, // Añade esta variable en .env
          "X-RapidAPI-Host": "real-time-tripadvisor-scraper.p.rapidapi.com",
        },
        params: {
          location: location,
          currency: "USD",
          lang: "en_US",
          limit: "5",
        },
      }
    );

    const tours = response.data.data.map((item) => ({
      name: item.name,
      price: item.price || "N/A",
      rating: item.rating || "N/A",
      link: item.url || "N/A",
      image: item.images?.[0] || "N/A",
    }));

    return res.status(200).json({
      status: true,
      message: `Found ${tours.length} tours in ${location}`,
      timestamp: Date.now(),
      data: { list: tours },
    });
  } catch (error) {
    console.error("Error fetching tours:", error.message);
    return res.status(500).json({ error: "Failed to fetch tours" });
  }
}