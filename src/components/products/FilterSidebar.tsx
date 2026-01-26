import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface FilterState {
  priceRange: [number, number];
  types: string[];
  occasions: string[];
  sizes: string[];
  inStock: boolean | null;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const typeOptions = [
  { id: "helium", label: "Гелиевые" },
  { id: "latex", label: "Латексные" },
  { id: "foil", label: "Фольгированные" },
];

const occasionOptions = [
  { id: "birthday", label: "День рождения" },
  { id: "wedding", label: "Свадьба" },
  { id: "corporate", label: "Корпоратив" },
  { id: "love", label: "Для влюбленных" },
  { id: "discharge", label: "Выписка" },
];

const sizeOptions = [
  { id: "S", label: "Маленький (S)" },
  { id: "M", label: "Средний (M)" },
  { id: "L", label: "Большой (L)" },
];

export function FilterSidebar({ filters, onFilterChange, onReset }: FilterSidebarProps) {
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

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.occasions.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange[0] > 300 ||
    filters.priceRange[1] < 15000 ||
    filters.inStock !== null;

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <Button variant="outline" onClick={onReset} className="w-full gap-2">
          <X className="h-4 w-4" />
          Сбросить фильтры
        </Button>
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

      {/* Type */}
      <div className="space-y-3">
        <h4 className="font-heading font-semibold">Тип</h4>
        {typeOptions.map((option) => (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={filters.types.includes(option.id)}
              onCheckedChange={(checked) => handleTypeChange(option.id, checked as boolean)}
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Occasion */}
      <div className="space-y-3">
        <h4 className="font-heading font-semibold">По поводу</h4>
        {occasionOptions.map((option) => (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={filters.occasions.includes(option.id)}
              onCheckedChange={(checked) => handleOccasionChange(option.id, checked as boolean)}
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Size */}
      <div className="space-y-3">
        <h4 className="font-heading font-semibold">Размер</h4>
        {sizeOptions.map((option) => (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={filters.sizes.includes(option.id)}
              onCheckedChange={(checked) => handleSizeChange(option.id, checked as boolean)}
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>

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
