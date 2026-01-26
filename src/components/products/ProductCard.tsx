import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface ProductCardProduct {
  id: string | number;
  name: string;
  price: number;
  old_price?: number | null;
  oldPrice?: number;
  discount?: number | null;
  in_stock?: boolean;
  inStock?: boolean;
  on_order?: boolean;
  onOrder?: boolean;
  rating?: number | null;
  reviews_count?: number | null;
  reviewsCount?: number;
  images?: string[] | null;
  is_new?: boolean;
  isNew?: boolean;
  is_hit?: boolean;
  isHit?: boolean;
  live_cover_url?: string | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isProductFavorite = isFavorite(product.id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Normalize product fields for both DB and static data
  const inStock = product.in_stock ?? product.inStock ?? true;
  const onOrder = product.on_order ?? product.onOrder ?? false;
  const rating = product.rating ?? 0;
  const reviewsCount = product.reviews_count ?? product.reviewsCount ?? 0;
  const oldPrice = product.old_price ?? product.oldPrice;
  const isNew = product.is_new ?? product.isNew ?? false;
  const isHit = product.is_hit ?? product.isHit ?? false;
  const images = product.images || [];
  const imageUrl = images[0] || "https://placehold.co/400x400?text=🎈";
  const liveCoverUrl = product.live_cover_url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product as any);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product as any);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-festive overflow-hidden h-full flex flex-col">
        {/* Image/Video Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {liveCoverUrl ? (
            <>
              {/* Fallback image shown when video is not playing */}
              <img
                src={imageUrl}
                alt={product.name}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                  isHovering ? "opacity-0" : "opacity-100"
                )}
              />
              {/* Video - always rendered but hidden when not hovering */}
              <video
                ref={videoRef}
                src={liveCoverUrl}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  isHovering ? "opacity-100" : "opacity-0"
                )}
                loop
                muted={isMuted}
                playsInline
                preload="metadata"
              />
              {/* Sound toggle button */}
              {isHovering && (
                <button
                  onClick={handleToggleMute}
                  className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm p-2 rounded-full z-10 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </>
          ) : (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && <span className="badge-new">Новое</span>}
            {isHit && <span className="badge-hit">Хит</span>}
            {product.discount && (
              <span className="bg-error text-error-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                -{product.discount}%
              </span>
            )}
            {liveCoverUrl && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
                LIVE
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center transition-all",
              isProductFavorite
                ? "bg-secondary text-secondary-foreground"
                : "bg-background/80 backdrop-blur text-muted-foreground hover:text-secondary"
            )}
          >
            <Heart className={cn("h-5 w-5", isProductFavorite && "fill-current")} />
          </button>

          {/* Stock Status */}
          {!inStock && onOrder && (
            <div className="absolute bottom-3 left-3 bg-warning/90 text-warning-foreground text-xs font-medium px-2 py-1 rounded">
              На заказ
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewsCount})</span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-2 flex-1">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            <span className="price-tag text-xl">{product.price.toLocaleString("ru-RU")} ₽</span>
            {oldPrice && (
              <span className="price-old">{oldPrice.toLocaleString("ru-RU")} ₽</span>
            )}
          </div>

          {/* Actions - always at bottom */}
          <Button
            onClick={handleAddToCart}
            className="w-full btn-primary mt-3"
            disabled={!inStock && !onOrder}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {inStock ? "В корзину" : onOrder ? "Заказать" : "Нет в наличии"}
          </Button>
        </div>
      </div>
    </Link>
  );
}
