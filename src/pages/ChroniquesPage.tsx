import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Heart, Gift, Calendar, User, MapPin, Search, Filter, ChevronLeft, ChevronRight, Swords, Star, Crown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import affrontementsService from "@/services/affrontementsService";
import lutteursService, { Lutteur } from "@/services/lutteursService";
import historiqueService from "@/services/historiqueService";

interface Fight {
  id: number;
  date: string;
  fighter1: string;
  fighter2: string;
  winner: string | null;
  region1: string;
  region2: string;
  phase: string;
}

interface Prediction {
  id: number;
  date: string;
  phone: string;
  fight: string;
  prediction: string;
  result: "correct" | "incorrect" | "pending";
}

interface Support {
  id: number;
  date: string;
  fighter: string;
  type: string;
}

const getResultBadge = (result: Prediction["result"]) => {
  switch (result) {
    case "correct":
      return <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">🎉 Gagné</span>;
    case "incorrect":
      return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">❌ Perdu</span>;
    case "pending":
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">⏳ En attente</span>;
  }
};

const ChroniquesPage = () => {
  const [fights, setFights] = useState<Fight[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  const [lutteurs, setLutteurs] = useState<{[key: string]: Lutteur}>({});
  
  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // États pour la pagination
  const [fightPage, setFightPage] = useState(1);
  const [predictionPage, setPredictionPage] = useState(1);
  const [supportPage, setSupportPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [affrontementsData, lutteursData, pronosticsData, soutiensData] = await Promise.all([
          affrontementsService.getAffrontements(),
          lutteursService.getLutteurs(),
          historiqueService.getPronostics(),
          historiqueService.getSoutiens()
        ]);

        // Créer un mapping des lutteurs par ID
        const lutteursMap: {[key: string]: Lutteur} = {};
        lutteursData.forEach(l => {
          lutteursMap[l.id] = l;
        });
        setLutteurs(lutteursMap);

        // Transformer tous les affrontements en fights
        console.log('Affrontements reçus:', affrontementsData);
        console.log('Lutteurs map:', lutteursMap);
        
        const fightsList: Fight[] = affrontementsData
          .map(aff => {
            const fight = {
              id: aff.id,
              date: new Date(aff.date).toLocaleDateString('fr-FR'),
              fighter1: lutteursMap[aff.l1]?.nom || `Inconnu (ID: ${aff.l1})`,
              fighter2: lutteursMap[aff.l2]?.nom || `Inconnu (ID: ${aff.l2})`,
              winner: aff.vainqueur ? (lutteursMap[aff.vainqueur]?.nom || `Inconnu (ID: ${aff.vainqueur})`) : null,
              region1: lutteursMap[aff.l1]?.region || '',
              region2: lutteursMap[aff.l2]?.region || '',
              phase: aff.etape
            };
            console.log('Affrontement transformé:', aff.id, fight);
            return fight;
          });
        
        console.log('Fights finaux:', fightsList);
        setFights(fightsList);

        // Transformer les pronostics
        const predictionsList: Prediction[] = pronosticsData.map(p => {
          const aff = affrontementsData.find(a => a.id === p.affrontement);
          const choixNom = p.choix === 'l1' 
            ? lutteursMap[aff?.l1 || '']?.nom 
            : lutteursMap[aff?.l2 || '']?.nom;
          
          // Utiliser le résultat de l'API
          let result: "correct" | "incorrect" | "pending" = "pending";
          if (p.resultat === "gagne") {
            result = "correct";
          } else if (p.resultat === "perdu") {
            result = "incorrect";
          }

          return {
            id: p.id,
            date: new Date(p.date_vote).toLocaleDateString('fr-FR'),
            phone: p.numero_telephone.slice(-4),
            fight: `${lutteursMap[aff?.l1 || '']?.nom || 'Inconnu'} vs ${lutteursMap[aff?.l2 || '']?.nom || 'Inconnu'}`,
            prediction: choixNom || 'Inconnu',
            result
          };
        });
        setPredictions(predictionsList);

        // Transformer les soutiens
        console.log('Soutiens reçus:', soutiensData);
        const supportsList: Support[] = soutiensData.map((s, index) => {
          const support = {
            id: s.id || index,
            date: new Date(s.cree_le).toLocaleDateString('fr-FR'),
            fighter: lutteursMap[s.lutteur]?.nom || `Inconnu (ID: ${s.lutteur})`,
            type: s.raison
          };
          console.log('Soutien transformé:', s, support);
          return support;
        });
        console.log('Soutiens finaux:', supportsList);
        setSupports(supportsList);

      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Données filtrées
  const filteredFights = useMemo(() => {
    return fights.filter(fight => {
      const matchesSearch = searchTerm === "" || 
        fight.fighter1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fight.fighter2.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fight.winner?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPhase = phaseFilter === "all" || fight.phase === phaseFilter;
      return matchesSearch && matchesPhase;
    });
  }, [fights, searchTerm, phaseFilter]);

  const filteredPredictions = useMemo(() => {
    return predictions.filter(pred => {
      const matchesSearch = searchTerm === "" || 
        pred.fight.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pred.prediction.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesResult = resultFilter === "all" || pred.result === resultFilter;
      return matchesSearch && matchesResult;
    });
  }, [predictions, searchTerm, resultFilter]);

  const filteredSupports = useMemo(() => {
    return supports.filter(support => {
      const matchesSearch = searchTerm === "" || 
        support.fighter.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || support.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [supports, searchTerm, typeFilter]);

  // Obtenir les valeurs uniques pour les filtres
  const phases = useMemo(() => {
    const phasesFromData = [...new Set(fights.map(f => f.phase))];
    const allPossiblePhases = ['Finale', 'Demi-finale', '3ème place', 'Quart de finale', '8èmes de finale'];
    // Combine les phases existantes avec celles possibles, en gardant l'ordre logique
    return allPossiblePhases.filter(p => phasesFromData.includes(p) || allPossiblePhases.indexOf(p) < 3);
  }, [fights]);
  const supportTypes = useMemo(() => [...new Set(supports.map(s => s.type))], [supports]);

  // Pagination
  const paginatedFights = useMemo(() => {
    const startIndex = (fightPage - 1) * itemsPerPage;
    return filteredFights.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFights, fightPage]);

  const paginatedPredictions = useMemo(() => {
    const startIndex = (predictionPage - 1) * itemsPerPage;
    return filteredPredictions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPredictions, predictionPage]);

  const paginatedSupports = useMemo(() => {
    const startIndex = (supportPage - 1) * itemsPerPage;
    return filteredSupports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSupports, supportPage]);

  const totalFightPages = Math.ceil(filteredFights.length / itemsPerPage);
  const totalPredictionPages = Math.ceil(filteredPredictions.length / itemsPerPage);
  const totalSupportPages = Math.ceil(filteredSupports.length / itemsPerPage);

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
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase bg-gradient-to-r from-primary via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-4">
              Historique
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              L'historique complet des activités de la plateforme
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
          <>
          {/* Barre de recherche et filtres */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setFightPage(1); setPredictionPage(1); setSupportPage(1); }}
                className="pl-10 bg-card border-border/50"
              />
            </div>
          </motion.div> */}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="fights" className="w-full" onValueChange={() => { setSearchTerm(""); setFightPage(1); setPredictionPage(1); setSupportPage(1); }}>
              <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-8">
                {/* <TabsTrigger
                  value="classement"
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-400 data-[state=active]:text-yellow-900 rounded-lg border border-border/50 data-[state=active]:border-yellow-400 data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-400/20"
                >
                  <Trophy size={18} className="text-yellow-400" />
                  <span>Classement</span>
                </TabsTrigger> */}
                <TabsTrigger
                  value="fights"
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-lg border border-border/50 data-[state=active]:border-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                >
                  <Swords size={18} className="text-yellow-500" />
                  <span>Affrontements</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-400 font-semibold">{filteredFights.length}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="predictions"
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-lg border border-border/50 data-[state=active]:border-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                >
                  <Target size={18} className="text-blue-500" />
                  <span>Pronostics</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 font-semibold">{filteredPredictions.length}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="supports"
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-lg border border-border/50 data-[state=active]:border-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                >
                  <Heart size={18} className="text-red-500" />
                  <span>Soutiens</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 font-semibold">{filteredSupports.length}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="rewards"
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground rounded-lg border border-border/50 data-[state=active]:border-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20"
                >
                  <Gift size={18} className="text-purple-500" />
                  <span>Gratifications</span>
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 font-semibold">0</span>
                </TabsTrigger>
              </TabsList>
              {/* Classement Tab */}
              <TabsContent value="classement">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {/* Top Pronostiqueurs - Bar Chart */}
                  <div className="bg-card rounded-xl border border-yellow-400/30 p-6 shadow-md flex flex-col">
                    <h3 className="font-heading text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2"><Trophy className="text-yellow-400" size={20}/>Top Pronostiqueurs</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={Array.from({length: 10}).map((_, i) => ({
                          name: `***${1000+i*111}`,
                          points: 100 - i*7 + Math.floor(Math.random()*5)
                        }))}
                        layout="vertical"
                        margin={{left: 20, right: 20, top: 10, bottom: 10}}
                      >
                        <XAxis type="number" hide domain={[0, 'dataMax+10']} />
                        <YAxis type="category" dataKey="name" width={60} tick={{fontSize: 12}} />
                        <Tooltip formatter={(value) => `${value} pts`} />
                        <Bar
                          dataKey="points"
                          radius={[8,8,8,8]}
                          fill="#FACC15"
                          label={({x, y, width, height, index, value, payload}) => (
                            <g>
                              {/* Numéro de téléphone à l'intérieur de la barre */}
                              <text
                                x={x + Math.max(width/2, 40)}
                                y={y + height/2 + 2}
                                fill="#fff"
                                fontWeight={index === 0 ? 'bold' : 'normal'}
                                fontSize={index === 0 ? 16 : 13}
                                alignmentBaseline="middle"
                                textAnchor="middle"
                              >
                                {index === 0 ? <tspan><Crown size={16} style={{verticalAlign:'middle'}}/> </tspan> : null}{payload && payload.name ? payload.name : ''}
                              </text>
                              {/* Points à droite de la barre */}
                              <text
                                x={x + width + 10}
                                y={y + height/2 + 2}
                                fill="#FACC15"
                                fontWeight={index === 0 ? 'bold' : 'normal'}
                                fontSize={index === 0 ? 16 : 13}
                                alignmentBaseline="middle"
                              >
                                {value} pts
                              </text>
                            </g>
                          )}
                        >
                          {Array.from({length: 10}).map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#FFD700' : '#FACC15'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Top Lutteurs gratifiés - Pie Chart */}
                  <div className="bg-card rounded-xl border border-orange-400/30 p-6 shadow-md flex flex-col">
                    <h3 className="font-heading text-lg font-bold text-orange-500 mb-4 flex items-center gap-2"><Gift className="text-orange-400" size={20}/>Lutteurs les plus gratifiés</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={Array.from({length: 5}).map((_, i) => ({
                            name: `Lutteur ${i+1}`,
                            value: Math.floor(Math.random()*100+20)
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label={({name, percent}) => `${name} (${Math.round(percent*100)}%)`}
                        >
                          {['#FDBA74','#F59E42','#F97316','#EA580C','#C2410C'].map((color, i) => (
                            <Cell key={i} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} gratifications`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Lutteurs spéciaux - Badges stylisés */}
                  <div className="bg-card rounded-xl border border-primary/30 p-6 shadow-md flex flex-col">
                    <h3 className="font-heading text-lg font-bold text-primary mb-4 flex items-center gap-2"><Star className="text-primary" size={20}/>Lutteurs spéciaux</h3>
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs shadow"><Star size={14} className="text-green-500"/> Fairplay</span>
                        <span className="font-heading text-foreground">Lutteur Fairplay</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs shadow"><Star size={14} className="text-blue-500"/> Performant</span>
                        <span className="font-heading text-foreground">Lutteur Performant</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-xs shadow"><Star size={14} className="text-yellow-500"/> Charismatique</span>
                        <span className="font-heading text-foreground">Lutteur Charismatique</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Fights Tab */}
              <TabsContent value="fights">
                <div className="mb-4 flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setFightPage(1); }}
                      className="pl-10 bg-card border-border/50"
                    />
                  </div>
                  <Select value={phaseFilter} onValueChange={(v) => { setPhaseFilter(v); setFightPage(1); }}>
                    <SelectTrigger className="w-[180px] bg-card border-border/50">
                      <SelectValue placeholder="Filtrer par phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les phases</SelectItem>
                      {phases.map(phase => (
                        <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Liste des combats */}
                <div className="space-y-3">
                  {filteredFights.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border border-border/50">
                      Aucun affrontement trouvé
                    </div>
                  ) : paginatedFights.map((fight, index) => (
                    <motion.div
                      key={fight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-card to-card/60 rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                    >
                      {/* Desktop view */}
                      <div className="hidden md:flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-orange-500" />
                          <span className="text-sm text-muted-foreground">{fight.date}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-1 justify-center">
                          <span className="font-heading font-semibold text-foreground text-lg">{fight.fighter1}</span>
                          <Swords size={20} className="text-primary" />
                          <span className="font-heading font-semibold text-foreground text-lg">{fight.fighter2}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {fight.winner ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                              <Star size={16} className="fill-yellow-500 text-yellow-500" />
                              <span className="font-semibold text-yellow-400">{fight.winner}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">En attente</span>
                          )}
                          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {fight.phase}
                          </span>
                        </div>
                      </div>
                      
                      {/* Mobile view */}
                      <div className="md:hidden space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-orange-500" />
                            <span className="text-xs text-muted-foreground">{fight.date}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {fight.phase}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-semibold text-foreground">{fight.fighter1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Swords size={16} className="text-primary" />
                            <div className="h-px flex-1 bg-border"></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-semibold text-foreground">{fight.fighter2}</span>
                          </div>
                        </div>
                        
                        {fight.winner && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 w-fit">
                            <Star size={14} className="fill-yellow-500 text-yellow-500" />
                            <span className="font-semibold text-yellow-400 text-sm">Vainqueur: {fight.winner}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {filteredFights.length > 0 && totalFightPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {fightPage} sur {totalFightPages} ({filteredFights.length} résultat{filteredFights.length > 1 ? 's' : ''})
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFightPage(p => Math.max(1, p - 1))}
                        disabled={fightPage === 1}
                      >
                        <ChevronLeft size={16} />
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFightPage(p => Math.min(totalFightPages, p + 1))}
                        disabled={fightPage === totalFightPages}
                      >
                        Suivant
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Predictions Tab */}
              <TabsContent value="predictions">
                <div className="mb-4 flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPredictionPage(1); }}
                      className="pl-10 bg-card border-border/50"
                    />
                  </div>
                  <Select value={resultFilter} onValueChange={(v) => { setResultFilter(v); setPredictionPage(1); }}>
                    <SelectTrigger className="w-[200px] bg-card border-border/50">
                      <SelectValue placeholder="Filtrer par résultat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les résultats</SelectItem>
                      <SelectItem value="correct">Correct</SelectItem>
                      <SelectItem value="incorrect">Incorrect</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden shadow-lg shadow-primary/5">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent bg-primary/5">
                        <TableHead className="text-muted-foreground font-heading uppercase text-xs hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-muted-foreground font-heading uppercase text-xs hidden md:table-cell">Téléphone</TableHead>
                        <TableHead className="text-muted-foreground font-heading uppercase text-xs">Combat</TableHead>
                        <TableHead className="text-muted-foreground font-heading uppercase text-xs">Prédiction</TableHead>
                        <TableHead className="text-muted-foreground font-heading uppercase text-xs">Résultat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPredictions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Aucun pronostic trouvé
                          </TableCell>
                        </TableRow>
                      ) : paginatedPredictions.map((prediction, index) => (
                        <tr
                          key={prediction.id}
                          className="border-border/30 hover:bg-primary/5"
                        >
                          <motion.td
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="text-sm text-muted-foreground hidden sm:table-cell"
                          >
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-blue-500" />
                              {prediction.date}
                            </span>
                          </motion.td>
                          <motion.td
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hidden md:table-cell"
                          >
                            <span className="flex items-center gap-1.5 text-foreground">
                              <User size={14} className="text-purple-500" />
                              ***{prediction.phone}
                            </span>
                          </motion.td>
                          <motion.td
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="font-medium text-foreground text-xs sm:text-sm"
                          >
                            <span className="line-clamp-2">{prediction.fight}</span>
                          </motion.td>
                          <motion.td
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="text-muted-foreground text-xs sm:text-sm"
                          >
                            <span className="line-clamp-1">{prediction.prediction}</span>
                          </motion.td>
                          <motion.td
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {getResultBadge(prediction.result)}
                          </motion.td>
                        </tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredPredictions.length > 0 && totalPredictionPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {predictionPage} sur {totalPredictionPages} ({filteredPredictions.length} résultat{filteredPredictions.length > 1 ? 's' : ''})
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPredictionPage(p => Math.max(1, p - 1))}
                        disabled={predictionPage === 1}
                      >
                        <ChevronLeft size={16} />
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPredictionPage(p => Math.min(totalPredictionPages, p + 1))}
                        disabled={predictionPage === totalPredictionPages}
                      >
                        Suivant
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Supports Tab */}
              <TabsContent value="supports">
                <div className="mb-4 flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setSupportPage(1); }}
                      className="pl-10 bg-card border-border/50"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setSupportPage(1); }}>
                    <SelectTrigger className="w-[180px] bg-card border-border/50">
                      <SelectValue placeholder="Filtrer par type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {supportTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Liste des soutiens */}
                <div className="space-y-3">
                  {filteredSupports.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border border-border/50">
                      Aucun soutien trouvé
                    </div>
                  ) : paginatedSupports.map((support, index) => (
                    <motion.div
                      key={support.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-br from-card to-card/60 rounded-xl border border-border/50 p-4 hover:border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/5"
                    >
                      {/* Desktop view */}
                      <div className="hidden md:flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-green-500" />
                          <span className="text-sm text-muted-foreground">{support.date}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <User size={16} className="text-blue-500" />
                            <span className="font-heading font-semibold text-foreground text-lg">{support.fighter}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                          <Heart size={16} className="fill-red-500 text-red-500" />
                          <span className="font-medium text-red-400">{support.type}</span>
                        </div>
                      </div>
                      
                      {/* Mobile view */}
                      <div className="md:hidden space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-green-500" />
                            <span className="text-xs text-muted-foreground">{support.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                            <Heart size={12} className="fill-red-500 text-red-500" />
                            <span className="font-medium text-red-400 text-xs">{support.type}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <User size={16} className="text-blue-500" />
                          <span className="font-heading font-semibold text-foreground">{support.fighter}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {filteredSupports.length > 0 && totalSupportPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {supportPage} sur {totalSupportPages} ({filteredSupports.length} résultat{filteredSupports.length > 1 ? 's' : ''})
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSupportPage(p => Math.max(1, p - 1))}
                        disabled={supportPage === 1}
                      >
                        <ChevronLeft size={16} />
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSupportPage(p => Math.min(totalSupportPages, p + 1))}
                        disabled={supportPage === totalSupportPages}
                      >
                        Suivant
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Rewards Tab */}
              <TabsContent value="rewards">
                <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
                  <p className="text-muted-foreground text-lg">
                    En attente ...
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
          </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChroniquesPage;
