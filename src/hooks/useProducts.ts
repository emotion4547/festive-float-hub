import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  name: string;
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
  colors: string[] | null;
  balloon_count: number | null;
  live_cover_url: string | null;
  videos: string[] | null;
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

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("products")
          .select(`
            *,
            categories (name, slug)
          `)
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
        }

        const { data, error } = await query;

        if (error) throw error;

        setProducts(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [options.categorySlug, options.search, options.limit, options.isNew, options.isHit]);

  return { products, loading, error };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            categories (name, slug)
          `)
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        setProduct(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; image: string | null; parent_id: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, image, parent_id")
          .order("sort_order", { ascending: true });

        if (error) throw error;

        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}
