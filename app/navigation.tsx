import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import FlightListScreen from './screens/FlightListScreen';
import {useTheme} from './../hooks/useTheme';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const {isDarkMode} = useTheme();
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#1C2526' : 'white' }}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#1C2526' : 'white'}
            />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Flights" component={FlightListScreen} />
            </Stack.Navigator>
        </SafeAreaView>
    )
};

export default AppNavigator;
