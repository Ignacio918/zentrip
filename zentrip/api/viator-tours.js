export default async function handler(req, res) {
  console.log('API /viator-tours iniciada con método:', req.method); // Log inicial
  if (req.method !== 'POST') {
    console.log('Método no permitido:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Procesando solicitud POST...');
    const body = {
      filtering: {
        destination: '732',
        tags: [21972],
        flags: ['LIKELY_TO_SELL_OUT', 'FREE_CANCELLATION'],
        lowestPrice: 5,
        highestPrice: 500,
        startDate: '2025-02-28',
        endDate: '2025-03-28',
        includeAutomaticTranslations: true,
        confirmationType: 'INSTANT',
        durationInMinutes: {
          from: 20,
          to: 360,
        },
        rating: {
          from: 3,
          to: 5,
        },
      },
      sorting: {
        sort: 'TRAVELER_RATING',
        order: 'DESCENDING',
      },
      pagination: {
        start: 1,
        count: 5,
      },
      currency: 'USD',
    };

    const response = await fetch(
      'https://api.viator.com/partner/products/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VITE_VIATOR_API_KEY_PROD}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Accept-Language': 'en',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error HTTP: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log('Respuesta completa de Viator:', data);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error en proxy de Viator:', error);
    res.status(500).json({ error: error.message });
  }
}
