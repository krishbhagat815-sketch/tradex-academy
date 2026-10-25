import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { getMediaUrl } from '../utils/media';

export interface LogoConfig {
  logoType: 'image' | 'icon';
  logoUrl: string;
  faviconUrl: string;
  brandNamePrimary: string;
  brandNameSecondary: string;
  brandSecondaryColor: string;
  brandTagline: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  borderRadius: string;
  heightPx?: number;
}

export interface SiteSettings {
  platformName?: string;
  supportEmail?: string;
  supportPhone?: string;
  currencySymbol?: string;
  whatsapp_enabled?: boolean;
  whatsapp_number?: string;
  whatsapp_default_message?: string;
}

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  logoType: 'icon',
  logoUrl: '',
  faviconUrl: '',
  brandNamePrimary: 'The Safe',
  brandNameSecondary: 'Trading',
  brandSecondaryColor: '#16a34a',
  brandTagline: 'ગુજરાતનું શ્રેષ્ઠ શેર બજાર અને ટ્રેડિંગ શિક્ષણ',
  iconName: 'TrendingUp',
  iconColor: '#ef4444',
  bgColor: '#020617',
  borderRadius: 'rounded-xl',
  heightPx: 40
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  logo: LogoConfig;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: {},
  logo: DEFAULT_LOGO_CONFIG,
  loading: true,
  refreshSettings: async () => {}
});

const CACHE_KEY = 'tradex_site_settings_cache';

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.settings || {};
      }
    } catch {}
    return {};
  });

  const [logo, setLogo] = useState<LogoConfig>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.logo) {
          return { ...DEFAULT_LOGO_CONFIG, ...parsed.logo };
        }
      }
    } catch {}
    return DEFAULT_LOGO_CONFIG;
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await apiRequest<{ success: boolean; settings?: SiteSettings; logo?: LogoConfig }>('/content/settings');
      if (res && res.success) {
        if (res.settings) setSettings(res.settings);
        if (res.logo) {
          const mergedLogo = { ...DEFAULT_LOGO_CONFIG, ...res.logo };
          setLogo(mergedLogo);
        }
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ settings: res.settings, logo: res.logo })
          );
        } catch {}
      }
    } catch (e) {
      console.warn('Failed to load site settings, using cached or default values', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Dynamically update favicon if custom favicon or logo image is set in CMS
  useEffect(() => {
    const faviconTarget = logo.faviconUrl || (logo.logoType === 'image' && logo.logoUrl ? logo.logoUrl : '');
    if (faviconTarget) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.type = faviconTarget.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
      link.href = getMediaUrl(faviconTarget);
    }
  }, [logo.faviconUrl, logo.logoUrl, logo.logoType]);

  return (
    <SiteSettingsContext.Provider value={{ settings, logo, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
