const BASE_URL = 'https://flight-price-api-hg5r.onrender.com/api/flights';

export interface Flight {
  uuid: string;
  date: string;
  origin: string;
  destination: string;
  airline: string;
  time: string;
  duration: string;
  flightType: string;
  price_inr: number;
  originCountry: string;
  destinationCountry: string;
  rain_probability: number;
  free_meal?: boolean;
}

export interface FlightResponse {
  data: Flight[];
  page: number;
  total_pages: number;
  total_items: number;
}

/**
 * Fetches paginated flight data from the REST API with optional filters
 */
export async function fetchFlights(params: Record<string, string | number> = {}): Promise<FlightResponse> {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      query.append(key, value.toString());
    });

    const url = `${BASE_URL}?${query.toString()}`;
    console.log('Fetching flights from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch flights: ${response.statusText}`);
    }

    const rawData = await response.json();
    
    // Transform price_inr to price_inr for consistency with existing code
    const transformedData: FlightResponse = {
      ...rawData,
      data: rawData.data.map((flight: any) => ({
        ...flight,
      }))
    };

    console.log(`Fetched ${transformedData.data.length} flights for page ${transformedData.page}`);
    return transformedData;
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error;
  }
}