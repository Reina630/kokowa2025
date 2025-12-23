import api from './api';

// Types
export interface Affrontement {
  id: number;
  l1: string;
  l2: string;
  etape: string;
  date: string;
  status: string;
  vainqueur: string | null;
  cree_le: string;
  nb_votes_l1: number;
  nb_votes_l2: number;
}

export interface PronosticData {
  numero_telephone: string;
  affrontement: number;
  choix: 'l1' | 'l2';
}

// Service des affrontements
const affrontementsService = {
  // Récupérer la liste des affrontements
  getAffrontements: async (): Promise<Affrontement[]> => {
    const response = await api.get('/affrontement_liste');
    return response.data;
  },

  // Ajouter un pronostic
  ajouterPronostic: async (data: PronosticData) => {
    const response = await api.post('/pronostic_add', data);
    return response.data;
  },
};

export default affrontementsService;
