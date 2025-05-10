import React from 'react';
import { SafeAreaView ,StatusBar, useColorScheme} from 'react-native';
import AppNavigator from './navigation';

const App = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#1C2526' : 'white'  }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1C2526' : 'white'}
      />
      <AppNavigator />
    </SafeAreaView>
  );
};

export default App;
