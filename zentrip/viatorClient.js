import axios from 'axios';

const viatorApi = axios.create({
  baseURL: '/api/viator-tours', // Proxy en Vercel
  headers: {
    Accept: 'application/json;version=2.0',
    'Accept-Language': 'es-ES',
  },
  params: {
    'exp-api-key': import.meta.env.VITE_VIATOR_API_KEY_SANDBOX, // Parámetro de consulta
  },
});

// Interceptor para debugging
viatorApi.interceptors.request.use((request) => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    params: request.params,
  });
  return request;
});

viatorApi.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
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
    const response = await viatorApi.get(''); // Vacío porque baseURL incluye el endpoint

    if (!response.data.productos || response.data.productos.length === 0) {
      return [];
    }

    return response.data.productos
      .map((product) => {
        if (!product.productCode || !product.title) {
          return null;
        }
        return {
          productCode: product.productCode,
          title: product.title,
          description: product.description || '',
          price: {
            amount: product.precios?.resumen?.desdePrecio || 0,
            currency: product.precios?.moneda || 'USD',
          },
          rating: product.reseñas?.calificaciónPromedioCombinada || 0,
          reviewCount: product.reseñas?.reseñasTotales || 0,
          photoUrl:
            product.images?.[0]?.variants?.find((v) => v.alto === 400)?.url ||
            product.images?.[0]?.variants?.[0]?.url ||
            '',
          duration: '', // No está en el ejemplo, podrías inferirlo si está disponible
          location: product.destinos?.[0]?.ref || '',
          productUrl:
            product.productUrl ||
            generateProductUrl(
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
