import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FlightListScreen from './screens/FlightListScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Flights" component={FlightListScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
