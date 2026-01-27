import { ReactNode, lazy, Suspense } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingButtons } from "./FloatingButtons";
import { PendingSpinHandler } from "@/components/wheel/PendingSpinHandler";

// Lazy load FortuneWheelDialog for performance
const FortuneWheelDialog = lazy(() => 
  import("@/components/wheel/FortuneWheelDialog").then(mod => ({ default: mod.FortuneWheelDialog }))
);

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButtons />
      <Suspense fallback={null}>
        <FortuneWheelDialog />
      </Suspense>
      <PendingSpinHandler />
    </div>
  );
}
