import { Link } from "react-router-dom";
import { Heart, ChevronRight, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { useFavorites } from "@/hooks/useFavorites";
import { products } from "@/data/products";

const FavoritesPage = () => {
  const { items, removeFavorite } = useFavorites();

  const recommendedProducts = products
    .filter((p) => !items.find((item) => item.id === p.id))
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-md mx-auto text-center">
            <Heart className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
            <h1 className="font-heading text-2xl font-bold mb-4">
              В избранном пусто
            </h1>
            <p className="text-muted-foreground mb-8">
              Добавляйте понравившиеся товары, чтобы не потерять их
            </p>
            <Button asChild size="lg" className="btn-primary">
              <Link to="/">Перейти в каталог</Link>
            </Button>
          </div>

          {recommendedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-heading text-2xl font-bold mb-8 text-center">
                Может понравиться
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Главная
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Избранное</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        <h1 className="font-heading text-3xl font-bold mb-8">
          Избранное ({items.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default FavoritesPage;
