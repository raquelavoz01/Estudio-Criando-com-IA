import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CubeIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const ExplainLikeImFive: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [simplifiedText, setSimplifiedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!inputText || isLoading) return;

        setIsLoading(true);
        setError(null);
        setSimplifiedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um professor paciente e criativo explicando um tópico para uma criança de cinco anos de idade.
                Use linguagem extremamente simples, analogias fáceis de entender e exemplos do dia a dia. Evite jargões e conceitos abstratos.
                O objetivo é tornar o tópico complexo o mais claro e simples possível.

                **Tópico para explicar:**
                ---
                ${inputText}
                ---

                **Importante:** Comece a explicação diretamente, sem introduções como "Claro, imagine que...". Mantenha os parágrafos curtos e a linguagem muito básica.
            `;

            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            // FIX: Safely access chunk.text
            for await (const chunk of resultStream) {
                setSimplifiedText(prev => prev + (chunk.text ?? ''));
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a explicação. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading]);

    const handleCopy = () => {
        if (!simplifiedText) return;
        navigator.clipboard.writeText(simplifiedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Explique como se eu tivesse cinco anos</h2>
                        <p className="text-gray-400">Explique um tópico complexo ou obscuro nos termos mais simples.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                {/* Input Panel */}
                <div className="flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Tópico Complexo</h3>
                    <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Digite um tópico para simplificar, ex: Computação Quântica, Buracos Negros, Blockchain..."
                        className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isLoading}
                    />
                </div>

                {/* Output Panel */}
                <div className="flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-300">Explicação Simples</h3>
                        <button 
                            onClick={handleCopy} 
                            disabled={!simplifiedText || isLoading}
                            className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm disabled:bg-gray-600 transition-colors"
                        >
                            {isCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <div className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg overflow-y-auto whitespace-pre-wrap">
                       {isLoading && !simplifiedText && (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light"></div>
                            </div>
                       )}
                       {simplifiedText ? simplifiedText : <span className="text-gray-500 italic">A explicação super simples aparecerá aqui...</span>}
                    </div>
                </div>
            </div>

            <div className="bg-base-200 p-4 rounded-xl shadow-lg">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !inputText}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                    <CubeIcon className="w-6 h-6"/>
                    {isLoading ? <LoadingSpinner /> : 'Gerar Explicação'}
                </button>
                {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>
        </div>
    );
};

export default ExplainLikeImFive;
