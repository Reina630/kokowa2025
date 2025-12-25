import { useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import "./RejoindreForm.css";

const regions = ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"];

export default function RejoindreForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Le nom est requis.");
    if (!phone.trim()) return setError("Le numéro de téléphone est requis.");
    // Simple validation: at least 8 digits
    if (!/^\d{8,}$/.test(phone.replace(/\D/g, ""))) return setError("Numéro de téléphone invalide.");
    if (!country) return setError("Le pays est requis.");
    if (country === "Niger" && !region) return setError("La région est requise pour le Niger.");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setName(""); setPhone(""); setCountry(""); setRegion("");
      if (onSuccess) onSuccess();
      alert("Merci ! Votre demande d'inscription a bien été reçue.");
    } catch (err) {
      setError("Une erreur est survenue, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full"
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
      <div className="flex items-center gap-4 mt-4">
        <button type="submit" className="btn-hero-primary" disabled={loading}>{loading ? 'Envoi...' : 'Rejoindre'}</button>
      </div>
    </form>
  );
}
