import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, useColorScheme } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface FlightFiltersProps {
  baggageOption: 'all' | 'free' | 'included';
  standardBaggageWeight: string;
  drySeason: boolean;
  priceFilter: boolean;
  onBaggageOptionChange: (option: 'all' | 'free' | 'included') => void;
  onBaggageWeightChange: (weight: string) => void;
  onDrySeasonToggle: (value: boolean) => void;
  onPriceFilterToggle: (value: boolean) => void;
  selectedDestination: string | null;
}

const FlightFilters: React.FC<FlightFiltersProps> = ({
  baggageOption,
  standardBaggageWeight,
  drySeason,
  priceFilter,
  onBaggageOptionChange,
  onBaggageWeightChange,
  onDrySeasonToggle,
  onPriceFilterToggle,
  selectedDestination,
}) => {
  const [baggageWeightModalVisible, setBaggageWeightModalVisible] = useState(false);

  // Check if selected destination is Hanoi, Ho Chi Minh City, or Da Nang
  const shouldShowDrySeasonToggle = selectedDestination === "Hanoi" || selectedDestination === "Ho Chi Minh City" || selectedDestination === "Da Nang";

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const styles = StyleSheet.create({
    filtersContainer: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      backgroundColor: isDarkMode ? '#1C2526' : 'transparent',
    },
    segmentedControlContainer: {
      flexDirection: 'row',
      marginBottom: 10,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDarkMode ? '#4A90E2' : '#0066cc',
    },
    segmentButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2C3A3B' : '#e8f1fc',
    },
    selectedSegmentButton: {
      backgroundColor: isDarkMode ? '#4A90E2' : '#0066cc',
    },
    segmentButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: isDarkMode ? '#E0E0E0' : '#004080',
    },
    selectedSegmentButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    weightSelectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#2C3A3B' : '#f0f0f0',
      marginRight: 8,
      marginBottom: 10,
    },
    weightSelectorText: {
      marginLeft: 4,
      marginRight: 4,
      color: isDarkMode ? '#E0E0E0' : '#333',
      fontSize: 12,
      fontWeight: '500',
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#2C3A3B' : '#f0f0f0',
      marginRight: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2C3A3B' : '#e0e0e0',
    },
    selectedFilterButton: {
      backgroundColor: isDarkMode ? '#2A4D3E' : '#e6f7e6',
      borderColor: isDarkMode ? '#66BB6A' : '#b3e6b3',
    },
    filterButtonText: {
      marginLeft: 4,
      color: isDarkMode ? '#A0A0A0' : '#555',
      fontSize: 12,
      fontWeight: '500',
    },
    selectedFilterButtonText: {
      color: isDarkMode ? '#66BB6A' : '#00a000',
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: isDarkMode ? '#1C2526' : 'white',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2C3A3B' : '#e0e0e0',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#E0E0E0' : '#333',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2C3A3B' : '#e0e0e0',
    },
    selectedModalItem: {
      backgroundColor: isDarkMode ? '#4A90E2' : '#0066cc',
    },
    modalItemText: {
      fontSize: 16,
      color: isDarkMode ? '#E0E0E0' : '#333',
    },
    selectedModalItemText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });  

  return (
    <View style={styles.filtersContainer}>
      {/* Baggage Option Segment Control */}
      <View style={styles.segmentedControlContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            baggageOption === 'all' && styles.selectedSegmentButton,
            { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }
          ]}
          onPress={() => onBaggageOptionChange('all')}
        >
          <Text style={[
            styles.segmentButtonText,
            baggageOption === 'all' && styles.selectedSegmentButtonText
          ]}>
            All Flights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            baggageOption === 'free' && styles.selectedSegmentButton
          ]}
          onPress={() => onBaggageOptionChange('free')}
        >
          <Text style={[
            styles.segmentButtonText,
            baggageOption === 'free' && styles.selectedSegmentButtonText
          ]}>
            Free Checked-In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            baggageOption === 'included' && styles.selectedSegmentButton,
            { borderTopRightRadius: 20, borderBottomRightRadius: 20 }
          ]}
          onPress={() => onBaggageOptionChange('included')}
        >
          <Text style={[
            styles.segmentButtonText,
            baggageOption === 'included' && styles.selectedSegmentButtonText
          ]}>
            Paid Checked-In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Baggage Weight Selector - Only visible when baggageOption is 'included' */}
      {baggageOption === 'included' && (
        <TouchableOpacity
          style={styles.weightSelectorButton}
          onPress={() => setBaggageWeightModalVisible(true)}
        >
          <Ionicons name="briefcase-outline" size={16} color={isDarkMode ? '#E0E0E0' : '#333'} />
          <Text style={styles.weightSelectorText}>{standardBaggageWeight}</Text>
          <Ionicons name="chevron-down" size={14} color={isDarkMode ? '#E0E0E0' : '#333'} />
        </TouchableOpacity>
      )}

      {/* Dry Season Toggle - Only visible for Hanoi, Ho Chi Minh City, or Da Nang */}
      {shouldShowDrySeasonToggle && (
        <TouchableOpacity
          style={[
            styles.filterButton,
            drySeason && styles.selectedFilterButton
          ]}
          onPress={() => onDrySeasonToggle(!drySeason)}
        >
          <Ionicons
            name="sunny-outline"
            size={16}
            color={drySeason ? '#66BB6A' : (isDarkMode ? '#A0A0A0' : '#555')}
          />
          <Text style={[
            styles.filterButtonText,
            drySeason && styles.selectedFilterButtonText
          ]}>
            Dry Season
          </Text>
        </TouchableOpacity>
      )}

      {/* Under ₹10,000 Filter Button */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          priceFilter && styles.selectedFilterButton
        ]}
        onPress={() => onPriceFilterToggle(!priceFilter)}
      >
        <Ionicons
          name="pricetag-outline"
          size={16}
          color={priceFilter ? '#66BB6A' : (isDarkMode ? '#A0A0A0' : '#555')}
        />
        <Text style={[
          styles.filterButtonText,
          priceFilter && styles.selectedFilterButtonText
        ]}>
          Under ₹10,000
        </Text>
      </TouchableOpacity>

      {/* Baggage Weight Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={baggageWeightModalVisible}
        onRequestClose={() => setBaggageWeightModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Baggage Weight</Text>
              <TouchableOpacity onPress={() => setBaggageWeightModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#E0E0E0' : '#333'} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={['20kg', '30kg', '40kg', '50kg', '60kg', '70kg']}
              keyExtractor={(item) => `weight-${item}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    standardBaggageWeight === item && styles.selectedModalItem
                  ]}
                  onPress={() => {
                    onBaggageWeightChange(item);
                    setBaggageWeightModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    standardBaggageWeight === item && styles.selectedModalItemText
                  ]}>
                    {item}
                  </Text>
                  {standardBaggageWeight === item && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};


export default FlightFilters;