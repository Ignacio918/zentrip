import { useEffect, useState } from 'react';

// Interfaz para las ubicaciones devueltas por /locationsBulk
export interface LocationDetails {
  locationId: number;
  city?: string; // Confirmamos que es opcional
  country?: string; // Confirmamos que es opcional
  addressLine1?: string;
  addressLine2?: string;
}

// Interfaz para los destinos devueltos por /destinations/search
export interface Destination {
  destinationId: number;
  name: string;
  type: string;
  parentDestinationId?: number;
  lookupId?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  location?: {
    city?: string;
    country?: string;
  };
}

interface ImageVariant {
  height: number;
  width?: number;
  url: string;
}

interface ProductImage {
  variants: ImageVariant[];
}

interface PricingInfo {
  summary: {
    fromPrice: number;
    currencyCode: string;
  };
}

interface ReviewInfo {
  combinedAverageRating: number;
  totalReviews: number;
}

interface DurationInfo {
  description: string;
  duration?: string;
}

export interface Product {
  productCode: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  rating: number;
  reviewCount: number;
  photoUrl: string;
  duration: string;
  location: string;
  productUrl: string;
}

export interface ProductSearchRequest {
  filtering: {
    destination: string;
    tags?: number[];
    startDate?: string;
    endDate?: string;
    includeAutomaticTranslations?: boolean;
  };
  sorting: {
    sort: 'PRICE' | 'TRAVELER_RATING' | 'TOP_SELLERS';
    order: 'ASCENDING' | 'DESCENDING';
  };
  pagination: {
    start: number;
    count: number;
  };
  currency: string;
}

interface ProductApiResponse {
  productCode: string;
  title: string;
  shortDescription?: string;
  description?: string;
  pricing?: PricingInfo;
  reviews?: ReviewInfo;
  images?: ProductImage[];
  duration?: DurationInfo;
  location?: {
    city?: string;
    country?: string;
  };
  bookingLink?: string;
}

export interface ProductSearchResponse {
  products: ProductApiResponse[];
  totalCount: number;
  errorMessage?: string;
}

const generateProductUrl = (
  productCode: string,
  title: string,
  destinationName: string,
  destinationId: number
): string => {
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

export const getDestinations = async (): Promise<Destination[]> => {
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
    return data.destinations || [];
  } catch (error) {
    console.error('Error getting destinations:', error);
    throw error;
  }
};

export const searchDestinations = async (
  searchTerm: string
): Promise<Destination[]> => {
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
    console.log('API Response:', data);

    if (!data.destinations) {
      throw new Error('No destinations found in the response');
    }

    const destinations = data.destinations;
    const destinationIds = destinations.map((dest: { destinationId: any; }) => dest.destinationId);

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
      locationsData.locations.map((loc: LocationDetails) => [
        loc.locationId,
        loc,
      ])
    );

    const destinationsWithDetails = destinations.map((destination: { destinationId: unknown; }) => {
      let locationDetails: LocationDetails;
      if (locationsMap.has(destination.destinationId)) {
        const mapValue = locationsMap.get(destination.destinationId);
        locationDetails = mapValue as LocationDetails; // Asignación segura con aserción
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

export const getDestinationProducts = async (
  destinationId: number,
  destinationName: string
): Promise<Product[]> => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const searchRequest = {
      filtering: {
        destination: destinationId.toString(),
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // Fecha futura (mañana)
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
    const response = await fetch('/viator/products/search', {
      method: 'POST',
      headers: {
        Accept: 'application/json;version=2.0',
        'Content-Type': 'application/json',
        'Accept-Language': 'es-ES',
      },
      body: JSON.stringify(searchRequest),
    });
    if (!response.ok)
      throw new Error(`Error fetching products: ${response.status}`);
    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return [];
    }

    return data.products
      .map((product: ProductApiResponse) => {
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
      .filter((product: Product | null): product is Product => product !== null);
  } catch (error) {
    console.error('Error getting destination products:', error);
    return [];
  }
};

export default {
  getDestinations,
  searchDestinations,
  getDestinationProducts,
};
