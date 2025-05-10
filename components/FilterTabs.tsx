import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import FlightFilters from './FlightFilters';
import LocationSelector from './LocationSelector';

interface FilterTabsProps {
  uniqueCities: string[];
  selectedOrigin: string | null;
  selectedDestination: string | null;
  baggageOption: 'all' | 'free' | 'included';
  standardBaggageWeight: string;
  drySeason: boolean;
  priceFilter: boolean;
  routes: Array<{ origin: string; destination: string }>;
  onOriginSelect: (origin: string) => void;
  onDestinationSelect: (destination: string) => void;
  onBaggageOptionChange: (option: 'all' | 'free' | 'included') => void;
  onBaggageWeightChange: (weight: string) => void;
  onDrySeasonToggle: (value: boolean) => void;
  onPriceFilterToggle: (value: boolean) => void;
}


const FilterTabs: React.FC<FilterTabsProps> = ({
  uniqueCities,
  selectedOrigin,
  selectedDestination,
  baggageOption,
  standardBaggageWeight,
  drySeason,
  priceFilter,
  routes,
  onOriginSelect,
  onDestinationSelect,
  onBaggageOptionChange,
  onBaggageWeightChange,
  onDrySeasonToggle,
  onPriceFilterToggle
}) => {
  const availableDestinations = selectedOrigin
    ? [...new Set(routes.filter(r => r.origin === selectedOrigin).map(r => r.destination))]
    : [];

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    filterContainer: {
      padding: 16,
      backgroundColor: isDarkMode ? '#1C2526' : 'white',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2C3A3B' : '#e0e0e0',
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode ? '#2C3A3B' : '#e0e0e0',
      marginVertical: 15,
    }
  });

  return (
    <View style={styles.filterContainer}>
      <LocationSelector
        uniqueCities={uniqueCities}
        selectedOrigin={selectedOrigin}
        selectedDestination={selectedDestination}
        availableDestinations={availableDestinations}
        onOriginSelect={onOriginSelect}
        onDestinationSelect={onDestinationSelect}
      />
      <View style={styles.divider} />
      <FlightFilters
        baggageOption={baggageOption}
        standardBaggageWeight={standardBaggageWeight}
        drySeason={drySeason}
        priceFilter={priceFilter}
        onBaggageOptionChange={onBaggageOptionChange}
        onBaggageWeightChange={onBaggageWeightChange}
        onDrySeasonToggle={onDrySeasonToggle}
        onPriceFilterToggle={onPriceFilterToggle}
        selectedDestination={selectedDestination}
      />
    </View>
  );
};

export default React.memo(FilterTabs);

