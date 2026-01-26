import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FilterOptions {
  types: { id: string; label: string }[];
  occasions: { id: string; label: string }[];
  sizes: { id: string; label: string }[];
  colors: { id: string; label: string }[];
  categories: { id: string; label: string; slug: string }[];
}

// Labels for types, occasions, sizes
const typeLabels: Record<string, string> = {
  helium: "Гелиевые",
  latex: "Латексные",
  foil: "Фольгированные",
};

const occasionLabels: Record<string, string> = {
  birthday: "День рождения",
  wedding: "Свадьба",
  corporate: "Корпоратив",
  love: "Для влюбленных",
  discharge: "Выписка",
  holiday: "Праздник",
  anniversary: "Юбилей",
  graduation: "Выпускной",
  "new-year": "Новый год",
  "8-march": "8 марта",
  "23-february": "23 февраля",
  valentine: "День Святого Валентина",
};

const sizeLabels: Record<string, string> = {
  S: "Маленький (S)",
  M: "Средний (M)",
  L: "Большой (L)",
  XL: "Очень большой (XL)",
};

const colorLabels: Record<string, string> = {
  red: "Красный",
  blue: "Синий",
  green: "Зелёный",
  yellow: "Жёлтый",
  pink: "Розовый",
  purple: "Фиолетовый",
  orange: "Оранжевый",
  white: "Белый",
  black: "Чёрный",
  gold: "Золотой",
  silver: "Серебряный",
  multicolor: "Разноцветный",
};

export function useFilterOptions() {
  const [options, setOptions] = useState<FilterOptions>({
    types: [],
    occasions: [],
    sizes: [],
    colors: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("sort_order", { ascending: true });

        const categories = (categoriesData || []).map(c => ({
          id: c.id,
          label: c.name,
          slug: c.slug,
        }));

        // Fetch unique types
        const { data: typesData } = await supabase
          .from("products")
          .select("type")
          .not("type", "is", null);

        const uniqueTypes = [...new Set(typesData?.map(p => p.type).filter(Boolean))];
        const types = uniqueTypes.map(t => ({
          id: t!,
          label: typeLabels[t!] || t!,
        }));

        // Fetch unique occasions
        const { data: occasionsData } = await supabase
          .from("products")
          .select("occasion")
          .not("occasion", "is", null);

        const allOccasions = occasionsData?.flatMap(p => p.occasion || []) || [];
        const uniqueOccasions = [...new Set(allOccasions.filter(Boolean))];
        const occasions = uniqueOccasions.map(o => ({
          id: o,
          label: occasionLabels[o] || o,
        }));

        // Fetch unique sizes
        const { data: sizesData } = await supabase
          .from("products")
          .select("size")
          .not("size", "is", null);

        const uniqueSizes = [...new Set(sizesData?.map(p => p.size).filter(Boolean))];
        const sizes = uniqueSizes.map(s => ({
          id: s!,
          label: sizeLabels[s!] || s!,
        }));

        // Fetch unique colors
        const { data: colorsData } = await supabase
          .from("products")
          .select("colors")
          .not("colors", "is", null);

        const allColors = colorsData?.flatMap(p => p.colors || []) || [];
        const uniqueColors = [...new Set(allColors.filter(Boolean))];
        const colors = uniqueColors.map(c => ({
          id: c,
          label: colorLabels[c] || c,
        }));

        setOptions({ types, occasions, sizes, colors, categories });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, loading };
}
