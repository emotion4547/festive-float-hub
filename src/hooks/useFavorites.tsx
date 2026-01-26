import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteProduct {
  id: string | number;
  name: string;
  price: number;
  old_price?: number | null;
  oldPrice?: number;
  discount?: number | null;
  images?: string[] | null;
  image?: string;
}

interface FavoritesState {
  items: FavoriteProduct[];
  favoritesCount: number;
  addFavorite: (product: FavoriteProduct) => void;
  removeFavorite: (productId: string | number) => void;
  isFavorite: (productId: string | number) => boolean;
  toggleFavorite: (product: FavoriteProduct) => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      favoritesCount: 0,

      addFavorite: (product) => {
        const items = get().items;
        const productIdStr = String(product.id);
        if (!items.find((item) => String(item.id) === productIdStr)) {
          const newItems = [...items, product];
          set({ items: newItems, favoritesCount: newItems.length });
        }
      },

      removeFavorite: (productId) => {
        const productIdStr = String(productId);
        const newItems = get().items.filter((item) => String(item.id) !== productIdStr);
        set({ items: newItems, favoritesCount: newItems.length });
      },

      isFavorite: (productId) => {
        const productIdStr = String(productId);
        return get().items.some((item) => String(item.id) === productIdStr);
      },

      toggleFavorite: (product) => {
        const isFav = get().isFavorite(product.id);
        if (isFav) {
          get().removeFavorite(product.id);
        } else {
          get().addFavorite(product);
        }
      },
    }),
    {
      name: "raduga-favorites",
    }
  )
);
