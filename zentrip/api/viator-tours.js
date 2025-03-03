export default async function handler(req, res) {
  // Extraer la ruta y los parámetros
  let apiPath = '';
  let queryParams = '';

  // Obtener la ruta después de /viator/
  if (req.url.includes('?')) {
    const parts = req.url.split('?');
    apiPath = parts[0].replace(/^\/viator\//, '');
    queryParams = '?' + parts[1];
  } else {
    apiPath = req.url.replace(/^\/viator\//, '');
  }

  console.log(
    `API Viator - Método: ${req.method}, Ruta: ${apiPath}, Params: ${queryParams}`
  );
  console.log('Body recibido:', req.body);

  const apiKey = process.env.VITE_VIATOR_API_KEY_PROD;
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
      console.log('Body enviado:', fetchOptions.body);
    }

    const response = await fetch(apiUrl, fetchOptions);

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
    console.log(`Respuesta exitosa de Viator para ${apiPath}`);
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error en proxy de Viator: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}
