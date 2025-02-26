const generateItinerary = async (message, context = '') => {
  try {
    const fullContext = context
      ? `${context}\nUsuario: ${message}`
      : `Usuario: ${message}`;
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: fullContext,
        model: 'command-r7b-12-2024',
        preamble: `Eres Zen, asistente de ZenTrip, experto en viajes globales. Mantén SIEMPRE el contexto de CUALQUIER destino mundial (ej: Escocia, París, Roma), usando el destino actual para respuestas específicas. Si piden tours y el contexto menciona un destino, sugiere hasta 3 tours detallados (nombre, precio, descripción) en HTML usando datos reales de Viator para ese destino, sin redirigir. Responde en el idioma del usuario, evita mensajes confusos o redundantes como 'No hay tours disponibles para text' o 'Sigue en el dashboard' si el contexto incluye '/dashboard'. Usa HTML: títulos con <div class="text-2xl font-semibold text-black mt-5 mb-4 border-l-4 pl-3 border-pink-600">, viñetas con <div class="ml-5 list-disc">, negrita con <strong class="font-extrabold text-black">. Firma con <div class="text-sm text-gray-500 italic mt-4">Zen - Tu Asistente de Viajes</div>.`,
        temperature: 0.7,
        maxTokens: 1000,
      }),
    });
    if (!response.ok) throw new Error(`Cohere API error: ${response.status}`);
    const data = await response.json();
    let text = data.text || 'Error, intenta de nuevo.';

    if (message.toLowerCase().includes('tours')) {
      const destinationMatch = context.match(/([A-Za-z\s]+)(?=\s*[-,]|$)/i);
      if (destinationMatch) {
        const destination = destinationMatch[1].trim().toLowerCase();
        const destinationTours = await fetchViatorTours(destination);
        if (destinationTours.length > 0) {
          text += `
            <h4 class="text-sm font-semibold mt-2 text-[#3B325B]">Tours en ${destination.charAt(0).toUpperCase() + destination.slice(1)}:</h4>
            <ul class="list-disc ml-5">${destinationTours
              .slice(0, 3)
              .map(
                (t) =>
                  `<li>${t.name} - $${t.price || 'N/A'} - ${t.description || 'Detalles no disponibles'}</li>`
              )
              .join('')}</ul>`;
        } else
          text += `<p class="text-sm text-gray-600">No hay tours disponibles para ${destination} en este momento.</p>`;
      } else
        text +=
          '<p class="text-sm text-gray-600">Por favor, especifica un destino para los tours.</p>';
    }

    if (
      context.includes('/dashboard') &&
      (text.includes('Tu viaje está tomando forma') ||
        text.includes('Sigue en el dashboard'))
    ) {
      text = text
        .replace(
          /¡Tu viaje está tomando forma!.*Sigue en el dashboard para:.*/s,
          ''
        )
        .trim();
    }
    text = text
      .replace(
        /### (.*?)$/gm,
        '<div class="text-2xl font-semibold text-black mt-5 mb-4 border-l-4 pl-3 border-pink-600">$1</div>'
      )
      .replace(
        /## (.*?)$/gm,
        '<div class="text-xl font-medium text-black mt-4 mb-2">$1</div>'
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-extrabold text-black">$1</strong>'
      )
      .replace(/^- (.*?)$/gm, '<div class="ml-5 list-disc">$1</div>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^\s*(.+)$/gm, '<p>$1</p>')
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<\/p><p>/g, '</p>\n<p>');
    if (!text.includes('Zen - Tu Asistente de Viajes'))
      text +=
        '\n<div class="text-sm text-gray-500 italic mt-4">Zen - Tu Asistente de Viajes</div>';

    return text;
  } catch (error) {
    console.error('Cohere error:', error);
    return `<div class="text-red-500 italic">Error técnico, intenta de nuevo: ${error.message}</div><div class="text-sm text-gray-500 italic mt-4">Zen - Tu Asistente de Viajes</div>`;
  }
};

const fetchViatorTours = async (destination) => {
  try {
    const destId = await getViatorDestinationId(destination);
    if (destId === 'invalid') return [];
    const response = await fetch(`https://api.viator.com/v1/products`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Partner-Key': import.meta.env.VITE_VIATOR_API_KEY_SANDBOX,
        mode: 'cors',
      },
      params: {
        destinationId: destId,
        language: 'es',
        currency: 'USD',
        sortBy: 'relevance',
      },
    });
    if (!response.ok) throw new Error(`Viator error: ${response.status}`);
    const data = await response.json();
    return (
      data.data?.map((t) => ({
        name: t.name,
        price: t.pricing?.adult || 'N/A',
        description: t.shortDescription || 'Detalles no disponibles',
      })) || []
    );
  } catch (error) {
    console.error('Viator error:', error);
    return [];
  }
};

const getViatorDestinationId = async (cityName) => {
  try {
    const response = await fetch(`https://api.viator.com/v1/destinations`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Partner-Key': import.meta.env.VITE_VIATOR_API_KEY_SANDBOX,
        mode: 'cors',
      },
      params: { query: cityName, language: 'es' },
    });
    if (!response.ok) throw new Error(`Destino error: ${response.status}`);
    const data = await response.json();
    return data.data?.[0]?.destinationId || 'invalid';
  } catch (error) {
    console.error('Destino error:', error);
    return 'invalid';
  }
};

const cacheDestinations = new Map();
const TOUR_CACHE_EXPIRY = 3600000; // 1 hora
const cleanCache = () =>
  cacheDestinations.forEach(
    (v, k) => Date.now() - v > TOUR_CACHE_EXPIRY && cacheDestinations.delete(k)
  );
setInterval(cleanCache, TOUR_CACHE_EXPIRY / 2);
const MAX_RETRIES = 3;
const validateDestination = (dest) => dest && dest.trim().length > 0;

export default generateItinerary;
