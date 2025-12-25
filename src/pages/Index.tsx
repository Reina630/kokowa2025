
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, Heart, MapPin, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import hero2 from "@/assets/hero2.jpeg";
import hero3 from "@/assets/hero3.jpeg";
import hero4 from "@/assets/hero4.jpeg";
import hero1 from "@/assets/hero1.jpeg";
import croixIcon from "@/assets/croix.png";
import sabreIcon from "@/assets/sarbre.png";
import Layout from "@/components/layout/Layout";
import lutteursService from "@/services/lutteursService";
import affrontementsService from "@/services/affrontementsService";

// Carrousel simple sans dépendance externe
const images = [
  // { src: gem1, alt: "Kokowa 1" },
  { src: hero2, alt: "Kokowa 2" },
  { src: hero3, alt: "Kokowa 3" },
  { src: hero4, alt: "Kokowa 4" },
  { src: hero1, alt: "Kokowa 5" },
];

function CarrouselImages() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto défilement
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [index]);

  return (
    <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-background/80 backdrop-blur relative">
      <img
        src={images[index].src}
        alt={images[index].alt}
        className="w-full h-[340px] object-cover object-center transition-all duration-700"
        style={{ maxHeight: 400 }}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, i) => (
          <button
            key={img.alt}
            className={`w-3 h-3 rounded-full border border-white/60 ${i === index ? 'bg-primary' : 'bg-white/30'}`}
            onClick={() => setIndex(i)}
            aria-label={`Aller à l'image ${i+1}`}
          />
        ))}
      </div>
    </div>
  );
}

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
  const [, setStatistics] = useState([
    { value: 0, label: "Combats", suffix: "" },
    { value: 0, label: "Pronostics", suffix: "" },
    { value: 0, label: "Soutiens", suffix: "" },
    { value: 850, label: "Récompenses", suffix: "K" },
  ]);

  const [previewFighters, setPreviewFighters] = useState<
    Array<{
      id: string;
      name: string;
      region: string;
      status: "active" | "eliminated";
      supports: number;
    }>
  >([]);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // État pour le match en cours
  const [currentMatch, setCurrentMatch] = useState<{
    id: number;
    fighter1: { id: string; name: string; region: string; votes: number };
    fighter2: { id: string; name: string; region: string; votes: number };
    round: string;
    date: string;
  } | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);
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

        const mapped = lutteursData
          .map((lutteur) => ({
            id: lutteur.id,
            name: lutteur.nom,
            region: lutteur.region,
            status: !lutteur.en_lisse ? "active" : "eliminated",
            supports: lutteur.total_soutiens,
          }))
          .sort((a, b) => b.supports - a.supports);

        setPreviewFighters(mapped.slice(0, 4));

        // Charger le match en cours ou à venir
        setMatchLoading(true);
        const activeMatch = affrontementsData.find(
          (aff) => aff.status === "en_cours" || aff.status === "a_venir"
        );

        if (activeMatch) {
          const fighter1Data = lutteursData.find((l) => l.id === activeMatch.l1);
          const fighter2Data = lutteursData.find((l) => l.id === activeMatch.l2);

          if (fighter1Data && fighter2Data) {
            setCurrentMatch({
              id: activeMatch.id,
              fighter1: {
                id: fighter1Data.id,
                name: fighter1Data.nom,
                region: fighter1Data.region,
                votes: activeMatch.nb_votes_l1,
              },
              fighter2: {
                id: fighter2Data.id,
                name: fighter2Data.nom,
                region: fighter2Data.region,
                votes: activeMatch.nb_votes_l2,
              },
              round: activeMatch.etape,
              date: activeMatch.date,
            });
          }
        }
        setMatchLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        setPreviewError("Impossible de charger les lutteurs");
        setMatchLoading(false);
      }
      finally {
        setPreviewLoading(false);
      }
    };

    fetchStats();
  }, []);


  // Carousel state for hero
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (heroTimeoutRef.current) clearTimeout(heroTimeoutRef.current);
    heroTimeoutRef.current = setTimeout(() => {
      setHeroIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => heroTimeoutRef.current && clearTimeout(heroTimeoutRef.current);
  }, [heroIndex]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-24">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 transition-all duration-700">
          <img
            src={images[heroIndex].src}
            alt={images[heroIndex].alt}
            className="w-full h-full object-cover transition-all duration-700"
          />
          {/* Overlay gradient vert sombre pour effet vitre */}
           <div className="absolute inset-0 bg-gradient-to-br from-[hsl(150,15%,12%)]/90 via-[hsl(150,15%,7%)]/80 to-background/70" /> 
           <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-background/30 to-background/10" /> 
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />    
        </div>
        {/* Dots navigation for hero carousel - en haut à droite */}
        <div className="absolute top-8 right-8 flex gap-2 z-20">
          {images.map((img, i) => (
            <button
              key={img.alt}
              className={`w-3 h-3 rounded-full border border-white/60 ${i === heroIndex ? 'bg-primary' : 'bg-white/30'}`}
              onClick={() => setHeroIndex(i)}
              aria-label={`Aller à l'image ${i+1}`}
            />
          ))}
        </div>



        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-1.5 md:gap-3"
          >
            {/* Sabre à gauche - couvre les deux lignes */}
            <img src={sabreIcon} alt="Sabre" className="h-32 md:h-44 lg:h-56 w-auto" />
            
            <div className="text-center">
              <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight mb-2 flex items-center justify-center gap-2 md:gap-3">
                <span className="text-foreground">KOKOWA</span>
                <img src={croixIcon} alt="Croix du Sud" className="h-12 md:h-16 lg:h-20 w-auto" />
              </h1>
              <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-foreground mb-6">
                TAHOUA 2025
              </h2>
            </div>
          </motion.div>

          {/* Ligne orange avant le paragraphe */}
          <div className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#ff9900] mb-4">
            Labou sanni no zantchan kasa ne
          </div>
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

      {/* Aperçu Lutteurs */}
      <section className="py-16 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="font-heading text-3xl md:text-4xl font-bold uppercase text-foreground mb-4">
              Champions en Vedette
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Un aperçu des lutteurs les plus suivis du moment.
            </p>
          </motion.div>

          {previewError ? (
            <div className="text-center text-muted-foreground">{previewError}</div>
          ) : previewLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {previewFighters.map((fighter) => (
                  <motion.div
                    key={fighter.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="fighter-card mx-auto w-full bg-white rounded-2xl shadow-md overflow-hidden"
                  >
                    <div className="relative flex items-center justify-center bg-gray-100 h-56 sm:h-64">
                      <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                        <User size={40} className="text-gray-400" />
                      </div>

                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-heading uppercase tracking-wide font-semibold ${
                            fighter.status === "active"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {fighter.status === "active" ? "EN LICE" : "ÉLIMINÉ"}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-white">
                      <h3 className="font-heading text-lg font-bold uppercase text-gray-900 mb-2 tracking-tight">
                        {fighter.name}
                      </h3>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-orange-500 text-sm flex items-center gap-1 font-normal truncate">
                          <MapPin size={16} />
                          {fighter.region}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm mb-3">
                        <Heart
                          size={16}
                          className={
                            fighter.supports > 0
                              ? "text-orange-500 fill-orange-500"
                              : "text-gray-400"
                          }
                        />
                        <span className="text-gray-900 font-normal">
                          {fighter.supports.toLocaleString()} soutiens
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          to="/lutteurs"
                          className="w-full px-3 py-2 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-heading text-[10px] font-bold uppercase tracking-tight rounded shadow-sm transition-all"
                        >
                          <Heart size={14} />
                          J'aime mon lutteur
                        </Link>
                        <Link
                          to="/lutteurs"
                          className="w-full px-3 py-2 flex items-center justify-center gap-1.5 border-2 border-orange-500 text-orange-500 bg-white hover:bg-orange-50 font-heading text-[10px] font-bold uppercase tracking-wide rounded shadow-sm transition-all"
                        >
                          Gratifier
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <Link to="/lutteurs" className="btn-hero-secondary w-full sm:w-auto text-center">
                  Voir tous les lutteurs
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Aperçu Pronostics - Match en cours */}
      {currentMatch && (
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h3 className="font-heading text-3xl md:text-4xl font-bold uppercase text-foreground mb-4">
                Prochain Combat
              </h3>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Qui remportera le prochain affrontement ? Faites votre pronostic !
              </p>
            </motion.div>

            {matchLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto"
              >
                {/* Badge étape */}
                <div className="text-center mb-8">
                  <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-heading text-sm uppercase tracking-wide font-semibold">
                    {currentMatch.round}
                  </span>
                </div>

                {/* VS Section avec cartes */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Carte Lutteur 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all"
                  >
                    {/* Photo */}
                    <div className="relative h-64 md:h-80 bg-gray-100 flex items-center justify-center">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 flex items-center justify-center">
                        <User size={60} className="text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-6 text-center">
                      <h4 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 uppercase">
                        {currentMatch.fighter1.name}
                      </h4>
                      <p className="text-orange-500 text-base mb-4 flex items-center justify-center gap-1">
                        <MapPin size={16} />
                        {currentMatch.fighter1.region}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                        <Heart size={18} className="text-orange-500 fill-orange-500" />
                        <span className="font-semibold text-gray-900 text-lg">
                          {currentMatch.fighter1.votes}
                        </span>
                        <span>pronostics</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* VS Badge au centre */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl border-4 border-white">
                      <span className="font-heading text-3xl font-bold text-primary-foreground">
                        VS
                      </span>
                    </div>
                  </div>

                  {/* VS Badge mobile */}
                  <div className="flex justify-center my-4 md:hidden">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl">
                      <span className="font-heading text-2xl font-bold text-primary-foreground">
                        VS
                      </span>
                    </div>
                  </div>

                  {/* Carte Lutteur 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all"
                  >
                    {/* Photo */}
                    <div className="relative h-64 md:h-80 bg-gray-100 flex items-center justify-center">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 flex items-center justify-center">
                        <User size={60} className="text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-6 text-center">
                      <h4 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2 uppercase">
                        {currentMatch.fighter2.name}
                      </h4>
                      <p className="text-orange-500 text-base mb-4 flex items-center justify-center gap-1">
                        <MapPin size={16} />
                        {currentMatch.fighter2.region}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                        <Heart size={18} className="text-orange-500 fill-orange-500" />
                        <span className="font-semibold text-gray-900 text-lg">
                          {currentMatch.fighter2.votes}
                        </span>
                        <span>pronostics</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-10 flex justify-center">
                  <Link to="/pronostics" className="btn-hero-primary w-full sm:w-auto text-center px-8">
                    Faire mon pronostic
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
