import React, { useRef } from 'react';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { UploadIcon } from './icons/UploadIcon';

const ClipboardDocumentListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 12 2.25a2.251 2.251 0 0 1 1.75.715m-1.75.715h5.801m-5.801a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 7.5 18h6a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08" />
  </svg>
);

interface HeaderProps {
    onExportJSON: () => void;
    onImportJSON: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ onExportJSON, onImportJSON }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportJSON(file);
        }
        // Reset the input value to allow importing the same file again
        event.target.value = '';
    };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 dark:text-blue-500" />
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-400 dark:from-blue-500 dark:to-sky-300 bg-clip-text text-transparent">
            Project Tracker CRQ
          </h1>
        </div>
        <div className="flex items-center space-x-2">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
                onClick={handleImportClick}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
                title="Importa Lista Progetti da JSON"
            >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span className="hidden sm:inline">IMPORTA LISTA PROGETTI</span>
            </button>
             <button
                onClick={onExportJSON}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
                title="Esporta Lista Progetti in JSON"
            >
                <UploadIcon className="h-5 w-5" />
                 <span className="hidden sm:inline">ESPORTA LISTA PROGETTI</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;