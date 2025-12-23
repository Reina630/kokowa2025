import api from './api';

// Types
export interface Lutteur {
  id: string;
  nom: string;
  region: string;
  poids: string;
  photo: string | null;
  toise: string;
  total_soutiens: number;
  en_lisse: boolean;
  cree_le: string;
}

export interface SupportLutteurData {
  lutteur: string;
  raison: 'Fairplay' | 'Charisme' | 'Performance';
}

export interface GratifierLutteurData {
  lutteur_id: string;
  montant: number;
}

// Service des lutteurs
const lutteursService = {
  // Récupérer la liste des lutteurs
  getLutteurs: async () => {
    const response = await api.get('/lutteur_liste');
    return response.data;
  },

  // Récupérer un lutteur par ID
  getLutteurById: async (id: number) => {
    const response = await api.get(`/lutteur/${id}`);
    return response.data;
  },

  // Soutenir un lutteur
  supporterLutteur: async (data: SupportLutteurData) => {
    const response = await api.post('/soutien_add', data);
    return response.data;
  },

  // Gratifier un lutteur
  gratifierLutteur: async (data: GratifierLutteurData) => {
    const response = await api.post('/lutteur_gratifier', data);
    return response.data;
  },
};

export default lutteursService;
