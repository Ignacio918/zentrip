export default async function handler(req, res) {
  // Extraer la ruta y los parámetros
  let apiPath = '';
  let queryParams = '';

  console.log('URL completa recibida:', req.url);

  // Obtener la ruta después de /viator/ o /api/viator-tours/
  if (req.url.includes('?')) {
    const parts = req.url.split('?');
    apiPath = parts[0]
      .replace(/^\/viator\//, '')
      .replace(/^\/api\/viator-tours\//, '');
    queryParams = '?' + parts[1];
  } else {
    apiPath = req.url
      .replace(/^\/viator\//, '')
      .replace(/^\/api\/viator-tours\//, '');
  }

  console.log(
    `API Viator - Método: ${req.method}, Ruta: ${apiPath}, Params: ${queryParams}`
  );

  // Mostrar body detallado para debuggear productos
  if (apiPath === 'products/search' && req.method === 'POST' && req.body) {
    const bodyStr =
      typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body, null, 2);
    console.log('Body para products/search:', bodyStr);
  }

  const apiKey = process.env.VITE_VIATOR_API_KEY_PROD || process.env.VIATOR_API_KEY_PROD;
  if (!apiKey) {
    console.error('API key no encontrada en variables de entorno');
    return res
      .status(500)
      .json({ error: 'API key not configured in environment variables' });
  }

  try {
    // Construir la URL completa para la API de Viator
    const apiUrl = `https://api.viator.com/partner/${apiPath}${queryParams}`;
    console.log(`Enviando solicitud a Viator: ${apiUrl}`);

    // Configurar las opciones para la solicitud
    const fetchOptions = {
      method: req.method,
      headers: {
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'es-ES',
        'exp-api-key': apiKey,
      },
    };

    // Añadir el body para solicitudes POST/PUT
    if (['POST', 'PUT'].includes(req.method) && req.body) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    console.log(`Iniciando petición a Viator...`);
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

    // Información adicional para endpoints específicos
    if (apiPath === 'products/search') {
      console.log(`Productos encontrados: ${data.products?.length || 0}`);
    } else if (apiPath === 'search/freetext') {
      console.log(`Resultados encontrados: ${data.data?.length || 0}`);
    } else if (apiPath.startsWith('products/') && !apiPath.endsWith('search')) {
      console.log(
        `Detalles de producto recibidos: ${data.productCode || 'Sin código'}`
      );
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error en proxy de Viator: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}
