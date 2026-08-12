import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

const DEFAULT_SETTINGS = {
  restaurant_name: 'Khmer-Fresh',
  tagline: 'Authentic Traditional Food',
  phone: '',
  email: '',
  address: '',
  currency: 'USD',
  timezone: 'Asia/Phnom_Penh',
  language: 'en',
  notify_new_order: true,
  notify_low_stock: true,
  notify_payment: false,
  notify_daily_report: true,
  sound_alert: true,
  show_logo_receipt: true,
  show_tax_receipt: false,
  tax_rate: '10',
  receipt_note: 'Thank you for dining with us!',
  table_service: true,
  takeaway: true,
  dark_mode: false,
  compact_mode: false,
  accent_color: '#10b981',
  theme_target: 'sidebar',
  two_fa: false,
  auto_logout: true,
  logout_time: '30',

  //  NEW — Backup & Recovery schedule defaults
  backup_frequency: 'daily',
  backup_time: '02:00',
  backup_keep: '7',
};

// The app's fixed brand palette. Whichever area is NOT the customer's
// chosen theme_target stays pinned to these values.
const BRAND = {
  sidebarBgLight: '#1E2A2E',
  sidebarBgDark:  '#161F22',
  headerBgLight:  '#ffffff',
  headerBgDark:   '#1E2A2E',
  pageBgLight:    '#FBF9F5',
  pageBgDark:     '#0F1A1D',
};

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(16,185,129,${alpha})`;
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: () => {},
  updateSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading]   = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res  = await axiosInstance.get('/admin/settings');
      const data = res.data?.data ?? res.data ?? {};
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.warn('Settings fetch failed, using defaults:', err.response?.status);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!settings.dark_mode);
  }, [settings.dark_mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-compact', settings.compact_mode ? 'true' : 'false');
  }, [settings.compact_mode]);

  useEffect(() => {
    const root    = document.documentElement;
    const isDark  = !!settings.dark_mode;
    const accent  = settings.accent_color || '#10b981';
    const target  = settings.theme_target === 'page' ? 'page' : 'sidebar';

    const fixedSidebarBg = isDark ? BRAND.sidebarBgDark : BRAND.sidebarBgLight;
    const fixedHeaderBg  = isDark ? BRAND.headerBgDark  : BRAND.headerBgLight;
    const fixedPageBg    = isDark ? BRAND.pageBgDark    : BRAND.pageBgLight;

    root.style.setProperty('--accent', accent);

    if (target === 'sidebar') {
      root.style.setProperty('--sidebar-bg', accent);
      root.style.setProperty('--header-bg', accent);
      root.style.setProperty('--header-accent', accent);
      root.style.setProperty('--header-fg', '#ffffff');
      root.style.setProperty('--header-fg-muted', 'rgba(255,255,255,0.75)');
      root.style.setProperty('--page-bg', fixedPageBg);
      root.style.setProperty('--page-accent', accent);
    } else {
      root.style.setProperty('--sidebar-bg', fixedSidebarBg);
      root.style.setProperty('--header-bg', fixedHeaderBg);
      root.style.setProperty('--header-accent', fixedSidebarBg);
      root.style.setProperty('--header-fg', isDark ? '#FBF9F5' : '#1e292b');
      root.style.setProperty('--header-fg-muted', isDark ? '#9AA5A3' : '#6b7280');
      root.style.setProperty('--page-bg', hexToRgba(accent, isDark ? 0.14 : 0.06));
      root.style.setProperty('--page-accent', accent);
    }

    root.setAttribute('data-theme-target', target);
  }, [settings.accent_color, settings.theme_target, settings.dark_mode]);

  const updateSettings = async (payload) => {
    const res  = await axiosInstance.put('/admin/settings', payload);
    const data = res.data?.data ?? payload;
    setSettings(prev => ({ ...prev, ...data }));
    return res.data;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);