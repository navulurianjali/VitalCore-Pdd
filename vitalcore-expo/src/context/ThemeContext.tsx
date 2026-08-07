import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export type ThemeMode = 'dark' | 'light';
export type OperatingMode = 'wellness' | 'performance' | 'elderly';

export interface ThemeColors {
  background: string;
  cardBg: string;
  cardBorder: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  inputBg: string;
  inputBorder: string;
  navBg: string;
  navBorder: string;
}

interface ThemeContextProps {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  activeMode: OperatingMode;
  setActiveMode: (mode: OperatingMode) => void;
  colors: ThemeColors;
  isCareMode: boolean;
  isPerformanceMode: boolean;
}

// VitalCore Organic Teal & Dark Carbon Midnight Palette (1:1 with web globals.css)
const darkColors: ThemeColors = {
  background: '#090e11',
  cardBg: '#12181c',
  cardBorder: 'rgba(20, 184, 166, 0.1)',
  surface: '#12181c',
  border: 'rgba(20, 184, 166, 0.1)',
  text: '#f4faf8',
  textMuted: '#86a29e',
  primary: '#0d9488',
  primaryHover: '#0f766e',
  primaryLight: 'rgba(20, 184, 166, 0.12)',
  secondary: '#8b5cf6',
  secondaryLight: 'rgba(139, 92, 246, 0.12)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.12)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.12)',
  danger: '#ef4444',
  dangerLight: 'rgba(239, 68, 68, 0.12)',
  inputBg: '#172026',
  inputBorder: 'rgba(20, 184, 166, 0.15)',
  navBg: '#090e11',
  navBorder: 'rgba(20, 184, 166, 0.12)',
};

const lightColors: ThemeColors = {
  background: '#fcfdfc',
  cardBg: '#ffffff',
  cardBorder: 'rgba(13, 148, 136, 0.08)',
  surface: '#ffffff',
  border: 'rgba(13, 148, 136, 0.08)',
  text: '#0e1412',
  textMuted: '#536b66',
  primary: '#0d9488',
  primaryHover: '#0f766e',
  primaryLight: 'rgba(13, 148, 136, 0.1)',
  secondary: '#7c3aed',
  secondaryLight: 'rgba(124, 58, 237, 0.1)',
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.1)',
  warning: '#d97706',
  warningLight: 'rgba(217, 119, 6, 0.1)',
  danger: '#dc2626',
  dangerLight: 'rgba(220, 38, 38, 0.1)',
  inputBg: '#f0f5f3',
  inputBorder: 'rgba(13, 148, 136, 0.15)',
  navBg: '#ffffff',
  navBorder: 'rgba(13, 148, 136, 0.08)',
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [activeMode, setActiveModeState] = useState<OperatingMode>('wellness');

  useEffect(() => {
    AsyncStorage.getItem('vitalcore_theme').then((savedTheme) => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    });
  }, []);

  useEffect(() => {
    if (profile?.active_mode) {
      setActiveModeState(profile.active_mode);
    }
  }, [profile?.active_mode]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    await AsyncStorage.setItem('vitalcore_theme', nextTheme);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeState(mode);
    await AsyncStorage.setItem('vitalcore_theme', mode);
  };

  const setActiveMode = async (mode: OperatingMode) => {
    setActiveModeState(mode);
    if (profile) {
      await updateProfile({ active_mode: mode });
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;
  const isCareMode = activeMode === 'elderly';
  const isPerformanceMode = activeMode === 'performance';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setThemeMode,
        activeMode,
        setActiveMode,
        colors,
        isCareMode,
        isPerformanceMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
