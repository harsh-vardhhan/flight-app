import { parseISO, isAfter, isBefore } from "date-fns";

// Types
export interface Flight {
  uuid: string;
  date: string;
  origin: string;
  destination: string;
  airline: string;
  time: string;
  duration: string;
  flight_type: string;
  price_inr: number;
  origin_country: string;
  destination_country: string;
  rain_probability: number;
  free_meal?: boolean;
}

export interface TripState {
  outbound: Flight | null;
  return: Flight | null;
}

export type LuggagePolicyDatabase = {
  [airlineName: string]: AirlineLuggagePolicy;
};

export interface AirlineLuggagePolicy {
  carryOn: { weight: string; free: boolean };
  checked: { weight: string; free: boolean; note?: string };
  extraCheckedOptions?: {
    weight: string;
    weightValue: number;
    beforeThreeHours: number;
    afterThreeHours: number;
  }[];
}

// State and Action types
export interface FlightListState {
  flights: Flight[];
  totalFlights: number;
  loading: boolean;
  loadingMore: boolean;
  page: number;
  hasMore: boolean;
  selectedOrigin: string | null;
  selectedDestination: string | null;
  baggageOption: "all" | "free" | "included";
  standardBaggageWeight: string;
  drySeason: boolean;
  priceFilter: boolean;
  sortByDate: boolean;
  trip: TripState;
  luggagePolicyVisible: boolean;
  selectedAirline: string;
  rainInfoVisible: boolean;
  selectedFlightForRainInfo: Flight | null;
}

export type FlightListAction =
  | { type: "SET_FLIGHTS"; payload: Flight[] }
  | { type: "SET_TOTAL_FLIGHTS"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOADING_MORE"; payload: boolean }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_HAS_MORE"; payload: boolean }
  | { type: "SET_ORIGIN"; payload: string | null }
  | { type: "SET_DESTINATION"; payload: string | null }
  | { type: "SET_BAGGAGE_OPTION"; payload: "all" | "free" | "included" }
  | { type: "SET_BAGGAGE_WEIGHT"; payload: string }
  | { type: "SET_DRY_SEASON"; payload: boolean }
  | { type: "SET_PRICE_FILTER"; payload: boolean }
  | { type: "TOGGLE_SORT_BY_DATE" }
  | {
      type: "SELECT_FLIGHT";
      payload: { flight: Flight; direction: "Outbound" | "Return" };
    }
  | { type: "REMOVE_FLIGHT"; payload: "Outbound" | "Return" }
  | { type: "OPEN_LUGGAGE_POLICY"; payload: string }
  | { type: "CLOSE_LUGGAGE_POLICY" }
  | { type: "OPEN_RAIN_INFO"; payload: Flight }
  | { type: "CLOSE_RAIN_INFO" }
  | { type: "RESET_LIST" }
  | { type: "APPEND_FLIGHTS"; payload: Flight[] };

// Constants
export const ITEMS_PER_PAGE = 20;

// Initial state
export const initialState: FlightListState = {
  flights: [],
  totalFlights: 0,
  loading: true,
  loadingMore: false,
  page: 1,
  hasMore: true,
  selectedOrigin: null,
  selectedDestination: null,
  baggageOption: "all",
  standardBaggageWeight: "20kg",
  drySeason: false,
  priceFilter: false,
  sortByDate: false,
  trip: {
    outbound: null,
    return: null,
  },
  luggagePolicyVisible: false,
  selectedAirline: "",
  rainInfoVisible: false,
  selectedFlightForRainInfo: null,
};

// Luggage policies data
export const luggagePolicies: LuggagePolicyDatabase = {
  "VietJet Air": {
    carryOn: { weight: "7kg", free: true },
    checked: { weight: "0kg", free: false, note: "Must purchase separately" },
    extraCheckedOptions: [
      {
        weight: "20kg",
        weightValue: 20,
        beforeThreeHours: 2030,
        afterThreeHours: 4060,
      },
      {
        weight: "30kg",
        weightValue: 30,
        beforeThreeHours: 3080,
        afterThreeHours: 5180,
      },
      {
        weight: "40kg",
        weightValue: 40,
        beforeThreeHours: 4060,
        afterThreeHours: 6160,
      },
      {
        weight: "50kg",
        weightValue: 50,
        beforeThreeHours: 5180,
        afterThreeHours: 7210,
      },
      {
        weight: "60kg",
        weightValue: 60,
        beforeThreeHours: 6160,
        afterThreeHours: 8210,
      },
      {
        weight: "70kg",
        weightValue: 70,
        beforeThreeHours: 7210,
        afterThreeHours: 10160,
      },
    ],
  },
  "Vietnam Airlines": {
    carryOn: { weight: "12kg", free: true },
    checked: { weight: "23kg", free: true },
  },
  "Air India": {
    carryOn: { weight: "7kg", free: true },
    checked: { weight: "25kg", free: true },
  },
};

// Reducer
export const flightListReducer = (
  state: FlightListState,
  action: FlightListAction,
): FlightListState => {
  switch (action.type) {
    case "SET_FLIGHTS":
      return { ...state, flights: action.payload };
    case "SET_TOTAL_FLIGHTS":
      return { ...state, totalFlights: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_LOADING_MORE":
      return { ...state, loadingMore: action.payload };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.payload };
    case "SET_ORIGIN":
      return { ...state, selectedOrigin: action.payload };
    case "SET_DESTINATION":
      return { ...state, selectedDestination: action.payload };
    case "SET_BAGGAGE_OPTION":
      return { ...state, baggageOption: action.payload };
    case "SET_BAGGAGE_WEIGHT":
      return { ...state, standardBaggageWeight: action.payload };
    case "SET_DRY_SEASON":
      return { ...state, drySeason: action.payload };
    case "SET_PRICE_FILTER":
      return { ...state, priceFilter: action.payload };
    case "TOGGLE_SORT_BY_DATE":
      return { ...state, sortByDate: !state.sortByDate };
    case "SELECT_FLIGHT": {
      const { flight, direction } = action.payload;
      const flightDate = parseISO(flight.date);
      const newTrip = { ...state.trip };

      if (direction === "Outbound") {
        if (
          state.trip.return &&
          isAfter(flightDate, parseISO(state.trip.return.date))
        ) {
          newTrip.return = null;
        }
        newTrip.outbound = flight;
      } else if (direction === "Return") {
        if (
          state.trip.outbound &&
          isBefore(flightDate, parseISO(state.trip.outbound.date))
        ) {
          newTrip.outbound = null;
        }
        newTrip.return = flight;
      }

      return { ...state, trip: newTrip };
    }
    case "REMOVE_FLIGHT": {
      const direction = action.payload.toLowerCase() as keyof TripState;
      return {
        ...state,
        trip: {
          ...state.trip,
          [direction]: null,
        },
      };
    }
    case "OPEN_LUGGAGE_POLICY":
      return {
        ...state,
        selectedAirline: action.payload,
        luggagePolicyVisible: true,
      };
    case "CLOSE_LUGGAGE_POLICY":
      return { ...state, luggagePolicyVisible: false };
    case "OPEN_RAIN_INFO":
      return {
        ...state,
        selectedFlightForRainInfo: action.payload,
        rainInfoVisible: true,
      };
    case "CLOSE_RAIN_INFO":
      return { ...state, rainInfoVisible: false };
    case "RESET_LIST":
      return {
        ...state,
        flights: [],
        page: 1,
        hasMore: true,
      };
    case "APPEND_FLIGHTS": {
      const combinedFlights = [...state.flights, ...action.payload];
      const uniqueFlightsMap = new Map(
        combinedFlights.map((flight) => [flight.uuid, flight]),
      );
      return {
        ...state,
        flights: Array.from(uniqueFlightsMap.values()),
      };
    }
    default:
      return state;
  }
};
