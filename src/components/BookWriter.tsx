
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

const BookWriter: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [synopsis, setSynopsis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSynopsisLoading, setIsSynopsisLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        setSynopsis('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const finalPrompt = `
                Aja como um escritor de best-sellers. Crie um conteúdo rico e detalhado para um livro com base na seguinte solicitação: "${prompt}".

                É CRÍTICO que o conteúdo seja 100% original e não plagie obras existentes ou outras gerações de IA. Cada história deve ser única.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: finalPrompt,
                config: {
                    temperature: 0.75,
                    topP: 0.95,
                }
            });
            
            // FIX: Safely access response.text
            setGeneratedContent(response.text ?? '');

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o conteúdo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);

    const handleGenerateSynopsis = useCallback(async () => {
        if (!generatedContent || isSynopsisLoading) return;
        
        setIsSynopsisLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Crie uma sinopse concisa e envolvente com no máximo 3 parágrafos para o seguinte texto de livro: "${generatedContent}"`,
            });
            // FIX: Safely access response.text
            setSynopsis(response.text ?? '');
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a sinopse.');
        } finally {
            setIsSynopsisLoading(false);
        }
    }, [generatedContent, isSynopsisLoading]);

    const handleSaveToScripts = () => {
        const title = window.prompt("Digite o título para este roteiro:", "Meu Novo Roteiro");
        if (title && generatedContent) {
            try {
                const existingProjects = JSON.parse(localStorage.getItem('my-ai-studio-scripts') || '[]');
                const newProject = {
                    id: crypto.randomUUID(),
                    title,
                    createdAt: Date.now(),
                    status: 'current',
                    documents: {
                        script: generatedContent,
                        outline: '',
                        characters: '',
                        research: '',
                    }
                };
                localStorage.setItem('my-ai-studio-scripts', JSON.stringify([...existingProjects, newProject]));
                alert(`"${title}" foi salvo em seus Roteiros!`);
            } catch (e) {
                console.error("Failed to save to scripts", e);
                alert("Ocorreu um erro ao salvar o roteiro.");
            }
        }
    };


    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-brand-light">Ferramenta de Escrita</h2>
                <p className="text-gray-400 mb-4">Descreva sua ideia, personagem ou cena e deixe a IA transformá-la em uma narrativa épica.</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Crie o primeiro capítulo de um romance de fantasia sobre um órfão que descobre que pode falar com dragões."
                    className="w-full h-32 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="mt-4 w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                    {isLoading ? 'Gerando...' : 'Gerar Texto'}
                </button>
            </div>

            {synopsis && (
                <div className="bg-brand-primary/10 border-l-4 border-brand-secondary p-4 rounded-r-lg animate-fade-in">
                    <h4 className="font-bold text-brand-light mb-2">Sinopse Gerada</h4>
                    <p className="text-gray-300 text-sm italic">{synopsis}</p>
                </div>
            )}

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Seu Conteúdo Gerado</h3>
                     {generatedContent && (
                        <div className="flex gap-2">
                             <button
                                onClick={handleGenerateSynopsis}
                                disabled={isSynopsisLoading}
                                className="bg-brand-secondary/70 hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-500 transition-colors text-sm"
                            >
                                {isSynopsisLoading ? 'Gerando...' : 'Gerar Sinopse'}
                            </button>
                            <button
                                onClick={handleSaveToScripts}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                            >
                                Salvar nos Roteiros
                            </button>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
                    </div>
                )}
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {generatedContent && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedContent.replace(/\n/g, '<br />') }}
                    />
                )}
                {!generatedContent && !isLoading && !error && (
                    <div className="text-center text-gray-500 italic mt-10">
                        O conteúdo do seu livro aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};
export default BookWriter;