import React, { useState, useEffect, useMemo } from 'react';
import { DocumentDuplicateIcon, ChevronDownIcon } from './Icons';

// Estruturas de dados
interface ScriptProject {
  id: string;
  title: string;
  createdAt: number;
  status: 'idea' | 'current' | 'completed';
  documents: {
    script: string;
    outline: string;
    characters: string;
    research: string;
  };
}

interface OldBook {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

type ProjectStatus = 'idea' | 'current' | 'completed';
type DocumentType = 'script' | 'outline' | 'characters' | 'research';

const statusMap: { [key in ProjectStatus]: string } = {
    idea: 'Ideias',
    current: 'Em Andamento',
    completed: 'Concluídos',
};

const documentMap: { [key in DocumentType]: string } = {
    script: 'Roteiro',
    outline: 'Esboço',
    characters: 'Personagens',
    research: 'Pesquisa',
};


// Componente Modal para Edição do Projeto
const ProjectModal = ({ project, onClose, onSave }: { project: ScriptProject, onClose: () => void, onSave: (p: ScriptProject) => void }) => {
    const [editedProject, setEditedProject] = useState(project);
    const [activeTab, setActiveTab] = useState<DocumentType>('script');

    const handleDocChange = (docType: DocumentType, content: string) => {
        setEditedProject(prev => ({
            ...prev,
            documents: { ...prev.documents, [docType]: content },
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-base-200 rounded-xl shadow-2xl p-6 w-11/12 max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-brand-light mb-4 truncate">{project.title}</h2>
                <div className="flex border-b border-gray-700 mb-4">
                    {(Object.keys(documentMap) as DocumentType[]).map(docType => (
                         <button 
                            key={docType}
                            onClick={() => setActiveTab(docType)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === docType ? 'border-b-2 border-brand-primary text-white' : 'text-gray-400 hover:text-white'}`}
                         >{documentMap[docType]}</button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto">
                    {(Object.keys(documentMap) as DocumentType[]).map(docType => (
                         <textarea 
                            key={docType}
                            value={editedProject.documents[docType]}
                            onChange={e => handleDocChange(docType, e.target.value)}
                            placeholder={`Escreva o ${documentMap[docType].toLowerCase()} aqui...`}
                            className={`w-full h-full p-3 bg-base-300 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary ${activeTab === docType ? 'block' : 'hidden'}`}
                        />
                    ))}
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onClose} className="bg-base-300 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button onClick={() => onSave(editedProject)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Salvar e Fechar</button>
                </div>
            </div>
        </div>
    );
};

// Componente Principal de Roteiros
const Scripts: React.FC = () => {
    const [projects, setProjects] = useState<ScriptProject[]>([]);
    const [viewingProject, setViewingProject] = useState<ScriptProject | null>(null);

    useEffect(() => {
        // Lógica de migração de dados
        const oldData = localStorage.getItem('my-ai-studio-books');
        if (oldData) {
            try {
                const oldBooks: OldBook[] = JSON.parse(oldData);
                const newProjects: ScriptProject[] = oldBooks.map(book => ({
                    id: book.id,
                    title: book.title,
                    createdAt: book.createdAt,
                    status: 'current',
                    documents: { script: book.content, outline: '', characters: '', research: '' }
                }));
                localStorage.setItem('my-ai-studio-scripts', JSON.stringify(newProjects));
                localStorage.removeItem('my-ai-studio-books');
                setProjects(newProjects.sort((a, b) => b.createdAt - a.createdAt));
            } catch (e) {
                console.error("Failed to migrate old book data", e);
            }
        } else {
            try {
                const savedProjects = JSON.parse(localStorage.getItem('my-ai-studio-scripts') || '[]');
                setProjects(savedProjects.sort((a: ScriptProject, b: ScriptProject) => b.createdAt - a.createdAt));
            } catch (e) {
                console.error("Failed to load scripts from localStorage", e);
                setProjects([]);
            }
        }
    }, []);
    
    const updateProjects = (updatedProjects: ScriptProject[]) => {
        const sorted = updatedProjects.sort((a,b) => b.createdAt - a.createdAt);
        setProjects(sorted);
        localStorage.setItem('my-ai-studio-scripts', JSON.stringify(sorted));
    };

    const handleDelete = (projectId: string) => {
        if (window.confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) {
            updateProjects(projects.filter(p => p.id !== projectId));
        }
    };
    
    const handleChangeStatus = (projectId: string, status: ProjectStatus) => {
        updateProjects(projects.map(p => p.id === projectId ? { ...p, status } : p));
    };
    
    const handleSaveProject = (updatedProject: ScriptProject) => {
        updateProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        setViewingProject(null);
    };

    const groupedProjects = useMemo(() => ({
        current: projects.filter(p => p.status === 'current'),
        completed: projects.filter(p => p.status === 'completed'),
        idea: projects.filter(p => p.status === 'idea'),
    }), [projects]);

    const ProjectGroup = ({ title, projects }: { title: string; projects: ScriptProject[] }) => {
        const [isOpen, setIsOpen] = useState(true);
        if (projects.length === 0) return null;

        return (
            <div className="mb-6">
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left text-xl font-bold text-brand-light mb-3">
                    {title} ({projects.length})
                    <ChevronDownIcon className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <ul className="space-y-4 animate-fade-in">
                        {projects.map(project => (
                            <li key={project.id} className="bg-base-300 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h3 className="font-bold text-lg text-white">{project.title}</h3>
                                    <p className="text-sm text-gray-400">Criado em: {new Date(project.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => setViewingProject(project)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-2 px-3 rounded-lg text-sm">Abrir</button>
                                    <select value={project.status} onChange={(e) => handleChangeStatus(project.id, e.target.value as ProjectStatus)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-sm appearance-none cursor-pointer">
                                        {Object.keys(statusMap).map(s => <option key={s} value={s}>{statusMap[s as ProjectStatus]}</option>)}
                                    </select>
                                    <button onClick={() => handleDelete(project.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg text-sm">Excluir</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
             {viewingProject && <ProjectModal project={viewingProject} onClose={() => setViewingProject(null)} onSave={handleSaveProject} />}
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Pasta de Roteiros</h2>
                <p className="text-gray-400">Organize e gerencie todos os seus projetos de escrita em um só lugar.</p>
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                {projects.length === 0 ? (
                    <div className="text-center text-gray-500 italic mt-10 flex flex-col items-center">
                        <DocumentDuplicateIcon className="w-24 h-24 text-gray-600 mb-4" />
                        Nenhum roteiro encontrado. Salve um projeto na ferramenta de escrita para começar.
                    </div>
                ) : (
                    <>
                        <ProjectGroup title="Em Andamento" projects={groupedProjects.current} />
                        <ProjectGroup title="Concluídos" projects={groupedProjects.completed} />
                        <ProjectGroup title="Ideias" projects={groupedProjects.idea} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Scripts;
