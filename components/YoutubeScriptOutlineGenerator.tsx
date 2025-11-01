import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ClapperboardIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const YoutubeScriptOutlineGenerator: React.FC = () => {
    const [videoTitle, setVideoTitle] = useState('');
    const [videoDescription, setVideoDescription] = useState('');
    const [outline, setOutline] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!videoTitle || !videoDescription || isLoading) return;

        setIsLoading(true);
        setError(null);
        setOutline('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um roteirista experiente do YouTube e especialista em estratégia de conteúdo. Crie um esboço (outline) de roteiro detalhado para um vídeo do YouTube.

                **Título do Vídeo:** ${videoTitle}
                **Breve Descrição do Vídeo:** ${videoDescription}

                **Estrutura do Esboço do Roteiro:**
                1.  **Gancho (Hook) Inicial (0-30 segundos):** Crie uma abertura cativante para prender o espectador imediatamente.
                2.  **Introdução:** Apresente o tópico e o que o espectador aprenderá ou verá no vídeo.
                3.  **Conteúdo Principal:** Divida o conteúdo principal em 3-5 seções lógicas com subtítulos claros. Detalhe os pontos a serem abordados em cada seção.
                4.  **Chamada para Ação (CTA):** Insira um momento para pedir likes, inscrições e comentários.
                5.  **Encerramento (Outro):** Crie uma conclusão que resuma os pontos principais e talvez dê uma prévia do próximo vídeo.

                **Instruções de Formatação:**
                - Use formatação Markdown para títulos e subtítulos (ex: # Título, ## Subtítulo).
                - Use listas com marcadores (-) para detalhar os pontos dentro de cada seção.
                - O texto deve ser claro, conciso e estruturado para facilitar a gravação.
                - Comece diretamente com o primeiro título, sem introduções como "Aqui está o esboço...".
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
            setError('Ocorreu um erro ao gerar o esboço do roteiro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [videoTitle, videoDescription, isLoading]);

    const handleCopy = () => {
        if (!outline) return;
        navigator.clipboard.writeText(outline);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Esboço de Roteiro do YouTube</h2>
                        <p className="text-gray-400 mb-6">Faça do seu próximo vídeo um sucesso com um roteiro profissional!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Título do Vídeo *</label>
                        <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="Ex: Como Perder o Medo de Falar em Público" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Breve Descrição do Vídeo *</label>
                        <textarea value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} placeholder="Ex: Um guia com 5 dicas práticas para controlar a ansiedade e se comunicar com confiança." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !videoTitle || !videoDescription}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Esboço do Roteiro'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Seu Esboço de Roteiro</h3>
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
                            <p className="text-gray-400">Estruturando seu roteiro...</p>
                        </div>
                    </div>
                )}
                 {outline && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: outline.replace(/\n/g, '<br />').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-4 mb-2">$1</h2>').replace(/# (.*?)<br \/>/g, '<h1 class="text-2xl font-bold text-white mt-2 mb-4">$1</h1>') }}
                    />
                 )}
                {!outline && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <ClapperboardIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O esboço do seu roteiro de vídeo aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default YoutubeScriptOutlineGenerator;