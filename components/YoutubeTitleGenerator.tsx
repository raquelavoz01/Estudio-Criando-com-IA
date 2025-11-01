import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { YoutubeIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type TitleTone = 'Atraente' | 'Profissional' | 'Engraçado' | 'Urgente';

const YoutubeTitleGenerator: React.FC = () => {
    const [videoDescription, setVideoDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [tone, setTone] = useState<TitleTone>('Atraente');
    const [titles, setTitles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!videoDescription || isLoading) return;

        setIsLoading(true);
        setError(null);
        setTitles([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em SEO para YouTube e copywriter viral. Crie 5 títulos de vídeo para o YouTube que maximizem os cliques (CTR).

                **Descrição do Vídeo:** ${videoDescription}
                **Palavras-chave a incluir:** ${keywords || 'nenhuma'}
                **Tom do Título:** ${tone}

                **Instruções:**
                - Os títulos devem ser curtos, impactantes e curiosos.
                - Incorpore as palavras-chave naturalmente.
                - Siga as melhores práticas de SEO para YouTube.
                - Retorne apenas os títulos, um por linha, sem numeração ou marcadores.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedTitles = response.text.split('\n').map(t => t.trim()).filter(t => t);
            setTitles(generatedTitles);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar os títulos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [videoDescription, keywords, tone, isLoading]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Títulos para Vídeos do YouTube</h2>
                        <p className="text-gray-400 mb-6">Crie títulos atraentes para seus vídeos do YouTube em segundos!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Descreva seu vídeo *</label>
                        <textarea
                            value={videoDescription}
                            onChange={(e) => setVideoDescription(e.target.value)}
                            placeholder="Ex: Um tutorial passo a passo de como fazer o melhor bolo de chocolate fofinho."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Palavras-chave (Opcional)</label>
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="Ex: receita fácil, bolo de chocolate, sobremesa"
                            className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">3. Escolha um tom</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Atraente', 'Profissional', 'Engraçado', 'Urgente'] as TitleTone[]).map(t => (
                                 <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !videoDescription}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Títulos'}
                    </button>
                </div>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Títulos Sugeridos</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Criando títulos virais...</p>
                        </div>
                    </div>
                )}
                 {titles.length > 0 && !isLoading && (
                     <div className="space-y-4">
                        {titles.map((title, i) => (
                             <div key={i} className="bg-base-300 p-4 rounded-lg animate-fade-in flex justify-between items-center">
                                 <p className="text-gray-300">{title}</p>
                                 <button onClick={() => handleCopy(title, i)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm flex-shrink-0 ml-4">
                                     {copiedIndex === i ? 'Copiado!' : 'Copiar'}
                                 </button>
                             </div>
                        ))}
                     </div>
                 )}
                {!titles.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <YoutubeIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Seus títulos de vídeo aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default YoutubeTitleGenerator;
