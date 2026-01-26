import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  [key: string]: string;
}

interface PageContent {
  [sectionKey: string]: {
    title: string | null;
    content: string | null;
    extra_data: Record<string, unknown>;
  };
}

interface SiteDataContextType {
  settings: SiteSettings;
  getPageContent: (pageSlug: string) => PageContent;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [pageContents, setPageContents] = useState<Record<string, PageContent>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch site settings using raw query to bypass type issues
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings" as never)
        .select("key, value") as { data: { key: string; value: string | null }[] | null; error: Error | null };

      if (settingsError) throw settingsError;

      const settingsMap: SiteSettings = {};
      settingsData?.forEach((item) => {
        settingsMap[item.key] = item.value || "";
      });
      setSettings(settingsMap);

      // Fetch page content
      const { data: contentData, error: contentError } = await supabase
        .from("page_content" as never)
        .select("page_slug, section_key, title, content, extra_data") as { 
          data: { page_slug: string; section_key: string; title: string | null; content: string | null; extra_data: Record<string, unknown> | null }[] | null;
          error: Error | null;
        };

      if (contentError) throw contentError;

      const contentMap: Record<string, PageContent> = {};
      contentData?.forEach((item) => {
        if (!contentMap[item.page_slug]) {
          contentMap[item.page_slug] = {};
        }
        contentMap[item.page_slug][item.section_key] = {
          title: item.title,
          content: item.content,
          extra_data: item.extra_data || {},
        };
      });
      setPageContents(contentMap);
    } catch (error) {
      console.error("Error fetching site data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPageContent = (pageSlug: string): PageContent => {
    return pageContents[pageSlug] || {};
  };

  return (
    <SiteDataContext.Provider value={{ settings, getPageContent, loading, refetch: fetchData }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (context === undefined) {
    throw new Error("useSiteData must be used within a SiteDataProvider");
  }
  return context;
}

export function useSetting(key: string, defaultValue = ""): string {
  const { settings } = useSiteData();
  return settings[key] || defaultValue;
}

export function usePageContent(pageSlug: string) {
  const { getPageContent } = useSiteData();
  return getPageContent(pageSlug);
}
