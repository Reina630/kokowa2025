import React from "react";
import { MapPin, User, Heart } from "lucide-react";

interface LutteurCardProps {
  name: string;
  region: string;
  totalSupports: number;
  mySupport: number;
  onSupport?: () => void;
  isFavorite?: boolean;
}

const LutteurCard: React.FC<LutteurCardProps> = ({
  name,
  region,
  totalSupports,
  mySupport,
  onSupport,
  isFavorite = false,
}) => {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-lg p-6 flex flex-col items-start gap-4 min-w-[320px] max-w-xs w-full transition-all hover:border-primary/40">
      <div className="w-full flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <User className="text-muted-foreground" size={32} />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground leading-tight mb-1">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={14} />
            {region}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 w-full">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-all"
          onClick={onSupport}
        >
          <Heart size={18} className="text-orange-400" />
          J'aime mon lutteur
        </button>
        {isFavorite && (
          <span className="px-3 py-1 rounded-full bg-background text-primary border border-primary text-xs font-bold">MON FAVORI</span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="flex items-center gap-1 text-orange-500 font-semibold text-base">
          <Heart size={16} />
          {totalSupports} soutiens
        </span>
        <span className="text-xs text-muted-foreground">|</span>
        <span className="text-primary font-semibold text-base">{mySupport} mes soutiens</span>
      </div>
    </div>
  );
};

export default LutteurCard;
