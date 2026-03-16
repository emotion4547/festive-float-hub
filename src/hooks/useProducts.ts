import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  name: string;
  created_at?: string;
  description: string | null;
  price: number;
  old_price: number | null;
  discount: number | null;
  category_id: string | null;
  type: string | null;
  occasion: string[] | null;
  size: string | null;
  in_stock: boolean;
  on_order: boolean;
  rating: number;
  reviews_count: number;
  images: string[] | null;
  is_new: boolean;
  is_hit: boolean;
  is_visible: boolean;
  colors: string[] | null;
  balloon_count: number | null;
  live_cover_url: string | null;
  videos: string[] | null;
  keywords: string[] | null;
  categories?: {
    name: string;
    slug: string;
  } | null;
}

interface UseProductsOptions {
  categorySlug?: string;
  search?: string;
  limit?: number;
  isNew?: boolean;
  isHit?: boolean;
}

async function fetchAllProducts(options: UseProductsOptions): Promise<DbProduct[]> {
  let query = supabase
    .from("products")
    .select(`
      *,
      categories (name, slug)
    `)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (options.categorySlug) {
    query = query.eq("categories.slug", options.categorySlug);
  }

  if (options.search) {
    query = query.ilike("name", `%${options.search}%`);
  }

  if (options.isNew) {
    query = query.eq("is_new", true);
  }

  if (options.isHit) {
    query = query.eq("is_hit", true);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  } else {
    // Override Supabase default 1000-row limit for full catalog
    query = query.range(0, 2999);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export function useProducts(options: UseProductsOptions = {}) {
  const queryKey = ["products", options.categorySlug, options.search, options.limit, options.isNew, options.isHit];

  const { data: products = [], isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: () => fetchAllProducts(options),
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000,
  });

  return { products, loading, error: error as Error | null };
}

export function useProduct(id: string) {
  const { data: product = null, isLoading: loading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (name, slug)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as DbProduct | null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return { product, loading, error: error as Error | null };
}

export function useCategories() {
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image, parent_id, is_visible")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return { categories, loading };
}
