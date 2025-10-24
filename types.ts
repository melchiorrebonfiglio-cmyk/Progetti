export interface Activity {
  id: number;
  name: string;
  completed: boolean;
}

export interface RiferimentoSede {
  referente?: string;
  tel?: string;
}

export interface Project {
  id: string; // Using CRQ number as ID
  ragioneSociale: string;
  via: string;
  citta: string;
  riepilogo?: string;
  riferimentoSede: RiferimentoSede;
  activities: Activity[];
  status: 'on going' | 'pending' | 'closed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}