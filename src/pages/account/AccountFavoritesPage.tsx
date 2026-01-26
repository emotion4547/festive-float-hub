import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, ShoppingCart, Trash2 } from "lucide-react";

interface FavoriteProduct {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    old_price: number | null;
    images: string[] | null;
    in_stock: boolean;
  } | null;
}

export default function AccountFavoritesPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            old_price,
            images,
            in_stock
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleRemove = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter((f) => f.id !== favoriteId));
      toast({ title: "Удалено из избранного" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить из избранного",
      });
    }
  };

  const handleAddToCart = (product: FavoriteProduct["products"]) => {
    if (!product) return;

    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      images: product.images || [],
      in_stock: product.in_stock,
    });

    toast({
      title: "Добавлено в корзину",
      description: product.name,
    });
  };

  if (loading) {
    return (
      <AccountLayout title="Избранное">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AccountLayout>
    );
  }

  if (favorites.length === 0) {
    return (
      <AccountLayout title="Избранное">
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">В избранном пусто</h3>
            <p className="text-muted-foreground mb-6">
              Добавляйте понравившиеся товары в избранное, чтобы не потерять их
            </p>
            <Button asChild>
              <Link to="/">Перейти в каталог</Link>
            </Button>
          </CardContent>
        </Card>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Избранное">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((favorite) => {
          const product = favorite.products;
          if (!product) return null;

          return (
            <Card key={favorite.id} className="overflow-hidden">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square bg-muted">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-lg">
                    {Number(product.price).toLocaleString("ru-RU")} ₽
                  </span>
                  {product.old_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {Number(product.old_price).toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    size="sm"
                    disabled={!product.in_stock}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.in_stock ? "В корзину" : "Нет в наличии"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemove(favorite.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AccountLayout>
  );
}
