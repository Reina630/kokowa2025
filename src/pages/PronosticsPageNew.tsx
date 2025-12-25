import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, MapPin, Trophy, TrendingUp, X, Phone, Swords } from "lucide-react";
import Layout from "@/components/layout/Layout";
import affrontementsService, { Affrontement } from "@/services/affrontementsService";
import lutteursService, { Lutteur } from "@/services/lutteursService";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface Fighter {
  id: string;
  name: string;
  region: string;
}

interface Match {
  id: number;
  phase: string;
  date: string;
  status: 'live' | 'upcoming' | 'finished';
  fighter1: Fighter;
  fighter2: Fighter;
  winner?: string | null;
  votes1: number;
  votes2: number;
}

type TabType = 'quarts' | 'demi' | '3eme' | 'finale';

const PronosticsPageNew = () => {
  const [activeTab, setActiveTab] = useState<TabType>('quarts');
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<{[key: number]: boolean}>({});
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [lutteurs, setLutteurs] = useState<{[key: string]: Lutteur}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [votedFighterName, setVotedFighterName] = useState<string>("");

  // Charger les affrontements et lutteurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [affrontementsData, lutteursData] = await Promise.all([
          affrontementsService.getAffrontements(),
          lutteursService.getLutteurs()
        ]);
        
        // Créer un mapping des lutteurs par ID
        const lutteursMap: {[key: string]: Lutteur} = {};
        lutteursData.forEach(l => {
          lutteursMap[l.id] = l;
        });
        setLutteurs(lutteursMap);
        
        // Transformer les affrontements en matches
        const mappedMatches: Match[] = affrontementsData.map(aff => {
          const l1 = lutteursMap[aff.l1];
          const l2 = lutteursMap[aff.l2];
          
          // Déterminer le statut basé sur le status de l'API
          let status: 'live' | 'upcoming' | 'finished';
          if (aff.status === 'en cours') status = 'live';
          else if (aff.status === 'terminé') status = 'finished';
          else status = 'upcoming';
          
          return {
            id: aff.id,
            phase: aff.etape,
            date: new Date(aff.date).toLocaleDateString('fr-FR'),
            status,
            fighter1: {
              id: aff.l1,
              name: l1?.nom || 'Inconnu',
              region: l1?.region || ''
            },
            fighter2: {
              id: aff.l2,
              name: l2?.nom || 'Inconnu',
              region: l2?.region || ''
            },
            winner: aff.vainqueur,
            votes1: aff.nb_votes_l1,
            votes2: aff.nb_votes_l2
          };
        });
        
        setMatches(mappedMatches);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des affrontements:", err);
        setError("Impossible de charger les affrontements");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Réinitialiser la page quand on change d'onglet
  useEffect(() => {
    setSelectedFighter(null);
    setSelectedMatch(null);
  }, [activeTab]);

  // Mapper les phases de l'API aux onglets
  const getPhaseCategory = (phase: string): TabType | null => {
    const phaseNormalized = phase.toLowerCase();
    // Formats: "1/4" pour quarts, "1/2" pour demi-finales, "3eme" pour 3ème place, "finale" pour finale
    if (phaseNormalized.includes('1/4') || phaseNormalized.includes('quart')) return 'quarts';
    if (phaseNormalized.includes('1/2') || phaseNormalized.includes('demi')) return 'demi';
    if (phaseNormalized.includes('3') || phaseNormalized.includes('troisième') || phaseNormalized.includes('troisieme')) return '3eme';
    if (phaseNormalized.includes('final')) return 'finale';
    return null;
  };

  const filteredMatches = matches.filter(match => getPhaseCategory(match.phase) === activeTab);

  // Compléter avec des matchs fictifs pour visualiser la hiérarchie complète
  const getDisplayMatches = (): Match[] => {
    const requiredCount = activeTab === 'quarts' ? 4 : activeTab === 'demi' ? 2 : activeTab === '3eme' ? 1 : 1;
    const realMatches = [...filteredMatches];
    
    // Si on a déjà assez ou plus de matchs, retourner les vrais matchs
    if (realMatches.length >= requiredCount) {
      return realMatches;
    }
    
    // Compléter avec des matchs de démonstration jusqu'au nombre requis
    const matchesToAdd = requiredCount - realMatches.length;
    for (let i = 0; i < matchesToAdd; i++) {
      realMatches.push({
        id: -i - 1, // ID négatif pour les démos
        phase: activeTab === 'quarts' ? '1/4' : activeTab === 'demi' ? '1/2' : activeTab === '3eme' ? '3ème place' : 'Finale',
        date: '???',
        status: 'upcoming',
        fighter1: {
          id: `demo-${i}-1`,
          name: '???',
          region: '???'
        },
        fighter2: {
          id: `demo-${i}-2`,
          name: '???',
          region: '???'
        },
        winner: null,
        votes1: 0,
        votes2: 0
      });
    }
    
    return realMatches;
  };

  const displayMatches = getDisplayMatches();

  const handleVote = (matchId: number, fighterId: string) => {
    if (hasVoted[matchId]) return;
    
    setSelectedFighter(fighterId);
    setSelectedMatch(matchId);
    setShowModal(true);
  };

  const confirmVote = async () => {
    if (!phoneNumber.trim() || !selectedFighter || !selectedMatch) return;
    
    try {
      // Trouver le match sélectionné pour déterminer le choix
      const match = matches.find(m => m.id === selectedMatch);
      if (!match) return;
      
      const choix = selectedFighter === match.fighter1.id ? 'l1' : 'l2';
      
      await affrontementsService.ajouterPronostic({
        numero_telephone: phoneNumber,
        affrontement: selectedMatch,
        choix
      });
      
      // Mettre à jour les compteurs de votes localement
      setMatches(prev => prev.map(m => {
        if (m.id === selectedMatch) {
          if (choix === 'l1') {
            return { ...m, votes1: m.votes1 + 1 };
          } else {
            return { ...m, votes2: m.votes2 + 1 };
          }
        }
        return m;
      }));
      
      setHasVoted(prev => ({ ...prev, [selectedMatch]: true }));
      setShowModal(false);
      setPhoneNumber("");
      
      // Afficher l'animation de succès
      const fighterName = selectedFighter === match.fighter1.id ? match.fighter1.name : match.fighter2.name;
      setVotedFighterName(fighterName);
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
    } catch (error) {
      console.error("Erreur lors de l'ajout du pronostic:", error);
      alert("Erreur lors de l'enregistrement de votre pronostic");
    }
  };

  const tabs = [
    { 
      id: 'quarts' as TabType, 
      label: 'Quarts de Finale', 
      count: activeTab === 'quarts' ? displayMatches.length : matches.filter(m => getPhaseCategory(m.phase) === 'quarts').length || 4
    },
    { 
      id: 'demi' as TabType, 
      label: 'Demi-Finales', 
      count: activeTab === 'demi' ? displayMatches.length : matches.filter(m => getPhaseCategory(m.phase) === 'demi').length || 2
    },
    { 
      id: '3eme' as TabType, 
      label: '3ème Place', 
      count: activeTab === '3eme' ? displayMatches.length : matches.filter(m => getPhaseCategory(m.phase) === '3eme').length || 1
    },
    { 
      id: 'finale' as TabType, 
      label: 'Finale', 
      count: activeTab === 'finale' ? displayMatches.length : matches.filter(m => getPhaseCategory(m.phase) === 'finale').length || 1
    }
  ];

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen">
        {/* Header - Outside white box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold uppercase text-white mb-2">
            PRONOSTICS
          </h1>
          <p className="text-gray-300 text-lg">
            Pronostiquez sur les matchs en direct et à venir !
          </p>
        </motion.div>

        {/* Tabs - Outside white box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-gray-800 rounded-xl p-1 border border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-sm opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="w-full flex justify-center">
          <div className="bg-white shadow-2xl border border-gray-200 p-4 md:p-10 w-full max-w-[95%] xl:max-w-7xl">
          {/* Tab Title - Inside white box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold uppercase text-gray-900">
              {activeTab === 'quarts' && 'QUARTS DE FINALE'}
              {activeTab === 'demi' && 'DEMI-FINALES'}
              {activeTab === '3eme' && 'MATCH POUR LA 3ÈME PLACE'}
              {activeTab === 'finale' && 'GRANDE FINALE'}
            </h2>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Loading Spinner */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
          {/* Matches List */}
          <div className={`
            ${activeTab === 'quarts' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 relative' : ''}
            ${activeTab === 'demi' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}
            ${activeTab === '3eme' ? 'max-w-3xl mx-auto' : ''}
            ${activeTab === 'finale' ? 'max-w-3xl mx-auto' : ''}
          `}>
            {/* Décoration centrale pour les quarts de finale
            {activeTab === 'quarts' && displayMatches.length >= 4 && (
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary/40">
                  <Swords className="text-primary" size={32} />
                </div>
              </div>
            )} */}
            
            {displayMatches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 col-span-full"
              >
                <p className="text-muted-foreground text-lg">Aucun affrontement pour cette phase</p>
              </motion.div>
            ) : (
              displayMatches.map((match, index) => {
              const votes1 = match.votes1;
              const votes2 = match.votes2;
              const totalVotes = votes1 + votes2;
              const percentage1 = totalVotes > 0 ? Math.round((votes1 / totalVotes) * 100) : 50;
              const percentage2 = 100 - percentage1;
              const isFinished = match.status === 'finished';
              const canVote = !hasVoted[match.id] && !isFinished && match.id > 0; // Pas de vote sur les démos

              // Layout pour quarts de finale - compact côte à côte
              if (activeTab === 'quarts') {
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border border-orange-500/30 rounded-2xl shadow-xl shadow-orange-500/10 p-4 transition-all hover:scale-[1.02] hover:shadow-orange-400/20"
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-muted-foreground">{match.date}</span>
                      {match.status === 'finished' && (
                        <span className="px-2 py-1 bg-white text-red-600 border border-red-200 rounded-full text-xs font-semibold">
                          Terminé
                        </span>
                      )}
                      {match.status === 'live' && (
                        <span className="px-2 py-1 bg-white text-green-600 border border-green-200 rounded-full text-xs font-semibold">
                          En Direct
                        </span>
                      )}
                      {match.status === 'upcoming' && (
                        <span className="px-2 py-1 bg-white text-primary border border-primary/20 rounded-full text-xs font-semibold">
                          À venir
                        </span>
                      )}
                    </div>

                    {/* Fighters side by side */}
                    <div className="flex items-center gap-3">
                      {/* Fighter 1 */}
                      <div 
                        className={`flex-1 rounded-lg border-2 transition-all overflow-hidden ${
                          canVote ? 'cursor-pointer hover:border-primary/50' : ''
                        } ${isFinished && match.winner === match.fighter1.id ? 'border-green-500 bg-green-500/10' : 'border-border'}`}
                        onClick={() => canVote && handleVote(match.id, match.fighter1.id)}
                      >
                        <div className="relative">
                          {/* Photo Zone */}
                          <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                            <User size={48} className="text-gray-400" />
                          </div>
                          {/* Info Zone - Compact at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="font-heading font-bold text-xs text-white truncate">{match.fighter1.name}</p>
                            <p className="text-[9px] text-gray-200 truncate">{match.fighter1.region}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="font-bold text-white text-xs">{votes1}</span>
                              {isFinished && match.winner === match.fighter1.id && (
                                <Trophy size={10} className="text-green-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* VS Badge with Swords Icon */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-1">
                        <Swords className="text-primary" size={20} />
                        <span className="font-heading text-[10px] font-bold text-muted-foreground">VS</span>
                      </div>
                      
                      {/* Fighter 2 */}
                      <div 
                        className={`flex-1 rounded-lg border-2 transition-all overflow-hidden ${
                          canVote ? 'cursor-pointer hover:border-primary/50' : ''
                        } ${isFinished && match.winner === match.fighter2.id ? 'border-green-500 bg-green-500/10' : 'border-border'}`}
                        onClick={() => canVote && handleVote(match.id, match.fighter2.id)}
                      >
                        <div className="relative">
                          {/* Photo Zone */}
                          <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                            <User size={48} className="text-gray-400" />
                          </div>
                          {/* Info Zone - Compact at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="font-heading font-bold text-xs text-white truncate">{match.fighter2.name}</p>
                            <p className="text-[9px] text-gray-200 truncate">{match.fighter2.region}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="font-bold text-white text-xs">{votes2}</span>
                              {isFinished && match.winner === match.fighter2.id && (
                                <Trophy size={10} className="text-green-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Layout pour demi-finale - moyen
              if (activeTab === 'demi') {
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-xl p-6 border border-orange-500/30 shadow-xl shadow-orange-500/10"
                  >
                    {/* Match Info */}
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-sm text-muted-foreground">{match.date}</span>
                      {match.status === 'finished' && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-600 rounded-full text-xs font-medium">
                          Terminé
                        </span>
                      )}
                      {match.status === 'live' && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-medium">
                          En Direct
                        </span>
                      )}
                      {match.status === 'upcoming' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#043A3A' }}>
                          À venir
                        </span>
                      )}
                    </div>

                    {/* Fighters */}
                    <div className="flex items-center gap-4">
                      {/* Fighter 1 */}
                      <div
                        className={`flex-1 rounded-lg border-2 transition-all overflow-hidden ${
                          canVote ? 'cursor-pointer hover:shadow-lg hover:border-primary/50' : ''
                        } ${isFinished && match.winner === match.fighter1.id ? 'border-green-500 bg-green-500/10' : 'border-border'}`}
                        onClick={() => canVote && handleVote(match.id, match.fighter1.id)}
                      >
                        <div className="relative">
                          {/* Photo Zone */}
                          <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                            <User size={56} className="text-gray-400" />
                          </div>
                          {/* Info Zone - Compact at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <h3 className="font-heading text-sm font-bold text-white truncate">{match.fighter1.name}</h3>
                            <p className="text-[10px] text-gray-200 truncate">{match.fighter1.region}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="font-bold text-white text-sm">{votes1}</span>
                              <span className="text-xs text-gray-300">{percentage1}%</span>
                              {isFinished && match.winner === match.fighter1.id && (
                                <Trophy size={14} className="text-green-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center flex-shrink-0">
                        <Swords className="text-primary mx-auto mb-1" size={24} />
                        <span className="font-heading text-sm font-bold text-muted-foreground block">VS</span>
                      </div>
                      
                      {/* Fighter 2 */}
                      <div
                        className={`flex-1 rounded-lg border-2 transition-all overflow-hidden ${
                          canVote ? 'cursor-pointer hover:shadow-lg hover:border-primary/50' : ''
                        } ${isFinished && match.winner === match.fighter2.id ? 'border-green-500 bg-green-500/10' : 'border-border'}`}
                        onClick={() => canVote && handleVote(match.id, match.fighter2.id)}
                      >
                        <div className="relative">
                          {/* Photo Zone */}
                          <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                            <User size={56} className="text-gray-400" />
                          </div>
                          {/* Info Zone - Compact at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <h3 className="font-heading text-sm font-bold text-white truncate">{match.fighter2.name}</h3>
                            <p className="text-[10px] text-gray-200 truncate">{match.fighter2.region}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="font-bold text-white text-sm">{votes2}</span>
                              <span className="text-xs text-gray-300">{percentage2}%</span>
                              {isFinished && match.winner === match.fighter2.id && (
                                <Trophy size={14} className="text-green-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Layout spécial pour la FINALE
              if (activeTab === 'finale') {
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 md:p-10 border-4 border-amber-400/60 shadow-2xl shadow-amber-500/20"
                  >
                    {/* Décoration coins dorés */}
                    <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-amber-400/30 to-transparent rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-400/30 to-transparent rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-amber-400/30 to-transparent rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-amber-400/30 to-transparent rounded-br-2xl" />

                    {/* Trophy Badge Central */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 z-20"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                        <Trophy className="text-white" size={32} />
                      </div>
                    </motion.div>

                    {/* Header */}
                    <div className="text-center mb-8 mt-6">
                      <h3 className="font-heading text-2xl md:text-3xl font-extrabold uppercase bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">
                        Grande Finale
                      </h3>
                      <div className="flex justify-center items-center gap-4">
                        <span className="text-sm text-gray-600">{match.date}</span>
                        {match.status === 'finished' && (
                          <span className="px-4 py-1.5 bg-red-500/20 text-red-700 rounded-full text-sm font-bold border-2 border-red-300">
                            Terminé
                          </span>
                        )}
                        {match.status === 'live' && (
                          <span className="px-4 py-1.5 bg-green-500/20 text-green-700 rounded-full text-sm font-bold border-2 border-green-300 animate-pulse">
                            🔴 En Direct
                          </span>
                        )}
                        {match.status === 'upcoming' && (
                          <span className="px-4 py-1.5 bg-amber-500/20 text-amber-700 rounded-full text-sm font-bold border-2 border-amber-300">
                            À venir
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fighters */}
                    <div className="flex items-center gap-8">
                      {/* Fighter 1 */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`flex-1 rounded-xl border-4 overflow-hidden transition-all shadow-xl ${
                          canVote ? 'cursor-pointer hover:shadow-2xl hover:border-amber-500' : ''
                        } ${isFinished && match.winner === match.fighter1.id ? 'border-amber-500 ring-4 ring-amber-300 shadow-amber-500/50' : 'border-amber-300'}`}
                        onClick={() => canVote && handleVote(match.id, match.fighter1.id)}
                      >
                        <div className="relative">
                          {/* Photo Zone - Plus grande pour la finale */}
                          <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <User size={96} className="text-gray-400" />
                          </div>
                          {/* Winner Crown */}
                          {isFinished && match.winner === match.fighter1.id && (
                            <motion.div
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="absolute top-4 left-1/2 -translate-x-1/2"
                            >
                              <Trophy className="text-amber-400 drop-shadow-lg" size={48} />
                            </motion.div>
                          )}
                          {/* Info Zone */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-5">
                            <p className="font-heading font-bold text-lg md:text-xl text-white truncate">{match.fighter1.name}</p>
                            <p className="text-xs text-amber-200 truncate flex items-center gap-1">
                              <MapPin size={12} />
                              {match.fighter1.region}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="font-bold text-amber-400 text-2xl">{votes1}</span>
                              <span className="text-sm text-gray-300">{percentage1}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* VS Badge Premium */}
                      <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="flex-shrink-0 flex flex-col items-center gap-3"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                          <Swords className="text-white" size={40} />
                        </div>
                        <span className="font-heading text-lg font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">VS</span>
                      </motion.div>
                      
                      {/* Fighter 2 */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`flex-1 rounded-xl border-4 overflow-hidden transition-all shadow-xl ${
                          canVote ? 'cursor-pointer hover:shadow-2xl hover:border-amber-500' : ''
                        } ${isFinished && match.winner === match.fighter2.id ? 'border-amber-500 ring-4 ring-amber-300 shadow-amber-500/50' : 'border-amber-300'}`}
                        onClick={() => canVote && handleVote(match.id, match.fighter2.id)}
                      >
                        <div className="relative">
                          {/* Photo Zone */}
                          <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <User size={96} className="text-gray-400" />
                          </div>
                          {/* Winner Crown */}
                          {isFinished && match.winner === match.fighter2.id && (
                            <motion.div
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="absolute top-4 left-1/2 -translate-x-1/2"
                            >
                              <Trophy className="text-amber-400 drop-shadow-lg" size={48} />
                            </motion.div>
                          )}
                          {/* Info Zone */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-5">
                            <p className="font-heading font-bold text-lg md:text-xl text-white truncate">{match.fighter2.name}</p>
                            <p className="text-xs text-amber-200 truncate flex items-center gap-1">
                              <MapPin size={12} />
                              {match.fighter2.region}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="font-bold text-amber-400 text-2xl">{votes2}</span>
                              <span className="text-sm text-gray-300">{percentage2}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              }

              // Layout pour 3ème place - design standard agrandi
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-xl p-8 border-2 border-orange-500/30 shadow-xl shadow-orange-500/10"
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-base text-muted-foreground">{match.date}</span>
                    {match.status === 'finished' && (
                      <span className="px-3 py-1.5 bg-red-500/20 text-red-600 rounded-full text-sm font-medium">
                        Terminé
                      </span>
                    )}
                    {match.status === 'live' && (
                      <span className="px-3 py-1.5 bg-green-500/20 text-green-600 rounded-full text-sm font-medium">
                        En Direct
                      </span>
                    )}
                    {match.status === 'upcoming' && (
                      <span className="px-3 py-1.5 bg-orange-500/20 text-orange-600 rounded-full text-sm font-medium">
                        À venir
                      </span>
                    )}
                  </div>

                  {/* Fighters side by side */}
                  <div className="flex items-center gap-6">
                    {/* Fighter 1 */}
                    <div 
                      className={`flex-1 rounded-lg border-2 overflow-hidden transition-all ${
                        canVote ? 'cursor-pointer hover:shadow-lg hover:border-primary/50' : ''
                      } ${isFinished && match.winner === match.fighter1.id ? 'border-green-500 bg-green-500/10' : 'border-border'}`}
                      onClick={() => canVote && handleVote(match.id, match.fighter1.id)}
                    >
                      <div className="relative">
                        {/* Photo Zone */}
                        <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                          <User size={72} className="text-gray-400" />
                        </div>
                        {/* Info Zone - Compact at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                          <p className="font-heading font-bold text-base text-white truncate">{match.fighter1.name}</p>
                          <p className="text-xs text-gray-200 truncate">{match.fighter1.region}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-white text-lg">{votes1}</span>
                            <span className="text-sm text-gray-300">{percentage1}%</span>
                            {isFinished && match.winner === match.fighter1.id && (
                              <Trophy size={18} className="text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* VS Badge with Swords Icon */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      <Swords className="text-primary" size={40} />
                      <span className="font-heading text-base font-bold text-muted-foreground">VS</span>
                    </div>
                    
                    {/* Fighter 2 */}
                    <div 
                      className={`flex-1 rounded-lg border-2 overflow-hidden transition-all ${
                        canVote ? 'cursor-pointer hover:shadow-lg hover:border-primary/50' : ''
                      } ${isFinished && match.winner === match.fighter2.id ? 'border-green-500 bg-green-500/10' : 'border-border'}`}
                      onClick={() => canVote && handleVote(match.id, match.fighter2.id)}
                    >
                      <div className="relative">
                        {/* Photo Zone */}
                        <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                          <User size={72} className="text-gray-400" />
                        </div>
                        {/* Info Zone - Compact at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                          <p className="font-heading font-bold text-base text-white truncate">{match.fighter2.name}</p>
                          <p className="text-xs text-gray-200 truncate">{match.fighter2.region}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-white text-lg">{votes2}</span>
                            <span className="text-sm text-gray-300">{percentage2}%</span>
                            {isFinished && match.winner === match.fighter2.id && (
                              <Trophy size={18} className="text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
            )}
          </div>
            </>
          )}
          </div>
        </div>

        {/* Modal for phone number */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
                >
                {/* Find the current match based on selectedMatch */}
                {selectedMatch !== null && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-heading text-xl font-bold uppercase text-foreground">Confirmer le vote</h3>
                      <button 
                        onClick={() => setShowModal(false)} 
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Vous votez pour <strong className="text-foreground">
                          {
                            (() => {
                              const currentMatch = matches.find(m => m.id === selectedMatch);
                              if (!currentMatch || !selectedFighter) return "";
                              if (selectedFighter === currentMatch.fighter1.id) return currentMatch.fighter1.name;
                              if (selectedFighter === currentMatch.fighter2.id) return currentMatch.fighter2.name;
                              return "";
                            })()
                          }
                        </strong>
                      </p>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                          Numéro de téléphone
                        </label>
                        <PhoneInput
                          country={'ne'}
                          value={phoneNumber}
                          onChange={(value) => setPhoneNumber(value)}
                          enableSearch={true}
                          searchPlaceholder="Rechercher un pays"
                          placeholder="Entrez votre numéro"
                          containerClass="phone-input-container"
                          inputClass="phone-input-field"
                          buttonClass="phone-input-button"
                          dropdownClass="phone-input-dropdown"
                        />
                      </div>
                    </div>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmVote}
                      disabled={!phoneNumber.trim()}
                      className={`w-full py-3 rounded-lg font-medium transition-all ${
                        phoneNumber.trim()
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      Confirmer mon vote
                    </motion.button>
                  </>
                )}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Success Animation - Bonne Chance */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md overflow-hidden"
            >
              {/* Confettis */}
              {[...Array(20)].map((_, i) => (
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
                  {['🎉', '✨', '⭐', '🎊', '💫'][Math.floor(Math.random() * 5)]}
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
                {[...Array(12)].map((_, i) => (
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
                      delay: i * 0.08,
                    }}
                    className="absolute top-1/2 left-1/2 text-4xl"
                  >
                    ⭐
                  </motion.div>
                ))}
                
                {/* Message */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4 uppercase">
                    Pronostic enregistré !
                  </h2>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground text-lg mb-4"
                  >
                    Vous avez voté pour
                  </motion.p>
                  <motion.h3
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="font-heading text-5xl md:text-6xl font-bold text-primary uppercase mb-6"
                  >
                    {votedFighterName}
                  </motion.h3>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block px-8 py-4 bg-primary rounded-full"
                  >
                    <span className="font-heading text-2xl md:text-3xl font-bold text-white uppercase">
                      Bonne Chance ! 🎯
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default PronosticsPageNew;