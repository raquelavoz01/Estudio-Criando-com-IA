
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CheckCircleIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const GrammarChecker: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [correctedText, setCorrectedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleCheck = useCallback(async () => {
        if (!inputText || isLoading) return;

        setIsLoading(true);
        setError(null);
        setCorrectedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um revisor e editor de texto especialista. Corrija todos os erros de gramática, ortografia e pontuação no texto a seguir.
                Além disso, melhore a clareza, o fluxo e a legibilidade do texto, fazendo pequenas reestruturações de frases quando necessário, mas mantendo o significado original.

                **Texto para corrigir:**
                ---
                ${inputText}
                ---

                **Importante:** Retorne APENAS o texto corrigido e aprimorado, sem nenhuma introdução, explicação ou comentário.
            `;

            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setCorrectedText(prev => prev + (chunk.text ?? ''));
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao verificar o texto. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading]);

    const handleCopy = () => {
        if (!correctedText) return;
        navigator.clipboard.writeText(correctedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Corretor Gramatical</h2>
                        <p className="text-gray-400">Certifique-se de que sua escrita não tenha erros! Cole seu texto para uma revisão completa.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                {/* Input Panel */}
                <div className="flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Seu Texto</h3>
                    <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Cole seu texto aqui para verificar..."
                        className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isLoading}
                    />
                </div>

                {/* Output Panel */}
                <div className="flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-300">Texto Corrigido</h3>
                        <button 
                            onClick={handleCopy} 
                            disabled={!correctedText || isLoading}
                            className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm disabled:bg-gray-600 transition-colors"
                        >
                            {isCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <div className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg overflow-y-auto whitespace-pre-wrap">
                       {isLoading && !correctedText && (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light"></div>
                            </div>
                       )}
                       {correctedText ? correctedText : <span className="text-gray-500 italic">O texto corrigido aparecerá aqui...</span>}
                    </div>
                </div>
            </div>

            <div className="bg-base-200 p-4 rounded-xl shadow-lg">
                <button
                    onClick={handleCheck}
                    disabled={isLoading || !inputText}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                    <CheckCircleIcon className="w-6 h-6"/>
                    {isLoading ? <LoadingSpinner /> : 'Verificar e Corrigir'}
                </button>
                {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>
        </div>
    );
};

export default GrammarChecker;
