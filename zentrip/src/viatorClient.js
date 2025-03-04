/**
 * Cliente para la API de Viator
 * Implementado según la documentación oficial: https://docs.viator.com/partner-api/technical/
 */

// Configuración general para todas las solicitudes
const API_BASE_PATH = '/viator';
const DEFAULT_HEADERS = {
  Accept: 'application/json;version=2.0',
  'Accept-Language': 'es-ES',
};

/**
 * Función auxiliar para realizar solicitudes a la API de Viator
 * @param {string} endpoint - El endpoint de la API (sin /viator)
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {object} [body] - Cuerpo de la solicitud para POST
 * @param {object} [queryParams] - Parámetros de consulta para la URL
 * @returns {Promise<any>} - La respuesta de la API
 */
async function fetchViator(endpoint, method, body = null, queryParams = null) {
  try {
    // Construir la URL con los parámetros de consulta si existen
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

    // Construir las opciones de la solicitud
    const options = {
      method,
      headers: { ...DEFAULT_HEADERS },
      signal: AbortSignal.timeout(15000), // 15 segundos de timeout
    };

    // Añadir el cuerpo para solicitudes POST/PUT
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
 * Obtener destinos según la documentación
 * @see https://docs.viator.com/partner-api/technical/#tag/Auxiliary/operation/destinations
 */
export const getDestinations = async () => {
  try {
    console.log('Obteniendo lista de destinos...');
    const data = await fetchViator('/destinations', 'GET');
    console.log(`Se obtuvieron ${data.destinations?.length || 0} destinos`);
    return data.destinations || [];
  } catch (error) {
    console.error('Error obteniendo destinos:', error);
    return [];
  }
};

/**
 * Buscar destinos según término de búsqueda
 * @see https://docs.viator.com/partner-api/technical/#tag/Auxiliary/operation/destinationsSearch
 */
export const searchDestinations = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('Término de búsqueda demasiado corto');
      return [];
    }

    console.log(`Buscando destinos para: "${searchTerm}"`);

    const queryParams = {
      searchTerm: searchTerm.trim(),
      includeDetails: 'true',
      language: 'es-ES',
    };

    const data = await fetchViator(
      '/destinations/search',
      'GET',
      null,
      queryParams
    );

    console.log(`Se encontraron ${data.destinations?.length || 0} destinos`);
    return data.destinations || [];
  } catch (error) {
    console.error('Error buscando destinos:', error);
    // Si la API falla, usar unos cuantos destinos predefinidos como respaldo
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fallbackDestinations = [
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

      return fallbackDestinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchLower) ||
          (dest.location?.city &&
            dest.location.city.toLowerCase().includes(searchLower)) ||
          (dest.location?.country &&
            dest.location.country.toLowerCase().includes(searchLower))
      );
    }
    return [];
  }
};
/**
 * Buscar productos/tours para un destino específico
 * @see https://docs.viator.com/partner-api/technical/#tag/Products/operation/productsSearch
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

    // Preparar fechas para la búsqueda (desde hoy hasta 3 meses adelante)
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 90);

    const formattedToday = currentDate.toISOString().split('T')[0];
    const formattedFuture = futureDate.toISOString().split('T')[0];

    // Construir el cuerpo de la solicitud según la documentación
    const requestBody = {
      filtering: {
        destination: destinationId.toString(),
        startDate: formattedToday,
        endDate: formattedFuture,
      },
      sorting: {
        sortBy: 'POPULARITY',
        sortOrder: 'DESC',
      },
      pagination: {
        start: 1,
        count: limit,
      },
      currencyCode: 'USD',
    };

    // Añadir filtros opcionales si se proporcionan
    if (priceRange) {
      requestBody.filtering.price = {
        min: priceRange.min || 0,
        max: priceRange.max || 1000,
      };
    }

    if (rating) {
      requestBody.filtering.rating = rating;
    }

    if (duration) {
      requestBody.filtering.duration = duration;
    }

    // Realizar la solicitud POST según la documentación
    const data = await fetchViator('/products/search', 'POST', requestBody);

    console.log(`Se encontraron ${data.products?.length || 0} tours`);

    // Si no hay productos, devolver un array vacío
    if (!data.products || data.products.length === 0) {
      return [];
    }

    // Transformar los datos al formato que necesita nuestra aplicación
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
      // Obtener la mejor URL de imagen disponible
      photoUrl: getProductImageUrl(product),
      duration: product.duration?.description || '',
      location: [product.location?.city, product.location?.country]
        .filter(Boolean)
        .join(', '),
      // IMPORTANTE: Usar la URL proporcionada por la API si está disponible
      productUrl:
        product.productUrl ||
        `https://www.viator.com/tours/${product.productCode}`,
      destinationId: destinationId,
    }));
  } catch (error) {
    console.error(`Error buscando tours para ${destinationName}:`, error);

    // En caso de error, intentar con búsqueda de texto libre
    try {
      return await searchToursByText(destinationName, { limit });
    } catch (searchError) {
      console.error('También falló la búsqueda de texto:', searchError);
      return [];
    }
  }
};
/**
 * Buscar tours por texto libre
 * https://docs.viator.com/partner-api/technical/#tag/Auxiliary/operation/searchFreeText
 */
export const searchToursByText = async (searchText, options = {}) => {
  try {
    if (!searchText || searchText.trim().length < 2) {
      console.warn('Texto de búsqueda demasiado corto');
      return [];
    }

    console.log(`Buscando tours por texto: "${searchText}"`);

    // Parámetros de consulta según la documentación
    const queryParams = {
      text: searchText.trim(),
      start: options.start || 1,
      count: options.limit || 20,
      currencyCode: options.currency || 'USD',
      sortOrder: options.sortOrder || 'TOP_RATED',
    };

    // Realizar la solicitud GET según la documentación
    const data = await fetchViator(
      '/search/freetext',
      'GET',
      null,
      queryParams
    );

    console.log(
      `Se encontraron ${data.data?.length || 0} resultados para "${searchText}"`
    );

    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Transformar los resultados al formato que necesita nuestra aplicación
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
      photoUrl: item.primaryImageUrl || '',
      duration: item.duration || '',
      location: item.location || '',
      // Usar la URL proporcionada por la API
      productUrl:
        item.productUrl || `https://www.viator.com/tours/${item.productCode}`,
      destinationId: item.destinationId || 0,
    }));
  } catch (error) {
    console.error('Error en búsqueda de texto libre:', error);
    return [];
  }
};

/**
 * Obtener detalles de un producto específico
 * https://docs.viator.com/partner-api/technical/#tag/Products/operation/products
 */
export const getProductDetails = async (productCode) => {
  try {
    if (!productCode) {
      throw new Error('No se proporcionó código de producto');
    }

    console.log(`Obteniendo detalles del producto: ${productCode}`);

    // Realizar la solicitud GET según la documentación
    const product = await fetchViator(`/products/${productCode}`, 'GET');

    // Si el producto no está activo, lanzar error
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
      // Usar la URL proporcionada por la API - MUY IMPORTANTE PARA AFILIADOS
      productUrl:
        product.productUrl || `https://www.viator.com/tours/${productCode}`,
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

    // Rastrear códigos de producto únicos para evitar duplicados
    const uniqueProductCodes = new Set();
    const allTours = [];

    // Procesar destinos secuencialmente
    for (const dest of destinations) {
      try {
        console.log(
          `Procesando destino: ${dest.name} (ID: ${dest.destinationId})`
        );

        if (!dest.destinationId) {
          console.warn(`Destino sin ID: ${dest.name}`);
          continue;
        }

        const products = await getDestinationProducts({
          destinationId: dest.destinationId,
          destinationName: dest.name,
          limit: limitPerDestination,
        });

        console.log(`Obtenidos ${products.length} tours de ${dest.name}`);

        // Añadir solo productos únicos
        for (const product of products) {
          if (!uniqueProductCodes.has(product.productCode)) {
            uniqueProductCodes.add(product.productCode);
            allTours.push({
              ...product,
              destinationId: dest.destinationId,
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

    // Ordenar por calificación y limitar a 8 tours
    const sortedTours = allTours
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);

    console.log(`Devolviendo ${sortedTours.length} tours ordenados`);
    return sortedTours;
  } catch (error) {
    console.error('Error obteniendo tours de destinos:', error);
    return [];
  }
};
