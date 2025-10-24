import React from 'react';
import { Project } from '../types';

interface ProgressBarProps {
  progress: number;
  projectStatus: Project['status'];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, projectStatus }) => {
  const progressColor = {
    'closed': 'bg-green-500',
    'on going': 'bg-blue-600',
    'pending': 'bg-yellow-500',
  }[projectStatus];
  
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
      <div
        className={`${progressColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;