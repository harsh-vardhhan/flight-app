import { useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { fetchFlights } from '../app/utils/fetchFlights';
import { Flight } from '../app/reducers/flightListReducer';

interface UseFlightDataProps {
  state: {
    selectedOrigin: string | null;
    selectedDestination: string | null;
    baggageOption: string;
    drySeason: boolean;
    priceFilter: boolean;
    sortByDate: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    loading: boolean;
    page: number;
  };
  dispatch: React.Dispatch<any>;
  flashListRef: React.RefObject<FlashList<Flight> | null>;
}

export const useFlightData = ({ state, dispatch, flashListRef }: UseFlightDataProps) => {
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
          params.airline = "VietJet Air";
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
      dispatch,
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
  }, [loadFlightsWithPage, dispatch]);

  const resetAndReload = useCallback(async () => {
    dispatch({ type: "RESET_LIST" });
    if (flashListRef.current) {
      flashListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
    await loadFlightsWithPage(1);
  }, [dispatch, flashListRef, loadFlightsWithPage]);

  const handleEndReached = useCallback(() => {
    if (!state.loadingMore && state.hasMore && !state.loading) {
      loadFlightsWithPage(state.page + 1);
    }
  }, [state.loadingMore, state.hasMore, state.page, state.loading, loadFlightsWithPage]);

  return {
    loadInitialFlights,
    resetAndReload,
    handleEndReached,
    loadFlightsWithPage,
  };
};