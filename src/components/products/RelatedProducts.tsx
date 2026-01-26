import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId: string | null;
  limit?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  discount: number | null;
  in_stock: boolean;
  on_order: boolean;
  rating: number;
  reviews_count: number;
  images: string[] | null;
  is_new: boolean;
  is_hit: boolean;
}

export function RelatedProducts({ currentProductId, categoryId, limit = 4 }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("products")
          .select("id, name, price, old_price, discount, in_stock, on_order, rating, reviews_count, images, is_new, is_hit")
          .neq("id", currentProductId)
          .eq("in_stock", true)
          .order("rating", { ascending: false })
          .order("reviews_count", { ascending: false })
          .limit(limit);

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // If we don't have enough from the same category, fetch more from other categories
        if (data && data.length < limit && categoryId) {
          const { data: moreData } = await supabase
            .from("products")
            .select("id, name, price, old_price, discount, in_stock, on_order, rating, reviews_count, images, is_new, is_hit")
            .neq("id", currentProductId)
            .neq("category_id", categoryId)
            .eq("in_stock", true)
            .order("rating", { ascending: false })
            .limit(limit - data.length);

          if (moreData) {
            setProducts([...data, ...moreData]);
            return;
          }
        }

        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentProductId, categoryId, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
