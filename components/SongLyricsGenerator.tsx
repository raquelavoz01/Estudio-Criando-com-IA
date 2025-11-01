import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FeatherIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type Genre = 'Pop' | 'Rock' | 'Eletrônica' | 'Hip Hop' | 'Sertanejo' | 'Samba';

const SongLyricsGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [genre, setGenre] = useState<Genre>('Pop');
    const [generatedLyrics, setGeneratedLyrics] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!topic || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedLyrics('');
        setIsCopied(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um compositor profissional. Escreva uma letra de música completa e original.

                **Gênero:** ${genre}
                **Tema da Música:** ${topic}

                **Estrutura da Letra:**
                - Inclua seções claras: Verso, Refrão, Ponte, etc.
                - Crie rimas e um ritmo que se encaixem no gênero musical.
                - A letra deve ser criativa, emotiva e contar uma história ou explorar o tema de forma profunda.

                Retorne APENAS a letra da música, formatada com quebras de linha.
            `;

            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setGeneratedLyrics(prev => prev + chunk.text);
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a letra. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, genre, isLoading]);

    const handleCopy = () => {
        if (!generatedLyrics) return;
        navigator.clipboard.writeText(generatedLyrics);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Letras de Músicas</h2>
                        <p className="text-gray-400 mb-6">Gere letras de músicas personalizadas com o poder da IA.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Qual é o tema da sua música?</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: A história de um amor de verão que terminou com a chegada do outono."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Escolha o gênero musical</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Pop', 'Rock', 'Eletrônica', 'Hip Hop', 'Sertanejo', 'Samba'] as Genre[]).map(g => (
                                 <button key={g} onClick={() => setGenre(g)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${genre === g ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {g}
                                 </button>
                            ))}
                         </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !topic}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Letras'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Letra Gerada</h3>
                     {generatedLyrics && !isLoading && (
                        <button onClick={handleCopy} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm">
                            {isCopied ? 'Copiado!' : 'Copiar Texto'}
                        </button>
                     )}
                </div>
                {isLoading && !generatedLyrics && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Escrevendo sua próxima canção de sucesso...</p>
                        </div>
                    </div>
                )}
                 {generatedLyrics && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedLyrics.replace(/\n/g, '<br />') }}
                    />
                 )}
                {!generatedLyrics && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <FeatherIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        A letra da sua música aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default SongLyricsGenerator;