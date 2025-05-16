import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import FlightCard from "./FlightCard";
import { Flight } from "../app/reducers/flightListReducer";
import { useTheme } from "./../hooks/useTheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 10; // Near top of screen
const MIN_TRANSLATE_Y = -SCREEN_HEIGHT * 0.25; // Collapsed position

interface TripBottomSheetProps {
  outboundFlight: Flight | null;
  returnFlight: Flight | null;
  price: number;
  duration: number | null;
  onRemoveFlight: (direction: "Outbound" | "Return") => void;
}

const TripBottomSheet: React.FC<TripBottomSheetProps> = ({
  outboundFlight,
  returnFlight,
  price,
  duration,
  onRemoveFlight,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const bottomSheetVisible = outboundFlight !== null || returnFlight !== null;
  const isAnimatingRef = useRef(false);

  const { isDarkMode } = useTheme();

  // Store the current position value
  const currentPositionRef = useRef(0);

  // Add listener to keep track of current position value
  useEffect(() => {
    const id = translateY.addListener(({ value }) => {
      currentPositionRef.current = value;
    });

    return () => {
      translateY.removeListener(id);
    };
  }, []);

  // Effect to handle visibility changes
  useEffect(() => {
    if (bottomSheetVisible) {
      // When flights are selected, show the bottom sheet with animation
      isAnimatingRef.current = true;
      Animated.spring(translateY, {
        toValue: MIN_TRANSLATE_Y,
        damping: 50,
        stiffness: 300,
        useNativeDriver: true,
      }).start(() => {
        isAnimatingRef.current = false;
      });
    } else {
      // When no flights are selected, hide the bottom sheet
      isAnimatingRef.current = true;
      Animated.spring(translateY, {
        toValue: 0,
        damping: 50,
        stiffness: 300,
        useNativeDriver: true,
      }).start(() => {
        isAnimatingRef.current = false;
      });
    }
  }, [bottomSheetVisible]);

  // Create PanResponder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimatingRef.current, // Don't handle when animating
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to deliberate vertical movements and not when animating
        return (
          !isAnimatingRef.current &&
          Math.abs(gestureState.dy) > 5 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderGrant: () => {
        // Save current position and prepare for movement
        translateY.setOffset(currentPositionRef.current);
        translateY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: translateY }], {
        useNativeDriver: false,
        listener: (_: any, gestureState: any) => {
          // Calculate boundaries
          const newValue = translateY._offset + gestureState.dy;

          // Apply resistance at boundaries
          if (
            newValue < MAX_TRANSLATE_Y ||
            (bottomSheetVisible && newValue > MIN_TRANSLATE_Y) ||
            (!bottomSheetVisible && newValue > 0)
          ) {
            // Apply resistance effect by adjusting the value
            const delta = gestureState.dy / 2; // Resistance factor
            translateY.setValue(delta);
          }
        },
      }),
      onPanResponderRelease: (_, gestureState) => {
        // Reset offset
        translateY.flattenOffset();
        const velocity = gestureState.vy;

        isAnimatingRef.current = true;

        // Snap based on velocity and position
        if (velocity < -0.5) {
          // Fast upward swipe - expand fully
          Animated.spring(translateY, {
            toValue: MAX_TRANSLATE_Y,
            damping: 50,
            stiffness: 300,
            useNativeDriver: true,
          }).start(() => {
            isAnimatingRef.current = false;
          });
        } else if (velocity > 0.5) {
          // Fast downward swipe - collapse to minimum
          if (bottomSheetVisible) {
            Animated.spring(translateY, {
              toValue: MIN_TRANSLATE_Y,
              damping: 50,
              stiffness: 300,
              useNativeDriver: true,
            }).start(() => {
              isAnimatingRef.current = false;
            });
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              damping: 50,
              stiffness: 300,
              useNativeDriver: true,
            }).start(() => {
              isAnimatingRef.current = false;
            });
          }
        } else {
          // Based on position
          const midPoint = (MAX_TRANSLATE_Y + MIN_TRANSLATE_Y) / 2;
          if (currentPositionRef.current < midPoint) {
            // Closer to fully expanded
            Animated.spring(translateY, {
              toValue: MAX_TRANSLATE_Y,
              damping: 50,
              stiffness: 300,
              useNativeDriver: true,
            }).start(() => {
              isAnimatingRef.current = false;
            });
          } else if (bottomSheetVisible) {
            // Default to collapsed position when flights are selected
            Animated.spring(translateY, {
              toValue: MIN_TRANSLATE_Y,
              damping: 50,
              stiffness: 300,
              useNativeDriver: true,
            }).start(() => {
              isAnimatingRef.current = false;
            });
          } else {
            // Only allow hiding when no flights are selected
            Animated.spring(translateY, {
              toValue: 0,
              damping: 50,
              stiffness: 300,
              useNativeDriver: true,
            }).start(() => {
              isAnimatingRef.current = false;
            });
          }
        }
      },
    }),
  ).current;

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-IN");
  };

  // Handle remove flight
  const handleRemoveFlight = (direction: "Outbound" | "Return") => {
    // Call the parent's removal function
    onRemoveFlight(direction);
  };

  if (!bottomSheetVisible) {
    return null;
  }

  const styles = StyleSheet.create({
    bottomSheetContainer: {
      height: SCREEN_HEIGHT,
      width: "100%",
      backgroundColor: isDarkMode ? "#1C2526" : "white",
      position: "absolute",
      top: SCREEN_HEIGHT,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: isDarkMode ? "#000" : "#000",
      shadowOffset: {
        width: 0,
        height: -3,
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.27,
      shadowRadius: 4.65,
      elevation: 6,
      padding: 16,
      zIndex: 1000,
    },
    line: {
      width: 75,
      height: 4,
      backgroundColor: isDarkMode ? "#4A5657" : "#DDD",
      alignSelf: "center",
      marginVertical: 8,
      borderRadius: 2,
    },
    summaryContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#2C3A3B" : "#eee",
    },
    tripInfoContainer: {
      flex: 1,
    },
    tripInfoTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#E0E0E0" : "#333",
      marginBottom: 4,
    },
    priceText: {
      fontSize: 22,
      fontWeight: "bold",
      color: isDarkMode ? "#4A90E2" : "#0066cc",
      marginBottom: 4,
    },
    durationText: {
      fontSize: 16,
      color: isDarkMode ? "#A0A0A0" : "#666",
    },
    bookButton: {
      backgroundColor: isDarkMode ? "#4A90E2" : "#0066cc",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    bookButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    flightsContainer: {
      flex: 1,
    },
    flightCardContainer: {
      marginBottom: 16,
    },
    flightHeaderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    directionText: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDarkMode ? "#E0E0E0" : "#333",
    },
    removeButton: {
      padding: 6,
    },
    removeButtonText: {
      color: isDarkMode ? "#EF5350" : "#f44336",
      fontWeight: "500",
    },
  });

  return (
    <Animated.View
      style={[
        styles.bottomSheetContainer,
        {
          transform: [{ translateY: translateY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.line} />

      <View style={styles.summaryContainer}>
        <View style={styles.tripInfoContainer}>
          <Text style={styles.tripInfoTitle}>Trip Summary</Text>
          <Text style={styles.priceText}>₹{formatCurrency(price)}</Text>
          {duration !== null && (
            <Text style={styles.durationText}>
              {duration} {duration === 1 ? "day" : "days"}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.flightsContainer}>
        {outboundFlight && (
          <View style={styles.flightCardContainer}>
            <View style={styles.flightHeaderContainer}>
              <Text style={styles.directionText}>Outbound Flight</Text>
              <TouchableOpacity
                onPress={() => handleRemoveFlight("Outbound")}
                activeOpacity={0.7}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
            <FlightCard
              item={outboundFlight}
              baggageOption="all"
              standardBaggageWeight="20kg"
              showButtons={false}
            />
          </View>
        )}

        {returnFlight && (
          <View style={styles.flightCardContainer}>
            <View style={styles.flightHeaderContainer}>
              <Text style={styles.directionText}>Return Flight</Text>
              <TouchableOpacity
                onPress={() => handleRemoveFlight("Return")}
                activeOpacity={0.7}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
            <FlightCard
              item={returnFlight}
              baggageOption="all"
              standardBaggageWeight="20kg"
              showButtons={false}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default TripBottomSheet;
