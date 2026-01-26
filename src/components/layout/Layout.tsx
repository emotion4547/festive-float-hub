import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingButtons } from "./FloatingButtons";
import { FortuneWheelDialog } from "@/components/wheel/FortuneWheelDialog";
import { PendingSpinHandler } from "@/components/wheel/PendingSpinHandler";

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
      <FortuneWheelDialog />
      <PendingSpinHandler />
    </div>
  );
}
