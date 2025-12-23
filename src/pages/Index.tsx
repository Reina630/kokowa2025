import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import heroBg from "@/assets/hero.png";
import croixIcon from "@/assets/croix.png";
import sabreIcon from "@/assets/sarbre.png";
import Layout from "@/components/layout/Layout";
import lutteursService from "@/services/lutteursService";
import affrontementsService from "@/services/affrontementsService";

// Animated counter component
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-heading text-4xl md:text-5xl font-bold text-foreground">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const Index = () => {
  const [statistics, setStatistics] = useState([
    { value: 0, label: "Combats", suffix: "" },
    { value: 0, label: "Pronostics", suffix: "" },
    { value: 0, label: "Soutiens", suffix: "" },
    { value: 850, label: "Récompenses", suffix: "K" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lutteursData, affrontementsData] = await Promise.all([
          lutteursService.getLutteurs(),
          affrontementsService.getAffrontements()
        ]);

        // Calculer les statistiques
        const totalCombats = affrontementsData.length;
        const totalPronostics = affrontementsData.reduce((sum, aff) => sum + aff.nb_votes_l1 + aff.nb_votes_l2, 0);
        const totalSoutiens = lutteursData.reduce((sum, lutteur) => sum + lutteur.total_soutiens, 0);

        setStatistics([
          { value: totalCombats, label: "Combats", suffix: "" },
          { value: totalPronostics, label: "Pronostics", suffix: "" },
          { value: totalSoutiens, label: "Soutiens", suffix: "" },
          { value: 850, label: "Récompenses", suffix: "K" }, // Gardé hardcodé car API pas prête
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Lutteurs traditionnels"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-3 md:gap-6"
          >
            {/* Sabre à gauche - couvre les deux lignes */}
            <img src={sabreIcon} alt="Sabre" className="h-20 md:h-44 lg:h-56 w-auto" />
            
            {/* Titre principal */}
            <div className="text-center">
              <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight mb-2 flex items-center justify-center gap-3">
                <span className="text-foreground">KOKOWA</span>
                <img src={croixIcon} alt="Croix du Sud" className="h-12 md:h-16 lg:h-20 w-auto" />
              </h1>
              <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-foreground mb-6">
                TAHOUA 2025
              </h2>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-foreground/80 max-w-3xl mx-auto mb-10 font-body leading-relaxed px-4"
          >
            La plateforme de référence pour la lutte traditionnelle nigérienne.
            <br className="hidden md:block" />
            Suivez vos lutteurs préférés, pronostiquez et soutenez vos champions.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4"
          >
            <Link
              to="/pronostics"
              className="btn-hero-primary w-full sm:w-auto text-center"
            >
              Voir les pronostics
            </Link>
            <Link
              to="/lutteurs"
              className="btn-hero-secondary w-full sm:w-auto text-center"
            >
              Découvrir les lutteurs
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-foreground/50"
          >
            <ChevronDown size={40} />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className="font-heading text-3xl md:text-4xl font-bold uppercase text-foreground mb-4">
              46ème Édition
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Le Sabre National, la plus grande compétition de lutte traditionnelle du Niger
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Suivez les combats",
                description: "Restez informé en temps réel sur tous les affrontements du tournoi",
                icon: "⚔️",
              },
              {
                title: "Pronostiquez",
                description: "Faites vos prédictions et défiez les autres fans de Kokowa",
                icon: "🔥",
              },
              {
                title: "Soutenez",
                description: "Apportez votre soutien et récompensez vos champions préférés",
                icon: "💪",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center p-8 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <span className="text-5xl mb-6 block">{feature.icon}</span>
                <h4 className="font-heading text-xl font-bold uppercase text-foreground mb-3">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
