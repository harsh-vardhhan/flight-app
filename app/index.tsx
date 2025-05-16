import React from 'react';
import AppNavigator from './navigation';
import { ThemeProvider } from '../contexts/ThemeContext'

const App = () => {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
};

export default App;
