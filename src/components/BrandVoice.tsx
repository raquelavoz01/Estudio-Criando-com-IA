import React, { useState, useEffect } from 'react';
import { UploadIcon } from './Icons';

interface BrandVoice {
    id: string;
    name: string;
    description: string;
    content: string;
}

const BrandVoice: React.FC = () => {
    const [voices, setVoices] = useState<BrandVoice[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [currentVoice, setCurrentVoice] = useState<Partial<BrandVoice> | null>(null);

    useEffect(() => {
        try {
            const savedVoices = JSON.parse(localStorage.getItem('my-ai-studio-brand-voices') || '[]');
            setVoices(savedVoices);
        } catch (e) {
            console.error("Failed to load brand voices", e);
        }
    }, []);

    const handleSave = () => {
        if (!currentVoice || !currentVoice.name) return;

        const newVoice: BrandVoice = {
            id: currentVoice.id || crypto.randomUUID(),
            name: currentVoice.name,
            description: currentVoice.description || '',
            content: currentVoice.content || ''
        };

        const existingIndex = voices.findIndex(v => v.id === newVoice.id);
        let updatedVoices;
        if (existingIndex > -1) {
            updatedVoices = [...voices];
            updatedVoices[existingIndex] = newVoice;
        } else {
            updatedVoices = [...voices, newVoice];
        }

        setVoices(updatedVoices);
        localStorage.setItem('my-ai-studio-brand-voices', JSON.stringify(updatedVoices));
        setIsCreating(false);
        setCurrentVoice(null);
    };

    const handleDelete = (voiceId: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta voz da marca?")) {
            const updatedVoices = voices.filter(v => v.id !== voiceId);
            setVoices(updatedVoices);
            localStorage.setItem('my-ai-studio-brand-voices', JSON.stringify(updatedVoices));
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setCurrentVoice(prev => ({...prev, content}));
            };
            reader.readAsText(file);
        }
         if (event.target) {
            event.target.value = '';
        }
    };

    const renderCreationForm = () => (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg animate-fade-in space-y-6">
            <h3 className="text-xl font-bold text-brand-light">{currentVoice?.id ? 'Editar' : 'Criar'} Voz da Marca</h3>
            <div>
                <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome da Voz</label>
                <input
                    type="text"
                    placeholder="Ex: Tom Divertido e Jovem"
                    value={currentVoice?.name || ''}
                    onChange={e => setCurrentVoice(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Descreva seu Estilo</label>
                    <p className="text-xs text-gray-500 mb-2">Seja específico sobre tom, vocabulário, exemplos do que fazer e não fazer.</p>
                    <textarea
                        placeholder="Ex: Escreva de forma casual e amigável. Use emojis. Faça piadas. Evite linguagem corporativa."
                        value={currentVoice?.description || ''}
                        onChange={e => setCurrentVoice(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full h-48 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                    />
                 </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Carregar Conteúdo de Exemplo (.txt)</label>
                    <p className="text-xs text-gray-500 mb-2">Forneça exemplos do seu texto para a IA aprender seu estilo (opcional).</p>
                     <label className="w-full h-48 border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center text-gray-500 cursor-pointer hover:border-brand-primary bg-base-300">
                        {currentVoice?.content ? (
                             <div className="p-3 text-sm text-left w-full h-full overflow-auto whitespace-pre-wrap text-gray-300">{currentVoice.content.substring(0, 300)}{currentVoice.content.length > 300 && '...'}</div>
                        ) : (
                             <>
                                <UploadIcon className="w-10 h-10 mb-2"/>
                                <span>Carregar Arquivo</span>
                            </>
                        )}
                        <input type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
                    </label>
                 </div>
            </div>

            <div className="flex justify-end gap-4">
                 <button onClick={() => { setIsCreating(false); setCurrentVoice(null); }} className="bg-base-300 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
                    Cancelar
                 </button>
                 <button onClick={handleSave} disabled={!currentVoice?.name} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
                    Salvar Voz
                 </button>
            </div>
        </div>
    );

    const renderVoiceList = () => (
         <div className="bg-base-200 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-xl font-bold mb-2 text-brand-light">Voz da Marca</h2>
                    <p className="text-gray-400">Treine a IA para escrever como você, criando uma voz de marca personalizada em minutos.</p>
                 </div>
                 <button onClick={() => { setIsCreating(true); setCurrentVoice({}); }} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg">
                    Adicionar Nova Voz
                 </button>
            </div>
             {voices.length === 0 ? (
                <div className="text-center text-gray-500 italic py-10">Nenhuma voz da marca criada ainda.</div>
             ) : (
                <ul className="space-y-4">
                    {voices.map(voice => (
                        <li key={voice.id} className="bg-base-300 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h3 className="font-bold text-lg text-white">{voice.name}</h3>
                                <p className="text-sm text-gray-400 truncate max-w-md">{voice.description || "Nenhuma descrição"}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => { setCurrentVoice(voice); setIsCreating(true); }} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-2 px-3 rounded-lg text-sm">Editar</button>
                                <button onClick={() => handleDelete(voice.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg text-sm">Excluir</button>
                            </div>
                        </li>
                    ))}
                </ul>
             )}
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            {isCreating ? renderCreationForm() : renderVoiceList()}
        </div>
    );
};

export default BrandVoice;
