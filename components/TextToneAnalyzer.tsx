import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatBubbleBottomCenterTextIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

interface ToneAnalysis {
    primaryTone: string;
    explanation: string;
    secondaryTones: string[];
}

const TextToneAnalyzer: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (!inputText || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em linguística e análise de sentimento. Analise o tom do texto a seguir.

                **Texto para Análise:**
                ---
                ${inputText}
                ---

                **Formato da Resposta:**
                Use EXATAMENTE este formato, sem nenhuma outra palavra ou explicação:
                Tom Principal: [O tom mais proeminente, ex: Formal]
                Explicação: [Uma breve explicação do porquê esse é o tom principal]
                Tons Secundários: [Uma lista de 1-3 tons secundários, separados por vírgula, ex: Informativo, Sério]
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const text = response.text;
            const primaryToneMatch = text.match(/Tom Principal: (.*)/);
            const explanationMatch = text.match(/Explicação: (.*)/);
            const secondaryTonesMatch = text.match(/Tons Secundários: (.*)/);

            if (primaryToneMatch && explanationMatch && secondaryTonesMatch) {
                setAnalysis({
                    primaryTone: primaryToneMatch[1].trim(),
                    explanation: explanationMatch[1].trim(),
                    secondaryTones: secondaryTonesMatch[1].split(',').map(t => t.trim()),
                });
            } else {
                // Fallback for unexpected format
                setAnalysis({
                    primaryTone: "Análise",
                    explanation: text,
                    secondaryTones: [],
                });
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao analisar o tom. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading]);

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Analisador de Tom de Texto</h2>
                <p className="text-gray-400 mb-6">Analise o tom de um texto para garantir que sua mensagem seja transmitida da maneira certa.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Cole o texto para analisar</label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Escreva ou cole seu texto aqui..."
                            className="w-full h-32 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !inputText}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Analisar Tom'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Análise do Tom</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Analisando as emoções do texto...</p>
                        </div>
                    </div>
                )}
                 {analysis && !isLoading && (
                     <div className="space-y-4 animate-fade-in">
                        <div>
                            <h4 className="font-semibold text-brand-secondary mb-1">Tom Principal</h4>
                            <span className="bg-brand-primary text-white font-bold py-2 px-4 rounded-full text-lg">{analysis.primaryTone}</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-brand-secondary mb-1">Explicação</h4>
                            <p className="text-gray-300 bg-base-300 p-3 rounded-lg">{analysis.explanation}</p>
                        </div>
                         {analysis.secondaryTones.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-brand-secondary mb-2">Tons Secundários</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.secondaryTones.map((tone, i) => (
                                        <span key={i} className="bg-base-300 text-gray-300 font-semibold py-1 px-3 rounded-full text-sm">{tone}</span>
                                    ))}
                                </div>
                            </div>
                         )}
                     </div>
                 )}
                {!analysis && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <ChatBubbleBottomCenterTextIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        A análise do tom do seu texto aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextToneAnalyzer;