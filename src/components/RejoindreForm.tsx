import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlagsSelect from "react-flags-select";
import lutteursService, { Lutteur } from "@/services/lutteursService";
import "./RejoindreForm.css";

const regions = ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"];

export default function RejoindreForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [favori, setFavori] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lutteurs, setLutteurs] = useState<Lutteur[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLutteurs, setLoadingLutteurs] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchLutteurs = async () => {
      setLoadingLutteurs(true);
      try {
        const data = await lutteursService.getLutteurs();
        setLutteurs(data);
      } catch (err) {
        console.error("Erreur lors du chargement des lutteurs:", err);
      } finally {
        setLoadingLutteurs(false);
      }
    };
    fetchLutteurs();
  }, []);

  const filteredLutteurs = lutteurs.filter((l) =>
    l.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Le nom est requis.");
    if (!phone.trim()) return setError("Le numéro de téléphone est requis.");
    if (!/^\d{8,}$/.test(phone.replace(/\D/g, ""))) return setError("Numéro de téléphone invalide.");
    if (!country) return setError("Le pays est requis.");
    if (country === "NE" && !region) return setError("La région est requise pour le Niger.");
    if (!favori) return setError("Veuillez choisir votre lutteur favori.");
    
    setLoading(true);
    try {
      // Formater le numéro avec le code pays (ex: 227 pour le Niger)
      const countryCode = country === "NE" ? "227" : "33"; // Niger ou France
      const formattedPhone = countryCode + phone.replace(/\D/g, "");
      
      await lutteursService.register({
        first_name: name,
        telephone: formattedPhone,
        pays: country,
        region: region || "",
        favoris: favori
      });
      setName(""); setPhone(""); setCountry(""); setRegion(""); setFavori(""); setSearchTerm("");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error("Erreur lors de l'inscription:", err);
      setError(err.response?.data?.message || "Une erreur est survenue, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AnimatePresence>
        {success ? (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <span className="text-5xl mb-4">🎉</span>
            <h2 className="text-2xl font-bold text-green-500 mb-2">Bienvenue !</h2>
            <p className="text-lg text-foreground">Votre inscription a bien été prise en compte.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && <div className="mb-2 text-red-500">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
                placeholder="Ton nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Numéro de téléphone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
                placeholder="Ex: 90123456"
                type="tel"
                inputMode="tel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Pays</label>
              <ReactFlagsSelect
                selected={country}
                onSelect={(code) => {
                  setCountry(code);
                  if (code !== 'NE') setRegion('');
                }}
                searchable
                placeholder="Choisir un pays"
                className="flag-select w-full"
                fullWidth
                alignOptionsToRight={false}
                showSelectedLabel={true}
                showOptionLabel={true}
                showSecondaryOptionLabel={true}
                showSecondarySelectedLabel={true}
                selectedSize={16}
                optionsSize={16}
                customLabels={{ NE: "Niger", FR: "France" }}
              />
            </div>
            {country === "NE" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Région</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
                >
                  <option value="">Choisir une région</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Lutteur favori</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un lutteur..."
                  className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
                />
                {searchTerm && (
                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg">
                    {loadingLutteurs ? (
                      <div className="p-4 text-center text-muted-foreground">Chargement...</div>
                    ) : filteredLutteurs.length > 0 ? (
                      filteredLutteurs.map((lutteur) => (
                        <button
                          key={lutteur.id}
                          type="button"
                          onClick={() => {
                            setFavori(lutteur.id);
                            setSearchTerm("");
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors"
                        >
                          <div className="font-medium text-foreground">{lutteur.nom}</div>
                          <div className="text-sm text-muted-foreground">{lutteur.region}</div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">Aucun lutteur trouvé</div>
                    )}
                  </div>
                )}
              </div>
              {favori && !searchTerm && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Lutteur sélectionné: {lutteurs.find(l => l.id === favori)?.nom}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button type="submit" className="btn-hero-primary" disabled={loading}>{loading ? 'Envoi...' : 'Rejoindre'}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
