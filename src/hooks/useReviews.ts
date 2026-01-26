import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbReview {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  content: string;
  images: string[] | null;
  status: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    images: string[] | null;
  } | null;
}

interface UseReviewsOptions {
  productId?: string;
  status?: string;
  limit?: number;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("reviews")
        .select(`
          *,
          products (id, name, images)
        `)
        .order("created_at", { ascending: false });

      if (options.productId) {
        query = query.eq("product_id", options.productId);
      }

      if (options.status) {
        query = query.eq("status", options.status);
      } else {
        // Default to approved reviews for public display
        query = query.eq("status", "approved");
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReviews(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [options.productId, options.status, options.limit]);

  return { reviews, loading, error, refetch: fetchReviews };
}

// Convenience hook for product page
export function useProductReviews(productId: string) {
  return useReviews({ productId, status: "approved" });
}
