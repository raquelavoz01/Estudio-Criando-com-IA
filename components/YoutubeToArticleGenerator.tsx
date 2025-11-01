import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { YoutubeIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const YoutubeToArticleGenerator: React.FC = () => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [article, setArticle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const isValidYoutubeUrl = (url: string) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubeRegex.test(url);
    };

    const handleGenerate = useCallback(async () => {
        if (!youtubeUrl || isLoading || !isValidYoutubeUrl(youtubeUrl)) {
            if(!isValidYoutubeUrl(youtubeUrl)) setError("Por favor, insira um URL válido do YouTube.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setArticle('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um redator de conteúdo especialista em SEO e roteirista.
                Um usuário forneceu a seguinte URL de um vídeo do YouTube: ${youtubeUrl}

                Sua tarefa é transformar o conteúdo principal e as ideias deste vídeo em um artigo de blog completo e bem estruturado.
                Você deve inferir o tópico do vídeo a partir de seu título e da URL.

                **Estrutura do Artigo:**
                1.  **Título Atraente:** Crie um título otimizado para SEO que capture a essência do vídeo.
                2.  **Introdução:** Escreva um parágrafo de introdução envolvente que prenda o leitor e resuma o que será abordado.
                3.  **Corpo do Artigo:** Desenvolva o conteúdo em várias seções, cada uma com um subtítulo claro (usando formatação markdown ##). Detalhe os pontos principais do vídeo de forma lógica e coerente.
                4.  **Conclusão:** Finalize com um parágrafo de conclusão que resuma os pontos chave e ofereça uma reflexão final ou um call-to-action.

                **Instruções Adicionais:**
                - O tom deve ser informativo, mas acessível e fácil de ler.
                - Formate o texto de forma limpa, com parágrafos bem definidos.
                - Não mencione que o conteúdo foi extraído de um vídeo. Apresente-o como um artigo original.
                - Comece diretamente com o título, sem introduções como "Claro, aqui está...".
            `;

            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setArticle(prev => prev + chunk.text);
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o artigo. Verifique o link ou tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [youtubeUrl, isLoading]);

    const handleCopy = () => {
        if (!article) return;
        navigator.clipboard.writeText(article);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Vídeo do YouTube para Artigo</h2>
                <p className="text-gray-400 mb-6">Converta qualquer vídeo do YouTube em um artigo bem estruturado em segundos!</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="Cole o link do vídeo do YouTube aqui..."
                        className="flex-grow p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !youtubeUrl}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Artigo'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Artigo Gerado</h3>
                     {article && !isLoading && (
                        <button 
                            onClick={handleCopy}
                            className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm transition-colors"
                        >
                            {isCopied ? 'Copiado!' : 'Copiar Artigo'}
                        </button>
                     )}
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Analisando o vídeo e escrevendo o artigo...</p>
                        </div>
                    </div>
                )}
                 {article && !isLoading && (
                    <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: article.replace(/\n/g, '<br />').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-4 mb-2">$1</h2>') }}
                    />
                 )}
                {!article && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <YoutubeIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Seu artigo gerado a partir de um vídeo aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default YoutubeToArticleGenerator;