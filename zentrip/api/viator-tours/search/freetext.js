export default async function handler(req, res) {
    console.log('Manejando búsqueda de texto libre en Viator');
    console.log('Query params:', req.url.split('?')[1]);
    
    // Extraer parámetros de consulta
    const url = new URL(req.url, 'https://zentrip.vercel.app');
    const text = url.searchParams.get('text') || '';
    const sortOrder = url.searchParams.get('sortOrder') || 'RELEVANCE';
    const topX = url.searchParams.get('topX') || '10';
    
    console.log(`Búsqueda: "${text}", sortOrder: ${sortOrder}, topX: ${topX}`);
  
    const apiKey = process.env.VITE_VIATOR_API_KEY_PROD || process.env.VIATOR_API_KEY_PROD;
    if (!apiKey) {
      console.error('API key no encontrada en variables de entorno');
      return res
        .status(500)
        .json({ error: 'API key not configured in environment variables' });
    }
  
    try {
      // Construir la URL completa para la API de Viator
      const apiUrl = `https://api.viator.com/partner/search/freetext${url.search}`;
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