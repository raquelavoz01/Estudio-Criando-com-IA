import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { DocumentTextIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-light"></div>
);

const ManuscriptWriter: React.FC = () => {
    const [manuscript, setManuscript] = useState('');
    const [chapterGoal, setChapterGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const handleAiAction = useCallback(async (action: 'continue' | 'add_dialogue' | 'add_description') => {
        if (isLoading) return;
        if (action !== 'continue' && !chapterGoal) {
            setError('Por favor, defina um objetivo para o capítulo para usar esta função.');
            return;
        }

        setIsLoading(true);
        setError(null);

        let prompt = '';
        const currentContent = manuscript;
        const originalityClause = "É CRÍTICO que o texto gerado seja 100% original e único.";

        switch(action) {
            case 'continue':
                prompt = `Aja como um coautor. Continue escrevendo o seguinte manuscrito de forma coesa e no mesmo estilo, avançando na história. ${originalityClause}. Manuscrito até agora:\n\n---\n\n${currentContent}`;
                break;
            case 'add_dialogue':
                prompt = `Aja como um roteirista. Com base no objetivo do capítulo, que é "${chapterGoal}", escreva o próximo trecho de diálogo original entre os personagens. ${originalityClause}. Manuscrito até agora:\n\n---\n\n${currentContent}`;
                break;
            case 'add_description':
                prompt = `Aja como um romancista descritivo. Com base no objetivo do capítulo, que é "${chapterGoal}", escreva um parágrafo descritivo vívido e original sobre o cenário, a atmosfera ou a aparência de um personagem. ${originalityClause}. Manuscrito até agora:\n\n---\n\n${currentContent}`;
                break;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            
            let generatedText = '';
            for await (const chunk of resultStream) {
                generatedText += chunk.text;
            }
            setManuscript(prev => prev + (prev.length > 0 ? '\n\n' : '') + generatedText);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o texto. Tente novamente.');
        } finally {
            setIsLoading(false);
        }

    }, [manuscript, chapterGoal]);
    
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Escritor de Manuscritos</h2>
                        <p className="text-gray-400">Ferramenta com tecnologia de IA para auxiliar na escrita do seu manuscrito.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                <div className="w-full md:w-1/3 flex flex-col gap-4 bg-base-200 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-brand-light border-b border-gray-700 pb-2">Assistente de IA</h3>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Objetivo do Capítulo Atual</label>
                        <textarea
                            value={chapterGoal}
                            onChange={e => setChapterGoal(e.target.value)}
                            placeholder="Ex: Apresentar o vilão e sua motivação, criar um conflito entre os protagonistas..."
                            className="w-full h-24 p-2 bg-base-300 rounded-lg text-sm"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-3">
                        <button onClick={() => handleAiAction('continue')} disabled={isLoading} className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                           {isLoading ? <LoadingSpinner /> : 'Continuar Escrevendo'}
                        </button>
                         <button onClick={() => handleAiAction('add_dialogue')} disabled={isLoading || !chapterGoal} className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                            {isLoading ? <LoadingSpinner /> : 'Adicionar Diálogo'}
                        </button>
                         <button onClick={() => handleAiAction('add_description')} disabled={isLoading || !chapterGoal} className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                            {isLoading ? <LoadingSpinner /> : 'Adicionar Descrição'}
                        </button>
                    </div>
                     {error && <div className="mt-2 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
                </div>
                <div className="flex-1 flex flex-col bg-base-200 rounded-xl shadow-lg p-4">
                     <textarea
                        ref={editorRef}
                        value={manuscript}
                        onChange={e => setManuscript(e.target.value)}
                        placeholder="Comece seu manuscrito aqui..."
                        className="w-full h-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none text-lg leading-relaxed"
                    />
                </div>
            </div>
        </div>
    );
};

export default ManuscriptWriter;