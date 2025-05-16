import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useTheme } from "./../hooks/useTheme";

type LuggageDetail = {
  weight: string;
  free: boolean;
  note?: string;
};

type CheckedBaggageTier = {
  weight: string;
  weightValue: number;
  beforeThreeHours: number;
  afterThreeHours: number;
};

type AirlineLuggagePolicy = {
  carryOn: LuggageDetail;
  checked: LuggageDetail;
  extraCheckedOptions?: CheckedBaggageTier[];
};

interface LuggagePolicyBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  airline: string;
  luggagePolicy: AirlineLuggagePolicy | null;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

const LuggagePolicyBottomSheet: React.FC<LuggagePolicyBottomSheetProps> = ({
  visible,
  onClose,
  airline,
  luggagePolicy,
}) => {
  if (!luggagePolicy) return null;

  // State for the selected weight value and index
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  const { isDarkMode } = useTheme();

  // Animation values
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const lastBaseY = useRef(SCREEN_HEIGHT);

  // Reset selected weight index when modal is opened
  useEffect(() => {
    if (visible) {
      setSelectedWeightIndex(0);
      setSliderValue(0);
      // Animate the bottom sheet in
      openBottomSheet();
    } else {
      // Animate the bottom sheet out
      closeBottomSheet();
    }
  }, [visible]);

  // Animation functions
  const openBottomSheet = () => {
    panY.setValue(0);
    translateY.setValue(SCREEN_HEIGHT);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastBaseY.current = 0;
    });
  };

  const closeBottomSheet = (fromValue?: number) => {
    panY.setValue(0);
    if (typeof fromValue === "number") {
      translateY.setValue(fromValue);
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastBaseY.current = SCREEN_HEIGHT;
      onClose();
    });
  };

  const resetBottomSheet = (fromValue?: number) => {
    panY.setValue(0);
    if (typeof fromValue === "number") {
      translateY.setValue(fromValue);
    }

    Animated.spring(translateY, {
      toValue: 0,
      bounciness: 0,
      speed: 12,
      useNativeDriver: true,
    }).start(() => {
      lastBaseY.current = 0;
    });
  };

  // Pan Responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderGrant: () => {
        lastBaseY.current = translateY._value;
        translateY.stopAnimation();
        panY.setOffset(0);
        panY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        let newPanY = gestureState.dy;
        if (lastBaseY.current + newPanY < 0) {
          newPanY = -lastBaseY.current;
        }
        panY.setValue(newPanY);

        // Calculate the new position for translateY
        const newPosition = lastBaseY.current + newPanY;
        translateY.setValue(newPosition);

        // Update overlay opacity based on position
        const newOpacity = 1 - newPosition / SCREEN_HEIGHT;
        overlayOpacity.setValue(Math.max(0, Math.min(1, newOpacity)));
      },
      onPanResponderRelease: (_, gestureState) => {
        panY.setValue(0);
        const finalPosition = lastBaseY.current + gestureState.dy;

        if (
          gestureState.dy > 0 &&
          (gestureState.vy > 0.3 || finalPosition > SCREEN_HEIGHT / 3)
        ) {
          closeBottomSheet(finalPosition);
        } else {
          resetBottomSheet(finalPosition);
        }
      },
    }),
  ).current;

  // Check if it's VietJet Air and has extraCheckedOptions
  const isVietJetWithOptions =
    airline === "VietJet Air" &&
    luggagePolicy?.extraCheckedOptions &&
    luggagePolicy.extraCheckedOptions.length > 0;

  // Get current price based on selected weight
  const getCurrentPrice = () => {
    if (!isVietJetWithOptions || !luggagePolicy.extraCheckedOptions)
      return { before: 0, after: 0 };

    const option = luggagePolicy.extraCheckedOptions[selectedWeightIndex];
    return {
      before: option.beforeThreeHours,
      after: option.afterThreeHours,
      weight: option.weight,
    };
  };

  // Handle slider change
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (luggagePolicy?.extraCheckedOptions) {
      // Find the closest index based on slider value
      const index = Math.round(
        value * (luggagePolicy.extraCheckedOptions.length - 1),
      );
      setSelectedWeightIndex(index);
    }
  };

  const currentPrice = getCurrentPrice();

  if (!visible && translateY._value === SCREEN_HEIGHT) {
    return null;
  }

  const styles = StyleSheet.create({
    overlayTouchable: {
      flex: 1,
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
      zIndex: 100,
    },
    bottomSheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDarkMode ? "#1C2526" : "white",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 20,
      paddingTop: 16,
      alignItems: "center",
      maxHeight: "90%",
      zIndex: 101,
      shadowColor: isDarkMode ? "#000" : "#000",
      shadowOffset: {
        width: 0,
        height: -3,
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    scrollView: {
      width: "100%",
    },
    scrollContent: {
      paddingBottom: 20,
    },
    bottomSheetHandle: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: isDarkMode ? "#4A5657" : "#e0e0e0",
      marginBottom: 20,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 24,
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    luggageTypeContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginBottom: 24,
    },
    luggageSection: {
      alignItems: "center",
      width: "45%",
    },
    luggageIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDarkMode ? "#2C3A3B" : "#f0f4f8",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    luggageIcon: {
      fontSize: 24,
    },
    luggageTypeTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 4,
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    luggageWeight: {
      fontSize: 18,
      marginBottom: 8,
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 6,
    },
    freeBadge: {
      backgroundColor: isDarkMode ? "#2A4D3E" : "#e6f7e6",
    },
    paidBadge: {
      backgroundColor: isDarkMode ? "#4D2A2A" : "#ffeaea",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "bold",
    },
    freeText: {
      color: isDarkMode ? "#66BB6A" : "#2a9d2a",
    },
    paidText: {
      color: isDarkMode ? "#EF5350" : "#e53935",
    },
    noteText: {
      fontSize: 12,
      color: isDarkMode ? "#A0A0A0" : "#666",
      textAlign: "center",
      marginTop: 4,
    },
    extraBaggageContainer: {
      width: "100%",
      marginBottom: 20,
    },
    extraBaggageTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    tableRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#2C3A3B" : "#eee",
    },
    tableCell: {
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    tableHeader: {
      fontWeight: "bold",
      color: isDarkMode ? "#A0A0A0" : "#555",
    },
    evenRow: {
      backgroundColor: isDarkMode ? "#2C3A3B" : "#f9f9f9",
    },
    oddRow: {
      backgroundColor: isDarkMode ? "#1C2526" : "#ffffff",
    },
    insightContainer: {
      backgroundColor: isDarkMode ? "#4D3E2A" : "#fff8e1",
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
      width: "100%",
    },
    insightText: {
      fontSize: 14,
      color: isDarkMode ? "#FFD54F" : "#795548",
      textAlign: "center",
    },
    rangeContainer: {
      width: "100%",
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    slider: {
      width: "100%",
      height: 40,
      marginVertical: 10,
    },
    weightLabelsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 20,
    },
    weightLabel: {
      fontSize: 12,
      color: isDarkMode ? "#A0A0A0" : "#666",
      textAlign: "center",
    },
    selectedWeightLabel: {
      color: isDarkMode ? "#4A90E2" : "#0066cc",
      fontWeight: "bold",
    },
    selectedWeightContainer: {
      alignItems: "center",
      marginVertical: 10,
    },
    selectedWeightText: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDarkMode ? "#4A90E2" : "#0066cc",
    },
    priceDisplayContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginBottom: 15,
    },
    priceBox: {
      backgroundColor: isDarkMode ? "#2C3A3B" : "#f5f5f5",
      borderRadius: 8,
      padding: 12,
      width: "45%",
      alignItems: "center",
    },
    priceLabel: {
      fontSize: 14,
      color: isDarkMode ? "#A0A0A0" : "#555",
      marginBottom: 5,
    },
    priceValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#4A90E2" : "#0066cc",
    },
    savingsContainer: {
      backgroundColor: isDarkMode ? "#2A4D3E" : "#e6f7e6",
      padding: 10,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 5,
    },
    savingsText: {
      color: isDarkMode ? "#66BB6A" : "#2a9d2a",
      fontWeight: "500",
      fontSize: 14,
    },
    closeButton: {
      backgroundColor: isDarkMode ? "#4A90E2" : "#0066cc",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 10,
      width: "100%",
      alignItems: "center",
    },
    closeButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

  return (
    <>
      <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => closeBottomSheet()}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[styles.bottomSheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.bottomSheetHandle} />

        <Text style={styles.bottomSheetTitle}>{airline} Luggage Policy</Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.luggageTypeContainer}>
            {/* Carry-on luggage */}
            <View style={styles.luggageSection}>
              <View style={styles.luggageIconContainer}>
                <Text style={styles.luggageIcon}>💼</Text>
              </View>
              <Text style={styles.luggageTypeTitle}>Carry-on</Text>
              <Text style={styles.luggageWeight}>
                {luggagePolicy.carryOn.weight}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  luggagePolicy.carryOn.free
                    ? styles.freeBadge
                    : styles.paidBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    luggagePolicy.carryOn.free
                      ? styles.freeText
                      : styles.paidText,
                  ]}
                >
                  {luggagePolicy.carryOn.free ? "FREE" : "PAID"}
                </Text>
              </View>
            </View>

            {/* Checked luggage */}
            <View style={styles.luggageSection}>
              <View style={styles.luggageIconContainer}>
                <Text style={styles.luggageIcon}>🧳</Text>
              </View>
              <Text style={styles.luggageTypeTitle}>Checked</Text>
              <Text style={styles.luggageWeight}>
                {luggagePolicy.checked.weight}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  luggagePolicy.checked.free
                    ? styles.freeBadge
                    : styles.paidBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    luggagePolicy.checked.free
                      ? styles.freeText
                      : styles.paidText,
                  ]}
                >
                  {luggagePolicy.checked.free ? "FREE" : "PAID"}
                </Text>
              </View>
              {luggagePolicy.checked.note && (
                <Text style={styles.noteText}>
                  {luggagePolicy.checked.note}
                </Text>
              )}
            </View>
          </View>

          {/* VietJet Air Range Slider for Extra Baggage */}
          {isVietJetWithOptions && (
            <View style={styles.rangeContainer}>
              <Text style={styles.extraBaggageTitle}>
                Select Additional Checked Baggage
              </Text>

              {/* Selected Weight Display */}
              <View style={styles.selectedWeightContainer}>
                <Text style={styles.selectedWeightText}>
                  Selected: {currentPrice.weight}
                </Text>
              </View>

              {/* Range Slider */}
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={sliderValue}
                onValueChange={handleSliderChange}
                minimumTrackTintColor={isDarkMode ? "#4A90E2" : "#0066cc"}
                maximumTrackTintColor={isDarkMode ? "#4A5657" : "#d3d3d3"}
                thumbTintColor={isDarkMode ? "#4A90E2" : "#0066cc"}
                step={1 / (luggagePolicy.extraCheckedOptions!.length - 1)}
              />

              {/* Weight Labels */}
              <View style={styles.weightLabelsContainer}>
                {luggagePolicy.extraCheckedOptions!.map((option, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.weightLabel,
                      selectedWeightIndex === index &&
                        styles.selectedWeightLabel,
                    ]}
                  >
                    {option.weight}
                  </Text>
                ))}
              </View>

              {/* Price Display */}
              <View style={styles.priceDisplayContainer}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Before 3 Hours</Text>
                  <Text style={styles.priceValue}>
                    ₹{currentPrice.before.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>After 3 Hours</Text>
                  <Text style={styles.priceValue}>
                    ₹{currentPrice.after.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Savings indicator */}
              <View style={styles.savingsContainer}>
                <Text style={styles.savingsText}>
                  Save ₹
                  {(currentPrice.after - currentPrice.before).toLocaleString()}{" "}
                  by booking online earlier!
                </Text>
              </View>
            </View>
          )}

          {/* Regular table for other airlines with extra options */}
          {!isVietJetWithOptions && luggagePolicy.extraCheckedOptions && (
            <View style={styles.extraBaggageContainer}>
              <Text style={styles.extraBaggageTitle}>
                Additional Checked Baggage Options
              </Text>

              {/* Table header */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableHeader]}>
                  Weight
                </Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>
                  Before 3 Hours
                </Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>
                  After 3 Hours
                </Text>
              </View>

              {/* Table rows */}
              {luggagePolicy.extraCheckedOptions.map((option, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={styles.tableCell}>{option.weight}</Text>
                  <Text style={styles.tableCell}>
                    ₹{option.beforeThreeHours.toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>
                    ₹{option.afterThreeHours.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default React.memo(LuggagePolicyBottomSheet);
export type { LuggageDetail, CheckedBaggageTier, AirlineLuggagePolicy };
