
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UsersIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const FanficCreator: React.FC = () => {
    const [fandom, setFandom] = useState('');
    const [characters, setCharacters] = useState('');
    const [scenario, setScenario] = useState('');
    const [story, setStory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!fandom || !characters || !scenario || isLoading) return;

        setIsLoading(true);
        setError(null);
        setStory('');
        setIsCopied(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um autor de fanfiction talentoso e experiente, com profundo conhecimento de vários universos da cultura pop.
                Escreva uma história de fanfiction (fanfic) curta e original.

                **Universo/Fandom:** ${fandom}
                **Personagens Envolvidos:** ${characters}
                **Cenário/Prompt da História:** ${scenario}

                **Instruções:**
                - Mantenha os personagens consistentes com suas personalidades originais (in-character).
                - Crie diálogos e interações autênticas entre os personagens.
                - Desenvolva o cenário proposto de forma criativa e envolvente.
                - A história deve ser 100% original e não uma cópia de outras obras ou gerações de IA.
                - A história deve ter começo, meio e fim.
                - Comece diretamente com a história, sem texto introdutório.
            `;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setStory(prev => prev + (chunk.text ?? ''));
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar sua fanfic. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [fandom, characters, scenario, isLoading]);

    const handleCopy = () => {
        if (!story) return;
        navigator.clipboard.writeText(story);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Criador de Fanfics</h2>
                        <p className="text-gray-400 mb-6">Crie suas próprias histórias de fanfic com IA.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Universo / Fandom *</label>
                            <input type="text" value={fandom} onChange={(e) => setFandom(e.target.value)} placeholder="Ex: Harry Potter, Marvel, Star Wars" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Personagens Principais *</label>
                            <input type="text" value={characters} onChange={(e) => setCharacters(e.target.value)} placeholder="Ex: Hermione Granger, Draco Malfoy" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Cenário / Ideia da História *</label>
                        <textarea value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="Ex: Eles são forçados a trabalhar juntos em uma poção complicada e acabam descobrindo um segredo um do outro." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !fandom || !characters || !scenario}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Fanfic'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Sua Fanfic</h3>
                     {story && !isLoading && (
                        <button onClick={handleCopy} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm">
                            {isCopied ? 'Copiado!' : 'Copiar Texto'}
                        </button>
                     )}
                </div>
                {isLoading && !story && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Escrevendo sua história...</p>
                        </div>
                    </div>
                )}
                 {story && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: story.replace(/\n/g, '<br />') }}
                    />
                 )}
                {!story && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <UsersIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Sua história de fanfiction aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default FanficCreator;
