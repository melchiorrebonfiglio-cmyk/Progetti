import React, { useMemo } from 'react';
import { Project } from '../types';
import ProgressBar from './ProgressBar';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { UserIcon } from './icons/UserIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ChatBubbleLeftEllipsisIcon } from './icons/ChatBubbleLeftEllipsisIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import ActivityList from './ActivityList';

interface ProjectCardProps {
  project: Project;
  onToggleActivity: (projectId: string, activityId: number) => void;
  onDuplicateActivity: (projectId: string, activityId: number) => void;
  onOpenEditModal: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onToggleActivity, onDuplicateActivity, onOpenEditModal, onDeleteProject }) => {
  const { completedActivities, totalActivities, progress } = useMemo(() => {
    const total = project.activities.length;
    const completed = project.activities.filter(a => a.completed).length;
    return {
      completedActivities: completed,
      totalActivities: total,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [project.activities]);

  const isClosed = project.status === 'closed';
  const isPending = project.status === 'pending';
  
  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'Data non valida';
    }
  };

  return (
    <div className={`relative flex flex-col bg-sky-50 dark:bg-slate-800 rounded-lg shadow-md transition-all duration-300 border-2 ${isClosed ? 'border-green-500' : 'border-transparent dark:border-slate-700'} ${isPending ? 'opacity-60' : ''}`}>
      <div className="p-5 flex-grow">
        {isPending && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">IN SOSPESO</div>
        )}
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 break-all">{project.id}</h3>
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{project.ragioneSociale}</p>
        
        <div className="text-xs text-slate-400 dark:text-slate-500 mb-3 space-y-0.5">
            <p>Creato il: {formatDate(project.createdAt)}</p>
            <p>Ultima modifica: {formatDate(project.updatedAt)}</p>
        </div>

        {isClosed && (
          <div className="flex items-center space-x-1 text-green-500 mb-3">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-semibold">Completato</span>
          </div>
        )}

        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            {project.riepilogo && (
                <div className="flex items-start">
                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="italic">{project.riepilogo}</p>
                </div>
            )}
            <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>{project.via}, {project.citta}</span>
            </div>
            {project.riferimentoSede.referente && (
                <div className="flex items-start">
                    <UserIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{project.riferimentoSede.referente}</span>
                </div>
            )}
            {project.riferimentoSede.tel && (
                 <div className="flex items-start">
                    <PhoneIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <a href={`tel:${project.riferimentoSede.tel}`} className="hover:text-blue-500 transition">{project.riferimentoSede.tel}</a>
                </div>
            )}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 mb-1">
            <span>Progresso</span>
            <span>{completedActivities} / {totalActivities}</span>
          </div>
          <ProgressBar progress={progress} projectStatus={project.status} />
          {(project.status === 'closed' || project.status === 'pending') && project.completedAt && (
              <div className="text-right text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {project.status === 'closed' ? 'Completato il:' : 'Sospeso il:'} {formatDate(project.completedAt)}
              </div>
          )}
        </div>

        <ActivityList 
          project={project}
          onToggleActivity={onToggleActivity}
          onDuplicateActivity={onDuplicateActivity}
          disabled={isPending}
        />
      </div>
      
      <div className="bg-white/50 dark:bg-slate-900/20 border-t border-sky-100 dark:border-slate-700 p-3 rounded-b-lg grid grid-cols-2 gap-2">
         <button
            onClick={() => onOpenEditModal(project)}
            disabled={isPending}
            className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <PencilSquareIcon className="h-4 w-4" />
            <span>Modifica</span>
          </button>
           <button
            onClick={() => onDeleteProject(project.id)}
            disabled={isPending}
            className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title="Elimina Progetto"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Elimina</span>
          </button>
      </div>
    </div>
  );
};

export default ProjectCard;