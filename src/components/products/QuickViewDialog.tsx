import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Minus, Plus, X, ChevronLeft, ChevronRight, Volume2, VolumeX, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Product {
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
  description?: string | null;
}

interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!product) return null;

  const inStock = product.in_stock ?? product.inStock ?? true;
  const onOrder = product.on_order ?? product.onOrder ?? false;
  const rating = product.rating ?? 0;
  const reviewsCount = product.reviews_count ?? product.reviewsCount ?? 0;
  const oldPrice = product.old_price ?? product.oldPrice;
  const isNew = product.is_new ?? product.isNew ?? false;
  const isHit = product.is_hit ?? product.isHit ?? false;
  const images = product.images?.filter(Boolean) || [];
  const liveCoverUrl = product.live_cover_url;
  const isProductFavorite = isFavorite(product.id);

  // Combine live cover with images for gallery
  const allMedia = liveCoverUrl ? [liveCoverUrl, ...images] : images;
  const currentMedia = allMedia[currentImageIndex] || "https://placehold.co/400x400?text=🎈";
  const isCurrentVideo = liveCoverUrl && currentImageIndex === 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product as any);
    }
    onOpenChange(false);
    setQuantity(1);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product as any);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
        <VisuallyHidden>
          <DialogTitle>Быстрый просмотр: {product.name}</DialogTitle>
        </VisuallyHidden>
        
        <motion.div 
          className="grid md:grid-cols-2 gap-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Gallery */}
          <div className="relative bg-muted aspect-square md:aspect-auto md:h-full">
            {/* Main Image/Video */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {isCurrentVideo ? (
                  <video
                    ref={videoRef}
                    src={currentMedia}
                    className="w-full h-full object-cover"
                    loop
                    muted={isMuted}
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img
                    src={currentMedia}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Video Sound Toggle */}
            {isCurrentVideo && (
              <button
                onClick={handleToggleMute}
                className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full z-10"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}

            {/* Navigation Arrows */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isNew && <Badge className="bg-accent-green text-white">Новое</Badge>}
              {isHit && <Badge className="bg-secondary text-secondary-foreground">Хит</Badge>}
              {product.discount && (
                <Badge variant="destructive">-{product.discount}%</Badge>
              )}
              {liveCoverUrl && (
                <Badge className="bg-primary animate-pulse">LIVE</Badge>
              )}
            </div>

            {/* Thumbnails */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allMedia.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentImageIndex === index ? "bg-primary w-4" : "bg-background/60"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">({reviewsCount} отзывов)</span>
            </div>

            {/* Title */}
            <h2 className="font-heading text-xl md:text-2xl font-bold mb-4 line-clamp-2">
              {product.name}
            </h2>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3 whitespace-pre-line">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                {product.price.toLocaleString("ru-RU")} ₽
              </span>
              {oldPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {oldPrice.toLocaleString("ru-RU")} ₽
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {inStock ? (
                <span className="text-sm text-accent-green font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent-green rounded-full" />
                  В наличии
                </span>
              ) : onOrder ? (
                <span className="text-sm text-warning font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-warning rounded-full" />
                  Под заказ
                </span>
              ) : (
                <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                  Нет в наличии
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Количество:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <Button
                onClick={handleAddToCart}
                className="flex-1 btn-primary"
                disabled={!inStock && !onOrder}
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                В корзину
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleFavorite}
                className={cn(isProductFavorite && "border-secondary text-secondary")}
              >
                <Heart className={cn("h-5 w-5", isProductFavorite && "fill-current")} />
              </Button>
            </div>

            {/* View Full Page Link */}
            <Link
              to={`/product/${product.id}`}
              onClick={() => onOpenChange(false)}
              className="mt-4 text-center text-sm text-primary hover:underline flex items-center justify-center gap-1"
            >
              <Eye className="h-4 w-4" />
              Перейти на страницу товара
            </Link>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
