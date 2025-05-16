import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from './../hooks/useTheme';

interface LocationSelectorProps {
  uniqueCities: string[];
  selectedOrigin: string | null;
  selectedDestination: string | null;
  availableDestinations: string[];
  onOriginSelect: (origin: string) => void;
  onDestinationSelect: (destination: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  uniqueCities,
  selectedOrigin,
  selectedDestination,
  availableDestinations,
  onOriginSelect,
  onDestinationSelect,
}) => {
  const [originModalVisible, setOriginModalVisible] = useState(false);
  const [destinationModalVisible, setDestinationModalVisible] = useState(false);

  const { isDarkMode } = useTheme();

  const handleSwapLocations = () => {
    if (selectedOrigin && selectedDestination) {
      onOriginSelect(selectedDestination);
      onDestinationSelect(selectedOrigin);
    }
  };

  const styles = StyleSheet.create({
    locationSelectorContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dropdownButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDarkMode ? "#2C3A3B" : "#e0e0e0",
      borderRadius: 8,
      padding: 10,
      backgroundColor: isDarkMode ? "#2C3A3B" : "white",
    },
    dropdownLabel: {
      fontSize: 12,
      color: isDarkMode ? "#A0A0A0" : "#666",
      marginBottom: 4,
    },
    dropdownValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dropdownValue: {
      fontSize: 14,
      color: isDarkMode ? "#E0E0E0" : "#333",
      fontWeight: "500",
    },
    disabledText: {
      color: isDarkMode ? "#4A5657" : "#aaa",
    },
    swapButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "#2C3A3B" : "#f5f5f5",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 8,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: isDarkMode ? "#1C2526" : "white",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "70%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#2C3A3B" : "#e0e0e0",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#2C3A3B" : "#e0e0e0",
    },
    selectedModalItem: {
      backgroundColor: isDarkMode ? "#4A90E2" : "#0066cc",
    },
    modalItemText: {
      fontSize: 16,
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    selectedModalItemText: {
      color: "white",
      fontWeight: "bold",
    },
  });

  return (
    <View style={styles.locationSelectorContainer}>
      {/* Origin Dropdown */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setOriginModalVisible(true)}
      >
        <Text style={styles.dropdownLabel}>From</Text>
        <View style={styles.dropdownValueContainer}>
          <Text style={styles.dropdownValue}>
            {selectedOrigin || "Select Origin"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={isDarkMode ? "#E0E0E0" : "#333"}
          />
        </View>
      </TouchableOpacity>

      {/* Swap Button */}
      <TouchableOpacity
        style={styles.swapButton}
        onPress={handleSwapLocations}
        disabled={!selectedOrigin || !selectedDestination}
      >
        <Ionicons
          name="swap-horizontal"
          size={20}
          color={
            selectedOrigin && selectedDestination
              ? isDarkMode
                ? "#4A90E2"
                : "#0066cc"
              : isDarkMode
                ? "#4A5657"
                : "#aaa"
          }
        />
      </TouchableOpacity>

      {/* Destination Dropdown */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDestinationModalVisible(true)}
        disabled={!selectedOrigin}
      >
        <Text style={styles.dropdownLabel}>To</Text>
        <View style={styles.dropdownValueContainer}>
          <Text
            style={[
              styles.dropdownValue,
              !selectedOrigin && styles.disabledText,
            ]}
          >
            {selectedDestination || "Select Destination"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={
              selectedOrigin
                ? isDarkMode
                  ? "#E0E0E0"
                  : "#333"
                : isDarkMode
                  ? "#4A5657"
                  : "#aaa"
            }
          />
        </View>
      </TouchableOpacity>

      {/* Origin Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={originModalVisible}
        onRequestClose={() => setOriginModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Origin</Text>
              <TouchableOpacity onPress={() => setOriginModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? "#E0E0E0" : "#333"}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={uniqueCities}
              keyExtractor={(item) => `origin-${item}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedOrigin === item && styles.selectedModalItem,
                  ]}
                  onPress={() => {
                    onOriginSelect(item);
                    setOriginModalVisible(false);
                    if (selectedDestination === item) {
                      onDestinationSelect(null);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedOrigin === item && styles.selectedModalItemText,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedOrigin === item && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Destination Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={destinationModalVisible}
        onRequestClose={() => setDestinationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Destination</Text>
              <TouchableOpacity
                onPress={() => setDestinationModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? "#E0E0E0" : "#333"}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableDestinations}
              keyExtractor={(item) => `dest-${item}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedDestination === item && styles.selectedModalItem,
                  ]}
                  onPress={() => {
                    onDestinationSelect(item);
                    setDestinationModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedDestination === item &&
                        styles.selectedModalItemText,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedDestination === item && (
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

export default LocationSelector;
