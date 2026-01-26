import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct {
  id: string | number;
  name: string;
  price: number;
  old_price?: number | null;
  oldPrice?: number;
  discount?: number | null;
  images?: string[] | null;
  image?: string;
  type?: string | null;
  balloonCount?: number | null;
  balloon_count?: number | null;
  in_stock?: boolean | null;
  inStock?: boolean;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  itemsCount: number;
  total: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemsCount: 0,
      total: 0,

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const productIdStr = String(product.id);
        const existingItem = items.find((item) => String(item.product.id) === productIdStr);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map((item) =>
            String(item.product.id) === productIdStr
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...items, { product, quantity }];
        }

        const itemsCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        set({ items: newItems, itemsCount, total });
      },

      removeItem: (productId) => {
        const productIdStr = String(productId);
        const newItems = get().items.filter((item) => String(item.product.id) !== productIdStr);
        const itemsCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        set({ items: newItems, itemsCount, total });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const productIdStr = String(productId);
        const newItems = get().items.map((item) =>
          String(item.product.id) === productIdStr ? { ...item, quantity } : item
        );
        const itemsCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        set({ items: newItems, itemsCount, total });
      },

      clearCart: () => {
        set({ items: [], itemsCount: 0, total: 0 });
      },
    }),
    {
      name: "raduga-cart",
    }
  )
);
