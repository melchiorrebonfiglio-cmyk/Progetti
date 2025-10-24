import React from 'react';

interface ProjectStatsProps {
  onGoing: number;
  pending: number;
  closed: number;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ onGoing, pending, closed }) => {
  return (
    <div className="my-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex items-center justify-around flex-wrap gap-4">
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Progetti On Going:
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{onGoing}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Progetti in Sospeso:
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{pending}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Progetti Chiusi:
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{closed}</span>
      </div>
    </div>
  );
};

export default ProjectStats;
