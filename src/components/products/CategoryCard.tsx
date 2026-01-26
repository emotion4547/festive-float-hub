import { Link } from "react-router-dom";
import { Category } from "@/data/products";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={category.href} className="group">
      <div className="relative aspect-square rounded-2xl overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-heading font-bold text-lg text-background group-hover:text-primary transition-colors">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
