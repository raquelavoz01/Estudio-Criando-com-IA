import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { KeyIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const KeywordGenerator: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [numKeywords, setNumKeywords] = useState(10);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!inputText || isLoading) return;

        setIsLoading(true);
        setError(null);
        setKeywords([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em SEO. Analise o seguinte texto e extraia as ${numKeywords} palavras-chave mais relevantes e importantes.
                Retorne as palavras-chave como uma lista separada por vírgulas, sem nenhuma outra formatação ou texto introdutório.

                **Texto para Análise:**
                ---
                ${inputText}
                ---
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedKeywords = response.text.split(',').map(k => k.trim()).filter(k => k);
            setKeywords(generatedKeywords);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar as palavras-chave. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, numKeywords, isLoading]);

    const handleCopy = (keyword: string) => {
        navigator.clipboard.writeText(keyword);
        setCopiedKeyword(keyword);
        setTimeout(() => setCopiedKeyword(null), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Palavras-chave</h2>
                <p className="text-gray-400 mb-6">Gere palavras-chave relevantes a partir do seu texto de entrada para aumentar o SEO e a relevância do conteúdo.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Cole seu texto aqui</label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ex: A inteligência artificial está transformando o marketing digital, permitindo a personalização em massa..."
                            className="w-full h-32 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Número de palavras-chave</label>
                         <input
                            type="number"
                            value={numKeywords}
                            onChange={(e) => setNumKeywords(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-24 p-2 bg-base-300 border border-gray-600 rounded-lg"
                            min="1"
                            max="50"
                            disabled={isLoading}
                         />
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !inputText}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                >
                    {isLoading ? <LoadingSpinner /> : 'Gerar Palavras-chave'}
                </button>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <h3 className="text-xl font-bold text-brand-light mb-4">Palavras-chave Geradas</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Analisando seu texto...</p>
                        </div>
                    </div>
                )}
                 {keywords.length > 0 && !isLoading && (
                     <div className="flex flex-wrap gap-3 animate-fade-in">
                        {keywords.map((keyword, i) => (
                           <button 
                                key={i}
                                onClick={() => handleCopy(keyword)}
                                className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm cursor-pointer"
                            >
                                {copiedKeyword === keyword ? 'Copiado!' : keyword}
                           </button>
                        ))}
                     </div>
                 )}
                {!keywords.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <KeyIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas palavras-chave aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeywordGenerator;