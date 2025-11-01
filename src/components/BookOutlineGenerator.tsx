import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BookIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const BookOutlineGenerator: React.FC = () => {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [outline, setOutline] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!title || !summary || isLoading) return;

        setIsLoading(true);
        setError(null);
        setOutline('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um autor e editor experiente. Crie um esboço de livro detalhado.

                **Título do Livro:** ${title}
                **Resumo da História:** ${summary}

                **Instruções:**
                - Estruture o esboço com seções claras, como "Parte I", "Parte II", etc.
                - Dentro de cada parte, liste os capítulos (ex: "Capítulo 1: O Início") com um breve resumo de uma frase dos principais eventos ou tópicos do capítulo.
                - O esboço deve ter um arco narrativo claro: introdução, desenvolvimento, clímax e resolução.
                - Use formatação Markdown (ex: ## Parte I, ### Capítulo 1).
                - Comece diretamente com o esboço, sem texto introdutório.
            `;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setOutline(prev => prev + chunk.text);
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o esboço. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [title, summary, isLoading]);

    const handleCopy = () => {
        if (!outline) return;
        navigator.clipboard.writeText(outline);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Esboços de Livros</h2>
                <p className="text-gray-400 mb-6">Crie um esboço estruturado para seu livro com assistência de IA.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Título do Livro *</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: A Sombra do Mágico" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Resumo da História *</label>
                        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Ex: Um detetive em uma cidade chuvosa investiga o desaparecimento de um famoso mágico, descobrindo um mundo de ilusões e segredos perigosos." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !title || !summary}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Esboço'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Seu Esboço de Livro</h3>
                     {outline && !isLoading && (
                        <button onClick={handleCopy} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm">
                            {isCopied ? 'Copiado!' : 'Copiar Texto'}
                        </button>
                     )}
                </div>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                         <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Estruturando sua obra-prima...</p>
                        </div>
                    </div>
                )}
                 {outline && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: outline.replace(/\n/g, '<br />').replace(/### (.*?)<br \/>/g, '<h3 class="text-lg font-bold text-brand-secondary mt-3 mb-1">$1</h3>').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-6 mb-2 border-b border-brand-primary/50 pb-1">$1</h2>') }}
                    />
                 )}
                {!outline && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <BookIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O esboço do seu livro aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookOutlineGenerator;