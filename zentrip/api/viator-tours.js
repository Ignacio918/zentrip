export default async function handler(req, res) {
  console.log('API /viator-tours invocada - Método:', req.method);
  console.log('URL recibida:', req.url);
  console.log('Body recibido:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.VITE_VIATOR_API_KEY_PROD;
    if (!apiKey) {
      console.error('API key no encontrada en variables de entorno');
      return res
        .status(500)
        .json({ error: 'API key not configured in environment variables' });
    }
    console.log('Procesando solicitud con API Key:', apiKey);

    const response = await fetch(
      'https://api.viator.com/partner/products/search',
      {
        method: req.method,
        headers: {
          Accept: 'application/json;version=2.0',
          'Content-Type': 'application/json',
          'Accept-Language': 'es-ES',
          'exp-api-key': apiKey,
        },
        body: req.body ? JSON.stringify(req.body) : undefined,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de Viator:', errorText);
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
