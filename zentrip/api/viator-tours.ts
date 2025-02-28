import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('API /viator-tours iniciada con método:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.VITE_VIATOR_API_KEY_PROD;
    console.log('Procesando solicitud con API Key:', apiKey);

    const url = req.url?.replace('/viator', '') ?? '/products/search'; // Manejar caso undefined
    const response = await fetch(`https://api.viator.com/partner${url}`, {
      method: req.method,
      headers: new Headers({
        Accept: 'application/json;version=2.0',
        'Content-Type': 'application/json',
        'Accept-Language': 'es-ES',
        'exp-api-key': apiKey || '',
      }),
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

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
