export default async function handler(req, res) {
    console.log('Manejando búsqueda de productos en Viator');
    
    // Mostrar body detallado para debuggear
    if (req.method === 'POST' && req.body) {
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
      const apiUrl = `https://api.viator.com/partner/products/search`;
      console.log(`Enviando solicitud a Viator: ${apiUrl}`);
  
      // Configurar las opciones para la solicitud
      const fetchOptions = {
        method: req.method,
        headers: {
          'Accept': 'application/json;version=2.0',
          'Accept-Language': 'es-ES',
          'exp-api-key': apiKey,
        },
      };
  
      // Añadir el body para solicitudes POST
      if (req.method === 'POST' && req.body) {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body =
          typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
  
      console.log(`Iniciando petición a Viator products/search...`);
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
      console.log(`Productos encontrados: ${data.products?.length || 0}`);
      return res.status(200).json(data);
    } catch (error) {
      console.error(`Error en proxy de Viator products/search: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }