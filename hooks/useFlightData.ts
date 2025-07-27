import { useCallback, useReducer, useRef, useEffect, useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { parseISO, differenceInCalendarDays } from "date-fns";
import { fetchFlights } from "../app/utils/fetchFlights";
import {
  flightListReducer,
  initialState,
  Flight,
} from "../app/reducers/flightListReducer";

export const useFlightData = () => {
  const [state, dispatch] = useReducer(flightListReducer, initialState);
  const flashListRef = useRef<FlashList<Flight> | null>(null);

  // Calculate trip price and duration
  const { price, duration } = useMemo(() => {
    const outbound = state.trip.outbound;
    const returnFlight = state.trip.return;

    const outboundPrice = outbound?.price_inr || 0;
    const returnPrice = returnFlight?.price_inr || 0;
    const total = outboundPrice + returnPrice;

    let duration: number | null = null;
    if (outbound?.date && returnFlight?.date) {
      const startDate = parseISO(outbound.date);
      const endDate = parseISO(returnFlight.date);
      duration = differenceInCalendarDays(endDate, startDate);
    }

    return { price: total, duration };
  }, [state.trip.outbound, state.trip.return]);

  const loadFlightsWithPage = useCallback(
    async (page: number) => {
      try {
        if (page > 1) {
          dispatch({ type: "SET_LOADING_MORE", payload: true });
        } else {
          dispatch({ type: "SET_LOADING", payload: true });
        }

        const params: Record<string, string | number> = { page };
        if (state.selectedOrigin) params.origin = state.selectedOrigin;
        if (state.selectedDestination)
          params.destination = state.selectedDestination;
        if (state.drySeason) params.max_rain = 20;
        if (state.priceFilter) params.max_price = 10000;
        if (state.sortByDate) params.sort_by = "date";
        if (state.baggageOption === "free") {
          params.airline = "Vietnam Airlines,Air India";
        } else if (state.baggageOption === "included") {
          params.airline = "Vietjet";
        }

        const response = await fetchFlights(params);

        const totalCount = response.total_items;
        dispatch({ type: "SET_TOTAL_FLIGHTS", payload: totalCount });

        const flights = response.data;
        if (flights.length === 0) {
          dispatch({ type: "SET_HAS_MORE", payload: false });
          dispatch({ type: "SET_LOADING_MORE", payload: false });
          if (page === 1) dispatch({ type: "SET_FLIGHTS", payload: [] });
          return;
        }

        if (page === 1) {
          dispatch({ type: "SET_FLIGHTS", payload: flights });
        } else {
          dispatch({ type: "APPEND_FLIGHTS", payload: flights });
        }

        dispatch({ type: "SET_PAGE", payload: page });
        dispatch({
          type: "SET_HAS_MORE",
          payload: page < response.total_pages,
        });
      } catch (error) {
        console.error("Error loading flights:", error);
        dispatch({ type: "SET_HAS_MORE", payload: false });
      } finally {
        dispatch({ type: "SET_LOADING_MORE", payload: false });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [
      state.selectedOrigin,
      state.selectedDestination,
      state.baggageOption,
      state.drySeason,
      state.priceFilter,
      state.sortByDate,
    ],
  );

  const loadInitialFlights = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await loadFlightsWithPage(1);
    } catch (error) {
      console.error("Error loading initial flights:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [loadFlightsWithPage]);

  const resetAndReload = useCallback(async () => {
    dispatch({ type: "RESET_LIST" });
    if (flashListRef.current) {
      flashListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
    await loadFlightsWithPage(1);
  }, [loadFlightsWithPage]);

  const handleEndReached = useCallback(() => {
    if (!state.loadingMore && state.hasMore && !state.loading) {
      loadFlightsWithPage(state.page + 1);
    }
  }, [
    state.loadingMore,
    state.hasMore,
    state.page,
    state.loading,
    loadFlightsWithPage,
  ]);

  // Load initial flights on hook initialization
  useEffect(() => {
    loadInitialFlights();
  }, [loadInitialFlights]);

  // Reset and reload flights when filters change
  useEffect(() => {
    if (!state.loading) {
      resetAndReload();
    }
  }, [
    state.selectedOrigin,
    state.selectedDestination,
    state.baggageOption,
    state.drySeason,
    state.priceFilter,
    state.sortByDate,
    resetAndReload,
  ]);

  // Action creators for dispatch
  const actions = {
    setOrigin: (origin: string | null) =>
      dispatch({ type: "SET_ORIGIN", payload: origin }),
    setDestination: (destination: string | null) =>
      dispatch({ type: "SET_DESTINATION", payload: destination }),
    setBaggageOption: (option: "all" | "free" | "included") =>
      dispatch({ type: "SET_BAGGAGE_OPTION", payload: option }),
    setBaggageWeight: (weight: string) =>
      dispatch({ type: "SET_BAGGAGE_WEIGHT", payload: weight }),
    setDrySeason: (value: boolean) =>
      dispatch({ type: "SET_DRY_SEASON", payload: value }),
    setPriceFilter: (value: boolean) =>
      dispatch({ type: "SET_PRICE_FILTER", payload: value }),
    toggleSortByDate: () => dispatch({ type: "TOGGLE_SORT_BY_DATE" }),
    selectFlight: (flight: Flight, direction: "Outbound" | "Return") =>
      dispatch({ type: "SELECT_FLIGHT", payload: { flight, direction } }),
    removeFlight: (direction: "Outbound" | "Return") =>
      dispatch({ type: "REMOVE_FLIGHT", payload: direction }),
    openLuggagePolicy: (airline: string) =>
      dispatch({ type: "OPEN_LUGGAGE_POLICY", payload: airline }),
    closeLuggagePolicy: () => dispatch({ type: "CLOSE_LUGGAGE_POLICY" }),
    openRainInfo: (flight: Flight) =>
      dispatch({ type: "OPEN_RAIN_INFO", payload: flight }),
    closeRainInfo: () => dispatch({ type: "CLOSE_RAIN_INFO" }),
  };

  return {
    state,
    actions,
    flashListRef,
    handleEndReached,
    price,
    duration,
  };
};
