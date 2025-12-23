import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Gift, X, Users, Award, Search, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import lutteursService, { Lutteur } from "@/services/lutteursService";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Fighter {
  id: string;
  name: string;
  region: string;
  status: "active" | "eliminated";
  supports: number;
  rewards: number;
}

const regions = ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"];
const regionsTopRow = regions.slice(0, 4);
const regionsBottomRow = regions.slice(4, 8);

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="counter-animate">
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

const FighterCard = ({ fighter, onSupportSuccess }: { fighter: Fighter; onSupportSuccess: (fighterId: string) => void }) => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [supportReason, setSupportReason] = useState<string>("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showMoneyAnimation, setShowMoneyAnimation] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number>(0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="fighter-card"
      >
        {/* Fighter Placeholder */}
        <div className="relative aspect-video overflow-hidden flex items-center justify-center bg-muted">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
            <User size={48} className="text-muted-foreground" />
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-heading uppercase tracking-wider ${
                fighter.status === "active" ? "badge-active" : "badge-eliminated"
              }`}
            >
              {fighter.status === "active" ? "En lice" : "Éliminé"}
            </span>
          </div>
        </div>

        {/* Fighter Info */}
        <div className="p-5">
          <h3 className="font-heading text-xl font-bold uppercase text-foreground mb-1">
            {fighter.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 flex items-center gap-1">
            <MapPin size={14} />
            {fighter.region}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="flex items-center gap-2 text-sm">
              <Users size={16} className="text-primary" />
              <span className="text-foreground">
                <AnimatedCounter value={fighter.supports} /> soutiens
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award size={16} className="text-gold" />
              <span className="text-foreground">
                <AnimatedCounter value={fighter.rewards} suffix=" F" />
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSupportModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-heading text-sm uppercase tracking-wider py-3 rounded-lg transition-colors touch-target"
            >
              <Heart size={18} />
              J'aime mon lutteur
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRewardModal(true)}
              className="w-full flex items-center justify-center gap-2 btn-hero-primary py-3 text-sm"
            >
              <Gift size={18} />
              Gratifier
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <Modal onClose={() => setShowSupportModal(false)} title="J'aime mon lutteur">
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Pourquoi aimez-vous <strong className="text-foreground">{fighter.name}</strong> ?
              </p>
              
              <div className="space-y-3">
                {[
                  { value: "Fairplay", label: "Fairplay" },
                  { value: "Charisme", label: "Charisme" },
                  { value: "Performance", label: "Performance" }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      supportReason === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="supportReason"
                      value={option.value}
                      checked={supportReason === option.value}
                      onChange={(e) => setSupportReason(e.target.value)}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full btn-hero-primary py-4"
                disabled={!supportReason}
                onClick={async () => {
                  try {
                    await lutteursService.supporterLutteur({
                      lutteur: fighter.id,
                      raison: supportReason as 'Fairplay' | 'Charisme' | 'Performance'
                    });
                    onSupportSuccess(fighter.id);
                    setShowSupportModal(false);
                    setSupportReason("");
                    setShowSuccessAnimation(true);
                    setTimeout(() => setShowSuccessAnimation(false), 3000);
                  } catch (error) {
                    console.error("Erreur lors du soutien:", error);
                    alert("Erreur lors du soutien du lutteur");
                  }
                }}
              >
                Confirmer
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md overflow-hidden"
          >
            {/* Confettis */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                initial={{ y: -100, x: Math.random() * window.innerWidth }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: 360,
                }}
                transition={{
                  duration: 2.5,
                  delay: Math.random() * 0.3,
                  ease: "linear",
                }}
                className="absolute text-3xl"
              >
                {['🎉', '✨', '⭐'][Math.floor(Math.random() * 3)]}
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="text-center relative"
            >
              {/* Étoiles qui tournent */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 8) * 180,
                    y: Math.sin((i * Math.PI * 2) / 8) * 180,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute top-1/2 left-1/2 text-4xl"
                >
                  ⭐
                </motion.div>
              ))}
              
              {/* Emoji principal */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                }}
                className="text-9xl mb-6"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.6))',
                }}
              >
                💪
              </motion.div>
              
              {/* Message */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-5xl md:text-6xl font-bold text-primary uppercase"
              >
                Aller {fighter.name} !!!
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Money/Gratification Animation */}
      <AnimatePresence>
        {showMoneyAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="text-center relative"
            >
              {/* Emojis d'acclamation qui tournent */}
              {['👏', '🙌', '🎊', '✨', '💯', '🔥', '⭐', '👏', '🙌', '🎊', '✨', '💯'].map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 12) * 200,
                    y: Math.sin((i * Math.PI * 2) / 12) * 200,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="absolute top-1/2 left-1/2 text-5xl"
                >
                  {emoji}
                </motion.div>
              ))}
              
              {/* Emoji principal */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                }}
                className="text-9xl mb-6"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.6))',
                }}
              >
                👏🏾
              </motion.div>
              
              {/* Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-heading text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 uppercase mb-4">
                  Bravo {fighter.name} !
                </h2>
                <p className="text-2xl text-primary font-bold">💰 Gratification envoyée !</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <Modal onClose={() => setShowRewardModal(false)} title="Récompenser le lutteur">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Envoyez une récompense à <strong className="text-foreground">{fighter.name}</strong>
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[1000, 5000, 10000].map((amount) => (
                  <button
                    key={amount}
                    className="py-3 px-4 bg-secondary hover:bg-primary/20 border border-border hover:border-primary/50 rounded-lg font-heading text-foreground transition-colors"
                  >
                    {amount.toLocaleString()} F
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Autre montant"
                className="w-full p-4 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full btn-hero-primary py-4"
                onClick={() => {
                  setShowRewardModal(false);
                  setShowMoneyAnimation(true);
                  setTimeout(() => setShowMoneyAnimation(false), 4000);
                }}
              >
                Envoyer la récompense
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

const Modal = ({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-xl font-bold uppercase text-foreground">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors touch-target">
              <X size={24} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </>
  );
};

const LutteursPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour mapper les données de l'API vers le format du frontend
  const mapLutteurToFighter = (lutteur: Lutteur): Fighter => ({
    id: lutteur.id,
    name: lutteur.nom,
    region: lutteur.region,
    status: !lutteur.en_lisse ? "active" : "eliminated",
    supports: lutteur.total_soutiens,
    rewards: 0, // À ajuster selon votre API
  });

  // Charger les lutteurs au montage du composant
  useEffect(() => {
    const fetchLutteurs = async () => {
      try {
        setLoading(true);
        const data = await lutteursService.getLutteurs();
        const mappedFighters = data.map(mapLutteurToFighter);
        setFighters(mappedFighters);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des lutteurs:", err);
        setError("Impossible de charger les lutteurs");
      } finally {
        setLoading(false);
      }
    };

    fetchLutteurs();
  }, []);

  const activeFighters = useMemo(() => {
    // Lutteurs en lice (toujours affichés, non filtrés par région)
    return fighters.filter(f => f.status === 'active' && f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [fighters, searchQuery]);

  const regionFilteredFighters = useMemo(() => {
    // Lutteurs filtrés par région (affichés seulement si un filtre est actif)
    if (!selectedRegion) return [];
    
    return fighters.filter((fighter) => {
      const matchesSearch = fighter.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = fighter.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion, fighters]);

  return (
    <Layout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="text-primary font-heading text-sm uppercase tracking-widest mb-2">46ème Édition</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase text-foreground mb-4">
               Lutteurs par Région
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Découvrez les champions qui s'affrontent pour le Sabre National 2025. Soutenez vos favoris et récompensez leur courage.
            </p>
          </motion.div>

          {/* Search and Filters */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un lutteur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Region Filters */}
              <div className="flex flex-col gap-2 flex-1">
                {/* First row - 4 regions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {regionsTopRow.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        selectedRegion === region
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                {/* Second row - 4 regions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {regionsBottomRow.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        selectedRegion === region
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lutteurs en Lice - Toujours affichés */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6 uppercase">
              Lutteurs en Lice
            </h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {activeFighters.map((fighter) => (
                  <CarouselItem key={fighter.id} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/4">
                    <AnimatePresence mode="popLayout">
                      <FighterCard 
                        fighter={fighter} 
                        onSupportSuccess={(fighterId) => {
                          setFighters(prev => prev.map(f => 
                            f.id === fighterId ? { ...f, supports: f.supports + 1 } : f
                          ));
                        }}
                      />
                    </AnimatePresence>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <div className="flex items-center justify-center gap-4 mt-8">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>

            {activeFighters.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-muted-foreground text-lg">Aucun lutteur en lice trouvé</p>
              </motion.div>
            )}
          </motion.div>

          {/* Lutteurs par Région - Affichés seulement si filtre actif */}
          {selectedRegion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6 uppercase">
                Lutteurs de {selectedRegion}
              </h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-6">
                  {regionFilteredFighters.map((fighter) => (
                    <CarouselItem key={fighter.id} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/4">
                      <AnimatePresence mode="popLayout">
                        <FighterCard 
                          fighter={fighter} 
                          onSupportSuccess={(fighterId) => {
                            setFighters(prev => prev.map(f => 
                              f.id === fighterId ? { ...f, supports: f.supports + 1 } : f
                            ));
                          }}
                        />
                      </AnimatePresence>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                <div className="flex items-center justify-center gap-4 mt-8">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              </Carousel>

              {regionFilteredFighters.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-muted-foreground text-lg">Aucun lutteur de {selectedRegion} trouvé</p>
                </motion.div>
              )}
            </motion.div>
          )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LutteursPage;
