import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ProductCard } from "@/components/products/ProductCard";
import { QuickViewDialog } from "@/components/products/QuickViewDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  discount: number | null;
  images: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  is_new: boolean | null;
  is_hit: boolean | null;
  in_stock: boolean | null;
  live_cover_url: string | null;
}

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!slug) return;

      // Fetch collection by slug
      const { data: collectionData, error: collectionError } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (collectionError || !collectionData) {
        setLoading(false);
        return;
      }

      setCollection(collectionData);

      // Fetch direct products
      const { data: directProducts } = await supabase
        .from("collection_products")
        .select(`
          product:products(
            id, name, price, old_price, discount, images, 
            rating, reviews_count, is_new, is_hit, in_stock, live_cover_url
          )
        `)
        .eq("collection_id", collectionData.id);

      // Fetch category products
      const { data: categoryLinks } = await supabase
        .from("collection_categories")
        .select("category_id")
        .eq("collection_id", collectionData.id);

      const categoryIds = categoryLinks?.map((cl) => cl.category_id) || [];

      let categoryProducts: Product[] = [];
      if (categoryIds.length > 0) {
        const { data: catProducts } = await supabase
          .from("products")
          .select("id, name, price, old_price, discount, images, rating, reviews_count, is_new, is_hit, in_stock, live_cover_url")
          .in("category_id", categoryIds);

        categoryProducts = catProducts || [];
      }

      // Combine and deduplicate products
      const directProductsList = (directProducts || [])
        .map((dp: any) => dp.product)
        .filter(Boolean) as Product[];

      const allProducts = [...directProductsList];
      categoryProducts.forEach((cp) => {
        if (!allProducts.find((p) => p.id === cp.id)) {
          allProducts.push(cp);
        }
      });

      setProducts(allProducts);
      setLoading(false);
    };

    fetchCollection();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <SEOHead title="Загрузка..." description="Загрузка подборки товаров" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!collection) {
    return (
      <Layout>
        <SEOHead title="Подборка не найдена" description="Запрашиваемая подборка не найдена или удалена" />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Подборка не найдена</h1>
          <p className="text-muted-foreground">
            Возможно, она была удалена или период её действия закончился.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${collection.name} | Радуга Праздника`}
        description={collection.description || `Подборка товаров "${collection.name}" в магазине Радуга Праздника`}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {collection.image_url && (
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
              <img
                src={collection.image_url}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h1 className="absolute bottom-4 left-4 text-3xl md:text-4xl font-bold text-white">
                {collection.name}
              </h1>
            </div>
          )}
          {!collection.image_url && (
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{collection.name}</h1>
          )}
          {collection.description && (
            <p className="text-muted-foreground text-lg">{collection.description}</p>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            В этой подборке пока нет товаров
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  old_price: product.old_price,
                  discount: product.discount,
                  images: product.images,
                  rating: product.rating,
                  reviews_count: product.reviews_count,
                  is_new: product.is_new,
                  is_hit: product.is_hit,
                  in_stock: product.in_stock,
                  live_cover_url: product.live_cover_url,
                }}
                onQuickView={() => setQuickViewProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={
          quickViewProduct
            ? {
                id: quickViewProduct.id,
                name: quickViewProduct.name,
                price: quickViewProduct.price,
                oldPrice: quickViewProduct.old_price || undefined,
                discount: quickViewProduct.discount || undefined,
                images: quickViewProduct.images || [],
                rating: quickViewProduct.rating || 0,
                reviewsCount: quickViewProduct.reviews_count || 0,
                description: "",
                inStock: quickViewProduct.in_stock !== false,
              }
            : null
        }
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </Layout>
  );
}
