import { ReactNode, useState } from "react";
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

  return (
    <div className="min-h-screen bg-muted/30 flex w-full">
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 z-40 h-screen hidden lg:block">
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

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">{title}</span>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          "lg:ml-16", // collapsed sidebar width
          sidebarOpen && "lg:ml-64" // expanded sidebar width
        )}
      >
        <div className="p-3 sm:p-6 pt-16 lg:pt-6">
          {/* Desktop Title */}
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 hidden lg:block">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
