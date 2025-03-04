export default async function handler(req, res) {
  console.log('Manejando búsqueda de texto libre en Viator con POST');

  // Verificar que sea una solicitud POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Parsear el cuerpo de la solicitud
  const body = await req.json();
  console.log('Body recibido:', body);

  const { searchTerm, searchTypes = ['PRODUCTS'], currency = 'USD' } = body;

  if (!searchTerm) {
    return res.status(400).json({ error: 'searchTerm is required' });
  }

  const apiKey = process.env.VIATOR_API_KEY_PROD;
  if (!apiKey) {
    console.error('API key no encontrada en variables de entorno');
    return res
      .status(500)
      .json({ error: 'API key not configured in environment variables' });
  }

  try {
    const apiUrl = 'https://api.viator.com/partner/search/freetext';
    console.log(`Enviando solicitud a Viator: ${apiUrl}`);

    const fetchOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'es-ES',
        'X-Partner-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchTerm,
        searchTypes,
        currency,
      }),
    };

    console.log(`Iniciando petición a Viator search/freetext...`);
    const response = await fetch(apiUrl, fetchOptions);
    console.log(`Recibida respuesta de Viator con status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error en respuesta de Viator (${response.status}): ${errorText}`
      );
      return res.status(response.status).json({
        error: `Error: ${response.status}`,
        message: errorText,
      });
    }

    const data = await response.json();
    console.log(`Resultados encontrados: ${data.data?.length || 0}`);
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error en proxy de Viator search/freetext: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}
