import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, Palette } from "lucide-react";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { Skeleton } from "@/components/ui/skeleton";

export interface FilterState {
  priceRange: [number, number];
  types: string[];
  occasions: string[];
  sizes: string[];
  colors: string[];
  categories: string[];
  inStock: boolean | null;
}

interface DynamicFilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  showCategoryFilter?: boolean;
}

const colorMap: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  pink: "#ec4899",
  purple: "#a855f7",
  orange: "#f97316",
  white: "#ffffff",
  black: "#000000",
  gold: "#d4af37",
  silver: "#c0c0c0",
  multicolor: "linear-gradient(135deg, red, orange, yellow, green, blue, purple)",
};

export function DynamicFilterSidebar({ filters, onFilterChange, onReset, showCategoryFilter = true }: DynamicFilterSidebarProps) {
  const { options, loading } = useFilterOptions();

  const handleTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.types, typeId]
      : filters.types.filter((t) => t !== typeId);
    onFilterChange({ ...filters, types: newTypes });
  };

  const handleOccasionChange = (occasionId: string, checked: boolean) => {
    const newOccasions = checked
      ? [...filters.occasions, occasionId]
      : filters.occasions.filter((o) => o !== occasionId);
    onFilterChange({ ...filters, occasions: newOccasions });
  };

  const handleSizeChange = (sizeId: string, checked: boolean) => {
    const newSizes = checked
      ? [...filters.sizes, sizeId]
      : filters.sizes.filter((s) => s !== sizeId);
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorChange = (colorId: string, checked: boolean) => {
    const newColors = checked
      ? [...filters.colors, colorId]
      : filters.colors.filter((c) => c !== colorId);
    onFilterChange({ ...filters, colors: newColors });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter((c) => c !== categoryId);
    onFilterChange({ ...filters, categories: newCategories });
  };

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.occasions.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.categories.length > 0 ||
    filters.priceRange[0] > 300 ||
    filters.priceRange[1] < 15000 ||
    filters.inStock !== null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <Button variant="outline" onClick={onReset} className="w-full gap-2">
          <X className="h-4 w-4" />
          Сбросить фильтры
        </Button>
      )}

      {/* Categories */}
      {showCategoryFilter && options.categories.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-heading font-semibold">Категория</h4>
          <div className="space-y-2">
            {options.categories.map((option) => (
              <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={filters.categories.includes(option.id)}
                  onCheckedChange={(checked) => handleCategoryChange(option.id, checked as boolean)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="font-heading font-semibold">Цена</h4>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) =>
            onFilterChange({ ...filters, priceRange: value as [number, number] })
          }
          min={300}
          max={15000}
          step={100}
          className="mt-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filters.priceRange[0].toLocaleString("ru-RU")} ₽</span>
          <span>{filters.priceRange[1].toLocaleString("ru-RU")} ₽</span>
        </div>
      </div>

      {/* Colors */}
      {options.colors.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-heading font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Цвет
          </h4>
          <div className="flex flex-wrap gap-2">
            {options.colors.map((option) => {
              const isMulticolor = option.id === "multicolor";
              const colorStyle = isMulticolor
                ? { background: colorMap[option.id] }
                : { backgroundColor: colorMap[option.id] || "#ccc" };
              const isSelected = filters.colors.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleColorChange(option.id, !isSelected)}
                  className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                    isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-muted"
                  }`}
                  style={colorStyle}
                  title={option.label}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Type */}
      {options.types.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-heading font-semibold">Тип</h4>
          {options.types.map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.types.includes(option.id)}
                onCheckedChange={(checked) => handleTypeChange(option.id, checked as boolean)}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Occasion */}
      {options.occasions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-heading font-semibold">По поводу</h4>
          {options.occasions.map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.occasions.includes(option.id)}
                onCheckedChange={(checked) => handleOccasionChange(option.id, checked as boolean)}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Size */}
      {options.sizes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-heading font-semibold">Размер</h4>
          {options.sizes.map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.sizes.includes(option.id)}
                onCheckedChange={(checked) => handleSizeChange(option.id, checked as boolean)}
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Stock Status */}
      <div className="space-y-3">
        <h4 className="font-heading font-semibold">Наличие</h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={filters.inStock === true}
            onCheckedChange={(checked) =>
              onFilterChange({ ...filters, inStock: checked ? true : null })
            }
          />
          <span className="text-sm">Только в наличии</span>
        </label>
      </div>
    </div>
  );
}
