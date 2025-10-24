
import { Activity } from './types';

export const ACTIVITIES_TEMPLATE: Omit<Activity, 'completed'>[] = [
  { id: 1, name: 'RICHIESTA FIBRA' },
  { id: 2, name: 'RICHIESTA CONFIGURAZIONE IP DI MANAGEMENT' },
  { id: 3, name: 'PROGETTO INVIATO A REALIZZAZIONI' },
  { id: 4, name: 'PROGETTO INVIATO A SERVICE ACTIVATION' },
  { id: 5, name: 'PROGETTO REALIZZATO' },
];