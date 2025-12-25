import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Layout from "@/components/layout/Layout";

interface Fight {
  id: number;
  fighter1: { name: string; region: string; votes: number };
  fighter2: { name: string; region: string; votes: number };
  round: string;
  time: string;
}

const currentFight: Fight = {
  id: 1,
  fighter1: { name: "Adamou Tchambou", region: "Tahoua", votes: 458 },
  fighter2: { name: "Ibrahim Garba", region: "Zinder", votes: 392 },
  round: "Quart de finale",
  time: "15:30",
};

const PronosticsPage = () => {
  const [selectedFighter, setSelectedFighter] = useState<1 | 2 | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes1, setVotes1] = useState(currentFight.fighter1.votes);
  const [votes2, setVotes2] = useState(currentFight.fighter2.votes);

  const handleVote = () => {
    if (selectedFighter) {
      if (!hasVoted) {
        if (selectedFighter === 1) setVotes1((v) => v + 1);
        if (selectedFighter === 2) setVotes2((v) => v + 1);
      }
      setHasVoted(true);
    }
  };

  // Vote directly for a fighter from header badges
  const voteFor = (id: 1 | 2) => {
    if (hasVoted) return;
    if (id === 1) setVotes1((v) => v + 1);
    if (id === 2) setVotes2((v) => v + 1);
    setSelectedFighter(id);
    setHasVoted(true);
  };

  // Select a fighter without voting
  const selectFighter = (id: 1 | 2) => {
    if (hasVoted) return;
    setSelectedFighter(id);
  };

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
              <span className="inline-block px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-heading text-[11px] leading-none uppercase tracking-widest">
                {currentFight.round}
              </span>
              <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase text-foreground mt-3">
                Pronostics
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Qui remportera le prochain combat ? Choisissez votre favori ci-dessous.
              </p>
              <div className="mt-6 inline-flex items-start justify-center gap-6 rounded-lg bg-card p-2 border border-border shadow-sm">
                <div className={`flex flex-col items-center gap-2 ${selectedFighter === 1 ? "ring-2 ring-primary rounded-md" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-muted">
                      <User size={9} className="text-muted-foreground" />
                    </span>
                    <span className="font-semibold text-[12px] text-foreground">{currentFight.fighter1.name}</span>
                    <span className="px-1 py-0 text-[9px] leading-none rounded-md bg-secondary text-secondary-foreground font-medium">
                      {currentFight.fighter1.region}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectFighter(1)}
                      disabled={hasVoted}
                      className="px-2 py-1 text-[11px] leading-none rounded-md bg-muted text-foreground hover:bg-muted/70 disabled:opacity-50"
                    >
                      Sélectionner
                    </button>
                  <button
                    onClick={() => voteFor(1)}
                    disabled={hasVoted}
                    className="px-2 py-1 text-[11px] leading-none rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Pronostiquer
                  </button>
                  </div>
                </div>
                <span className="text-muted-foreground font-bold text-xs">VS</span>
                <div className={`flex flex-col items-center gap-2 ${selectedFighter === 2 ? "ring-2 ring-primary rounded-md" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-muted">
                      <User size={9} className="text-muted-foreground" />
                    </span>
                    <span className="font-semibold text-[12px] text-foreground">{currentFight.fighter2.name}</span>
                    <span className="px-1 py-0 text-[9px] leading-none rounded-md bg-secondary text-secondary-foreground font-medium">
                      {currentFight.fighter2.region}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectFighter(2)}
                      disabled={hasVoted}
                      className="px-2 py-1 text-[11px] leading-none rounded-md bg-muted text-foreground hover:bg-muted/70 disabled:opacity-50"
                    >
                      Sélectionner
                    </button>
                  <button
                    onClick={() => voteFor(2)}
                    disabled={hasVoted}
                    className="px-2 py-1 text-[11px] leading-none rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Pronostiquer
                  </button>
                  </div>
                </div>
              </div>
          </motion.div>

          {/* VS Section */}
          <div className="relative max-w-4xl mx-auto">
            {/* VS Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-primary flex items-center justify-center shadow-2xl glow-orange">
                <span className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground">
                  VS
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {/* Fighter 1 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`relative cursor-pointer group ${
                  selectedFighter === 1 ? "ring-4 ring-primary rounded-xl" : ""
                }`}
                onClick={() => !hasVoted && setSelectedFighter(1)}
              >
                <div className="relative rounded-xl overflow-hidden bg-card transform transition-transform duration-300 group-hover:scale-[1.02]">
                  {/* 3D depth effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="aspect-[4/5] relative bg-muted flex items-center justify-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary flex items-center justify-center">
                      <User size={64} className="text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className="font-heading text-base md:text-xl font-bold uppercase text-foreground leading-tight">
                      {currentFight.fighter1.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] leading-none rounded bg-secondary text-secondary-foreground">
                        {currentFight.fighter1.region}
                      </span>
                      <span className="text-primary font-heading text-xs">{votes1} votes</span>
                    </div>
                  </div>

                  {selectedFighter === 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                    >
                      <span className="text-primary-foreground">✓</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Fighter 2 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`relative cursor-pointer group ${
                  selectedFighter === 2 ? "ring-4 ring-primary rounded-xl" : ""
                }`}
                onClick={() => !hasVoted && setSelectedFighter(2)}
              >
                <div className="relative rounded-xl overflow-hidden bg-card transform transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="aspect-[4/5] relative bg-muted flex items-center justify-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary flex items-center justify-center">
                      <User size={64} className="text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-right">
                    <h3 className="font-heading text-base md:text-xl font-bold uppercase text-foreground leading-tight">
                      {currentFight.fighter2.name}
                    </h3>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] leading-none rounded bg-secondary text-secondary-foreground">
                        {currentFight.fighter2.region}
                      </span>
                      <span className="text-primary font-heading text-xs">{votes2} votes</span>
                    </div>
                  </div>

                  {selectedFighter === 2 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                    >
                      <span className="text-primary-foreground">✓</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Vote Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 max-w-md mx-auto"
          >
            {hasVoted ? (
              <div className="text-center py-6 bg-card rounded-xl border border-primary/30">
                <span className="text-primary text-4xl mb-4 block">✓</span>
                <p className="text-foreground font-heading text-lg uppercase">
                  Votre pronostic est enregistré !
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Vous avez voté pour{" "}
                  <strong className="text-foreground">
                    {selectedFighter === 1 ? currentFight.fighter1.name : currentFight.fighter2.name}
                  </strong>
                </p>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleVote}
                disabled={!selectedFighter}
                className={`w-full py-5 rounded-xl font-heading text-lg uppercase tracking-wider transition-all ${
                  selectedFighter
                    ? "btn-hero-primary"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {selectedFighter ? "Pronostiquer" : "Sélectionnez un lutteur"}
              </motion.button>
            )}
          </motion.div>

          {/* Stats removed per request */}
        </div>
      </div>
    </Layout>
  );
};

export default PronosticsPage;
