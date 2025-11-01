import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { LightbulbIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const MusicIdeaGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!topic || isLoading) return;

        setIsLoading(true);
        setError(null);
        setIdeas([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um compositor criativo e premiado. Gere 10 ideias de músicas únicas e cativantes com base na seguinte palavra, sentimento ou tema: "${topic}".

                **Instruções:**
                - Cada ideia deve ser um conceito, um título ou uma primeira linha de uma música.
                - As ideias devem ser inspiradoras e cobrir diferentes ângulos do tema fornecido.
                - Formate a resposta como uma lista, com cada ideia em uma nova linha, sem numeração ou marcadores.

                Retorne APENAS a lista de ideias.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedIdeas = response.text.split('\n').map(idea => idea.trim()).filter(idea => idea);
            setIdeas(generatedIdeas);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar as ideias. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, isLoading]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Ideias para Músicas</h2>
                        <p className="text-gray-400 mb-6">Se você não consegue pensar em uma música, nós podemos ajudar!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Descreva uma palavra, sentimento ou tema</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Saudade, uma noite de verão, recomeço"
                            className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !topic}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Ideias'}
                    </button>
                </div>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Suas Ideias para Músicas</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Buscando inspiração musical...</p>
                        </div>
                    </div>
                )}
                 {ideas.length > 0 && !isLoading && (
                     <div className="space-y-4">
                        {ideas.map((idea, i) => (
                             <div key={i} className="bg-base-300 p-4 rounded-lg animate-fade-in flex justify-between items-center">
                                 <p className="text-gray-300">{idea}</p>
                                 <button onClick={() => handleCopy(idea, i)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm flex-shrink-0 ml-4">
                                     {copiedIndex === i ? 'Copiado!' : 'Copiar'}
                                 </button>
                             </div>
                        ))}
                     </div>
                 )}
                {!ideas.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <LightbulbIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas ideias para músicas aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default MusicIdeaGenerator;