import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, RiferimentoSede, Activity } from './types';
import { ACTIVITIES_TEMPLATE } from './constants';
import Header from './components/Header';
import AddProjectForm from './components/AddProjectForm';
import ProjectCard from './components/ProjectCard';
import ProjectListView from './components/ProjectListView';
import EditProjectModal from './components/EditProjectModal';
import ProjectStats from './components/ProjectStats';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const projectStats = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        if (project.status === 'on going') {
          acc.onGoing++;
        } else if (project.status === 'pending') {
          acc.pending++;
        } else if (project.status === 'closed') {
          acc.closed++;
        }
        return acc;
      },
      { onGoing: 0, pending: 0, closed: 0 }
    );
  }, [projects]);

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const parsedProjects: (Omit<Project, 'status' | 'createdAt' | 'updatedAt' | 'completedAt'> & { status?: Project['status'], createdAt?: string, updatedAt?: string, completedAt?: string | null })[] = JSON.parse(savedProjects);
        const now = new Date().toISOString();
        const migratedProjects = parsedProjects.map(p => {
            let status: Project['status'];
            if (p.status && ['on going', 'pending', 'closed'].includes(p.status)) {
                status = p.status;
            } else {
                const isCompleted = p.activities.every(a => a.completed);
                status = isCompleted ? 'closed' : 'on going';
            }
            const updatedAt = p.updatedAt || now;
            const completedAt = p.hasOwnProperty('completedAt') ? p.completedAt : ((status === 'closed' || status === 'pending') ? updatedAt : null);

            return { 
                ...p, 
                status: status,
                createdAt: p.createdAt || now,
                updatedAt: updatedAt,
                completedAt: completedAt
            } as Project;
        });
        setProjects(migratedProjects);
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('projects', JSON.stringify(projects));
      } catch (error) {
        console.error("Failed to save projects to localStorage", error);
      }
    }
  }, [projects, isLoading]);

  const handleAddProject = useCallback((crq: string, ragioneSociale: string, via: string, citta: string, riepilogo: string, riferimentoSede: RiferimentoSede) => {
    if (!crq.trim() || !ragioneSociale.trim()) {
      alert('I campi CRQ e Ragione Sociale sono obbligatori.');
      return;
    }
    if (projects.some(p => p.id.toLowerCase() === crq.toLowerCase())) {
      alert('Un progetto con questo Numero CRQ esiste già.');
      return;
    }
    
    const now = new Date().toISOString();
    const newProject: Project = {
      id: crq,
      ragioneSociale,
      via,
      citta,
      riepilogo,
      riferimentoSede,
      activities: ACTIVITIES_TEMPLATE.map(activity => ({
        ...activity,
        completed: false,
      })),
      status: 'on going',
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
  }, [projects]);

  const handleToggleActivity = useCallback((projectId: string, activityId: number) => {
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project.id === projectId) {
          const updatedActivities = project.activities.map(activity =>
              activity.id === activityId
                ? { ...activity, completed: !activity.completed }
                : activity
            );
          
          if (project.status === 'pending') {
              return { 
                  ...project, 
                  activities: updatedActivities,
                  updatedAt: new Date().toISOString(),
                };
          }
          
          const isCompleted = updatedActivities.every(a => a.completed);
          const newStatus = isCompleted ? 'closed' : 'on going';

          let newCompletedAt = project.completedAt;
          if (newStatus === 'closed' && project.status !== 'closed') {
              newCompletedAt = new Date().toISOString();
          } else if (newStatus === 'on going' && project.status === 'closed') {
              newCompletedAt = null;
          }

          return {
            ...project,
            activities: updatedActivities,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            completedAt: newCompletedAt,
          };
        }
        return project;
      })
    );
  }, []);
  
  const handleChangeProjectStatus = useCallback((projectId: string, newStatus: Project['status']) => {
    setProjects(prevProjects =>
        prevProjects.map(p => {
            if (p.id !== projectId) return p;
            
            let finalStatus: Project['status'];
            if (newStatus === 'pending') {
                finalStatus = 'pending';
            } else { // 'on going' selected from dropdown
                const isCompleted = p.activities.every(a => a.completed);
                finalStatus = isCompleted ? 'closed' : 'on going';
            }

            if (p.status === finalStatus) return p;

            let newCompletedAt = p.completedAt;
            if ((finalStatus === 'pending' || finalStatus === 'closed') && (p.status === 'on going')) {
                newCompletedAt = new Date().toISOString();
            } else if (finalStatus === 'on going' && (p.status === 'pending' || p.status === 'closed')) {
                newCompletedAt = null;
            }

            return { ...p, status: finalStatus, updatedAt: new Date().toISOString(), completedAt: newCompletedAt };
        })
    );
  }, []);

  const handleDuplicateActivity = useCallback((projectId: string, activityId: number) => {
    setProjects(prevProjects => prevProjects.map(project => {
      if (project.id === projectId) {
        const activityToDuplicate = project.activities.find(a => a.id === activityId);
        if (!activityToDuplicate) return project;

        const newActivity: Activity = {
          ...activityToDuplicate,
          id: Date.now(),
          name: `${activityToDuplicate.name} (Copia)`,
          completed: false,
        };

        const activityIndex = project.activities.findIndex(a => a.id === activityId);
        const newActivities = [...project.activities];
        newActivities.splice(activityIndex + 1, 0, newActivity);

        const newStatus = project.status === 'pending' ? 'pending' : 'on going';
        const newCompletedAt = (project.status === 'closed' && newStatus === 'on going') ? null : project.completedAt;

        return { 
            ...project, 
            activities: newActivities, 
            status: newStatus,
            updatedAt: new Date().toISOString(),
            completedAt: newCompletedAt,
        };
      }
      return project;
    }));
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare il progetto ${projectId}? L'azione è irreversibile.`)) {
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
        // Se siamo nella vista dettaglio del progetto eliminato, torniamo alla lista
        if (selectedProjectId === projectId) {
            handleReturnToList();
        }
    }
  }, [selectedProjectId]);

  const handleOpenEditModal = useCallback((project: Project) => {
    setEditingProject(project);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditingProject(null);
  }, []);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    setProjects(prevProjects => 
      prevProjects.map(p => {
        if (p.id !== updatedProject.id) return p;

        let newStatus = p.status;
        if (p.status !== 'pending') {
            const isCompleted = updatedProject.activities.every(a => a.completed);
            newStatus = isCompleted ? 'closed' : 'on going';
        }
        
        let newCompletedAt = p.completedAt;
        if (newStatus === 'closed' && p.status !== 'closed') {
            newCompletedAt = new Date().toISOString();
        } else if (newStatus === 'on going' && p.status === 'closed') {
            newCompletedAt = null;
        }

        const activitiesChanged = JSON.stringify(p.activities) !== JSON.stringify(updatedProject.activities);

        return { 
          ...updatedProject,
          status: newStatus,
          updatedAt: activitiesChanged ? new Date().toISOString() : p.updatedAt,
          completedAt: newCompletedAt,
        };
      })
    );
    setEditingProject(null);
  }, []);

  const handleExportJSON = useCallback(() => {
    if (projects.length === 0) {
      alert("Nessun progetto da esportare.");
      return;
    }

    try {
      const jsonString = JSON.stringify(projects, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `progetti_crq_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export projects to JSON", error);
      alert("Errore durante l'esportazione. Controlla la console per i dettagli.");
    }
  }, [projects]);

  const handleImportJSON = (file: File) => {
    file.text()
      .then(text => {
        try {
          const importedData = JSON.parse(text);

          if (!Array.isArray(importedData)) {
            throw new Error("Il file JSON deve contenere un array di progetti.");
          }

          const validatedProjects: Project[] = importedData.map((p: any) => {
            if (!p.id || !p.ragioneSociale || !p.activities) {
              console.warn("Oggetto progetto non valido saltato (id, ragioneSociale o activities mancanti):", p);
              return null;
            }
            
            const now = new Date().toISOString();
            let status: Project['status'];
            if (p.status && ['on going', 'pending', 'closed'].includes(p.status)) {
                status = p.status;
            } else {
                const areActivitiesValid = Array.isArray(p.activities);
                const isCompleted = areActivitiesValid && p.activities.every((a: any) => a.completed);
                status = isCompleted ? 'closed' : 'on going';
            }
            const updatedAt = p.updatedAt || now;

            return {
              id: String(p.id),
              ragioneSociale: String(p.ragioneSociale),
              via: String(p.via || ''),
              citta: String(p.citta || ''),
              riepilogo: String(p.riepilogo || ''),
              riferimentoSede: {
                referente: String(p.riferimentoSede?.referente || ''),
                tel: String(p.riferimentoSede?.tel || '')
              },
              activities: Array.isArray(p.activities) ? p.activities : [],
              status: status,
              createdAt: p.createdAt || now,
              updatedAt: updatedAt,
              completedAt: p.hasOwnProperty('completedAt') ? p.completedAt : ((status === 'closed' || status === 'pending') ? updatedAt : null),
            } as Project;
          }).filter((p): p is Project => p !== null);
          
          if (validatedProjects.length === 0) {
            alert("Nessun progetto valido trovato nel file. L'importazione è stata annullata.");
            return;
          }

          const mergeChoice = window.confirm("Premi 'OK' per AGGIUNGERE i progetti importati a quelli esistenti.\nPremi 'Annulla' per SOSTITUIRE la lista corrente.");

          if (mergeChoice) { // Aggiungi
              const existingIds = new Set(projects.map(p => p.id.toLowerCase()));
              const newProjects = validatedProjects.filter(p => !existingIds.has(p.id.toLowerCase()));
              const skippedCount = validatedProjects.length - newProjects.length;

              setProjects(prevProjects => [...newProjects, ...prevProjects]);
              
              let alertMessage = `${newProjects.length} nuovi progetti importati e aggiunti con successo!`;
              if (skippedCount > 0) {
                  alertMessage += `\n${skippedCount} progetti sono stati saltati perché i loro CRQ erano già presenti.`;
              }
              alert(alertMessage);
          } else { // Sostituisci
              setProjects(validatedProjects);
              alert(`${validatedProjects.length} progetti importati con successo! La lista precedente è stata sostituita.`);
          }

        } catch (error) {
          console.error("Failed to parse JSON file", error);
          alert(`Errore durante l'importazione: ${error instanceof Error ? error.message : 'Formato file JSON non valido.'}`);
        }
      })
      .catch(err => {
        console.error("Error reading file:", err);
        alert("Errore nella lettura del file.");
      });
  };

  const handleSelectProject = useCallback((projectId: string) => {
    setView('detail');
    setSelectedProjectId(projectId);
  }, []);

  const handleReturnToList = useCallback(() => {
    setView('list');
    setSelectedProjectId(null);
  }, []);

  const renderContent = () => {
    if (view === 'detail' && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project) {
        return (
           <div className="text-center mt-16">
            <h2 className="text-2xl font-semibold text-red-500 dark:text-red-400">Progetto non trovato.</h2>
            <button onClick={handleReturnToList} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Torna alla lista
            </button>
          </div>
        )
      }
      return (
        <div className="max-w-4xl mx-auto mt-8">
            <button 
                onClick={handleReturnToList} 
                className="flex items-center gap-2 mb-4 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Torna alla lista</span>
            </button>
            <ProjectCard
                key={project.id}
                project={project}
                onToggleActivity={handleToggleActivity}
                onDuplicateActivity={handleDuplicateActivity}
                onOpenEditModal={handleOpenEditModal}
                onDeleteProject={handleDeleteProject}
            />
        </div>
      );
    }
    
    // List View
    if (projects.length === 0) {
      return (
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-slate-500 dark:text-slate-400">Nessun progetto trovato.</h2>
          <p className="mt-2 text-slate-400 dark:text-slate-500">Inizia aggiungendo un nuovo progetto o importando un file JSON.</p>
        </div>
      );
    }
    
    return (
      <>
        <ProjectStats 
          onGoing={projectStats.onGoing}
          pending={projectStats.pending}
          closed={projectStats.closed}
        />
        <ProjectListView 
          projects={projects} 
          onToggleActivity={handleToggleActivity}
          onDuplicateActivity={handleDuplicateActivity}
          onChangeProjectStatus={handleChangeProjectStatus}
          onOpenEditModal={handleOpenEditModal}
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
        />
      </>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">Caricamento...</div>;
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header 
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />
      <main className="container mx-auto p-4 md:p-8">
        {view === 'list' && <AddProjectForm onAddProject={handleAddProject} />}
        {renderContent()}
      </main>
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onUpdateProject={handleUpdateProject}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default App;