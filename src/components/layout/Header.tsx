import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RejoindreForm from "@/components/RejoindreForm";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import kokowaLogo from "@/assets/kokowa-logo.png";
import kokowaLogo2 from "@/assets/kokowa-logo2.png";
import bandeBg from "@/assets/bande.png";

const navItems = [
  { label: "ACCUEIL", path: "/" },
  { label: "LUTTEURS", path: "/lutteurs" },
  { label: "PRONOSTICS", path: "/pronostics" },
   { label: "Historique", path: "/chroniques" },
  { label: "FAQ", path: "/faq" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 min-h-[4.5rem] md:min-h-[5.5rem] flex flex-col justify-center` + (scrolled ? " shadow-lg" : "")}
        style={{
          backgroundImage: `url(${bandeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md" : "bg-background/60"
        }`} />
        <div className="w-full relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-4">
              <img
                src={kokowaLogo}
                alt="Kokowa Sabre National Tahoua 2025"
                className="h-12 md:h-16 w-auto"
              />
              {/* <img
                src={kokowaLogo2}
                alt="Kokowa Logo 2"
                className="h-12 md:h-16 w-auto"
              /> */}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-heading text-sm uppercase tracking-wider transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="ml-4 bg-orange-500 hover:bg-orange-600 text-white font-heading font-bold uppercase tracking-tight rounded px-4 py-2 shadow transition-all"
                  >
                    Rejoindre
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rejoindre Kokowa</DialogTitle>
                  </DialogHeader>
                  <RejoindreForm />
                </DialogContent>
              </Dialog>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden touch-target flex items-center justify-center text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-card z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-heading text-lg uppercase text-foreground">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="touch-target flex items-center justify-center text-foreground"
                    aria-label="Close menu"
                  >
                    <X size={28} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`mobile-nav-item block border-b border-border/50 ${
                          location.pathname === item.path
                            ? "text-primary"
                            : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Rejoindre button in mobile menu */}
                <div className="p-4 border-t border-border">
                  <Link
                    to="/rejoindre"
                    className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-heading font-bold uppercase tracking-tight rounded px-4 py-3 shadow transition-all"
                  >
                    Rejoindre
                  </Link>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
