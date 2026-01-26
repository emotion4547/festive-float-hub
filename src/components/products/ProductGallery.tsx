import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface ProductGalleryProps {
  images: string[];
  videos?: string[];
  liveCoverUrl?: string | null;
  productName: string;
}

export function ProductGallery({ images, videos = [], liveCoverUrl, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Combine all media into a single array
  const mediaItems: MediaItem[] = [
    ...images.map(url => ({ url, type: "image" as const })),
    ...videos.map(url => ({ url, type: "video" as const })),
  ];

  const currentMedia = mediaItems[selectedIndex];

  const handlePrev = () => {
    setSelectedIndex(prev => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex(prev => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setIsLightboxOpen(false);
  };

  if (mediaItems.length === 0) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
        <span className="text-6xl">🎈</span>
      </div>
    );
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main Display */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
        {currentMedia.type === "video" ? (
          <video
            ref={videoRef}
            src={currentMedia.url}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        ) : (
          <>
            <img
              src={currentMedia.url}
              alt={`${productName} - изображение ${selectedIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300"
            />
            {/* Zoom button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Navigation arrows */}
        {mediaItems.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Dots indicator for mobile */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  selectedIndex === index ? "bg-primary" : "bg-background/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {mediaItems.length > 1 && (
        <div className="hidden md:flex gap-3 overflow-x-auto pb-2">
          {mediaItems.map((media, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              {media.type === "video" ? (
                <>
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </>
              ) : (
                <img
                  src={media.url}
                  alt={`${productName} миниатюра ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {currentMedia.type === "video" ? (
              <video
                src={currentMedia.url}
                className="max-w-full max-h-[85vh] object-contain"
                controls
                autoPlay
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={productName}
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}

            {mediaItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {selectedIndex + 1} / {mediaItems.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
