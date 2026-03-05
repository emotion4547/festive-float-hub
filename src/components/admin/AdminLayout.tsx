import { ReactNode, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { AnimatePresence, motion } from "framer-motion";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="h-screen bg-muted/30 flex w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="fixed left-0 top-0 z-50 h-screen lg:hidden"
            >
              <AdminSidebar open={true} setOpen={() => {}} isMobile />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-[-48px] bg-background rounded-full shadow-lg"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex-shrink-0 bg-background border-b z-30">
          <div className="flex items-center justify-between px-4 h-14">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold truncate max-w-[200px]">{title}</span>
            <div className="w-10" />
          </div>
        </header>

        {/* Scrollable Content */}
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div className="p-3 sm:p-6">
            {/* Desktop Title */}
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 hidden lg:block truncate">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
