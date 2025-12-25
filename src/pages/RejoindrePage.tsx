import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const regions = ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"];

const RejoindrePage = () => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Le nom est requis.");
    if (!country) return setError("Le pays est requis.");
    if (country === "Niger" && !region) return setError("La région est requise pour le Niger.");

    setLoading(true);
    try {
      // Ici on simule un envoi. Remplace par un appel API réel si besoin.
      await new Promise((r) => setTimeout(r, 800));
      // On montre une confirmation et redirige vers l'accueil
      alert("Merci ! Votre demande d'inscription a bien été reçue.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto bg-card p-8 rounded-xl border border-border/50 shadow">
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-4">Rejoindre Kokowa</h1>
          <p className="text-muted-foreground mb-6">Remplissez ce formulaire pour rejoindre la communauté.</p>

          {error && <div className="mb-4 text-red-500">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-foreground mb-1">Pays</label>
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); if (e.target.value !== 'Niger') setRegion(''); }}
                className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
              >
                <option value="">Choisir un pays</option>
                <option value="Niger">Niger</option>
                <option value="France">France</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {country === "Niger" && (
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

            <div className="flex items-center gap-4">
              <button type="submit" className="btn-hero-primary" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer'}</button>
              <Link to="/" className="btn-ghost">Annuler</Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RejoindrePage;
