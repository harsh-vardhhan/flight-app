import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";

type Month =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";
type CityPrecipitationData = Record<Month, number>;
type PrecipitationData = Record<string, CityPrecipitationData>;

interface RainInfoBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  destination: string;
  rain_probability: number;
  date: string;
}

const RainInfoBottomSheet: React.FC<RainInfoBottomSheetProps> = ({
  visible,
  onClose,
  destination,
  rain_probability,
  date,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const precipitationData: PrecipitationData = {
    Hanoi: {
      Jan: 1.9,
      Feb: 2.2,
      Mar: 4.6,
      Apr: 6.7,
      May: 12.2,
      Jun: 14.4,
      Jul: 16.3,
      Aug: 17.2,
      Sep: 12.6,
      Oct: 8.0,
      Nov: 4.2,
      Dec: 2.0,
    },
    "Ho Chi Minh City": {
      Jan: 0.9,
      Feb: 0.6,
      Mar: 1.6,
      Apr: 4.3,
      May: 11.7,
      Jun: 15.9,
      Jul: 16.7,
      Aug: 15.7,
      Sep: 16.6,
      Oct: 16.5,
      Nov: 8.4,
      Dec: 2.9,
    },
    "Da Nang": {
      Jan: 4.5,
      Feb: 1.8,
      Mar: 2.0,
      Apr: 3.2,
      May: 7.2,
      Jun: 7.2,
      Jul: 7.1,
      Aug: 10.8,
      Sep: 15.5,
      Oct: 18.3,
      Nov: 13.8,
      Dec: 9.7,
    },
    "Phu Quoc": {
      Jan: 2.0,
      Feb: 2.3,
      Mar: 5.2,
      Apr: 9.7,
      May: 15.8,
      Jun: 19.6,
      Jul: 21.3,
      Aug: 21.6,
      Sep: 20.6,
      Oct: 19.4,
      Nov: 11.0,
      Dec: 3.9,
    },
  };

  const getMaxRainDays = (): number => {
    let max = 0;
    Object.values(precipitationData).forEach((cityData) => {
      Object.values(cityData).forEach((value) => {
        if (value > max) max = value;
      });
    });
    return max > 0 ? max * 1.1 : 1;
  };

  const BASE_BAR_COLOR = isDarkMode ? "#6b7280" : "#a3bffa";
  const CURRENT_MONTH_FILL_COLOR = isDarkMode ? "#4A90E2" : "#8cadf5";
  const CURRENT_MONTH_BORDER_COLOR = isDarkMode ? "#1E3A8A" : "#0052a3";
  const CURRENT_MONTH_BACKGROUND = isDarkMode ? "#2C3A3B" : "#f0f4fa";
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;
  const months: Month[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getBarColor = (isCurrentMonth: boolean): string =>
    isCurrentMonth ? CURRENT_MONTH_FILL_COLOR : BASE_BAR_COLOR;
  const getRainEmoji = (rainDays: number, maxRainDaysVal: number): string => {
    if (maxRainDaysVal <= 0) return "☀️";
    const ratio = rainDays / maxRainDaysVal;
    if (ratio < 0.33) return "☀️";
    if (ratio < 0.66) return "⛅";
    return "🌧️";
  };

  const animatedBaseY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const lastBaseY = useRef(SCREEN_HEIGHT);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(
    null,
  );

  // All available destinations
  const destinations = useMemo(() => Object.keys(precipitationData), []);

  // --- useMemo hooks for derived data ---
  const closestDestination = useMemo(() => {
    const destinations = Object.keys(precipitationData);
    if (destinations.includes(destination)) return destination;
    for (const city of destinations) {
      if (destination.toLowerCase().includes(city.toLowerCase())) return city;
    }
    return destinations[0] || "Unknown";
  }, [destination]);

  const displayDestination = useMemo(
    () => selectedDestination || closestDestination,
    [selectedDestination, closestDestination],
  );

  const destinationData = useMemo(
    () => precipitationData[displayDestination] || {},
    [displayDestination],
  );

  const currentMonthIndex = useMemo(() => {
    try {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime())
        ? dateObj.getMonth()
        : new Date().getMonth();
    } catch {
      return new Date().getMonth();
    }
  }, [date]);

  const rainRisk = useMemo(() => {
    if (rain_probability < 25)
      return { level: "Low", color: isDarkMode ? "#66BB6A" : "#2ecc71" };
    if (rain_probability <= 50)
      return { level: "Moderate", color: isDarkMode ? "#4A90E2" : "#3498db" };
    return { level: "High", color: isDarkMode ? "#EF5350" : "#e74c3c" };
  }, [rain_probability]);

  const maxRainDays = useMemo(() => getMaxRainDays(), []);

  // --- PanResponder ---
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderGrant: () => {
        lastBaseY.current = animatedBaseY._value;
        animatedBaseY.stopAnimation();
        panY.setOffset(0);
        panY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        let newPanY = gestureState.dy;
        if (lastBaseY.current + newPanY < 0) {
          newPanY = -lastBaseY.current;
        }
        panY.setValue(newPanY);
      },
      onPanResponderRelease: (_, gestureState) => {
        panY.setValue(0);
        const finalPosition = lastBaseY.current + gestureState.dy;
        if (
          gestureState.dy > 0 &&
          (gestureState.vy > 0.3 || finalPosition > BOTTOM_SHEET_HEIGHT / 3)
        ) {
          closeBottomSheet(finalPosition);
        } else {
          resetBottomSheet(finalPosition);
        }
      },
    }),
  ).current;

  // --- Animation Functions ---
  const openBottomSheet = () => {
    panY.setValue(0);
    animatedBaseY.setValue(SCREEN_HEIGHT);
    Animated.timing(animatedBaseY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      lastBaseY.current = 0;
    });
  };

  const closeBottomSheet = (fromValue?: number) => {
    panY.setValue(0);
    if (typeof fromValue === "number") {
      animatedBaseY.setValue(fromValue);
    }
    Animated.timing(animatedBaseY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      lastBaseY.current = SCREEN_HEIGHT;
      setSelectedDestination(null); // Reset selected destination when closing
      onClose();
    });
  };

  const resetBottomSheet = (fromValue?: number) => {
    panY.setValue(0);
    if (typeof fromValue === "number") {
      animatedBaseY.setValue(fromValue);
    }
    Animated.spring(animatedBaseY, {
      toValue: 0,
      bounciness: 0,
      speed: 12,
      useNativeDriver: true,
    }).start(() => {
      lastBaseY.current = 0;
    });
  };

  // --- useEffect for visibility ---
  useEffect(() => {
    if (visible) {
      if (lastBaseY.current >= SCREEN_HEIGHT) {
        openBottomSheet();
      }
    } else {
      if (lastBaseY.current < SCREEN_HEIGHT) {
        closeBottomSheet();
      }
    }
  }, [visible]);

  // --- Transform Value ---
  const translateY = Animated.add(animatedBaseY, panY).interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [0, SCREEN_HEIGHT],
    extrapolate: "clamp",
  });

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "flex-end",
      zIndex: 1000,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)",
    },
    bottomSheet: {
      backgroundColor: isDarkMode ? "#1C2526" : "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: 30,
      paddingTop: 0,
      alignItems: "center",
      shadowColor: isDarkMode ? "#000" : "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 8,
      elevation: 10,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    },
    draggableArea: {
      width: "100%",
      height: 35,
      alignItems: "center",
      justifyContent: "center",
    },
    bottomSheetHandle: {
      width: 50,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: isDarkMode ? "#4A5657" : "#dcdcdc",
      marginTop: 8,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 5,
      marginBottom: 18,
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    destinationContainer: {
      marginBottom: 15,
      width: "100%",
    },
    highlightText: {
      fontWeight: "bold",
      color: isDarkMode ? "#4A90E2" : "#0066cc",
    },
    currentRainContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    separator: {
      height: 1,
      backgroundColor: isDarkMode ? "#2C3A3B" : "#eeeeee",
      marginVertical: 10,
    },
    rainProbabilityText: {
      fontSize: 14,
      color: isDarkMode ? "#E0E0E0" : "#444",
    },
    riskIndicator: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 15,
    },
    riskText: {
      color: "white",
      fontWeight: "600",
      fontSize: 12,
    },
    subheaderText: {
      fontSize: 14,
      color: isDarkMode ? "#A0A0A0" : "#555",
      marginBottom: 12,
      fontWeight: "500",
    },
    chartContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      height: 220,
      width: "100%",
      marginTop: 10,
      paddingHorizontal: 5,
    },
    monthColumn: {
      alignItems: "center",
      flex: 1,
      maxWidth: 40,
    },
    barContainer: {
      height: "100%",
      width: "100%",
      justifyContent: "flex-end",
      alignItems: "center",
      borderRadius: 4,
    },
    currentMonthBackground: {
      backgroundColor: CURRENT_MONTH_BACKGROUND,
      width: "85%",
      paddingHorizontal: 2,
      paddingBottom: 2,
    },
    labelContainer: {
      alignItems: "center",
      marginBottom: 4,
    },
    bar: {
      width: "65%",
      borderRadius: 3,
      minHeight: 2,
    },
    currentMonthBarHighlight: {
      width: "95%",
      borderWidth: Platform.OS === "ios" ? 1.5 : 1.5,
      borderColor: CURRENT_MONTH_BORDER_COLOR,
      shadowColor: CURRENT_MONTH_BORDER_COLOR,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      elevation: 3,
    },
    emojiLabel: {
      fontSize: 11,
      lineHeight: 12,
    },
    monthLabel: {
      fontSize: 10,
      color: isDarkMode ? "#A0A0A0" : "#666",
      marginTop: 6,
      fontWeight: "500",
      textAlign: "center",
    },
    currentMonthLabelHighlight: {
      fontWeight: "bold",
      color: isDarkMode ? "#4A90E2" : "#0052a3",
    },
    rainDaysLabel: {
      fontSize: 9,
      color: isDarkMode ? "#A0A0A0" : "#777",
      fontWeight: "600",
      marginBottom: 1,
    },
    destinationSelector: {
      flexDirection: "row",
      paddingVertical: 5,
      marginBottom: 10,
    },
    destinationButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: isDarkMode ? "#2C3A3B" : "#f0f0f0",
      marginRight: 8,
      height: 36,
      justifyContent: "center",
      minWidth: 80,
    },
    selectedDestinationButton: {
      backgroundColor: isDarkMode ? "#4A90E2" : "#0066cc",
    },
    destinationButtonText: {
      fontSize: 12,
      fontWeight: "500",
      color: isDarkMode ? "#E0E0E0" : "#555",
      textAlign: "center",
    },
    selectedDestinationText: {
      color: "white",
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: translateY.interpolate({
              inputRange: [0, SCREEN_HEIGHT],
              outputRange: [isDarkMode ? 0.7 : 0.4, 0],
              extrapolate: "clamp",
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: BOTTOM_SHEET_HEIGHT,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* --- Content --- */}
        <View style={styles.draggableArea}>
          <View style={styles.bottomSheetHandle} />
        </View>
        <Text style={styles.bottomSheetTitle}>
          {displayDestination} Rain Statistics
        </Text>

        {/* Destination Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.destinationSelector}
        >
          {destinations.map((city) => (
            <TouchableOpacity
              key={city}
              style={[
                styles.destinationButton,
                displayDestination === city && styles.selectedDestinationButton,
              ]}
              onPress={() => setSelectedDestination(city)}
            >
              <Text
                style={[
                  styles.destinationButtonText,
                  displayDestination === city && styles.selectedDestinationText,
                ]}
                numberOfLines={1}
              >
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.destinationContainer}>
          {/* Rain probability only shown for the original destination */}
          {displayDestination === closestDestination && (
            <View style={styles.currentRainContainer}>
              <Text style={styles.rainProbabilityText}>
                Rain Probability:{" "}
                <Text style={styles.highlightText}>{rain_probability}%</Text>
              </Text>
              <View
                style={[
                  styles.riskIndicator,
                  { backgroundColor: rainRisk.color },
                ]}
              >
                <Text style={styles.riskText}>{rainRisk.level} Risk</Text>
              </View>
            </View>
          )}
          <View style={styles.separator} />
          <Text style={styles.subheaderText}>Avg. rainy days per month:</Text>
        </View>
        <View style={styles.chartContainer}>
          {months.map((month, index) => {
            const rainDays = destinationData[month] || 0;
            const barHeightPercent =
              maxRainDays > 0 ? (rainDays / maxRainDays) * 100 : 0;
            const isCurrentMonth = index === currentMonthIndex;
            return (
              <View key={month} style={styles.monthColumn}>
                <View
                  style={[
                    styles.barContainer,
                    isCurrentMonth && styles.currentMonthBackground,
                  ]}
                >
                  {/* Labels FIRST */}
                  <View style={styles.labelContainer}>
                    <Text style={styles.rainDaysLabel}>
                      {rainDays.toFixed(1)}
                    </Text>
                    <Text style={styles.emojiLabel}>
                      {getRainEmoji(rainDays, maxRainDays)}
                    </Text>
                  </View>
                  {/* Bar SECOND */}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${barHeightPercent}%`,
                        backgroundColor: getBarColor(isCurrentMonth),
                      },
                      isCurrentMonth && styles.currentMonthBarHighlight,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.monthLabel,
                    isCurrentMonth && styles.currentMonthLabelHighlight,
                  ]}
                >
                  {month}
                </Text>
              </View>
            );
          })}
        </View>
        {/* --- End Content --- */}
      </Animated.View>
    </View>
  );
};

// Wrap the export in React.memo for performance optimization
export default React.memo(RainInfoBottomSheet);
