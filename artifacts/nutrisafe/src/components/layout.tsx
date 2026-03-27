import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  History, 
  Settings as SettingsIcon, 
  Menu,
  X,
  Leaf
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Calibration", icon: SettingsIcon },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <img 
            src={`${import.meta.env.BASE_URL}images/logo.png`} 
            alt="NutriSafe" 
            className="w-8 h-8 object-contain"
            onError={(e) => {
              // Fallback if image generation isn't ready
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Leaf className="w-8 h-8 text-primary hidden" />
          <span className="font-display font-bold text-xl text-foreground">NutriSafe</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-[73px] bg-card/95 backdrop-blur-md border-b border-border z-30 shadow-lg"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-card border-r border-border h-screen sticky top-0 z-30">
        <div className="p-8 flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo.png`} 
              alt="NutriSafe" 
              className="w-8 h-8 object-contain absolute inset-0 m-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Leaf className="w-6 h-6 text-primary hidden" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground tracking-tight">NutriSafe</span>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    "transition-transform duration-200", 
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} 
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 m-4 mt-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
          <h4 className="font-display font-bold text-sm text-foreground mb-1">Sensor Active</h4>
          <p className="text-xs text-muted-foreground">Connected to ESP32 via secure API.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <div className="p-4 md:p-8 lg:p-10 w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
