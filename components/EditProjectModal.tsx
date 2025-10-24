import React, { useState } from 'react';
import { Project, Activity } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface EditProjectModalProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onClose: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onUpdateProject, onClose }) => {
  // Deep copy to avoid mutating the original project state directly,
  // and initialize state only once.
  const [activities, setActivities] = useState<Activity[]>(() =>
    JSON.parse(JSON.stringify(project.activities))
  );

  const handleActivityNameChange = (activityId: number, newName: string) => {
    setActivities(currentActivities =>
      currentActivities.map(act =>
        act.id === activityId ? { ...act, name: newName } : act
      )
    );
  };

  const handleAddActivity = () => {
    const newActivity: Activity = {
      id: Date.now(), // Unique ID
      name: '',
      completed: false,
    };
    setActivities(currentActivities => [...currentActivities, newActivity]);
  };

  const handleDeleteActivity = (activityId: number) => {
    setActivities(currentActivities =>
      currentActivities.filter(act => act.id !== activityId)
    );
  };
  
  const handleSave = () => {
    onUpdateProject({ ...project, activities });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Modifica Progetto: <span className="font-bold text-blue-600 dark:text-blue-400">{project.id}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{project.ragioneSociale}</p>
        </header>

        <main className="p-6 overflow-y-auto space-y-4">
          <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300">Attività</h3>
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-center gap-2">
              <input 
                type="text"
                value={activity.name}
                onChange={(e) => handleActivityNameChange(activity.id, e.target.value)}
                placeholder={`Nuova attività ${index + 1}`}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
              <button 
                onClick={() => handleDeleteActivity(activity.id)}
                title="Elimina attività"
                className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-500 rounded-full transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          ))}
           <button
            onClick={handleAddActivity}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-500 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Aggiungi Attività</span>
          </button>
        </main>
        
        <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            Salva Modifiche
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EditProjectModal;