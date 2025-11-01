import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const SeriesStoryGenerator: React.FC = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1 Data
    const [genre, setGenre] = useState('Ficção Científica');
    const [coreIdea, setCoreIdea] = useState('');
    const [titles, setTitles] = useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [logline, setLogline] = useState('');

    // Step 2 Data
    const [characters, setCharacters] = useState({ protagonist: '', antagonist: '', supporting: '' });
    const [world, setWorld] = useState('');

    // Step 3 Data
    const [numEpisodes, setNumEpisodes] = useState(6);
    const [episodeSummaries, setEpisodeSummaries] = useState<string[]>([]);
    
    // Step 4 Data
    const [fullStory, setFullStory] = useState('');

    const resetWorkflow = () => {
        setStep(1);
        setIsLoading(false);
        setError(null);
        setGenre('Ficção Científica');
        setCoreIdea('');
        setTitles([]);
        setSelectedTitle('');
        setLogline('');
        setCharacters({ protagonist: '', antagonist: '', supporting: '' });
        setWorld('');
        setNumEpisodes(6);
        setEpisodeSummaries([]);
        setFullStory('');
    };

    const handleGenerateTitlesAndLogline = useCallback(async () => {
        if (!coreIdea) return;
        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um roteirista de Hollywood experiente. Crie um Título e uma Logline para uma série de TV.
                **Gênero:** ${genre}
                **Ideia Central:** ${coreIdea}
                **Formato da Resposta:**
                [TÍTULO]
                Título Sugerido
                [LOGLINE]
                Logline concisa e envolvente (uma frase).
            `;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const text = response.text;
            const titleMatch = text.match(/\[TÍTULO\]\n([\s\S]*?)\n\[LOGLINE\]/);
            const loglineMatch = text.match(/\[LOGLINE\]\n([\s\S]*)/);
            setSelectedTitle(titleMatch ? titleMatch[1].trim() : 'Título Provisório');
            setLogline(loglineMatch ? loglineMatch[1].trim() : 'Logline não gerada.');
        } catch (err) { setError('Falha ao gerar título e logline.'); } finally { setIsLoading(false); }
    }, [coreIdea, genre]);

    const handleGenerateCharactersAndWorld = useCallback(async () => {
        if (!selectedTitle || !logline) return;
        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Desenvolva os personagens principais e o mundo para uma série de TV.
                **Título:** ${selectedTitle}
                **Logline:** ${logline}
                **Formato da Resposta:**
                [PROTAGONISTA]
                Descrição detalhada do protagonista (motivações, falhas, arco).
                [ANTAGONISTA]
                Descrição do antagonista (objetivos, conflito com o protagonista).
                [SECUNDÁRIOS]
                Breves descrições de 2-3 personagens secundários importantes.
                [MUNDO]
                Descrição do cenário, regras e atmosfera do mundo da série.
            `;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            const text = response.text;
            const protagonistMatch = text.match(/\[PROTAGONISTA\]\n([\s\S]*?)\n\[ANTAGONISTA\]/);
            const antagonistMatch = text.match(/\[ANTAGONISTA\]\n([\s\S]*?)\n\[SECUNDÁRIOS\]/);
            const supportingMatch = text.match(/\[SECUNDÁRIOS\]\n([\s\S]*?)\n\[MUNDO\]/);
            const worldMatch = text.match(/\[MUNDO\]\n([\s\S]*)/);
            setCharacters({
                protagonist: protagonistMatch ? protagonistMatch[1].trim() : '',
                antagonist: antagonistMatch ? antagonistMatch[1].trim() : '',
                supporting: supportingMatch ? supportingMatch[1].trim() : '',
            });
            setWorld(worldMatch ? worldMatch[1].trim() : '');
        } catch (err) { setError('Falha ao gerar personagens e mundo.'); } finally { setIsLoading(false); }
    }, [selectedTitle, logline]);
    
    const handleGenerateSummaries = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Crie resumos para uma temporada de ${numEpisodes} episódios para a série "${selectedTitle}". A história segue esta logline: "${logline}". Crie um arco de temporada coeso. Formate como "Episódio X: [Título do Episódio]" seguido por um breve resumo. Separe cada episódio com '---'.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            setEpisodeSummaries(response.text.split('---').map(s => s.trim()).filter(s => s));
        } catch (err) { setError('Falha ao gerar os resumos dos episódios.'); } finally { setIsLoading(false); }
    }, [selectedTitle, logline, numEpisodes]);

    const renderStepContent = () => {
        switch(step) {
            case 1: return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-brand-light">Passo 1: Conceito da Série</h3>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Gênero</label>
                        <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full p-2 bg-base-300 rounded-lg">
                            <option>Ficção Científica</option> <option>Fantasia</option> <option>Drama</option> <option>Comédia</option> <option>Suspense</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Ideia Central</label>
                        <textarea value={coreIdea} onChange={e => setCoreIdea(e.target.value)} placeholder="Ex: Em um futuro onde as memórias podem ser compradas e vendidas, um detetive caça um ladrão que rouba as memórias mais preciosas das pessoas." className="w-full h-24 p-2 bg-base-300 rounded-lg"/>
                    </div>
                    <button onClick={handleGenerateTitlesAndLogline} disabled={isLoading || !coreIdea} className="w-full bg-brand-primary h-12 flex justify-center items-center rounded-lg font-bold disabled:bg-gray-500">{isLoading ? <LoadingSpinner/> : 'Gerar Título e Logline'}</button>
                    {logline && (
                        <div className="space-y-4 pt-4">
                            <div><label className="block text-sm font-semibold text-gray-400 mb-2">Título (editável)</label><input type="text" value={selectedTitle} onChange={e => setSelectedTitle(e.target.value)} className="w-full p-2 bg-base-300 rounded-lg"/></div>
                            <div><label className="block text-sm font-semibold text-gray-400 mb-2">Logline (editável)</label><textarea value={logline} onChange={e => setLogline(e.target.value)} className="w-full h-20 p-2 bg-base-300 rounded-lg"/></div>
                            <button onClick={() => setStep(2)} disabled={!selectedTitle || !logline} className="float-right bg-green-600 px-6 py-2 rounded-lg font-bold disabled:bg-gray-500">Próximo</button>
                        </div>
                    )}
                </div>
            );
            case 2: return (
                <div className="space-y-4">
                     <h3 className="text-xl font-bold text-brand-light">Passo 2: Personagens e Mundo</h3>
                     <button onClick={handleGenerateCharactersAndWorld} disabled={isLoading} className="w-full bg-brand-primary h-12 flex justify-center items-center rounded-lg font-bold disabled:bg-gray-500">{isLoading ? <LoadingSpinner/> : 'Gerar Personagens e Mundo'}</button>
                     {world && (
                         <div className="space-y-4 pt-4">
                            <div><label className="block text-sm font-semibold text-gray-400 mb-2">Protagonista</label><textarea value={characters.protagonist} onChange={e => setCharacters(c => ({...c, protagonist: e.target.value}))} className="w-full h-24 p-2 bg-base-300 rounded-lg"/></div>
                            <div><label className="block text-sm font-semibold text-gray-400 mb-2">Antagonista</label><textarea value={characters.antagonist} onChange={e => setCharacters(c => ({...c, antagonist: e.target.value}))} className="w-full h-24 p-2 bg-base-300 rounded-lg"/></div>
                            <div><label className="block text-sm font-semibold text-gray-400 mb-2">Personagens Secundários</label><textarea value={characters.supporting} onChange={e => setCharacters(c => ({...c, supporting: e.target.value}))} className="w-full h-24 p-2 bg-base-300 rounded-lg"/></div>
                            <div><label className="block text-sm font-semibold text-gray-400 mb-2">Mundo</label><textarea value={world} onChange={e => setWorld(e.target.value)} className="w-full h-24 p-2 bg-base-300 rounded-lg"/></div>
                            <div className="flex justify-between pt-2"><button onClick={() => setStep(1)} className="bg-gray-600 px-6 py-2 rounded-lg font-bold">Voltar</button><button onClick={() => setStep(3)} className="bg-green-600 px-6 py-2 rounded-lg font-bold">Próximo</button></div>
                         </div>
                     )}
                </div>
            );
            case 3: return (
                <div className="space-y-4">
                     <h3 className="text-xl font-bold text-brand-light">Passo 3: Resumo dos Episódios</h3>
                     <div><label className="block text-sm font-semibold text-gray-400 mb-2">Número de Episódios</label><input type="number" value={numEpisodes} onChange={e => setNumEpisodes(parseInt(e.target.value))} className="w-24 p-2 bg-base-300 rounded-lg" min="1" max="20"/></div>
                     <button onClick={handleGenerateSummaries} disabled={isLoading} className="w-full bg-brand-primary h-12 flex justify-center items-center rounded-lg font-bold disabled:bg-gray-500">{isLoading ? <LoadingSpinner/> : 'Gerar Resumos'}</button>
                     {episodeSummaries.length > 0 && (
                         <div className="space-y-2 pt-4">
                            {episodeSummaries.map((summary, i) => <div key={i}><textarea value={summary} onChange={e => { const newSummaries = [...episodeSummaries]; newSummaries[i] = e.target.value; setEpisodeSummaries(newSummaries); }} className="w-full h-24 p-2 bg-base-300 rounded-lg"/></div>)}
                            <div className="flex justify-between pt-2"><button onClick={() => setStep(2)} className="bg-gray-600 px-6 py-2 rounded-lg font-bold">Voltar</button><button onClick={() => setStep(4)} className="bg-green-600 px-6 py-2 rounded-lg font-bold">Finalizar</button></div>
                         </div>
                     )}
                </div>
            );
            case 4: return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-brand-light">Passo 4: Sua História Completa</h3>
                    <p className="text-gray-400">Aqui está um resumo de toda a sua temporada, pronto para ser expandido.</p>
                    <textarea value={fullStory || `${selectedTitle}\n\n${logline}\n\n--- PERSONAGENS ---\nProtagonista: ${characters.protagonist}\nAntagonista: ${characters.antagonist}\n\n--- RESUMOS ---\n${episodeSummaries.join('\n\n')}`} readOnly className="w-full h-96 p-3 bg-base-100 rounded-lg text-gray-400 whitespace-pre-wrap"/>
                    <div className="flex justify-between"><button onClick={resetWorkflow} className="bg-gray-600 px-6 py-2 rounded-lg font-bold">Começar de Novo</button><button onClick={() => navigator.clipboard.writeText(fullStory)} className="bg-green-600 px-6 py-2 rounded-lg font-bold">Copiar</button></div>
                </div>
            );
        }
    };
    
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
             <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Histórias de Séries</h2>
                        <p className="text-gray-400">Desenvolva uma série completa, do conceito aos episódios, com este fluxo de trabalho guiado.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
            </div>
            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                {error && <div className="my-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
                {renderStepContent()}
            </div>
        </div>
    );
};

export default SeriesStoryGenerator;