// Improved function to generate valid Viator product URLs
export const generateProductUrl = (
  productCode,
  title,
  destinationName,
  destinationId
) => {
  if (!productCode) {
    console.error('Missing product code for URL generation');
    return '#';
  }

  // Basic sanitization for URL parameters
  const cleanTitle = title
    ? title
        .toLowerCase()
        .trim()
        .replace(/[áäâàãå]/g, 'a')
        .replace(/[éëêè]/g, 'e')
        .replace(/[íïîì]/g, 'i')
        .replace(/[óöôòõø]/g, 'o')
        .replace(/[úüûù]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : 'tour';

  // Use a direct, reliable product URL format that works consistently
  // This is the most reliable URL format for Viator products
  return `https://www.viator.com/tours/${productCode}`;
};

// Function to get a reliable image URL from Viator product data
const getReliableImageUrl = (product) => {
  // Try various possible image sources in order of reliability

  // 1. Try the primary image URL if available
  if (product.primaryImageUrl && product.primaryImageUrl.startsWith('http')) {
    return product.primaryImageUrl;
  }

  // 2. Try the first image from the images array with proper variants
  if (product.images && product.images.length > 0) {
    // Try to find medium-sized variant around 400px height
    const mediumVariant = product.images[0].variants?.find(
      (v) => v.height >= 300 && v.height <= 500 && v.url?.startsWith('http')
    );

    if (mediumVariant?.url) {
      return mediumVariant.url;
    }

    // If no medium variant, try any available variant
    const anyVariant = product.images[0].variants?.[0]?.url;
    if (anyVariant && anyVariant.startsWith('http')) {
      return anyVariant;
    }
  }

  // 3. Check if there's a thumbnailURL or thumbnailHiResURL
  if (
    product.thumbnailHiResURL &&
    product.thumbnailHiResURL.startsWith('http')
  ) {
    return product.thumbnailHiResURL;
  }

  if (product.thumbnailURL && product.thumbnailURL.startsWith('http')) {
    return product.thumbnailURL;
  }

  // 4. Use a reliable image placeholder (Placehold.co instead of placeholder.com)
  return 'https://placehold.co/400x300/eee/999?text=Tour+Image';
};
// Function to generate hardcoded tours when everything else fails
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

  // Add backup image URLs and generate proper product URLs
  return tours.map((tour) => ({
    ...tour,
    // Add backup image in case primary fails
    photoUrl:
      tour.photoUrl || 'https://placehold.co/400x300/eee/999?text=Tour+Image',
    backupPhotoUrl: 'https://placehold.co/400x300/eee/999?text=Tour+Image',
    // Generate proper Viator URL
    productUrl: generateProductUrl(
      tour.productCode,
      tour.title,
      cityName,
      destinationId || 0
    ),
  }));
};

// Improved helper function to map products to standard format with better reliability
const mapProductsToStandardFormat = (
  products,
  destinationName,
  destinationId
) => {
  return products
    .filter((product) => product.productCode)
    .map((product) => {
      // Make sure we have a valid product code
      const productCode = product.productCode || '';

      // Get a reliable title
      const title =
        product.title ||
        product.shortTitle ||
        'Tour en ' + (destinationName || 'destino');

      // Generate the product URL early so we can validate it
      const productUrl = generateProductUrl(
        productCode,
        title,
        destinationName,
        destinationId
      );

      // Get the best available image URL
      const photoUrl = getReliableImageUrl(product);

      // Calculate display price with sensible defaults
      const priceAmount =
        product.pricing?.summary?.fromPrice ||
        product.price?.fromPrice ||
        product.fromPrice ||
        0;

      const priceCurrency =
        product.pricing?.summary?.currencyCode ||
        product.price?.currencyCode ||
        'USD';

      // Get rating information
      const rating =
        product.reviews?.combinedAverageRating ||
        product.reviews?.overallRating ||
        product.rating ||
        4.0;

      const reviewCount =
        product.reviews?.totalReviews ||
        product.reviews?.numReviews ||
        product.reviewCount ||
        0;

      // Get duration information
      const duration = product.duration?.description || product.duration || '';

      // Location information
      let location = '';
      if (product.location?.city && product.location?.country) {
        location = `${product.location.city}, ${product.location.country}`;
      } else if (destinationName) {
        location = destinationName;
      }

      // Return the standardized product format with all the extracted data
      return {
        productCode,
        title,
        description:
          product.shortDescription ||
          product.description ||
          `Explora ${destinationName || 'este destino'} con esta increíble experiencia.`,
        price: {
          amount: priceAmount,
          currency: priceCurrency,
        },
        rating,
        reviewCount,
        photoUrl,
        // Add a backup image that's less likely to fail
        backupPhotoUrl: 'https://placehold.co/400x300/eee/999?text=Tour+Image',
        duration,
        location,
        productUrl,
        // Store the raw destinationId for reference
        destinationId: destinationId || product.destinationId || 0,
        // Store the raw destination name for reference
        destinationName: destinationName || '',
      };
    });
};
// Obtener lista de destinos
export const getDestinations = async () => {
  try {
    console.log('Obteniendo lista de destinos...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('/viator/destinations', {
      method: 'GET',
      headers: {
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'es-ES',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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

// Improved search destinations function with more reliable results
export const searchDestinations = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('Término de búsqueda demasiado corto');
      return [];
    }

    console.log(`Buscando destinos para: "${searchTerm}"`);

    // Comprehensive predefined destinations list
    const predefinedDestinations = [
      {
        terms: ['paris', 'francia', 'france', 'parí'],
        destination: {
          destinationId: 732,
          name: 'Paris',
          type: 'CITY',
          location: { city: 'Paris', country: 'France' },
        },
      },
      {
        terms: ['barcelona', 'españa', 'spain', 'barça', 'barca', 'barsa'],
        destination: {
          destinationId: 684,
          name: 'Barcelona',
          type: 'CITY',
          location: { city: 'Barcelona', country: 'Spain' },
        },
      },
      {
        terms: ['madrid', 'españa', 'spain', 'madrí'],
        destination: {
          destinationId: 662,
          name: 'Madrid',
          type: 'CITY',
          location: { city: 'Madrid', country: 'Spain' },
        },
      },
      {
        terms: [
          'london',
          'londres',
          'reino unido',
          'uk',
          'england',
          'inglaterra',
        ],
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
        terms: ['buenos aires', 'argentina', 'baires', 'capital federal'],
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
      // Add more popular destinations
      {
        terms: ['amsterdam', 'holanda', 'países bajos', 'netherlands'],
        destination: {
          destinationId: 525,
          name: 'Amsterdam',
          type: 'CITY',
          location: { city: 'Amsterdam', country: 'Netherlands' },
        },
      },
      {
        terms: ['berlin', 'berlín', 'alemania', 'germany'],
        destination: {
          destinationId: 511,
          name: 'Berlin',
          type: 'CITY',
          location: { city: 'Berlin', country: 'Germany' },
        },
      },
      {
        terms: ['atenas', 'athens', 'grecia', 'greece'],
        destination: {
          destinationId: 496,
          name: 'Athens',
          type: 'CITY',
          location: { city: 'Athens', country: 'Greece' },
        },
      },
      {
        terms: ['bangkok', 'tailandia', 'thailand'],
        destination: {
          destinationId: 344,
          name: 'Bangkok',
          type: 'CITY',
          location: { city: 'Bangkok', country: 'Thailand' },
        },
      },
    ];

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    // First check for exact matches
    const exactMatches = predefinedDestinations.filter((item) =>
      item.terms.some((term) => term === lowerSearchTerm)
    );

    if (exactMatches.length > 0) {
      console.log(
        `Se encontraron ${exactMatches.length} destinos con coincidencia exacta`
      );
      return exactMatches.map((match) => match.destination);
    }

    // Then check for partial matches
    const partialMatches = predefinedDestinations.filter((item) =>
      item.terms.some(
        (term) =>
          lowerSearchTerm.includes(term) || term.includes(lowerSearchTerm)
      )
    );

    if (partialMatches.length > 0) {
      console.log(
        `Se encontraron ${partialMatches.length} destinos con coincidencia parcial`
      );
      return partialMatches.map((match) => match.destination);
    }

    // If no matches in predefined list, try with the API with timeout protection
    try {
      console.log('No se encontraron destinos predefinidos, intentando API...');
      const params = new URLSearchParams({
        searchTerm: searchTerm.trim(),
        includeDetails: 'true',
        language: 'es-ES',
      });

      const url = `/viator/destinations/search?${params.toString()}`;
      console.log(`Enviando solicitud a: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json;version=2.0',
          'Accept-Language': 'es-ES',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error searching destinations: ${response.status}`);
      }

      const data = await response.json();

      if (!data.destinations || data.destinations.length === 0) {
        console.warn('No se encontraron destinos en la API');
        return [];
      }

      const destinations = data.destinations;
      return destinations;
    } catch (apiError) {
      console.error('Error en la API de destinos:', apiError);

      // As a last resort, try to create a generic destination based on the search term
      return [
        {
          destinationId: parseInt(Math.random() * 10000), // Generate random ID for generic destination
          name: searchTerm.trim(),
          type: 'CITY',
          location: {
            city: searchTerm.trim(),
            country: 'Global',
          },
        },
      ];
    }
  } catch (error) {
    console.error('Error en búsqueda de destinos:', error);
    return []; // Devolver array vacío para mejorar experiencia de usuario
  }
};
// Improved function to get destination products with better error handling and fallbacks
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

    // Tracking successful strategies for analytics
    let successfulStrategy = 'none';

    // Improved strategies with better error handling and retry logic
    const strategies = [
      // Strategy 1: Use destination search with product codes
      async () => {
        console.log(
          `Estrategia 1: Búsqueda por destino para ${destinationName}`
        );

        const currentDate = new Date();
        const futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + 90); // Look ahead 90 days

        // Format dates as YYYY-MM-DD
        const formattedToday = currentDate.toISOString().split('T')[0];
        const formattedFuture = futureDate.toISOString().split('T')[0];

        const searchRequest = {
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

        // Apply optional filters if provided
        if (priceRange) {
          searchRequest.filtering.price = {
            min: priceRange.min || 0,
            max: priceRange.max || 1000,
          };
        }

        if (rating) {
          searchRequest.filtering.rating = rating;
        }

        console.log(
          `Request para products/search:`,
          JSON.stringify(searchRequest)
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          const response = await fetch('/viator/products/search', {
            method: 'POST',
            headers: {
              Accept: 'application/json;version=2.0',
              'Content-Type': 'application/json',
              'Accept-Language': 'es-ES',
            },
            body: JSON.stringify(searchRequest),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }

          const data = await response.json();

          if (!data.products || data.products.length === 0) {
            console.warn('No products found in response');
            return null;
          }

          successfulStrategy = 'products-search';
          return mapProductsToStandardFormat(
            data.products,
            destinationName,
            destinationId
          );
        } catch (err) {
          console.error('Error in strategy 1:', err);
          return null;
        }
      },

      // Strategy 2: Use the freetext search endpoint with destination name
      async () => {
        console.log(
          `Estrategia 2: Búsqueda de texto libre para ${destinationName}`
        );

        const cleanSearchTerm = destinationName.trim();
        const params = new URLSearchParams({
          text: cleanSearchTerm,
          start: 1,
          count: limit,
          currencyCode: 'USD',
          sortOrder: 'TOP_RATED',
        });

        const url = `/viator/search/freetext?${params.toString()}`;
        console.log(`Enviando solicitud a: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              Accept: 'application/json;version=2.0',
              'Accept-Language': 'es-ES',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }

          const data = await response.json();

          if (!data.data || data.data.length === 0) {
            console.warn('No results found in freetext search');
            return null;
          }

          successfulStrategy = 'freetext-search';

          // Map the freetext search results to standard format
          return data.data
            .filter((item) => item.productCode)
            .map((item) => ({
              productCode: item.productCode,
              title: item.title || `Tour en ${destinationName}`,
              description: item.shortDescription || item.description || '',
              price: {
                amount: item.price?.fromPrice || 0,
                currency: item.price?.currencyCode || 'USD',
              },
              rating: item.reviews?.combinedRating || 0,
              reviewCount: item.reviews?.totalReviews || 0,
              photoUrl: item.primaryImageUrl || '',
              backupPhotoUrl:
                'https://placehold.co/400x300/eee/999?text=Tour+Image',
              duration: item.duration || '',
              location: item.location || destinationName,
              productUrl: generateProductUrl(
                item.productCode,
                item.title,
                destinationName,
                destinationId
              ),
              destinationId: destinationId,
              destinationName: destinationName,
            }));
        } catch (err) {
          console.error('Error in strategy 2:', err);
          return null;
        }
      },

      // Strategy 3: For specific cities, use hardcoded data as fallback
      async () => {
        console.log(
          `Estrategia 3: Usar datos preprogramados para ${destinationName}`
        );
        return getHardcodedToursForCity(destinationName, destinationId);
      },
    ];

    // Try each strategy until one works
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

    // If we reach here, no strategy worked
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

      // Si ya tenemos suficientes tours, podemos parar
      if (allTours.length >= 24) {
        console.log(
          `Ya tenemos ${allTours.length} tours, detener búsqueda adicional`
        );
        break;
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
        { destinationId: 712, name: 'New York' },
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

    // Si aún no tenemos tours, devolver un array vacío
    if (allTours.length === 0) {
      console.warn('No se pudieron obtener tours de ningún destino');
      return [];
    }

    // Ordenar por calificación y luego por número de reseñas
    const sortedTours = allTours
      .sort((a, b) => {
        // Primero por calificación
        if (b.rating !== a.rating) return b.rating - a.rating;
        // Si tienen la misma calificación, ordenar por número de reseñas
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 8); // Limitar a 8 tours

    console.log(`Returning ${sortedTours.length} unique sorted tours`);
    return sortedTours;
  } catch (error) {
    console.error('Error getting top tours from destinations:', error);
    return [];
  }
};
// Función para verificar si una URL de imagen es válida
export const checkImageUrl = async (url) => {
  if (!url || !url.startsWith('http')) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response.ok;
  } catch (error) {
    console.warn(`Error checking image URL ${url}:`, error);
    return false;
  }
};

// Función para obtener información detallada de un producto específico
export const getProductDetails = async (productCode) => {
  try {
    if (!productCode) {
      throw new Error('No se proporcionó código de producto');
    }

    console.log(`Obteniendo detalles para el producto: ${productCode}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(`/viator/products/${productCode}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'es-ES',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error fetching product details: ${response.status}`);
    }

    const productData = await response.json();

    // Si no tenemos datos válidos, lanzar error
    if (!productData || !productData.productCode) {
      throw new Error('Datos de producto no válidos recibidos de la API');
    }

    // Formatear el producto según nuestro estándar
    return {
      productCode: productData.productCode,
      title: productData.title,
      description:
        productData.description || productData.shortDescription || '',
      highlights: productData.highlights || [],
      itinerary: productData.itinerary || [],
      price: {
        amount: productData.pricing?.summary?.fromPrice || 0,
        currency: productData.pricing?.summary?.currencyCode || 'USD',
      },
      rating: productData.reviews?.combinedAverageRating || 0,
      reviewCount: productData.reviews?.totalReviews || 0,
      photoUrl: getReliableImageUrl(productData),
      backupPhotoUrl: 'https://placehold.co/400x300/eee/999?text=Tour+Image',
      duration: productData.duration?.description || '',
      location:
        productData.location?.city && productData.location?.country
          ? `${productData.location.city}, ${productData.location.country}`
          : '',
      productUrl: generateProductUrl(
        productData.productCode,
        productData.title,
        productData.location?.city,
        productData.destinationId
      ),
      additionalImages: (productData.images || [])
        .slice(1, 6)
        .map(
          (img) =>
            img.variants?.find((v) => v.height >= 300 && v.height <= 500)
              ?.url ||
            img.variants?.[0]?.url ||
            ''
        )
        .filter((url) => url && url.startsWith('http')),
    };
  } catch (error) {
    console.error('Error getting product details:', error);
    throw error;
  }
};
