// "Interfaz" para las ubicaciones devueltas por /locationsBulk (como objeto base)
const LocationDetails = {
  locationId: 0,
  city: undefined,
  country: undefined,
  addressLine1: undefined,
  addressLine2: undefined,
};

// "Interfaz" para los destinos devueltos por /destinations/search
function Destination(
  destinationId,
  name,
  type,
  parentDestinationId,
  lookupId,
  latitude,
  longitude,
  photoUrl,
  location
) {
  return {
    destinationId,
    name,
    type,
    parentDestinationId,
    lookupId,
    latitude,
    longitude,
    photoUrl,
    location,
  };
}

function ImageVariant(height, width, url) {
  return { height, width, url };
}

function ProductImage(variants) {
  return { variants };
}

function PricingInfo(summary) {
  return { summary };
}

function ReviewInfo(combinedAverageRating, totalReviews) {
  return { combinedAverageRating, totalReviews };
}

function DurationInfo(description, duration) {
  return { description, duration };
}

function Product(
  productCode,
  title,
  description,
  price,
  rating,
  reviewCount,
  photoUrl,
  duration,
  location,
  productUrl
) {
  return {
    productCode,
    title,
    description,
    price,
    rating,
    reviewCount,
    photoUrl,
    duration,
    location,
    productUrl,
  };
}

function ProductSearchRequest(filtering, sorting, pagination, currency) {
  return { filtering, sorting, pagination, currency };
}

function ProductApiResponse(
  productCode,
  title,
  shortDescription,
  description,
  pricing,
  reviews,
  images,
  duration,
  location,
  bookingLink
) {
  return {
    productCode,
    title,
    shortDescription,
    description,
    pricing,
    reviews,
    images,
    duration,
    location,
    bookingLink,
  };
}

function ProductSearchResponse(products, totalCount, errorMessage) {
  return { products, totalCount, errorMessage };
}

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

  return `https://www.viator.com/es-ES/tours/${cleanDestinationName}/${cleanTitle}/d${destinationId}-${productCode}`;
};

// Obtener lista de destinos
export const getDestinations = async () => {
  try {
    const response = await fetch('/viator/destinations', {
      method: 'GET',
      headers: {
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'es-ES',
      },
    });
    if (!response.ok)
      throw new Error(`Error fetching destinations: ${response.status}`);
    const data = await response.json();
    console.log('Destinos obtenidos:', data.destinations);
    return data.destinations || [];
  } catch (error) {
    console.error('Error getting destinations:', error);
    throw error;
  }
};

// Buscar destinos según término de búsqueda
export const searchDestinations = async (searchTerm) => {
  try {
    const url = new URL('/viator/destinations/search', window.location.origin);
    const params = new URLSearchParams({
      searchTerm,
      includeDetails: 'true',
      language: 'es-ES',
    });
    url.search = params.toString();

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json;version=2.0',
        'Accept-Language': 'es-ES',
      },
    });
    if (!response.ok)
      throw new Error(`Error searching destinations: ${response.status}`);
    const data = await response.json();
    console.log('Respuesta de búsqueda de destinos:', data);

    if (!data.destinations) {
      throw new Error('No destinations found in the response');
    }

    const destinations = data.destinations;
    const destinationIds = destinations.map((dest) => dest.destinationId);

    if (destinationIds.length === 0) {
      return [];
    }

    const locationsResponse = await fetch('/viator/locationsBulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json;version=2.0',
      },
      body: JSON.stringify({ locationIds: destinationIds }),
    });
    if (!locationsResponse.ok)
      throw new Error(`Error fetching locations: ${locationsResponse.status}`);
    const locationsData = await locationsResponse.json();

    const locationsMap = new Map(
      locationsData.locations.map((loc) => [loc.locationId, loc])
    );

    const destinationsWithDetails = destinations.map((destination) => {
      let locationDetails;
      if (locationsMap.has(destination.destinationId)) {
        locationDetails = locationsMap.get(destination.destinationId);
      } else {
        locationDetails = {
          locationId: 0,
          city: undefined,
          country: undefined,
          addressLine1: undefined,
          addressLine2: undefined,
        };
      }
      return {
        ...destination,
        location: {
          city: locationDetails.city ?? '',
          country: locationDetails.country ?? '',
        },
      };
    });

    return destinationsWithDetails;
  } catch (error) {
    console.error('Error searching destinations:', error);
    return []; // Return empty array instead of throwing to improve UX
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
