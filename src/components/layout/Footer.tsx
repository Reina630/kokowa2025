import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sabre National */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-3" style={{ color: '#043A3A' }}>Sabre National 2025</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>46 e édition 50 e anniversaire</li>
              <li>Tahoua, Niger</li>
              <li>Un évènement culturel historique</li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-3" style={{ color: '#043A3A' }}>Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary" style={{ color: '#043A3A' }}>ACCUEIL</Link></li>
              <li><Link to="/lutteurs" className="hover:text-primary" style={{ color: '#043A3A' }}>NOS LUTTEURS</Link></li>
              <li><Link to="/pronostics" className="hover:text-primary" style={{ color: '#043A3A' }}>PRONOSTICS</Link></li>
              <li><Link to="/chroniques" className="hover:text-primary" style={{ color: '#043A3A' }}>HISTORIQUE</Link></li>
              <li><Link to="/faq" className="hover:text-primary" style={{ color: '#043A3A' }}>FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-3" style={{ color: '#043A3A' }}>Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Tahoua, Niger</li>
              <li className="flex items-center gap-2"><Mail size={16} className="text-primary" /> iman@iman.ne</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-primary" /> +227 95 00 61 02</li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-3" style={{ color: '#043A3A' }}>Réseaux sociaux</h3>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="inline-flex w-9 h-9 items-center justify-center rounded-full border hover:bg-primary/10 transition-colors" style={{ borderColor: '#043A3A', color: '#043A3A' }}>
                <Facebook size={18} />
              </a>
              <a href="#" aria-label="Twitter" className="inline-flex w-9 h-9 items-center justify-center rounded-full border hover:bg-primary/10 transition-colors" style={{ borderColor: '#043A3A', color: '#043A3A' }}>
                <Twitter size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="inline-flex w-9 h-9 items-center justify-center rounded-full border hover:bg-primary/10 transition-colors" style={{ borderColor: '#043A3A', color: '#043A3A' }}>
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
