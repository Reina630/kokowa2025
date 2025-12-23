import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="font-heading text-8xl md:text-9xl font-bold text-primary mb-4">
          404
        </h1>
        <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase text-foreground mb-4">
          Page introuvable
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 btn-hero-primary px-8 py-4"
        >
          <Home size={20} />
          Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
