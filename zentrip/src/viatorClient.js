// Constantes y definiciones de tipos

// "Interfaz" para las ubicaciones devueltas por /locationsBulk (como objeto base)
const LocationDetails = {
  locationId: 0,
  city: undefined,
  country: undefined,
  addressLine1: undefined,
  addressLine2: undefined,
};

// Función para generar URLs limpias para productos con parámetro de afiliado
const generateProductUrl = (
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

  // Puedes actualizar este valor cuando tengas tu código de afiliado de Viator
  const affiliateParam = 'partner_source=zentrip';

  return `https://www.viator.com/es-ES/tours/${cleanDestinationName}/${cleanTitle}/d${destinationId}-${productCode}?${affiliateParam}`;
};

// Obtener lista de destinos
export const getDestinations = async () => {
  try {
    console.log('Obteniendo lista de destinos...');
    const response = await fetch('/viator/destinations', {
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

    // Si no encontramos coincidencias predefinidas, intentamos con la API real
    try {
      const params = new URLSearchParams({
        searchTerm: searchTerm.trim(),
        includeDetails: 'true',
        language: 'es-ES',
      });

      const url = `/viator/destinations/search?${params.toString()}`;
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
        const errorText = await response.text();
        console.error(
          `Error en búsqueda de destinos: ${response.status} - ${errorText}`
        );
        throw new Error(`Error searching destinations: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        `Búsqueda encontró ${data.destinations?.length || 0} destinos`
      );

      if (!data.destinations || data.destinations.length === 0) {
        console.warn('No se encontraron destinos');
        return [];
      }

      const destinations = data.destinations;

      // Si no hay IDs de destino, devolvemos la lista sin detalles adicionales
      if (destinations.length === 0) {
        return [];
      }

      const destinationIds = destinations.map((dest) => dest.destinationId);

      try {
        // Obtener detalles adicionales de ubicación
        console.log(
          `Solicitando detalles para ${destinationIds.length} ubicaciones`
        );
        const locationsResponse = await fetch('/viator/locations/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json;version=2.0',
          },
          body: JSON.stringify({ locationIds: destinationIds }),
          signal: AbortSignal.timeout(15000),
        });

        if (!locationsResponse.ok) {
          console.warn(
            `Error obteniendo detalles de ubicación: ${locationsResponse.status}`
          );
          // Continuamos sin detalles adicionales
          return destinations.map((dest) => ({
            ...dest,
            location: { city: dest.name, country: '' },
          }));
        }

        const locationsData = await locationsResponse.json();
        console.log(
          `Recibidos detalles para ${locationsData.locations?.length || 0} ubicaciones`
        );

        // Crear un mapa de ubicaciones por ID para fácil acceso
        const locationsMap = new Map();
        if (locationsData.locations && locationsData.locations.length > 0) {
          locationsData.locations.forEach((loc) => {
            locationsMap.set(loc.locationId, loc);
          });
        }

        // Combinar destinos con detalles de ubicación
        return destinations.map((dest) => {
          const locationDetails = locationsMap.get(dest.destinationId) || {
            city: dest.name || '',
            country: '',
          };

          return {
            ...dest,
            location: {
              city: locationDetails.city || dest.name || '',
              country: locationDetails.country || '',
            },
          };
        });
      } catch (locError) {
        console.warn('Error obteniendo detalles de ubicación:', locError);
        // En caso de error, devolvemos los destinos sin detalles adicionales
        return destinations.map((dest) => ({
          ...dest,
          location: { city: dest.name || '', country: '' },
        }));
      }
    } catch (apiError) {
      console.error('Error en la API de destinos:', apiError);
      return []; // Devolver vacío si la API falla
    }
  } catch (error) {
    console.error('Error en búsqueda de destinos:', error);
    return []; // Devolver array vacío para mejorar experiencia de usuario
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

    // Track unique product codes to avoid duplicates across destinations
    const uniqueProductCodes = new Set();
    const allTours = [];

    // Process destinations sequentially to better handle errors and track progress
    for (const dest of destinations) {
      try {
        console.log(`Fetching tours from ${dest.name} (ID: ${dest.id})...`);
        const products = await getDestinationProducts({
          destinationId: dest.id,
          destinationName: dest.name,
          limit: limitPerDestination,
        });

        console.log(`Received ${products.length} tours from ${dest.name}`);

        // Add only unique products
        for (const product of products) {
          if (!uniqueProductCodes.has(product.productCode)) {
            uniqueProductCodes.add(product.productCode);
            allTours.push({
              ...product,
              destinationId: dest.id,
              destinationName: dest.name,
            });
          }
        }
      } catch (err) {
        console.warn(`Error fetching tours for ${dest.name}:`, err);
        // Continue with next destination
      }
    }

    // If we have very few tours, try fallback destinations
    if (allTours.length < 8) {
      const fallbackDestinations = [
        { id: 732, name: 'Paris' }, // Paris is reliable
        { id: 684, name: 'Barcelona' }, // Barcelona as backup
        { id: 662, name: 'Madrid' }, // Madrid as backup
        { id: 687, name: 'London' }, // London as backup
        { id: 546, name: 'Rome' }, // Rome as backup
      ];

      console.log(
        `Only found ${allTours.length} tours, trying fallback destinations`
      );

      for (const fallbackDest of fallbackDestinations) {
        // Skip if we already have enough tours
        if (allTours.length >= 8) break;

        // Skip if this destination was already in the original list
        if (destinations.some((d) => d.id === fallbackDest.id)) continue;

        try {
          console.log(
            `Trying fallback destination ${fallbackDest.name} (ID: ${fallbackDest.id})`
          );
          const fallbackTours = await getDestinationProducts({
            destinationId: fallbackDest.id,
            destinationName: fallbackDest.name,
            limit: 8 - allTours.length,
          });

          for (const tour of fallbackTours) {
            if (!uniqueProductCodes.has(tour.productCode)) {
              uniqueProductCodes.add(tour.productCode);
              allTours.push({
                ...tour,
                destinationId: fallbackDest.id,
                destinationName: fallbackDest.name,
              });
            }

            // Stop if we have enough tours
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

    // Sort by rating and limit to 8 tours
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
    // Add retry logic
    const fetchWithRetry = async (retries = 2) => {
      try {
        // Expand date range to get more results
        const currentDate = new Date().toISOString().split('T')[0];
        const ninetyDaysFromNow = new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0];

        // Build appropriate filters based on parameters
        const filters = {
          destination: destinationId.toString(),
          startDate: currentDate,
          endDate: ninetyDaysFromNow,
          includeAutomaticTranslations: true,
        };

        // Only add filters if they're actually provided
        if (
          priceRange &&
          (priceRange.min !== undefined || priceRange.max !== undefined)
        ) {
          filters.priceRange = {
            min: priceRange.min ?? 0,
            max: priceRange.max ?? 1000,
          };
        }

        if (duration) {
          filters.duration = duration;
        }

        if (rating && rating > 0) {
          filters.minimumRating = rating;
        }

        const searchRequest = {
          filtering: filters,
          sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
          pagination: { start: 1, count: limit },
          currency: 'USD',
        };

        console.log(
          `Requesting products for ${destinationName} (ID: ${destinationId})`,
          searchRequest
        );

        const response = await fetch('/viator/products/search', {
          method: 'POST',
          headers: {
            Accept: 'application/json;version=2.0',
            'Content-Type': 'application/json',
            'Accept-Language': 'es-ES',
          },
          body: JSON.stringify(searchRequest),
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(20000), // Increased timeout
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error HTTP: ${response.status} - ${errorText}`);
          throw new Error(
            `Error fetching products: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log(
          `Received ${data.products?.length || 0} products for ${destinationName}`
        );

        if (!data.products || data.products.length === 0) {
          console.warn('No products found in response:', data);
          return [];
        }

        return data.products
          .map((product) => {
            if (!product.productCode || !product.title) {
              console.warn('Producto inválido encontrado:', product);
              return null;
            }
            return {
              productCode: product.productCode,
              title: product.title,
              description:
                product.shortDescription || product.description || '',
              price: {
                amount: product.pricing?.summary?.fromPrice || 0,
                currency: product.pricing?.summary?.currencyCode || 'USD',
              },
              rating: product.reviews?.combinedAverageRating || 0,
              reviewCount: product.reviews?.totalReviews || 0,
              photoUrl:
                product.images?.[0]?.variants?.find((v) => v.height === 400)
                  ?.url ||
                product.images?.[0]?.variants?.[0]?.url ||
                '',
              duration: product.duration?.description || '',
              location: [product.location?.city, product.location?.country]
                .filter(Boolean)
                .join(', '),
              productUrl: generateProductUrl(
                product.productCode,
                product.title,
                destinationName,
                destinationId || 0
              ),
            };
          })
          .filter((product) => product !== null);
      } catch (err) {
        if (retries > 0) {
          console.log(
            `Retrying API call for ${destinationName}, ${retries} attempts left`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
          return fetchWithRetry(retries - 1);
        }
        throw err;
      }
    };

    return await fetchWithRetry();
  } catch (error) {
    console.error(`Error getting products for ${destinationName}:`, error);
    return [];
  }
};

export default {
  getDestinations,
  searchDestinations,
  getDestinationProducts,
  getTopToursFromDestinations,
};
