import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const useThemeConfig = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeConfig must be used within ThemeProvider');
  return ctx;
};

const DEFAULT_THEME = {
  header: { bg: 'white', text: '#333333', hoverBg: '#e0e0e0' },
  sidebar: { bg: '#f8f9fa', text: '#333333', hoverBg: '#f5f5f5', selectedBg: '#1976d2', selectedHoverBg: '#1565c0' },
  mainHeader: { bg: 'white', text: '#333333', hoverBg: '#e0e0e0' },
  mainSidebar: { bg: '#f8f9fa', text: '#333333', hoverBg: '#f5f5f5', selectedBg: '#1976d2', selectedHoverBg: '#1565c0' },
  content: { bg: '#f8f9fa', bgImage: '', bgImageOpacity: 0.0, bgSize: 'cover', bgRepeat: 'no-repeat', bgPosition: 'center' },
  table: { bg: '#ffffff', text: '#333333', headerBg: '#f0f4f8', headerText: '#333333', buttonBg: '#1976d2', buttonText: '#ffffff', bgImage: '', bgImageOpacity: 0.0 },
  tokens: {
    primary: '#1976d2',
    text: '#333333',
    muted: '#666666',
    hover: '#f5f5f5',
    highlight: '#e3f2fd',
    success: '#4caf50',
    info: '#2196f3',
    warning: '#ff9800',
    error: '#f44336',
  },
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = useMemo(() => 'ui_theme_config', []);

  const [themeConfig, setThemeConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
      const globalSaved = localStorage.getItem('ui_theme_config');
      return globalSaved ? JSON.parse(globalSaved) : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setThemeConfig(JSON.parse(saved));
      } else if (storageKey !== 'ui_theme_config') {
        const globalSaved = localStorage.getItem('ui_theme_config');
        setThemeConfig(globalSaved ? JSON.parse(globalSaved) : DEFAULT_THEME);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(themeConfig));
    } catch {}
  }, [themeConfig, storageKey]);

  const hexToRgba = (hex, a) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const updateSectionColors = (section, colors) => {
    setThemeConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...colors },
    }));
  };

  const resetThemeAll = () => {
    setThemeConfig(DEFAULT_THEME);
  };

  const resetSection = (section) => {
    setThemeConfig(prev => ({
      ...prev,
      [section]: { ...DEFAULT_THEME[section] },
    }));
  };

  const updateTokens = (colors) => {
    setThemeConfig(prev => {
      const next = { ...prev.tokens, ...colors };
      if (colors.primary) {
        const p = colors.primary;
        if (!colors.hover) next.hover = hexToRgba(p, 0.12);
        if (!colors.highlight) next.highlight = hexToRgba(p, 0.18);
      }
      return { ...prev, tokens: next };
    });
  };

  const resetTokens = () => {
    setThemeConfig(prev => ({
      ...prev,
      tokens: { ...DEFAULT_THEME.tokens },
    }));
  };

  const value = useMemo(() => ({ themeConfig, updateSectionColors, resetThemeAll, resetSection, updateTokens, resetTokens }), [themeConfig]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
