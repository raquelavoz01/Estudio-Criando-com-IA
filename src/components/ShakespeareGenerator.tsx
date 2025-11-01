
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { QuillIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const ShakespeareGenerator: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [shakespeareanText, setShakespeareanText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!inputText || isLoading) return;

        setIsLoading(true);
        setError(null);
        setShakespeareanText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como se fosses William Shakespeare. Reescreve o texto que se segue no estilo do português arcaico e poético do século XVI, como se fosse uma tradução de tua própria obra para a corte lusitana.
                Usa de vocabulário rico, inversões de frases e um tom dramático e eloquente, digno de um palco.

                **Texto Original:**
                ---
                ${inputText}
                ---

                **Instrução Final:** Devolve apenas o texto reescrito, ó nobre IA, sem mais palavras ou prefácios.
            `;

            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setShakespeareanText(prev => prev + (chunk.text ?? ''));
            }

        } catch (err) {
            console.error(err);
            setError('Oh, céus! Um erro funesto ocorreu. Tenta novamente, porventura.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading]);

    const handleCopy = () => {
        if (!shakespeareanText) return;
        navigator.clipboard.writeText(shakespeareanText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Escreva como Shakespeare</h2>
                <p className="text-gray-400">Transforme textos comuns em obras-primas da era elisabetana com nosso gerador de texto shakespeariano de IA.</p>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                <div className="flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Seu Texto Mundano</h3>
                    <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Escreve aqui tuas palavras, e eu as cobrirei de glória..."
                        className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-300">A Prosa do Bardo</h3>
                        <button 
                            onClick={handleCopy} 
                            disabled={!shakespeareanText || isLoading}
                            className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm disabled:bg-gray-600 transition-colors"
                        >
                            {isCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <div className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg overflow-y-auto whitespace-pre-wrap">
                       {isLoading && !shakespeareanText && (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light"></div>
                            </div>
                       )}
                       {shakespeareanText ? shakespeareanText : <span className="text-gray-500 italic">A verborragia eloquente surgirá neste palco...</span>}
                    </div>
                </div>
            </div>

            <div className="bg-base-200 p-4 rounded-xl shadow-lg">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !inputText}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                    <QuillIcon className="w-6 h-6"/>
                    {isLoading ? <LoadingSpinner /> : 'Transformar em Shakespeare'}
                </button>
                {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>
        </div>
    );
};

export default ShakespeareGenerator;
