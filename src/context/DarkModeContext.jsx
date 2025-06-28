import React, { createContext, useEffect, useState } from 'react';

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    console.log('Initial theme from localStorage:', savedTheme);
    return savedTheme === 'dark';
  });

  useEffect(() => {
    console.log('Dark mode effect running, isDark:', isDark);
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the appropriate class
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Added dark class to root element');
    } else {
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
      console.log('Added light class to root element');
    }

    // Force a re-render by updating the body class
    document.body.className = isDark ? 'dark-mode' : 'light-mode';
  }, [isDark]);

  return (
    <DarkModeContext.Provider value={{ isDark, setIsDark }}>
      <div className={`app-container ${isDark ? 'dark' : 'light'}`}>
        {children}
      </div>
    </DarkModeContext.Provider>
  );
};
