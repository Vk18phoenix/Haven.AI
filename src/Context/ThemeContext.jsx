import React, { createContext, useState, useContext } from 'react';

// 1. Create the context which will be available to other components
const ThemeContext = createContext();

// 2. Create the Provider component. It will wrap your application and manage the theme state.
export const ThemeProvider = ({ children }) => {
  // The state for the theme, with 'dark' as the default
  const [theme, setTheme] = useState('dark');

  // The function to toggle between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Pass the current theme and the toggle function to all children components
  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Create a custom hook for easily accessing the theme context in any component
export const useTheme = () => {
  return useContext(ThemeContext);
};