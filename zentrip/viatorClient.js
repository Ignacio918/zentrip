import axios from 'axios';

const viatorApi = axios.create({
  baseURL: '/viator',
  headers: {
    Accept: 'application/json;version=2.0', // Añadido según la documentación
    'Content-Type': 'application/json',
    'Accept-Language': 'es-ES',
    Authorization: `Bearer ${import.meta.env.VITE_VIATOR_API_KEY_SANDBOX}`,
  },
});

// Interceptor para debugging
viatorApi.interceptors.request.use((request) => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data,
  });
  return request;
});

viatorApi.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });
    return Promise.reject(error);
  }
);

// Funciones convertidas a JavaScript
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

export const getDestinations = async () => {
  try {
    const response = await viatorApi.get('/destinations');
    return response.data.destinations || [];
  } catch (error) {
    console.error('Error getting destinations:', error);
    throw error;
  }
};

export const searchDestinations = async (searchTerm) => {
  try {
    const response = await viatorApi.get('/destinations/search', {
      params: {
        searchTerm,
        includeDetails: true,
        language: 'es-ES',
      },
    });

    console.log('API Response:', response.data);

    if (!response.data.destinations) {
      throw new Error('No destinations found in the response');
    }

    const destinations = response.data.destinations;
    const destinationIds = destinations.map((dest) => dest.destinationId);

    const locationsResponse = await viatorApi.post('/locationsBulk', {
      locationIds: destinationIds,
    });

    const locationsMap = new Map(
      locationsResponse.data.locations.map((loc) => [loc.locationId, loc])
    );

    const destinationsWithDetails = destinations.map((destination) => {
      const locationDetails = locationsMap.get(destination.destinationId);
      return {
        ...destination,
        location: {
          city: locationDetails?.city || '',
          country: locationDetails?.country || '',
        },
      };
    });

    return destinationsWithDetails;
  } catch (error) {
    console.error('Error searching destinations:', error);
    throw error;
  }
};

export const getDestinationProducts = async (
  destinationId,
  destinationName
) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const searchRequest = {
      filtering: {
        destination: destinationId.toString(),
        startDate: currentDate,
        endDate: thirtyDaysFromNow,
        includeAutomaticTranslations: true,
      },
      sorting: {
        sort: 'TRAVELER_RATING',
        order: 'DESCENDING',
      },
      pagination: {
        start: 1,
        count: 20,
      },
      currency: 'USD',
    };
    const response = await viatorApi.post('/products/search', searchRequest);

    if (!response.data.products || response.data.products.length === 0) {
      return [];
    }

    return response.data.products
      .map((product) => {
        if (!product.productCode || !product.title) {
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
            destinationId
          ),
        };
      })
      .filter((product) => product !== null);
  } catch (error) {
    console.error('Error getting destination products:', error);
    return [];
  }
};

export default viatorApi;
