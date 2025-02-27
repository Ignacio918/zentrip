const generateItinerary = async (message, context = '') => {
  try {
    // Contar mensajes previos del usuario en el contexto
    const userMessages = (context.match(/Usuario:/g) || []).length;
    console.log('User messages count:', userMessages); // Depuración
    const fullContext = context ? `${context}\nUsuario: ${message}` : `Usuario: ${message}`;
    console.log('Full context:', fullContext); // Depuración

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: fullContext,
        model: 'command-r7b-12-2024',
        preamble: `Eres Zen, asistente de ZenTrip, experto en viajes globales. DEBES mantener y utilizar el contexto de CUALQUIER destino mundial (ej: Escocia, París, Roma) o términos relacionados con viajes (como 'tour', 'castillos', 'días', 'itinerario', 'recomendás', 'ideas') proporcionados en fullContext para respuestas específicas y coherentes. Reconoce preguntas abiertas como '¿A dónde viajamos?' o '¿Qué destinos recomendás?' y solicitudes vagas como 'qué más recomendás' o 'dame ideas' como válidas, respondiendo con sugerencias de destinos, itinerarios tentativos o actividades, pidiendo detalles si es necesario (ej: '¿A qué destino te referís?' o '¿Cuántos días?'). Solo considera números como presupuesto o duración si están explícitamente vinculados a un plan (ej: '5 días en Roma' o '500 euros para un tour'), rechazando números aislados o random (ej: '123') con '<p class=\"text-sm text-gray-600\">Lo siento, no entiendo tu solicitud. ¿Podrías darme más detalles sobre tu destino o plan de viaje?</p><div class=\"text-sm text-gray-500 italic mt-4\">Zen - Tu Asistente de Viajes</div>'. Limita la conversación a 8 mensajes del usuario. Cuando el conteo de 'Usuario:' en fullContext alcance 8 (16º mensaje total), responde exclusivamente con: '¡Tu aventura está tomando forma! 🌟 Parece que estás disfrutando planificando tu viaje perfecto. Para seguir creando tu itinerario y acceder a más funciones, te invitamos a continuar en el dashboard. ' donde [CTA] indica que se debe mostrar un botón. Solo usa este mensaje de error '<p class=\"text-sm text-gray-600\">Lo siento, no entiendo tu solicitud. ¿Podrías darme más detalles sobre tu destino o plan de viaje?</p><div class=\"text-sm text-gray-500 italic mt-4\">Zen - Tu Asistente de Viajes</div>' para mensajes completamente aleatorios o no relacionados (ej: 'asdas'). Si piden tours y hay un destino, sugiere hasta 3 tours detallados (nombre, precio, descripción) en HTML usando datos reales de Viator, sin enlaces. Responde en el idioma del usuario, evita redundancias como 'No hay tours disponibles para text'. Usa HTML: títulos con <div class=\"text-2xl font-semibold text-black mt-5 mb-4 border-l-4 pl-3 border-pink-600\">, viñetas con <div class=\"ml-5 list-disc\">, negrita con <strong class=\"font-extrabold text-black\">. Firma con <div class=\"text-sm text-gray-500 italic mt-4\">Zen - Tu Asistente de Viajes</div>.`,
        temperature: 0.5,
        maxTokens: 500,
      }),
    });
    if (!response.ok) throw new Error(`Cohere API error: ${response.status}`);
    const data = await response.json();
    let text = data.text || 'Error, intenta de nuevo.';
    console.log('Raw response:', text); // Depuración

    if (message.toLowerCase().includes('tours')) {
      const destinationMatch = context.match(/([A-Za-z\s]+)(?=\s*[-,]|$)/i);
      if (destinationMatch) {
        const destination = destinationMatch[1].trim().toLowerCase();
        const destinationTours = await fetchViatorTours(destination);
        if (destinationTours.length > 0) {
          text = text + '<div class="text-2xl font-semibold text-black mt-5 mb-4 border-l-4 pl-3 border-pink-600">Tours en ' + 
                  destination.charAt(0).toUpperCase() + destination.slice(1) + 
                  '</div><div class="space-y-4">';
          for (let i = 0; i < Math.min(3, destinationTours.length); i++) {
            const t = destinationTours[i];
            text = text + '<div class="p-4 bg-white shadow-sm rounded-lg border border-gray-200"><strong class="font-extrabold text-black">' + 
                    t.name + 
                    '</strong><div class="ml-5 list-disc"><div>Precio: $' + 
                    (t.price || 'N/A') + 
                    '</div><div>Descripción: ' + 
                    (t.description || 'Detalles no disponibles') + 
                    '</div></div></div>';
          }
          text = text + '</div>';
        } else {
          text = text + '<p class="text-sm text-gray-600">No hay tours disponibles para ' + destination + ' en este momento.</p>';
        }
      } else {
        text = text + '<p class="text-sm text-gray-600">Por favor, especifica un destino para los tours.</p>';
      }
    }

    if (context.includes('/dashboard') && 
        (text.includes('Tu viaje está tomando forma') || text.includes('Sigue en el dashboard'))) {
      text = text.replace(/¡Tu viaje está tomando forma!.*Sigue en el dashboard para:.*/s, '').trim();
    }
    text = text.replace(/### (.*?)$/gm, '<div class="text-2xl font-semibold text-black mt-5 mb-4 border-l-4 pl-3 border-pink-600">$1</div>');
    text = text.replace(/## (.*?)$/gm, '<div class="text-xl font-medium text-black mt-4 mb-2">$1</div>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-black">$1</strong>');
    text = text.replace(/^- (.*?)$/gm, '<div class="ml-5 list-disc">$1</div>');
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/^\s*(.+)$/gm, '<p>$1</p>');
    text = text.replace(/<p>\s*<\/p>/g, '');
    text = text.replace(/<p><p>/g, '</p>\n<p>');
    if (!text.includes('Zen - Tu Asistente de Viajes')) {
      text = text + '<div class="text-sm text-gray-500 italic mt-4">Zen - Tu Asistente de Viajes</div>';
    }

    return text;
  } catch (error) {
    console.error('Cohere error:', error);
    return '<div class="text-red-500 italic">Error técnico, intenta de nuevo: ' + error.message + '</div><div class="text-sm text-gray-500 italic mt-4">Zen - Tu Asistente de Viajes</div>';
  }
};

const fetchViatorTours = async (destination) => {
  try {
    const cacheKey = destination.toLowerCase();
    if (cacheDestinations.has(cacheKey)) {
      const cached = cacheDestinations.get(cacheKey);
      if (Date.now() - cached.timestamp < TOUR_CACHE_EXPIRY) {
        return cached.data;
      }
    }

    const destId = await getViatorDestinationId(destination);
    if (destId === 'invalid') return [];
    const url = new URL(`https://api.viator.com/v1/products`);
    url.searchParams.append('destinationId', destId);
    url.searchParams.append('language', 'es');
    url.searchParams.append('currency', 'USD');
    url.searchParams.append('sortBy', 'relevance');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Partner-Key': import.meta.env.VITE_VIATOR_API_KEY_SANDBOX,
        mode: 'cors',
      },
    });
    if (!response.ok) throw new Error(`Viator error: ${response.status}`);
    const data = await response.json();
    const tours = data.data?.map((t) => ({
      name: t.name,
      price: t.pricing?.adult || 'N/A',
      description: t.shortDescription || 'Detalles no disponibles',
    })) || [];
    cacheDestinations.set(cacheKey, { data: tours, timestamp: Date.now() });
    return tours;
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
    (v, k) => Date.now() - v.timestamp > TOUR_CACHE_EXPIRY && cacheDestinations.delete(k)
  );
setInterval(cleanCache, TOUR_CACHE_EXPIRY / 2);

export default generateItinerary;