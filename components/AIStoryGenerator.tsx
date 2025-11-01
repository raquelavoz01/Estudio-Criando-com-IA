import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MagicWandIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type Genre = 'Fantasia' | 'Ficção Científica' | 'Terror' | 'Aventura' | 'Romance';

const AIStoryGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [genre, setGenre] = useState<Genre>('Fantasia');
    const [story, setStory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;

        setIsLoading(true);
        setError(null);
        setStory('');
        setIsCopied(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemPrompt = `
                Aja como um mestre contador de histórias. Escreva uma história curta e envolvente com base no prompt do usuário.
                A história deve ter um começo, meio e fim claros, personagens interessantes e um enredo cativante.
                O tom e o estilo devem corresponder ao gênero solicitado.
                Seja criativo e surpreenda o leitor.
                É CRÍTICO que a história seja 100% original e única, não plagiando obras existentes ou outras gerações de IA.
                Comece diretamente com a história, sem nenhum texto introdutório.
            `;

            const userPrompt = `Gênero: ${genre}. Ideia para a história: ${prompt}`;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                }
            });

            for await (const chunk of resultStream) {
                setStory(prev => prev + chunk.text);
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a história. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, genre, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Histórias de IA</h2>
                        <p className="text-gray-400 mb-6">Desvende a magia da narrativa automatizada!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Qual é a sua ideia para a história?</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: Um faroleiro solitário descobre uma criatura marinha bioluminescente que se comunica através da luz."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Escolha o gênero</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Fantasia', 'Ficção Científica', 'Terror', 'Aventura', 'Romance'] as Genre[]).map(g => (
                                 <button key={g} onClick={() => setGenre(g)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${genre === g ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {g}
                                 </button>
                            ))}
                         </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar História'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Sua História Gerada</h3>
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
                            <p className="text-gray-400">Tecendo as palavras da sua história...</p>
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
                        <MagicWandIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Sua história mágica aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIStoryGenerator;