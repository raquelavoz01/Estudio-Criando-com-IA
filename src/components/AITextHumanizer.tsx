import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FingerprintIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const AITextHumanizer: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [humanizedText, setHumanizedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleHumanize = useCallback(async () => {
        if (!inputText || isLoading) return;

        setIsLoading(true);
        setError(null);
        setHumanizedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um editor de texto especialista em humanizar conteúdo de IA. Sua tarefa é reescrever o texto a seguir para que ele soe como se tivesse sido escrito por um humano, tornando-o indetectável por ferramentas de detecção de IA.

                **Instruções para a reescrita:**
                1.  **Varie a Estrutura da Frase:** Misture frases curtas e impactantes com frases mais longas e complexas. Evite a estrutura de frase repetitiva comum em textos de IA.
                2.  **Use um Vocabulário Natural:** Substitua palavras excessivamente formais ou técnicas por sinônimos mais comuns e acessíveis.
                3.  **Adicione um Toque Pessoal:** Incorpore expressões idiomáticas, uma voz mais pessoal ou pequenas contrações (como "não" em vez de "não é") para adicionar um ritmo humano.
                4.  **Mantenha o Significado Original:** É crucial que o texto reescrito preserve a mensagem e as informações do texto original.

                **Texto para Humanizar:**
                ---
                ${inputText}
                ---

                **Importante:** Retorne APENAS o texto humanizado, sem nenhuma introdução, explicação ou comentário sobre o processo.
            `;

            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setHumanizedText(prev => prev + chunk.text);
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao humanizar o texto. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading]);

    const handleCopy = () => {
        if (!humanizedText) return;
        navigator.clipboard.writeText(humanizedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Humanizador de Texto de IA</h2>
                <p className="text-gray-400">Transforme texto gerado por IA em conteúdo que soa natural e humano, evitando a detecção.</p>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                {/* Input Panel */}
                <div className="flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Texto Gerado por IA</h3>
                    <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Cole o texto que você deseja humanizar aqui..."
                        className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isLoading}
                    />
                </div>

                {/* Output Panel */}
                <div className="flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-300">Texto Humanizado</h3>
                        <button 
                            onClick={handleCopy} 
                            disabled={!humanizedText || isLoading}
                            className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm disabled:bg-gray-600 transition-colors"
                        >
                            {isCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <div className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg overflow-y-auto whitespace-pre-wrap">
                       {isLoading && !humanizedText && (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light"></div>
                            </div>
                       )}
                       {humanizedText ? humanizedText : <span className="text-gray-500 italic">O texto com um toque humano aparecerá aqui...</span>}
                    </div>
                </div>
            </div>

            <div className="bg-base-200 p-4 rounded-xl shadow-lg">
                <button
                    onClick={handleHumanize}
                    disabled={isLoading || !inputText}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                    <FingerprintIcon className="w-6 h-6"/>
                    {isLoading ? <LoadingSpinner /> : 'Humanizar Texto'}
                </button>
                {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>
        </div>
    );
};

export default AITextHumanizer;
