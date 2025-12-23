import api from './api';

// Types
export interface HistoriquePronostic {
  id: number;
  numero_telephone: string;
  affrontement: number;
  choix: string;
  resultat?: string;
  date_vote: string;
}

export interface HistoriqueSoutien {
  id?: number;
  numero_telephone?: string;
  lutteur: string;
  raison: string;
  cree_le: string;
}

// Service de l'historique
const historiqueService = {
  // Récupérer l'historique des pronostics
  getPronostics: async (): Promise<HistoriquePronostic[]> => {
    const response = await api.get('/pronostic_liste');
    return response.data;
  },

  // Récupérer l'historique des soutiens
  getSoutiens: async (): Promise<HistoriqueSoutien[]> => {
    const response = await api.get('/soutien_liste');
    return response.data;
  },
};

export default historiqueService;
