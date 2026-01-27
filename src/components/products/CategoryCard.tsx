import { Link } from "react-router-dom";
import { Category } from "@/data/products";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <CardContainer containerClassName="w-full">
      <CardBody className="w-full">
        <Link to={category.href} className="block w-full">
          <CardItem
            translateZ={50}
            className="w-full"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
              <CardItem
                translateZ={30}
                className="w-full h-full"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </CardItem>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <CardItem
                translateZ={60}
                className="absolute bottom-0 left-0 right-0 p-4"
              >
                <h3 className="font-heading font-bold text-lg text-background">
                  {category.name}
                </h3>
              </CardItem>
            </div>
          </CardItem>
        </Link>
      </CardBody>
    </CardContainer>
  );
}
