import React, { useMemo } from 'react';
import { Project } from '../types';
import ProgressBar from './ProgressBar';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ProjectListRowProps {
  project: Project;
  rowIndex: number;
  onViewDetails: (projectId: string) => void;
  onToggleActivity: (projectId: string, activityId: number) => void;
  onDuplicateActivity: (projectId: string, activityId: number) => void;
  onChangeProjectStatus: (projectId: string, newStatus: Project['status']) => void;
  onOpenEditModal: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectListRow: React.FC<ProjectListRowProps> = ({ 
  project, 
  rowIndex,
  onViewDetails,
  onToggleActivity, 
  onDuplicateActivity,
  onChangeProjectStatus,
  onOpenEditModal,
  onDeleteProject
}) => {
  const { progress } = useMemo(() => {
    const total = project.activities.length;
    const completed = project.activities.filter(a => a.completed).length;
    return {
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [project.activities]);

  const isPending = project.status === 'pending';
  const isEvenRow = rowIndex % 2 === 1;
  const rowBgClass = isEvenRow ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800';

  const statusIndicator = {
    'on going': <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" title="In Corso"></div>,
    'closed': <div className="h-2.5 w-2.5 rounded-full bg-green-500 mt-1 flex-shrink-0" title="Chiuso"></div>,
    'pending': <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mt-1 flex-shrink-0" title="In Sospeso"></div>,
  }[project.status];

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
    <React.Fragment>
      <tr className={`border-b border-slate-200 dark:border-slate-700 ${rowBgClass} hover:bg-sky-100 dark:hover:bg-slate-700/60 transition-colors duration-150 ${isPending ? 'opacity-60' : ''}`}>
        <th 
            scope="row" 
            onClick={() => onViewDetails(project.id)}
            className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap cursor-pointer"
        >
          <div className="flex items-start gap-2 text-left w-full group">
            {statusIndicator}
            <div className="flex flex-col">
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.id}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
                    Creato: {formatDate(project.createdAt)}
                </span>
            </div>
          </div>
        </th>
        <td 
            onClick={() => onViewDetails(project.id)}
            className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {project.ragioneSociale}
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {project.activities.map(activity => (
                <span
                  key={activity.id}
                  title={activity.name}
                  className={`block h-3 w-3 rounded-full ${activity.completed ? 'bg-green-500' : 'bg-slate-600 dark:bg-slate-500'}`}
                ></span>
              ))}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Modif.: {formatDate(project.updatedAt)}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-4">
                <ProgressBar progress={progress} projectStatus={project.status} />
                <span className="font-semibold text-slate-600 dark:text-slate-300">{Math.round(progress)}%</span>
            </div>
            {(project.status === 'closed' || project.status === 'pending') && project.completedAt && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {project.status === 'closed' ? 'Chiuso il:' : 'Sospeso il:'} {formatDate(project.completedAt)}
                </div>
            )}
        </td>
        <td className="px-6 py-4">
            <select
              value={project.status === 'pending' ? 'pending' : 'on going'}
              onChange={(e) => onChangeProjectStatus(project.id, e.target.value as Project['status'])}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="on going">Attivo</option>
              <option value="pending">In Sospeso</option>
            </select>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-end space-x-2">
                <button
                    onClick={() => onOpenEditModal(project)}
                    title="Modifica Progetto"
                    disabled={isPending}
                    className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onDeleteProject(project.id)}
                    title="Elimina Progetto"
                    disabled={isPending}
                    className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </td>
      </tr>
    </React.Fragment>
  );
};

export default ProjectListRow;