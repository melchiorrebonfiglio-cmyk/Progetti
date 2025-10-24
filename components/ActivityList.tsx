import React from 'react';
import { Project } from '../types';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';

interface ActivityListProps {
  project: Project;
  onToggleActivity: (projectId: string, activityId: number) => void;
  onDuplicateActivity: (projectId: string, activityId: number) => void;
  disabled?: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ project, onToggleActivity, onDuplicateActivity, disabled = false }) => {
  return (
    <div className="space-y-3">
      {project.activities.map(activity => (
        <div key={activity.id} className="flex items-center justify-between group">
          <label className={`flex items-center flex-grow min-w-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            {/* Custom checkbox */}
            <div className="relative h-5 w-5 flex-shrink-0">
              <input
                type="checkbox"
                checked={activity.completed}
                onChange={() => onToggleActivity(project.id, activity.id)}
                disabled={disabled}
                className="peer absolute h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className={`
                pointer-events-none
                h-full w-full rounded border-2
                flex items-center justify-center
                transition-colors duration-200
                bg-white dark:bg-slate-700
                border-slate-300 dark:border-slate-600
                peer-checked:border-green-600 peer-checked:bg-green-600
                peer-focus:ring-2 peer-focus:ring-blue-500
                peer-disabled:opacity-50
                ${!disabled ? 'group-hover:border-blue-500 dark:group-hover:border-blue-400' : ''}
              `}>
                <svg
                  className="h-3.5 w-3.5 text-white hidden peer-checked:block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <span className={`ml-3 text-sm truncate ${activity.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-600 dark:text-slate-300'} ${!disabled ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400' : ''} transition`}>
              {activity.name}
            </span>
          </label>
          <button 
            onClick={() => onDuplicateActivity(project.id, activity.id)}
            disabled={disabled}
            className="ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-opacity p-1 rounded-full flex-shrink-0 disabled:opacity-0 disabled:cursor-not-allowed"
            title="Duplica attività"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;