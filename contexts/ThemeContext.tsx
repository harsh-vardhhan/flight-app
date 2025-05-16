import React, { createContext, ReactNode } from "react";
import { useColorScheme } from "react-native";

interface ThemeContextType {
  isDarkMode: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const ThemeValue: ThemeContextType = {
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={ThemeValue}>{children}</ThemeContext.Provider>
  );
};
