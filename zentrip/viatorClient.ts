import axios, { AxiosResponse, AxiosError } from "axios";

const viatorApi = axios.create({
  baseURL: "/viator", // Usa el proxy definido en vite.config.ts
  headers: {
    Accept: "application/json;version=2.0",
    "Accept-Language": "es-ES",
  },
  params: {
    'exp-api-key': import.meta.env.VITE_VIATOR_API_KEY_PROD, // Usamos PROD como prioritario
  },
});

// Interceptor para debugging
viatorApi.interceptors.request.use((request) => {
  console.log("Starting Request:", {
    url: request.url,
    method: request.method,
    headers: request.headers,
    params: request.params,
  });
  return request;
});

viatorApi.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("Response:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error: AxiosError) => {
    console.error("API Error:", {
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

// Interfaces desde el backup
interface LocationDetails {
  locationId: number;
  city?: string;
  country?: string;
  addressLine1?: string;
  addressLine2?: string;
}

interface Destination {
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

const generateProductUrl = (productCode: string, title: string, destinationName: string, destinationId: number): string => {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[áäâà]/g, "a")
    .replace(/[éëêè]/g, "e")
    .replace(/[íïîì]/g, "i")
    .replace(/[óöôò]/g, "o")
    .replace(/[úüûù]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const cleanDestinationName = destinationName
    .toLowerCase()
    .trim()
    .replace(/[áäâà]/g, "a")
    .replace(/[éëêè]/g, "e")
    .replace(/[íïîì]/g, "i")
    .replace(/[óöôò]/g, "o")
    .replace(/[úüûù]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `https://www.viator.com/es-ES/tours/${cleanDestinationName}/${cleanTitle}/d${destinationId}-${productCode}`;
};

export const getDestinations = async (): Promise<Destination[]> => {
  try {
    const response = await viatorApi.get<{ destinations: Destination[] }>("/destinations");
    return response.data.destinations || [];
  } catch (error) {
    console.error("Error getting destinations:", error);
    throw error;
  }
};

export const searchDestinations = async (searchTerm: string): Promise<Destination[]> => {
  try {
    const response = await viatorApi.get<{ destinations: Destination[] }>("/destinations/search", {
      params: {
        searchTerm,
        includeDetails: true,
        language: "es-ES",
      },
    });

    console.log("API Response:", response.data);

    if (!response.data.destinations) {
      throw new Error("No destinations found in the response");
    }

    const destinations = response.data.destinations;
    const destinationIds = destinations.map((dest) => dest.destinationId);

    const locationsResponse = await viatorApi.post<{ locations: LocationDetails[] }>("/locationsBulk", {
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
          city: locationDetails?.city || "",
          country: locationDetails?.country || "",
        },
      };
    });

    return destinationsWithDetails;
  } catch (error) {
    console.error("Error searching destinations:", error);
    throw error;
  }
};

export const getDestinationProducts = async (destinationId: number, destinationName: string): Promise<Product[]> => {
  try {
    const response = await viatorApi.get<ProductSearchResponse>("/products/search");

    if (!response.data.products || response.data.products.length === 0) {
      return [];
    }

    return response.data.products.map((product: ProductApiResponse) => {
      if (!product.productCode || !product.title) {
        return null;
      }
      return {
        productCode: product.productCode,
        title: product.title,
        description: product.shortDescription || product.description || "",
        price: {
          amount: product.pricing?.summary?.fromPrice || 0,
          currency: product.pricing?.summary?.currencyCode || "USD",
        },
        rating: product.reviews?.combinedAverageRating || 0,
        reviewCount: product.reviews?.totalReviews || 0,
        photoUrl: product.images?.[0]?.variants?.find((v) => v.height === 400)?.url ||
                  product.images?.[0]?.variants?.[0]?.url || "",
        duration: product.duration?.description || "",
        location: [product.location?.city, product.location?.country].filter(Boolean).join(", "),
        productUrl: generateProductUrl(product.productCode, product.title, destinationName, destinationId),
      };
    }).filter((product): product is Product => product !== null);
  } catch (error) {
    console.error("Error getting destination products:", error);
    return [];
  }
};

export default viatorApi;