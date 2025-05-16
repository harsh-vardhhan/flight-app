import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from './../hooks/useTheme';

interface RainProbabilityIndicatorProps {
  probability: number;
  size?: number;
}

const RainProbabilityIndicator = ({
  probability,
  size = 40,
}: RainProbabilityIndicatorProps) => {
  const { isDarkMode } = useTheme();

  if (probability === null || probability === undefined || probability <= 0) {
    return null;
  }

  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(probability, 100) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  let color = isDarkMode ? "#4A90E2" : "#3498db";
  if (probability < 25) {
    color = isDarkMode ? "#66BB6A" : "#2ecc71";
  } else if (probability > 50) {
    color = isDarkMode ? "#EF5350" : "#e74c3c";
  }

  const styles = StyleSheet.create({
    indicatorContainer: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    textOverlayContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
    },
    probabilityText: {
      fontSize: 11,
      fontWeight: "bold",
      lineHeight: 13,
    },
    label: {
      fontSize: 8,
      color: isDarkMode ? "#A0A0A0" : "#667",
      fontWeight: "500",
      lineHeight: 10,
      marginTop: -1,
    },
  });

  return (
    <View style={[styles.indicatorContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={isDarkMode ? "#2C3A3B" : "#eef2f5"}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.textOverlayContainer}>
        <Text style={[styles.probabilityText, { color }]}>{probability}%</Text>
        <Text style={styles.label}>Rain</Text>
      </View>
    </View>
  );
};

export default RainProbabilityIndicator;
