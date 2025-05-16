import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import RainProbabilityIndicator from "./RainProbabilityIndicator";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { AirlineLuggagePolicy } from "./LuggagePolicyModal";
import { formatDate } from "../app/utils/formatDate";
import { Flight } from "../app/reducers/flightListReducer";
import { useTheme } from './../hooks/useTheme';

type LuggagePolicyDatabase = {
  [airlineName: string]: AirlineLuggagePolicy;
};

interface FlightCardProps {
  item: Flight;
  baggageOption: "all" | "free" | "included";
  standardBaggageWeight: string;
  showButtons?: boolean;
  onSelectFlight?: (flight: Flight, direction: "Outbound" | "Return") => void;
  onLuggagePolicyPress?: (airline: string) => void;
  onRainInfoPress?: (flight: Flight) => void;
  luggagePolicies?: LuggagePolicyDatabase;
}

const FlightCard: React.FC<FlightCardProps> = ({
  item,
  baggageOption,
  standardBaggageWeight,
  showButtons = true,
  onSelectFlight,
  onLuggagePolicyPress,
  onRainInfoPress,
  luggagePolicies = {},
}) => {
  const showRainInfo = item.rain_probability > 0;
  const showMealInfo = item.free_meal === true;
  const rainInfo = Math.trunc(item.rain_probability);

  const { isDarkMode } = useTheme();

  const airlinePolicy = luggagePolicies[item.airline];

  if (
    showButtons &&
    luggagePolicies &&
    Object.keys(luggagePolicies).length > 0
  ) {
    if (!airlinePolicy) {
    } else {
      if (baggageOption === "free" && !airlinePolicy.checked?.free) {
      }
      if (baggageOption === "included" && airlinePolicy.checked?.free) {
      }
    }
  }

  const searchDate = format(item.date, "dd MMMM", {
    locale: enUS,
  }).toLowerCase();

  const calculateBaggageCost = () => {
    if (baggageOption !== "included" || !airlinePolicy) {
      return 0;
    }

    if (
      !airlinePolicy.extraCheckedOptions ||
      airlinePolicy.extraCheckedOptions.length === 0
    ) {
      return 0;
    }

    const normalizedWeight = standardBaggageWeight.includes("kg")
      ? standardBaggageWeight
      : `${standardBaggageWeight}kg`;

    const selectedOption = airlinePolicy.extraCheckedOptions.find(
      (option) => option.weight === normalizedWeight,
    );

    return selectedOption ? selectedOption.beforeThreeHours : 0;
  };

  const baggageCost = calculateBaggageCost();
  const totalPrice = item.price_inr + baggageCost;

  const showBaggageCostInfo = baggageOption === "included";

  const displayWeight = standardBaggageWeight.includes("kg")
    ? standardBaggageWeight
    : `${standardBaggageWeight}kg`;

  const handleSearchPress = () => {
    const searchQuery = `flights from ${item.origin} to ${item.destination} ${searchDate} one way`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    Linking.openURL(googleSearchUrl).catch((err) =>
      console.error("Couldn't load page", err),
    );
  };

  const handleLuggagePress = () => {
    if (onLuggagePolicyPress && airlinePolicy) {
      onLuggagePolicyPress(item.airline);
    }
  };

  const handleRainPress = () => {
    if (onRainInfoPress) {
      onRainInfoPress(item);
    }
  };

  const getRainColor = (probability: number) => {
    if (probability < 25)
      return isDarkMode ? "rgba(46, 204, 113, 0.2)" : "rgba(46, 204, 113, 0.1)";
    if (probability > 50)
      return isDarkMode ? "rgba(231, 76, 60, 0.2)" : "rgba(231, 76, 60, 0.1)";
    return isDarkMode ? "rgba(52, 152, 219, 0.2)" : "rgba(52, 152, 219, 0.1)";
  };

  const isOutbound = item.origin_country === "India";
  const flightDirection = isOutbound ? "Outbound" : "Return";

  const handleAddFlightPress = () => {
    if (onSelectFlight) {
      onSelectFlight(item, flightDirection as "Outbound" | "Return");
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? "#1C2526" : "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 3,
      shadowColor: isDarkMode ? "#000" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? "#2C3A3B" : "#eee",
    },
    airlineContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      alignItems: "center",
    },
    airline: {
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? "#E0E0E0" : "#333",
      flexShrink: 1,
      marginRight: 8,
    },
    rightHeaderContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    directionBadge: {
      backgroundColor: isDarkMode ? "#2A3B5E" : "#eef",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      marginRight: 8,
    },
    directionText: {
      fontSize: 11,
      color: isDarkMode ? "#4A90E2" : "#0066cc",
      fontWeight: "600",
    },
    flight_type: {
      fontSize: 13,
      color: isDarkMode ? "#A0A0A0" : "#666",
      fontStyle: "italic",
    },
    routeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    locationInfo: {
      alignItems: "center",
      width: "28%",
    },
    locationCode: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#111",
      marginBottom: 2,
    },
    country: {
      fontSize: 11,
      color: isDarkMode ? "#A0A0A0" : "#777",
      textAlign: "center",
    },
    flightPath: {
      flexDirection: "row",
      alignItems: "center",
      width: "44%",
      justifyContent: "center",
    },
    line: {
      height: 1.5,
      backgroundColor: isDarkMode ? "#4A5657" : "#ddd",
      flex: 1,
    },
    circle: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: isDarkMode ? "#4A90E2" : "#0066cc",
      marginHorizontal: 3,
    },
    duration: {
      fontSize: 12,
      color: isDarkMode ? "#B0B0B0" : "#555",
      fontWeight: "500",
      marginHorizontal: 5,
    },
    detailsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    dateTimeContainer: {
      flex: 1,
      paddingRight: 8,
    },
    date: {
      fontSize: 14,
      color: isDarkMode ? "#E0E0E0" : "#333",
      fontWeight: "500",
      marginBottom: 2,
    },
    time: {
      fontSize: 13,
      color: isDarkMode ? "#B0B0B0" : "#555",
      marginBottom: 8,
    },
    mealContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      backgroundColor: isDarkMode ? "#2A4D3E" : "#e6f7e6",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: "flex-start",
    },
    mealIcon: {
      fontSize: 12,
      marginRight: 4,
    },
    mealText: {
      fontSize: 11,
      color: isDarkMode ? "#66BB6A" : "#1e7e34",
      fontWeight: "500",
    },
    priceWeatherContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    priceContainer: {
      alignItems: "flex-end",
      marginRight: 10,
    },
    priceLabel: {
      fontSize: 12,
      color: isDarkMode ? "#A0A0A0" : "#666",
      marginBottom: 0,
    },
    price: {
      fontSize: 19,
      fontWeight: "bold",
      color: isDarkMode ? "#4A90E2" : "#0066cc",
    },
    baggageCost: {
      fontSize: 12,
      color: isDarkMode ? "#A0A0A0" : "#777",
      marginTop: 1,
      textAlign: "right",
    },
    totalPrice: {
      fontSize: 12,
      color: isDarkMode ? "#B0B0B0" : "#555",
      fontWeight: "600",
      marginTop: 2,
      textAlign: "right",
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode ? "#2C3A3B" : "#eee",
      marginTop: 16,
      marginBottom: 12,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: -4,
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: isDarkMode ? "#2C3A3B" : "#f5f5f5",
      backgroundColor: isDarkMode ? "#2C3A3B" : "#f5f5f5",
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
      marginHorizontal: 4,
    },
    buttonText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDarkMode ? "#A0A0A0" : "#888",
    },
    addFlightButton: {
      backgroundColor: isDarkMode
        ? "rgba(46, 204, 113, 0.3)"
        : "rgba(46, 204, 113, 0.15)",
      borderColor: isDarkMode
        ? "rgba(46, 204, 113, 0.3)"
        : "rgba(46, 204, 113, 0.15)",
    },
    addFlightButtonText: {
      color: isDarkMode ? "#66BB6A" : "#27ae60",
      fontWeight: "600",
      fontSize: 13,
    },
    searchButton: {
      backgroundColor: isDarkMode
        ? "rgba(52, 152, 219, 0.3)"
        : "rgba(52, 152, 219, 0.15)",
      borderColor: isDarkMode
        ? "rgba(52, 152, 219, 0.3)"
        : "rgba(52, 152, 219, 0.15)",
    },
    searchButtonText: {
      color: isDarkMode ? "#4A90E2" : "#2980b9",
      fontWeight: "600",
      fontSize: 13,
    },
    disabledButton: {
      backgroundColor: isDarkMode ? "#2A2A2A" : "#fafafa",
      borderColor: isDarkMode ? "#4A5657" : "#bbb",
    },
    disabledButtonText: {
      color: isDarkMode ? "#4A5657" : "#bbb",
    },
    rainButton: {
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.airlineContainer}>
        <Text style={styles.airline}>{item.airline}</Text>
        <View style={styles.rightHeaderContainer}>
          <View style={styles.directionBadge}>
            <Text style={styles.directionText}>{flightDirection}</Text>
          </View>
          <Text style={styles.flight_type}>{item.flight_type}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationCode}>{item.origin}</Text>
          <Text style={styles.country}>{item.origin_country}</Text>
        </View>
        <View style={styles.flightPath}>
          <View style={styles.line}></View>
          <View style={styles.circle}></View>
          <Text style={styles.duration}>{item.duration}</Text>
          <View style={styles.circle}></View>
          <View style={styles.line}></View>
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationCode}>{item.destination}</Text>
          <Text style={styles.country}>{item.destination_country}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <Text style={styles.time}>{item.time}</Text>
          {showMealInfo && (
            <View style={styles.mealContainer}>
              <Text style={styles.mealIcon}>🍽️</Text>
              <Text style={styles.mealText}>Free Meal</Text>
            </View>
          )}
        </View>

        <View style={styles.priceWeatherContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            {showBaggageCostInfo ? (
              <>
                <Text style={styles.price}>
                  ₹{item.price_inr.toLocaleString()}
                </Text>
                {(baggageCost > 0 ||
                  (airlinePolicy?.extraCheckedOptions &&
                    airlinePolicy.extraCheckedOptions.length > 0)) && (
                  <Text style={styles.baggageCost}>
                    + ₹{baggageCost.toLocaleString()} ({displayWeight})
                  </Text>
                )}
                {baggageCost > 0 && (
                  <Text style={styles.totalPrice}>
                    Total: ₹{totalPrice.toLocaleString()}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.price}>
                ₹{item.price_inr.toLocaleString()}
              </Text>
            )}
          </View>

          {showRainInfo && (
            <TouchableOpacity
              style={[
                styles.rainButton,
                { backgroundColor: getRainColor(item.rain_probability) },
              ]}
              onPress={handleRainPress}
              accessible={true}
              accessibilityLabel={`View rain information for ${item.destination}. Probability: ${item.rain_probability}%`}
              accessibilityHint="Opens weather details"
            >
              <RainProbabilityIndicator probability={rainInfo} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showButtons && <View style={styles.divider} />}
      {showButtons && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.addFlightButton]}
            onPress={handleAddFlightPress}
            accessible={true}
            accessibilityLabel={`Add ${item.airline} flight from ${item.origin} to ${item.destination} as ${flightDirection}`}
            disabled={!onSelectFlight}
          >
            <Text style={styles.addFlightButtonText}>Add Flight</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !airlinePolicy && styles.disabledButton]}
            onPress={handleLuggagePress}
            accessible={true}
            accessibilityLabel={`View luggage policy for ${item.airline}`}
            accessibilityHint="Opens luggage details modal"
            disabled={!onLuggagePolicyPress || !airlinePolicy}
          >
            <Text
              style={[
                styles.buttonText,
                !airlinePolicy && styles.disabledButtonText,
              ]}
            >
              Luggage
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.searchButton]}
            onPress={handleSearchPress}
            accessible={true}
            accessibilityLabel={`Search Google for ${item.airline} flight from ${item.origin} to ${item.destination} on ${searchDate}`}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default FlightCard;
