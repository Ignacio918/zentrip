/**
 * Cliente para la API de Viator
 * Implementado según la documentación oficial de Partner API
 * https://docs.viator.com/partner-api/technical/
 */

// Configuración general para todas las solicitudes
const API_BASE_PATH = '/viator';
const DEFAULT_HEADERS = {
  Accept: 'application/json;version=2.0',
  'Accept-Language': 'es-ES',
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

    console.log(
      `Enviando ${method} a ${url}${body ? ' con body' : ' sin body'}`
    );
    if (body) console.log('Body:', JSON.stringify(body));

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
 * Procesa el objeto de imagen de la API para obtener la variante más apropiada
 */
function getImageUrl(image, preferredHeight = 400) {
  if (!image || !image.variants || !image.variants.length) {
    return null;
  }

  // Primero intentamos encontrar una imagen cercana a la altura preferida
  const sortedVariants = [...image.variants].sort((a, b) => {
    const diffA = Math.abs(a.height - preferredHeight);
    const diffB = Math.abs(b.height - preferredHeight);
    return diffA - diffB;
  });

  return sortedVariants[0]?.url || null;
}

/**
 * Obtiene la mejor URL de imagen de un producto
 */
function getProductImageUrl(product) {
  if (!product) {
    return null;
  }

  // Si hay una URL primaria, usamos esa
  if (product.primaryImageUrl) {
    return product.primaryImageUrl;
  }

  // Si hay imágenes, procesamos la primera
  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }

  return null;
}

/**
 * Obtener destinos
 * https://docs.viator.com/partner-api/technical/#tag/Auxiliary/operation/destinations
 */
export const getDestinations = async () => {
  try {
    console.log('Obteniendo lista de destinos...');
    const data = await fetchViator('/destinations', 'GET');
    console.log(`Se obtuvieron ${data.destinations?.length || 0} destinos`);
    return data.destinations || [];
  } catch (error) {
    console.error('Error obteniendo destinos:', error);
    throw error;
  }
};

/**
 * Buscar destinos según término de búsqueda
 * https://docs.viator.com/partner-api/technical/#tag/Auxiliary/operation/destinationsSearch
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

    console.log(
      `Se encontraron ${data.destinations?.length || 0} destinos para "${searchTerm}"`
    );
    return data.destinations || [];
  } catch (error) {
    console.error('Error buscando destinos:', error);
    throw error;
  }
};

/**
 * Buscar productos/tours para un destino específico
 * https://docs.viator.com/partner-api/technical/#tag/Products/operation/productsSearch
 */
export const getDestinationProducts = async ({
  destinationId,
  destinationName = '',
  priceRange = null,
  duration = null,
  rating = null,
  limit = 20,
} = {}) => {
  try {
    console.log(
      `Buscando tours para destino: ${destinationName} (ID: ${destinationId})`
    );

    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 90);

    const formattedToday = currentDate.toISOString().split('T')[0];
    const formattedFuture = futureDate.toISOString().split('T')[0];

    // Crear body según la documentación exacta de Viator
    const requestBody = {
      filters: {
        destinationIds: [destinationId.toString()],
      },
      pagination: {
        start: 1,
        count: limit,
      },
      sortOrder: 'POPULARITY_DESC',
      currency: 'USD',
    };

    // Añadir fechas si es necesario
    if (formattedToday && formattedFuture) {
      requestBody.filters.startDate = formattedToday;
      requestBody.filters.endDate = formattedFuture;
    }

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

    // Realizar solicitud POST según la documentación
    const data = await fetchViator('/products/search', 'POST', requestBody);

    // Verificar si hay productos
    if (!data.products || data.products.length === 0) {
      console.log(`No se encontraron productos para ${destinationName}`);
      return [];
    }

    console.log(
      `Se encontraron ${data.products.length} productos para ${destinationName}`
    );

    // Transformar los resultados al formato que necesita nuestra aplicación
    return data.products.map((product) => ({
      productCode: product.productCode,
      title: product.title,
      description: product.shortDescription || '',
      price: {
        amount: product.pricing?.summary?.fromPrice || 0,
        currency: product.pricing?.summary?.currencyCode || 'USD',
      },
      rating: product.reviews?.combinedAverageRating || 0,
      reviewCount: product.reviews?.totalReviews || 0,
      photoUrl:
        product.images && product.images.length > 0
          ? getImageUrl(product.images[0])
          : null,
      duration: product.duration?.description || '',
      location: [product.location?.city, product.location?.country]
        .filter(Boolean)
        .join(', '),
      // Usar la URL proporcionada por la API - MUY IMPORTANTE PARA AFILIADOS
      productUrl: product.productUrl,
      destinationId: destinationId,
    }));
  } catch (error) {
    console.error(`Error buscando tours para ${destinationName}:`, error);
    throw error;
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

    // Crear el body según la documentación exacta
    const requestBody = {
      text: searchText.trim(),
      start: options.start || 1,
      count: options.limit || 20,
      currencyCode: options.currency || 'USD',
      sortOrder: options.sortOrder || 'TOP_RATED',
    };

    // Realizar la solicitud POST según la documentación
    const data = await fetchViator(
      '/search/freetext',
      'POST', // La documentación especifica POST, no GET
      requestBody
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
      productUrl: item.productUrl,
      destinationId: item.destinationId || 0,
    }));
  } catch (error) {
    console.error('Error en búsqueda de texto libre:', error);
    throw error;
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

    // Realizar la solicitud GET según la documentación exacta
    const product = await fetchViator(`/products/${productCode}`, 'GET');

    // Si el producto no está activo, lanzar error
    if (product.status !== 'ACTIVE') {
      throw new Error(`Producto ${productCode} no está activo`);
    }

    // Extraer las imágenes adicionales correctamente
    const additionalImages = [];
    if (product.images && product.images.length) {
      for (let i = 0; i < Math.min(5, product.images.length); i++) {
        const imgUrl = getImageUrl(product.images[i]);
        if (imgUrl) {
          additionalImages.push(imgUrl);
        }
      }
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
      photoUrl: getImageUrl(
        product.images && product.images.length ? product.images[0] : null
      ),
      duration: product.duration?.description || '',
      location:
        product.logistics?.location?.city &&
        product.logistics?.location?.country
          ? `${product.logistics.location.city}, ${product.logistics.location.country}`
          : '',
      // Usar la URL proporcionada por la API - MUY IMPORTANTE PARA AFILIADOS
      productUrl: product.productUrl,
      destinationId: product.destinationId,
      additionalImages,
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

    // Si no hay destinos, obtener algunos populares
    if (!destinations || destinations.length === 0) {
      try {
        const allDestinations = await getDestinations();
        // Destinos populares por ID, según la documentación
        const popularIds = [732, 684, 662]; // Paris, Barcelona, Madrid
        destinations = allDestinations
          .filter((d) => popularIds.includes(d.destinationId))
          .slice(0, 3);
      } catch (err) {
        console.error('Error obteniendo destinos populares:', err);
        return [];
      }
    }

    // Rastrear códigos de producto únicos para evitar duplicados
    const uniqueProductCodes = new Set();
    const allTours = [];

    // Procesar destinos secuencialmente
    for (const dest of destinations) {
      try {
        if (!dest || !dest.destinationId) continue;

        console.log(
          `Procesando destino: ${dest.name} (ID: ${dest.destinationId})`
        );

        // Obtener productos para este destino
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
    throw error;
  }
};

/**
 * Obtener categorías disponibles de productos
 * https://docs.viator.com/partner-api/technical/#operation/productsTags
 */
export const getProductTags = async () => {
  try {
    console.log('Obteniendo categorías de productos...');
    const data = await fetchViator('/products/tags', 'GET');
    return data.tags || [];
  } catch (error) {
    console.error('Error obteniendo categorías de productos:', error);
    throw error;
  }
};

/**
 * Buscar atracciones
 * https://docs.viator.com/partner-api/technical/#operation/attractionsSearch
 */
export const searchAttractions = async (searchTerm, options = {}) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      console.warn('Término de búsqueda demasiado corto');
      return [];
    }

    console.log(`Buscando atracciones para: "${searchTerm}"`);

    const requestBody = {
      query: searchTerm.trim(),
      start: options.start || 1,
      count: options.count || 10,
    };

    const data = await fetchViator('/attractions/search', 'POST', requestBody);
    return data.attractions || [];
  } catch (error) {
    console.error('Error buscando atracciones:', error);
    throw error;
  }
};
