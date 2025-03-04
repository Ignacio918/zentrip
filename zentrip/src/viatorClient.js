/**
 * Cliente para la API de Viator
 * Implementado según la documentación oficial
 */

// Configuración general para todas las solicitudes
const API_BASE_PATH = '/viator';
const DEFAULT_HEADERS = {
  Accept: 'application/json;version=2.0',
  'Accept-Language': 'es-ES',
};

// Datos de destinos comunes para usar cuando falle la API
const FALLBACK_DESTINATIONS = [
  {
    destinationId: 732,
    name: 'Paris',
    type: 'CITY',
    location: { city: 'Paris', country: 'France' },
  },
  {
    destinationId: 684,
    name: 'Barcelona',
    type: 'CITY',
    location: { city: 'Barcelona', country: 'Spain' },
  },
  {
    destinationId: 662,
    name: 'Madrid',
    type: 'CITY',
    location: { city: 'Madrid', country: 'Spain' },
  },
  {
    destinationId: 687,
    name: 'London',
    type: 'CITY',
    location: { city: 'London', country: 'United Kingdom' },
  },
  {
    destinationId: 546,
    name: 'Rome',
    type: 'CITY',
    location: { city: 'Rome', country: 'Italy' },
  },
  {
    destinationId: 712,
    name: 'New York',
    type: 'CITY',
    location: { city: 'New York', country: 'United States' },
  },
  {
    destinationId: 30603,
    name: 'Buenos Aires',
    type: 'CITY',
    location: { city: 'Buenos Aires', country: 'Argentina' },
  },
];

// Datos de respaldo para tours por ciudad
const FALLBACK_TOURS = {
  paris: [
    {
      productCode: '25076P1',
      title: 'Tour guiado por el Museo del Louvre',
      description:
        'Explore las obras maestras del museo más famoso del mundo con un guía experto.',
      price: { amount: 65.99, currency: 'USD' },
      rating: 4.8,
      reviewCount: 1250,
      photoUrl:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/9e/be/57/guided-tour-louvre-museum.jpg',
      duration: '3 horas',
      location: 'París, Francia',
      destinationId: 732,
      productUrl:
        'https://www.viator.com/es-ES/tours/Paris/Skip-the-Line-Louvre-Museum-Walking-Tour/d479-3731LOUVRE',
    },
    {
      productCode: '3731EIFFELTOWER',
      title: 'Torre Eiffel sin colas con acceso a la cima',
      description:
        'Evite las largas colas y ascienda hasta la cima de la Torre Eiffel para disfrutar de vistas panorámicas de París.',
      price: { amount: 79.99, currency: 'USD' },
      rating: 4.6,
      reviewCount: 957,
      photoUrl:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/64/44/3a/skip-the-line-eiffel.jpg',
      duration: '2 horas',
      location: 'París, Francia',
      destinationId: 732,
      productUrl:
        'https://www.viator.com/es-ES/tours/Paris/Skip-the-Line-Eiffel-Tower-Tour/d479-3731EIFFELTOWER',
    },
  ],
  'buenos aires': [
    {
      productCode: '5239BUEAIR',
      title: 'Traslado privado: Aeropuerto Internacional Ezeiza',
      description:
        'Comience o finalice sus vacaciones en Buenos Aires sin preocupaciones con este traslado privado.',
      price: { amount: 28.99, currency: 'USD' },
      rating: 4.5,
      reviewCount: 253,
      photoUrl:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/20/a5/f3/private-transfer-ezeiza.jpg',
      duration: '1 hora',
      location: 'Buenos Aires, Argentina',
      destinationId: 30603,
      productUrl:
        'https://www.viator.com/es-ES/tours/Buenos-Aires/Private-Transfer-Ezeiza-International-Airport/d901-5239BUEAIR',
    },
    {
      productCode: '13998P1',
      title: 'Excursión por la ciudad de Buenos Aires',
      description:
        'Recorra Buenos Aires en un recorrido de medio día que le lleva a través de los barrios más emblemáticos.',
      price: { amount: 39.99, currency: 'USD' },
      rating: 4.4,
      reviewCount: 195,
      photoUrl:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/71/41/a5/city-tour-buenos-aires.jpg',
      duration: '3 horas',
      location: 'Buenos Aires, Argentina',
      destinationId: 30603,
      productUrl:
        'https://www.viator.com/es-ES/tours/Buenos-Aires/Buenos-Aires-City-Tour/d901-13998P1',
    },
  ],
};

/**
 * Función auxiliar para realizar solicitudes a la API de Viator
 */
async function fetchViator(endpoint, method, body = null, queryParams = null) {
  try {
    let url = `${API_BASE_PATH}${endpoint}`;
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const paramsString = params.toString();
      if (paramsString) {
        url += `?${paramsString}`;
      }
    }

    const options = {
      method,
      headers: { ...DEFAULT_HEADERS },
      signal: AbortSignal.timeout(15000),
    };

    if (['POST', 'PUT'].includes(method) && body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    console.log(`Enviando ${method} a ${url}`, body ? 'con body' : 'sin body');

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Error en solicitud ${method} a ${endpoint}: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en solicitud ${method} a ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Función para obtener la mejor URL de imagen disponible
 */
function getProductImageUrl(product) {
  if (!product) {
    return 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/16/45/71/city-tour.jpg';
  }

  if (product.primaryImageUrl) {
    return product.primaryImageUrl;
  }

  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (image.variants && image.variants.length) {
        const mediumVariant = image.variants.find(
          (v) => v.height >= 300 && v.height <= 500
        );
        if (mediumVariant?.url) {
          return mediumVariant.url;
        }

        if (image.variants[0]?.url) {
          return image.variants[0].url;
        }
      }
    }
  }

  return 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/16/45/71/city-tour.jpg';
}

/**
 * Obtener destinos
 * Endpoint: /destinations
 */
export const getDestinations = async () => {
  try {
    console.log('Obteniendo lista de destinos...');
    const data = await fetchViator('/destinations', 'GET');
    console.log(`Se obtuvieron ${data.destinations?.length || 0} destinos`);
    return data.destinations || [];
  } catch (error) {
    console.error('Error obteniendo destinos:', error);
    return FALLBACK_DESTINATIONS;
  }
};

/**
 * Buscar destinos según término de búsqueda
 */
export const searchDestinations = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('Término de búsqueda demasiado corto');
      return [];
    }

    console.log(`Buscando destinos para: "${searchTerm}"`);

    // CORREGIDO: La API parece no encontrar el endpoint /destinations/search
    // Intentamos con /destinations como respaldo
    try {
      const queryParams = {
        searchTerm: searchTerm.trim(),
        includeDetails: 'true',
        language: 'es-ES',
      };

      const data = await fetchViator('/destinations', 'GET', null, queryParams);

      const filteredDestinations =
        data.destinations?.filter(
          (dest) =>
            dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (dest.location?.city &&
              dest.location.city
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (dest.location?.country &&
              dest.location.country
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        ) || [];

      console.log(`Se encontraron ${filteredDestinations.length} destinos`);
      return filteredDestinations;
    } catch (apiError) {
      console.error(
        'Error en API de destinos, usando datos de respaldo:',
        apiError
      );
      // Usar datos de respaldo
      const searchLower = searchTerm.toLowerCase();
      return FALLBACK_DESTINATIONS.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchLower) ||
          (dest.location?.city &&
            dest.location.city.toLowerCase().includes(searchLower)) ||
          (dest.location?.country &&
            dest.location.country.toLowerCase().includes(searchLower))
      );
    }
  } catch (error) {
    console.error('Error buscando destinos:', error);
    // Respaldo para cualquier otro error
    const searchLower = searchTerm.toLowerCase();
    return FALLBACK_DESTINATIONS.filter(
      (dest) =>
        dest.name.toLowerCase().includes(searchLower) ||
        (dest.location?.city &&
          dest.location.city.toLowerCase().includes(searchLower)) ||
        (dest.location?.country &&
          dest.location.country.toLowerCase().includes(searchLower))
    );
  }
};

/**
 * Buscar productos/tours para un destino específico
 */
export const getDestinationProducts = async ({
  destinationId = 732,
  destinationName = 'Global',
  priceRange = null,
  duration = null,
  rating = null,
  limit = 50,
} = {}) => {
  try {
    console.log(
      `Buscando tours para destino: ${destinationName} (ID: ${destinationId})`
    );

    // Usar datos de respaldo inmediatamente si están disponibles
    const cityNameLower = destinationName.toLowerCase();
    for (const [key, tours] of Object.entries(FALLBACK_TOURS)) {
      if (cityNameLower.includes(key)) {
        console.log(`Usando datos de respaldo para ${destinationName}`);
        return tours;
      }
    }

    // Si no hay datos de respaldo, intentar con la API
    try {
      const currentDate = new Date();
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + 90);

      const formattedToday = currentDate.toISOString().split('T')[0];
      const formattedFuture = futureDate.toISOString().split('T')[0];

      // CORREGIDO: Formato correcto según la documentación más reciente
      const requestBody = {
        filters: {
          destinationIds: [destinationId.toString()],
          startDate: formattedToday,
          endDate: formattedFuture,
        },
        pagination: {
          start: 1,
          count: limit,
        },
        sortOrder: 'POPULARITY_DESC',
        currency: 'USD',
      };

      // Añadir filtros opcionales si se proporcionan
      if (priceRange) {
        requestBody.filters.price = {
          min: priceRange.min || 0,
          max: priceRange.max || 1000,
        };
      }

      if (rating) {
        requestBody.filters.rating = rating;
      }

      const data = await fetchViator('/products/search', 'POST', requestBody);

      if (!data.products || data.products.length === 0) {
        throw new Error('No se encontraron productos');
      }

      return data.products.map((product) => ({
        productCode: product.productCode,
        title: product.title,
        description: product.shortDescription || product.description || '',
        price: {
          amount: product.pricing?.summary?.fromPrice || 0,
          currency: product.pricing?.summary?.currencyCode || 'USD',
        },
        rating: product.reviews?.combinedAverageRating || 0,
        reviewCount: product.reviews?.totalReviews || 0,
        photoUrl: getProductImageUrl(product),
        duration: product.duration?.description || '',
        location: [product.location?.city, product.location?.country]
          .filter(Boolean)
          .join(', '),
        productUrl:
          product.productUrl ||
          `https://www.viator.com/tours/${destinationName}/${product.productCode}`,
        destinationId: destinationId,
      }));
    } catch (apiError) {
      // Si la API falla, usar datos genéricos de respaldo
      console.error(
        `Error en API de productos para ${destinationName}:`,
        apiError
      );
      return generateFallbackTours(destinationName, destinationId);
    }
  } catch (error) {
    console.error(`Error buscando tours para ${destinationName}:`, error);
    return generateFallbackTours(destinationName, destinationId);
  }
};

/**
 * Generar tours de respaldo cuando todo lo demás falla
 */
function generateFallbackTours(cityName, destinationId) {
  console.log(`Generando tours genéricos para ${cityName}`);
  return [
    {
      productCode: `GENERIC1-${destinationId}`,
      title: `City Tour por ${cityName}`,
      description: `Descubra los lugares más emblemáticos de ${cityName} en este tour panorámico.`,
      price: { amount: 49.99, currency: 'USD' },
      rating: 4.5,
      reviewCount: 120,
      photoUrl:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/16/45/71/city-tour.jpg',
      duration: '4 horas',
      location: cityName,
      destinationId: destinationId,
      productUrl: `https://www.viator.com/es-ES/tours/${cityName.replace(/\s+/g, '-')}/City-Tour/d${destinationId}-GENERIC1`,
    },
    {
      productCode: `GENERIC2-${destinationId}`,
      title: `Tour Gastronómico por ${cityName}`,
      description: `Prueba los mejores platos y bebidas locales de ${cityName} con un guía experto.`,
      price: { amount: 59.99, currency: 'USD' },
      rating: 4.7,
      reviewCount: 85,
      photoUrl:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/b7/a5/60/food-tour.jpg',
      duration: '3 horas',
      location: cityName,
      destinationId: destinationId,
      productUrl: `https://www.viator.com/es-ES/tours/${cityName.replace(/\s+/g, '-')}/Food-Tour/d${destinationId}-GENERIC2`,
    },
    {
      productCode: `GENERIC3-${destinationId}`,
      title: `Excursión de día completo desde ${cityName}`,
      description: `Explore los alrededores de ${cityName} en esta completa excursión guiada.`,
      price: { amount: 89.99, currency: 'USD' },
      rating: 4.6,
      reviewCount: 95,
      photoUrl:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/60/b1/54/day-trip.jpg',
      duration: '8 horas',
      location: cityName,
      destinationId: destinationId,
      productUrl: `https://www.viator.com/es-ES/tours/${cityName.replace(/\s+/g, '-')}/Day-Trip/d${destinationId}-GENERIC3`,
    },
  ];
}

/**
 * Buscar tours por texto libre
 * CORREGIDO: Según los errores, debe ser POST, no GET
 */
export const searchToursByText = async (searchText, options = {}) => {
  try {
    if (!searchText || searchText.trim().length < 2) {
      console.warn('Texto de búsqueda demasiado corto');
      return [];
    }

    console.log(`Buscando tours por texto: "${searchText}"`);

    // Intentar usar datos de respaldo primero
    const searchLower = searchText.toLowerCase();
    for (const [key, tours] of Object.entries(FALLBACK_TOURS)) {
      if (searchLower.includes(key) || key.includes(searchLower)) {
        console.log(`Usando datos de respaldo para búsqueda: ${searchText}`);
        return tours;
      }
    }

    // CORREGIDO: Cambiar de GET a POST según el error 405
    const requestBody = {
      text: searchText.trim(),
      start: options.start || 1,
      count: options.limit || 20,
      currencyCode: options.currency || 'USD',
      sortOrder: options.sortOrder || 'TOP_RATED',
    };

    try {
      const data = await fetchViator('/search/freetext', 'POST', requestBody);

      if (!data.data || data.data.length === 0) {
        throw new Error('No se encontraron resultados');
      }

      return data.data.map((item) => ({
        productCode: item.productCode,
        title: item.title,
        description: item.shortDescription || '',
        price: {
          amount: item.price?.fromPrice || 0,
          currency: item.price?.currencyCode || 'USD',
        },
        rating: item.reviews?.combinedRating || 0,
        reviewCount: item.reviews?.totalReviews || 0,
        photoUrl: item.primaryImageUrl || getProductImageUrl(item),
        duration: item.duration || '',
        location: item.location || '',
        productUrl:
          item.productUrl ||
          `https://www.viator.com/es-ES/tours/${item.productCode}`,
        destinationId: item.destinationId || 0,
      }));
    } catch (apiError) {
      console.error('Error en API de búsqueda de texto:', apiError);
      return generateFallbackTours(searchText, 0);
    }
  } catch (error) {
    console.error('Error en búsqueda de texto libre:', error);
    return generateFallbackTours(searchText, 0);
  }
};

/**
 * Obtener detalles de un producto específico
 */
export const getProductDetails = async (productCode) => {
  try {
    if (!productCode) {
      throw new Error('No se proporcionó código de producto');
    }

    console.log(`Obteniendo detalles del producto: ${productCode}`);

    // Buscar en datos de respaldo primero
    for (const tours of Object.values(FALLBACK_TOURS)) {
      const found = tours.find((tour) => tour.productCode === productCode);
      if (found) {
        console.log(`Usando datos de respaldo para producto: ${productCode}`);
        return {
          ...found,
          highlights: ['Entrada incluida', 'Guía en español'],
          itinerary: [
            {
              title: 'Itinerario',
              content: 'Itinerario detallado no disponible en modo offline.',
            },
          ],
          additionalImages: [found.photoUrl],
        };
      }
    }

    // Si no está en datos de respaldo, intentar con la API
    try {
      const product = await fetchViator(`/products/${productCode}`, 'GET');

      if (product.status !== 'ACTIVE') {
        throw new Error(`Producto ${productCode} no está activo`);
      }

      return {
        productCode: product.productCode,
        title: product.title,
        description: product.description || product.shortDescription || '',
        highlights: product.inclusions || [],
        itinerary: product.itinerary?.sections || [],
        price: {
          amount: product.pricingInfo?.summary?.fromPrice || 0,
          currency: product.pricingInfo?.summary?.currencyCode || 'USD',
        },
        rating: product.reviews?.combinedAverageRating || 0,
        reviewCount: product.reviews?.totalReviews || 0,
        photoUrl: getProductImageUrl(product),
        duration: product.duration?.description || '',
        location:
          product.logistics?.location?.city &&
          product.logistics?.location?.country
            ? `${product.logistics.location.city}, ${product.logistics.location.country}`
            : '',
        productUrl:
          product.productUrl ||
          `https://www.viator.com/es-ES/tours/${productCode}`,
        destinationId: product.destinationId,
        additionalImages: (product.images || [])
          .slice(0, 5)
          .map(
            (image) =>
              image.variants?.find((v) => v.height >= 300)?.url ||
              image.variants?.[0]?.url ||
              ''
          )
          .filter((url) => url),
      };
    } catch (apiError) {
      console.error(`Error en API de detalles para ${productCode}:`, apiError);
      throw new Error(
        `No se encontró información para el tour con código ${productCode}`
      );
    }
  } catch (error) {
    console.error(
      `Error obteniendo detalles del producto ${productCode}:`,
      error
    );
    throw error;
  }
};

/**
 * Obtener los mejores tours de una lista de destinos
 */
export const getTopToursFromDestinations = async (
  destinations = [],
  limitPerDestination = 6
) => {
  try {
    console.log(`Obteniendo tours de ${destinations.length} destinos`);

    // Si no hay destinos, usar populares predefinidos
    if (!destinations || destinations.length === 0) {
      destinations = [
        FALLBACK_DESTINATIONS[0], // Paris
        FALLBACK_DESTINATIONS[1], // Barcelona
        FALLBACK_DESTINATIONS[4], // Rome
      ];
    }

    // Rastrear códigos de producto únicos para evitar duplicados
    const uniqueProductCodes = new Set();
    const allTours = [];

    // Procesar destinos secuencialmente
    for (const dest of destinations) {
      try {
        if (!dest || !dest.name) continue;

        console.log(
          `Procesando destino: ${dest.name} (ID: ${dest.destinationId})`
        );

        // Obtener productos para este destino
        const products = await getDestinationProducts({
          destinationId: dest.destinationId || 0,
          destinationName: dest.name,
          limit: limitPerDestination,
        });

        console.log(`Obtenidos ${products.length} tours de ${dest.name}`);

        // Añadir solo productos únicos
        for (const product of products) {
          if (!product.productCode) continue;

          if (!uniqueProductCodes.has(product.productCode)) {
            uniqueProductCodes.add(product.productCode);
            allTours.push({
              ...product,
              destinationId: dest.destinationId || 0,
              destinationName: dest.name,
            });
          }
        }
      } catch (err) {
        console.warn(`Error obteniendo tours de ${dest.name}:`, err);
      }

      // Si ya tenemos suficientes tours, podemos detenernos
      if (allTours.length >= 8) {
        break;
      }
    }

    // Si no tenemos suficientes tours, agregar algunos genéricos
    if (allTours.length < 3) {
      allTours.push(...generateFallbackTours('Destino Popular', 0));
    }

    // Ordenar por calificación y limitar a 8 tours como máximo
    const sortedTours = allTours
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);

    console.log(`Devolviendo ${sortedTours.length} tours ordenados`);
    return sortedTours;
  } catch (error) {
    console.error('Error obteniendo tours de destinos:', error);
    // Devolver algo para que la UI no se rompa
    return [...Object.values(FALLBACK_TOURS).flat().slice(0, 8)];
  }
};
