// Función para generar URLs limpias para productos con parámetro de afiliado
export const generateProductUrl = (
  productCode,
  title,
  destinationName,
  destinationId
) => {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const cleanDestinationName = destinationName
    .toLowerCase()
    .trim()
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Parámetro de afiliado para Viator
  const affiliateParam = 'partner_source=zentrip';

  return `https://www.viator.com/es-ES/tours/${cleanDestinationName}/${cleanTitle}/d${destinationId}-${productCode}?${affiliateParam}`;
};

// Función para obtener una imagen de placeholder cuando las otras fallan
function getRandomPlaceholderImage() {
  // Usar imágenes alternativas que no dependen de via.placeholder.com
  const images = [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    'https://images.unsplash.com/photo-1504150558240-0b4fd8946624',
  ];
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Función para obtener la mejor URL de imagen disponible
 */
function getImageUrl(image, preferredHeight = 400) {
  try {
    if (!image) {
      return getRandomPlaceholderImage();
    }

    // Si hay una URL directa en el objeto
    if (typeof image === 'string') {
      return image;
    }

    // Si hay una URL primaria/directa en el objeto
    if (image.url) {
      return image.url;
    }

    if (image.primaryImageUrl) {
      return image.primaryImageUrl;
    }

    // Si no hay variantes, no podemos obtener una URL
    if (
      !image.variants ||
      !Array.isArray(image.variants) ||
      image.variants.length === 0
    ) {
      return getRandomPlaceholderImage();
    }

    // Filtrar variantes válidas (con URL)
    const validVariants = image.variants.filter((v) => v && v.url);
    if (validVariants.length === 0) {
      return getRandomPlaceholderImage();
    }

    // Ordenar por cercanía a la altura preferida
    const sortedVariants = [...validVariants].sort((a, b) => {
      const diffA = Math.abs((a.height || 0) - preferredHeight);
      const diffB = Math.abs((b.height || 0) - preferredHeight);
      return diffA - diffB;
    });

    return sortedVariants[0]?.url || getRandomPlaceholderImage();
  } catch (error) {
    console.error('Error procesando URL de imagen:', error);
    return getRandomPlaceholderImage();
  }
}
// Función para generar tours hardcodeados para casos en que todo lo demás falle
const getHardcodedToursForCity = (cityName, destinationId) => {
  console.log(`Generando tours hardcodeados para ${cityName}`);

  let tours = [];

  // Tours específicos para algunas ciudades populares
  if (
    cityName.toLowerCase().includes('buenos aires') ||
    destinationId === 30603
  ) {
    tours = [
      {
        productCode: '5239BUEAIR',
        title: 'Traslado privado: Aeropuerto Internacional Ezeiza',
        description:
          'Comience o finalice sus vacaciones en Buenos Aires sin preocupaciones con este traslado privado.',
        price: { amount: 28.99, currency: 'USD' },
        rating: 4.5,
        reviewCount: 253,
        photoUrl:
          'https://media.tacdn.com/media/attractions-splice-spp-674x446/07/20/a5/f3.jpg',
        duration: '1 hora',
        location: 'Buenos Aires, Argentina',
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
          'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/71/41/a5.jpg',
        duration: '3 horas',
        location: 'Buenos Aires, Argentina',
      },
      {
        productCode: '3851DAYRANCH',
        title: 'Día de gaucho en el Rancho Santa Susana',
        description:
          'Experimente la tradición gaucha argentina en un rancho histórico con almuerzo y espectáculo.',
        price: { amount: 147.99, currency: 'USD' },
        rating: 4.3,
        reviewCount: 178,
        photoUrl:
          'https://media.tacdn.com/media/attractions-splice-spp-674x446/07/33/16/74.jpg',
        duration: '8 horas',
        location: 'Buenos Aires, Argentina',
      },
    ];
  } else if (
    cityName.toLowerCase().includes('barcelona') ||
    destinationId === 684
  ) {
    tours = [
      {
        productCode: '2140BARCELONA',
        title: 'City Tour por Barcelona con Sagrada Familia',
        description:
          'Descubra los imprescindibles de Barcelona, incluyendo la icónica Sagrada Familia de Gaudí, con entrada sin colas.',
        price: { amount: 99.0, currency: 'USD' },
        rating: 4.7,
        reviewCount: 1243,
        photoUrl:
          'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/6f/58/75.jpg',
        duration: '4 horas',
        location: 'Barcelona, España',
      },
      {
        productCode: '5692MONTP1',
        title: 'Excursión a Montserrat desde Barcelona',
        description:
          'Visite el monasterio de Montserrat y disfrute de impresionantes vistas panorámicas desde la montaña.',
        price: { amount: 65.99, currency: 'USD' },
        rating: 4.6,
        reviewCount: 897,
        photoUrl:
          'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/71/bf/ce.jpg',
        duration: '5 horas',
        location: 'Barcelona, España',
      },
    ];
  } else {
    // Tours genéricos para cualquier otra ciudad
    tours = [
      {
        productCode: `generic_city_tour_${destinationId || Math.floor(Math.random() * 10000)}`,
        title: `City Tour por ${cityName}`,
        description: `Descubre los lugares más emblemáticos de ${cityName} en este completo tour por la ciudad.`,
        price: { amount: 39.99, currency: 'USD' },
        rating: 4.5,
        reviewCount: 120,
        photoUrl:
          'https://media.tacdn.com/media/attractions-splice-spp-674x446/07/03/1c/9b.jpg',
        duration: '4 horas',
        location: cityName,
      },
      {
        productCode: `generic_food_tour_${destinationId || Math.floor(Math.random() * 10000)}`,
        title: `Tour Gastronómico por ${cityName}`,
        description: `Prueba los mejores platos y bebidas locales mientras conoces la cultura culinaria de ${cityName}.`,
        price: { amount: 54.99, currency: 'USD' },
        rating: 4.7,
        reviewCount: 85,
        photoUrl:
          'https://media.tacdn.com/media/attractions-splice-spp-674x446/07/01/ed/92.jpg',
        duration: '3 horas',
        location: cityName,
      },
      {
        productCode: `generic_day_trip_${destinationId || Math.floor(Math.random() * 10000)}`,
        title: `Excursión de día completo desde ${cityName}`,
        description: `Disfruta de los alrededores de ${cityName} en esta excursión guiada de día completo.`,
        price: { amount: 89.99, currency: 'USD' },
        rating: 4.6,
        reviewCount: 95,
        photoUrl:
          'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/cd/70.jpg',
        duration: '8 horas',
        location: cityName,
      },
    ];
  }

  // Añadir URLs de productos a todos los tours
  return tours.map((tour) => ({
    ...tour,
    productUrl: generateProductUrl(
      tour.productCode,
      tour.title,
      cityName,
      destinationId || 0
    ),
  }));
};

// Helper function para mapear productos a formato estándar
const mapProductsToStandardFormat = (
  products,
  destinationName,
  destinationId
) => {
  return products
    .filter((product) => product.productCode && product.title)
    .map((product) => ({
      productCode: product.productCode,
      title: product.title,
      description: product.shortDescription || product.description || '',
      price: {
        amount: product.pricing?.summary?.fromPrice || 0,
        currency: product.pricing?.summary?.currencyCode || 'USD',
      },
      rating: product.reviews?.combinedAverageRating || 0,
      reviewCount: product.reviews?.totalReviews || 0,
      photoUrl: getImageUrl(product.images?.[0]) || '',
      duration: product.duration?.description || '',
      location: [product.location?.city, product.location?.country]
        .filter(Boolean)
        .join(', '),
      productUrl: generateProductUrl(
        product.productCode,
        product.title,
        destinationName,
        destinationId
      ),
    }));
};
// Obtener lista de destinos
export const getDestinations = async () => {
  try {
    console.log('Obteniendo lista de destinos...');
    const response = await fetch('/api/viator-tours/destinations', {
      method: 'GET',
      headers: {
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'es-ES',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching destinations: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Se obtuvieron ${data.destinations?.length || 0} destinos`);
    return data.destinations || [];
  } catch (error) {
    console.error('Error getting destinations:', error);
    return []; // Devolver array vacío en lugar de lanzar error
  }
};

// Buscar destinos según término de búsqueda
export const searchDestinations = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('Término de búsqueda demasiado corto');
      return [];
    }

    console.log(`Buscando destinos para: "${searchTerm}"`);

    // SOLUCIÓN TEMPORAL: Usar destinos predefinidos mientras solucionamos la API
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    // Lista de destinos predefinidos para búsquedas comunes
    const predefinedDestinations = [
      {
        terms: ['paris', 'francia', 'france'],
        destination: {
          destinationId: 732,
          name: 'Paris',
          type: 'CITY',
          location: { city: 'Paris', country: 'France' },
        },
      },
      {
        terms: ['barcelona', 'españa', 'spain'],
        destination: {
          destinationId: 684,
          name: 'Barcelona',
          type: 'CITY',
          location: { city: 'Barcelona', country: 'Spain' },
        },
      },
      {
        terms: ['madrid', 'españa', 'spain'],
        destination: {
          destinationId: 662,
          name: 'Madrid',
          type: 'CITY',
          location: { city: 'Madrid', country: 'Spain' },
        },
      },
      {
        terms: ['london', 'londres', 'reino unido', 'uk', 'england'],
        destination: {
          destinationId: 687,
          name: 'London',
          type: 'CITY',
          location: { city: 'London', country: 'United Kingdom' },
        },
      },
      {
        terms: ['rome', 'roma', 'italia', 'italy'],
        destination: {
          destinationId: 546,
          name: 'Rome',
          type: 'CITY',
          location: { city: 'Rome', country: 'Italy' },
        },
      },
      {
        terms: ['new york', 'nueva york', 'nyc', 'estados unidos', 'usa'],
        destination: {
          destinationId: 712,
          name: 'New York',
          type: 'CITY',
          location: { city: 'New York', country: 'United States' },
        },
      },
      {
        terms: ['tokio', 'tokyo', 'japón', 'japan'],
        destination: {
          destinationId: 10812,
          name: 'Tokyo',
          type: 'CITY',
          location: { city: 'Tokyo', country: 'Japan' },
        },
      },
      {
        terms: ['sydney', 'sidney', 'australia'],
        destination: {
          destinationId: 357,
          name: 'Sydney',
          type: 'CITY',
          location: { city: 'Sydney', country: 'Australia' },
        },
      },
      {
        terms: ['buenos aires', 'argentina'],
        destination: {
          destinationId: 30603,
          name: 'Buenos Aires',
          type: 'CITY',
          location: { city: 'Buenos Aires', country: 'Argentina' },
        },
      },
      {
        terms: ['rio de janeiro', 'rio', 'brasil', 'brazil'],
        destination: {
          destinationId: 318,
          name: 'Rio de Janeiro',
          type: 'CITY',
          location: { city: 'Rio de Janeiro', country: 'Brazil' },
        },
      },
      {
        terms: ['ciudad del cabo', 'cape town', 'sudáfrica', 'south africa'],
        destination: {
          destinationId: 318,
          name: 'Cape Town',
          type: 'CITY',
          location: { city: 'Cape Town', country: 'South Africa' },
        },
      },
    ];

    // Buscar coincidencias en nuestros destinos predefinidos
    const matchingDestinations = [];
    for (const item of predefinedDestinations) {
      if (item.terms.some((term) => lowerSearchTerm.includes(term))) {
        matchingDestinations.push(item.destination);
      }
    }

    if (matchingDestinations.length > 0) {
      console.log(
        `Se encontraron ${matchingDestinations.length} destinos predefinidos`
      );
      return matchingDestinations;
    }

    // Si no encontramos coincidencias predefinidas, intentamos con la API
    // CORRECCIÓN: Usar /search/freetext en lugar de /destinations/search
    try {
      const params = new URLSearchParams({
        text: searchTerm.trim(),
        sortOrder: 'RELEVANCE',
        topX: '10',
        language: 'es-ES',
      });

      const url = `/api/viator-tours/search/freetext?${params.toString()}`;
      console.log(`Enviando solicitud a: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json;version=2.0',
          'Accept-Language': 'es-ES',
        },
        signal: AbortSignal.timeout(20000), // 20 segundos de timeout
      });

      if (!response.ok) {
        throw new Error(`Error searching destinations: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        console.warn('No se encontraron resultados');
        return [];
      }

      // Filtrar solo los resultados de tipo DESTINATION
      const destinations = data.data
        .filter((item) => item.type === 'DESTINATION')
        .map((item) => ({
          destinationId: item.destinationId || item.seoId,
          name: item.text || item.title,
          type: 'CITY',
          location: {
            city: item.text || item.title,
            country: item.parentText || '',
          },
        }));

      console.log(
        `Se encontraron ${destinations.length} destinos mediante API`
      );
      return destinations;
    } catch (apiError) {
      console.error('Error en la API de destinos:', apiError);
      return []; // Devolver vacío si la API falla
    }
  } catch (error) {
    console.error('Error en búsqueda de destinos:', error);
    return []; // Devolver array vacío para mejorar experiencia de usuario
  }
};
// Obtener productos de destinos con soporte para filtros y globalidad
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

    // Implementar estrategia de múltiples intentos con diferentes enfoques
    const strategies = [
      // Estrategia 1: Usar formato simplificado para productos/búsqueda
      async () => {
        console.log(
          `Estrategia 1: Búsqueda simplificada para ${destinationName}`
        );

        const currentDate = new Date();
        const tomorrowDate = new Date(currentDate);
        tomorrowDate.setDate(currentDate.getDate() + 30);

        // Formato YYYY-MM-DD
        const formattedToday = currentDate.toISOString().split('T')[0];
        const formattedMonth = tomorrowDate.toISOString().split('T')[0];

        const searchRequest = {
          filtering: {
            destination: destinationId.toString(),
            startDate: formattedToday,
            endDate: formattedMonth,
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

        console.log(
          `Request para products/search:`,
          JSON.stringify(searchRequest)
        );

        const response = await fetch('/api/viator-tours/products/search', {
          method: 'POST',
          headers: {
            Accept: 'application/json;version=2.0',
            'Content-Type': 'application/json',
            'Accept-Language': 'es-ES',
          },
          body: JSON.stringify(searchRequest),
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.products || data.products.length === 0) {
          console.warn('No products found in response');
          return null;
        }

        return mapProductsToStandardFormat(
          data.products,
          destinationName,
          destinationId
        );
      },

      // Estrategia 2: Usar búsqueda de texto libre
      async () => {
        console.log(`Estrategia 2: Búsqueda de texto para ${destinationName}`);

        const params = new URLSearchParams({
          text: destinationName,
          start: 1,
          count: limit,
          currencyCode: 'USD',
          sortOrder: 'TOP_RATED',
        });

        const url = `/api/viator-tours/search/freetext?${params.toString()}`;
        console.log(`Enviando solicitud a: ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json;version=2.0',
            'Accept-Language': 'es-ES',
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          console.warn('No results found in freetext search');
          return null;
        }

        return data.data
          .filter((item) => item.productCode)
          .map((item) => ({
            productCode: item.productCode,
            title: item.title,
            description: item.shortDescription || item.description || '',
            price: {
              amount: item.price?.fromPrice || 0,
              currency: item.price?.currencyCode || 'USD',
            },
            rating: item.reviews?.combinedRating || 0,
            reviewCount: item.reviews?.totalReviews || 0,
            photoUrl: getImageUrl(item.image) || item.primaryImageUrl || '',
            duration: item.duration || '',
            location: item.location || destinationName,
            productUrl: generateProductUrl(
              item.productCode,
              item.title,
              destinationName,
              destinationId
            ),
          }));
      },

      // Estrategia 3: Para ciudades específicas, usar datos preprogramados
      async () => {
        console.log(
          `Estrategia 3: Usar datos preprogramados para ${destinationName}`
        );
        return getHardcodedToursForCity(destinationName, destinationId);
      },
    ];

    // Probar cada estrategia hasta que una funcione
    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = await strategies[i]();
        if (result && result.length > 0) {
          console.log(
            `Estrategia ${i + 1} exitosa para ${destinationName}: ${result.length} tours`
          );
          return result;
        }
      } catch (err) {
        console.warn(`Estrategia ${i + 1} falló para ${destinationName}:`, err);
      }
    }

    // Si llegamos aquí, ninguna estrategia funcionó
    console.log(
      `Todas las estrategias fallaron para ${destinationName}, usando respaldo genérico`
    );
    return getHardcodedToursForCity(destinationName, destinationId);
  } catch (error) {
    console.error(`Error getting products for ${destinationName}:`, error);
    return getHardcodedToursForCity(destinationName, destinationId);
  }
};

// Obtener los mejores tours de una lista de destinos
export const getTopToursFromDestinations = async (
  destinations = [],
  limitPerDestination = 6
) => {
  try {
    console.log(
      'Fetching tours from destinations:',
      JSON.stringify(destinations)
    );

    // Rastrear códigos de producto únicos para evitar duplicados entre destinos
    const uniqueProductCodes = new Set();
    const allTours = [];

    // Procesar destinos secuencialmente para manejar errores y seguir el progreso
    for (const dest of destinations) {
      try {
        console.log(
          `Fetching tours from ${dest.name} (ID: ${dest.destinationId})...`
        );
        const products = await getDestinationProducts({
          destinationId: dest.destinationId,
          destinationName: dest.name,
          limit: limitPerDestination,
        });

        console.log(`Received ${products.length} tours from ${dest.name}`);

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
        console.warn(`Error fetching tours for ${dest.name}:`, err);
        // Continuar con el siguiente destino
      }
    }

    // Si tenemos muy pocos tours, probar con destinos de respaldo
    if (allTours.length < 8) {
      const fallbackDestinations = [
        { destinationId: 732, name: 'Paris' },
        { destinationId: 684, name: 'Barcelona' },
        { destinationId: 662, name: 'Madrid' },
        { destinationId: 687, name: 'London' },
        { destinationId: 546, name: 'Rome' },
      ];

      console.log(
        `Only found ${allTours.length} tours, trying fallback destinations`
      );

      for (const fallbackDest of fallbackDestinations) {
        // Omitir si ya tenemos suficientes tours
        if (allTours.length >= 8) break;

        // Omitir si este destino ya estaba en la lista original
        if (
          destinations.some(
            (d) => d.destinationId === fallbackDest.destinationId
          )
        )
          continue;

        try {
          console.log(
            `Trying fallback destination ${fallbackDest.name} (ID: ${fallbackDest.destinationId})`
          );
          const fallbackTours = await getDestinationProducts({
            destinationId: fallbackDest.destinationId,
            destinationName: fallbackDest.name,
            limit: 8 - allTours.length,
          });

          for (const tour of fallbackTours) {
            if (!uniqueProductCodes.has(tour.productCode)) {
              uniqueProductCodes.add(tour.productCode);
              allTours.push({
                ...tour,
                destinationId: fallbackDest.destinationId,
                destinationName: fallbackDest.name,
              });
            }

            // Detenerse si tenemos suficientes tours
            if (allTours.length >= 8) break;
          }
        } catch (err) {
          console.warn(
            `Error fetching fallback tours from ${fallbackDest.name}:`,
            err
          );
        }
      }
    }

    // Ordenar por calificación y limitar a 8 tours
    const sortedTours = allTours
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);

    console.log(`Returning ${sortedTours.length} unique sorted tours`);
    return sortedTours;
  } catch (error) {
    console.error('Error getting top tours from destinations:', error);
    return [];
  }
};
