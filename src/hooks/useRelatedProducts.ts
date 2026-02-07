import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  price: number;
  old_price?: number | null;
  discount?: number | null;
  images?: string[] | null;
  category_id?: string | null;
  in_stock?: boolean | null;
  is_new?: boolean | null;
  is_hit?: boolean | null;
  rating?: number | null;
  reviews_count?: number | null;
}

export function useRelatedProducts(excludeIds: (string | number)[] = [], limit = 4) {
  const { items } = useCart();

  // Get unique category IDs from cart items
  const cartCategoryIds = useMemo(() => {
    const categoryIds = new Set<string>();
    items.forEach(item => {
      const product = item.product as { category_id?: string | null };
      if (product.category_id) {
        categoryIds.add(product.category_id);
      }
    });
    return Array.from(categoryIds);
  }, [items]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["related-products", cartCategoryIds, excludeIds],
    queryFn: async () => {
      if (cartCategoryIds.length === 0) {
        // If no categories from cart, fetch popular products
        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, old_price, discount, images, category_id, in_stock, is_new, is_hit, rating, reviews_count")
          .eq("in_stock", true)
          .order("reviews_count", { ascending: false, nullsFirst: false })
          .limit(limit * 2);

        if (error) throw error;
        return data || [];
      }

      // Fetch products from same categories
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, old_price, discount, images, category_id, in_stock, is_new, is_hit, rating, reviews_count")
        .in("category_id", cartCategoryIds)
        .eq("in_stock", true)
        .order("is_hit", { ascending: false, nullsFirst: false })
        .order("rating", { ascending: false, nullsFirst: false })
        .limit(limit * 3);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Filter out excluded IDs and limit results
  const filteredProducts = useMemo(() => {
    const excludeSet = new Set(excludeIds.map(String));
    return products
      .filter(p => !excludeSet.has(String(p.id)))
      .slice(0, limit);
  }, [products, excludeIds, limit]);

  return { products: filteredProducts, isLoading };
}
