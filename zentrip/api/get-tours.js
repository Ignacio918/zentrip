import axios from "axios";

export default async function handler(req, res) {
  const { location } = req.query;

  console.log("API Key in use:", process.env.RAPIDAPI_KEY_TRIPADVISOR ? "Present" : "Missing");

  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    const response = await axios.get(
      "https://real-time-tripadvisor-scraper.p.rapidapi.com/api/v1/tours",
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY_TRIPADVISOR,
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
    console.error("Error fetching tours:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return res.status(500).json({
      error: "Failed to fetch tours",
      details: error.message,
      status: error.response?.status || "N/A",
    });
  }
}