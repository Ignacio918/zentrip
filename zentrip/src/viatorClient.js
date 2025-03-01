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
    throw error;
  }
};

// Obtener los mejores tours de una lista de destinos
export const getTopToursFromDestinations = async (
  destinations = [],
  limitPerDestination = 4
) => {
  try {
    const allTours = await Promise.all(
      destinations.map(async (dest) => {
        const products = await getDestinationProducts({
          destinationId: dest.id,
          destinationName: dest.name,
          limit: limitPerDestination,
        });
        console.log(`Tours desde ${dest.name} (ID: ${dest.id}):`, products); // Depuración por destino
        return products.map((product) => ({
          ...product,
          destinationId: dest.id,
          destinationName: dest.name,
        }));
      })
    );
    // Combinar todos los tours y eliminar duplicados por productCode
    const flattenedTours = allTours.flat().filter(Boolean);
    const uniqueTours = Array.from(
      new Map(flattenedTours.map((tour) => [tour.productCode, tour])).values()
    );
    // Ordenar por rating y limitar a 8
    return uniqueTours
      .sort((a, b) => b.rating - a.rating) // Ordenar por rating descendente
      .slice(0, 8); // Limitar a 8 tours
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
    const currentDate = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const searchRequest = {
      filtering: {
        ...(destinationId && { destination: destinationId.toString() }),
        startDate: currentDate,
        endDate: thirtyDaysFromNow,
        includeAutomaticTranslations: true,
        ...(priceRange && {
          priceRange: { min: priceRange.min, max: priceRange.max },
        }),
        ...(duration && { duration }),
        ...(rating && { minimumRating: rating }),
      },
      sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
      pagination: { start: 1, count: limit },
      currency: 'USD',
    };

    console.log('Solicitud enviada a Viator:', searchRequest);

    const response = await fetch('/viator/products/search', {
      method: 'POST',
      headers: {
        Accept: 'application/json;version=2.0',
        'Content-Type': 'application/json',
        'Accept-Language': 'es-ES',
      },
      body: JSON.stringify(searchRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error HTTP: ${response.status} - ${errorText}`);
      throw new Error(
        `Error fetching products: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log('Respuesta completa de Viator:', data);

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
          description: product.shortDescription || product.description || '',
          price: {
            amount: product.pricing?.summary?.fromPrice || 0,
            currency: product.pricing?.summary?.currencyCode || 'USD',
          },
          rating: product.reviews?.combinedAverageRating || 0,
          reviewCount: product.reviews?.totalReviews || 0,
          photoUrl:
            product.images?.[0]?.variants?.find((v) => v.height === 400)?.url ||
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
  } catch (error) {
    console.error('Error getting destination products:', error);
    return [];
  }
};

export default {
  getDestinations,
  searchDestinations,
  getDestinationProducts,
  getTopToursFromDestinations,
};
