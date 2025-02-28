export default async function handler(req, res) {
  console.log('API /viator-tours iniciada con método:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;
    console.log('Procesando solicitud POST con cuerpo:', body);

    const response = await fetch(
      'https://api.viator.com/partner/products/search',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json;version=2.0',
          'Content-Type': 'application/json',
          'Accept-Language': 'es-ES',
          Authorization: `Bearer ${process.env.VITE_VIATOR_API_KEY_SANDBOX}`,
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
