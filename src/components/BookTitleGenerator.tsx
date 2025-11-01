import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BookIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type Genre = 'Ficção' | 'Não Ficção' | 'Fantasia' | 'Mistério' | 'Romance';

const BookTitleGenerator: React.FC = () => {
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState<Genre>('Ficção');
    const [titles, setTitles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!description || isLoading) return;

        setIsLoading(true);
        setError(null);
        setTitles([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um editor literário criativo e premiado. Crie 5 títulos de livros cativantes e únicos para um livro com o seguinte tema e gênero.

                **Tema do Livro:** ${description}
                **Gênero:** ${genre}

                **Instruções:**
                - Os títulos devem ser intrigantes e adequados ao gênero.
                - Evite clichês e busque originalidade.
                - Retorne apenas os títulos, um por linha, sem numeração ou marcadores.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            // FIX: Safely access response.text
            const generatedTitles = (response.text ?? '').split('\n').map(t => t.trim()).filter(t => t);
            setTitles(generatedTitles);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar os títulos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [description, genre, isLoading]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Títulos de Livros</h2>
                <p className="text-gray-400 mb-6">Crie títulos de livros exclusivos e criativos com IA.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Descreva a ideia do seu livro</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Um detetive em uma cidade chuvosa investiga o desaparecimento de um famoso mágico."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Escolha um gênero</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Ficção', 'Não Ficção', 'Fantasia', 'Mistério', 'Romance'] as Genre[]).map(t => (
                                 <button key={t} onClick={() => setGenre(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${genre === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !description}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Títulos'}
                    </button>
                </div>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Títulos Sugeridos</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Criando títulos de best-seller...</p>
                        </div>
                    </div>
                )}
                 {titles.length > 0 && !isLoading && (
                     <div className="space-y-4">
                        {titles.map((title, i) => (
                             <div key={i} className="bg-base-300 p-4 rounded-lg animate-fade-in flex justify-between items-center">
                                 <p className="text-gray-300">{title}</p>
                                 <button onClick={() => handleCopy(title, i)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm flex-shrink-0 ml-4">
                                     {copiedIndex === i ? 'Copiado!' : 'Copiar'}
                                 </button>
                             </div>
                        ))}
                     </div>
                 )}
                {!titles.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <BookIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Os títulos para seu livro aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookTitleGenerator;
