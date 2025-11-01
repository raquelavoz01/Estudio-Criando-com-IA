
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-light"></div>
);

const LongFormEditor: React.FC = () => {
    const [content, setContent] = useState('');
    const [selection, setSelection] = useState<{ start: number, end: number } | null>(null);
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const handleSelect = () => {
        if (editorRef.current) {
            const { selectionStart, selectionEnd } = editorRef.current;
            if (selectionStart !== selectionEnd) {
                setSelection({ start: selectionStart, end: selectionEnd });
            } else {
                setSelection(null);
            }
        }
    };

    const handleAiAction = useCallback(async (action: 'continue' | 'expand' | 'rewrite') => {
        setIsLoading(true);
        setError(null);
        setGeneratedText('');

        let prompt = '';
        let textToProcess = '';

        if (action === 'continue') {
            textToProcess = content;
            prompt = `Continue escrevendo o texto a seguir de forma coerente e criativa:\n\n---\n\n${textToProcess}`;
        } else if (selection) {
            textToProcess = content.substring(selection.start, selection.end);
            if (action === 'expand') {
                prompt = `Expanda o seguinte trecho, adicionando mais detalhes, exemplos ou aprofundando o conceito:\n\n---\n\n${textToProcess}`;
            } else if (action === 'rewrite') {
                prompt = `Reescreva o seguinte trecho com um estilo diferente, melhorando a clareza ou o impacto:\n\n---\n\n${textToProcess}`;
            }
        } else {
            setIsLoading(false);
            return;
        }

        try {
            // FIX: Use process.env.API_KEY as per the guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            
            for await (const chunk of resultStream) {
                setGeneratedText(prev => prev + chunk.text);
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o texto. Tente novamente.');
        } finally {
            setIsLoading(false);
        }

    }, [content, selection]);

    const handleInsert = (mode: 'replace' | 'append') => {
        if (!generatedText) return;
        
        let newContent = '';
        if (mode === 'replace' && selection) {
             newContent = content.substring(0, selection.start) + generatedText + content.substring(selection.end);
        } else {
             newContent = content + '\n' + generatedText;
        }

        setContent(newContent);
        setGeneratedText('');
        setSelection(null);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Editor de Formato Longo</h2>
                <p className="text-gray-400">Escreva artigos, capítulos ou qualquer conteúdo extenso. Use a IA para continuar, expandir ou reescrever suas ideias.</p>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* Editor Panel */}
                <div className="flex-1 flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                     <textarea
                        ref={editorRef}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        onSelect={handleSelect}
                        placeholder="Comece a escrever seu texto aqui..."
                        className="w-full h-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all resize-none text-lg leading-relaxed"
                    />
                </div>

                {/* AI Controls Panel */}
                <div className="w-full md:w-1/3 flex flex-col gap-4 bg-base-200 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-brand-light border-b border-gray-700 pb-2">Assistente de IA</h3>
                    
                    <div className="space-y-3">
                        <button onClick={() => handleAiAction('continue')} disabled={isLoading} className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                           {isLoading ? <LoadingSpinner /> : 'Continuar Escrevendo'}
                        </button>
                         <button onClick={() => handleAiAction('expand')} disabled={isLoading || !selection} className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                            {isLoading ? <LoadingSpinner /> : 'Expandir Seleção'}
                        </button>
                         <button onClick={() => handleAiAction('rewrite')} disabled={isLoading || !selection} className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                            {isLoading ? <LoadingSpinner /> : 'Reescrever Seleção'}
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col mt-4">
                        <h4 className="font-semibold text-gray-400 mb-2">Sugestão da IA:</h4>
                        <div className="flex-1 bg-base-300 rounded-lg p-3 overflow-y-auto text-gray-300 whitespace-pre-wrap">
                            {isLoading && !generatedText && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                            {generatedText || (isLoading ? '' : <span className="text-gray-500 italic">As sugestões da IA aparecerão aqui...</span>)}
                        </div>
                    </div>

                     {generatedText && !isLoading && (
                        <div className="flex gap-2">
                             <button onClick={() => handleInsert('append')} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                                Anexar
                             </button>
                             <button onClick={() => handleInsert('replace')} disabled={!selection} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
                                Substituir Seleção
                             </button>
                        </div>
                     )}
                     {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default LongFormEditor;