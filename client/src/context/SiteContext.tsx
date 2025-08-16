import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SiteSetting {
  id: number;
  key: string;
  value: string | null;
  type: string;
  description: string | null;
  updatedAt: string;
}

interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteLogo: string | null;
  storeInfo: {
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  socialLinks: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
    youtube: string | null;
    website: string | null;
  };
}

interface SiteContextType {
  settings: SiteSettings;
  isLoading: boolean;
  refetch: () => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const { data: rawSettings = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/site-settings'],
    queryFn: () => apiRequest('/api/site-settings'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform raw settings into structured format
  const settings: SiteSettings = React.useMemo(() => {
    const settingsMap = rawSettings.reduce((acc: Record<string, string>, setting: SiteSetting) => {
      if (setting.value) {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {});

    return {
      siteName: settingsMap.site_name || 'HarvestDirect',
      siteTagline: settingsMap.site_tagline || 'Fresh from Farm to Your Table',
      siteLogo: settingsMap.site_logo || null,
      storeInfo: {
        email: settingsMap.store_email || 'contact@harvestdirect.com',
        phone: settingsMap.store_phone || '+1 (555) 123-4567',
        address: settingsMap.store_address || '123 Harvest Lane',
        city: settingsMap.store_city || 'Farmington',
        state: settingsMap.store_state || 'California',
        zip: settingsMap.store_zip || '90210',
        country: settingsMap.store_country || 'United States',
      },
      socialLinks: {
        facebook: settingsMap.social_facebook || null,
        instagram: settingsMap.social_instagram || null,
        twitter: settingsMap.social_twitter || null,
        linkedin: settingsMap.social_linkedin || null,
        youtube: settingsMap.social_youtube || null,
        website: settingsMap.social_website || null,
      },
    };
  }, [rawSettings]);

  return (
    <SiteContext.Provider value={{ settings, isLoading, refetch }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteProvider');
  }
  return context;
}