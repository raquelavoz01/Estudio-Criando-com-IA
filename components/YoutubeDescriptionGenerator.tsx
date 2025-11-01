import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { YoutubeIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type DescriptionTone = 'Amigável' | 'Profissional' | 'Engraçado' | 'Informativo';

const YoutubeDescriptionGenerator: React.FC = () => {
    const [videoTitle, setVideoTitle] = useState('');
    const [keywords, setKeywords] = useState('');
    const [tone, setTone] = useState<DescriptionTone>('Amigável');
    const [descriptions, setDescriptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!videoTitle || isLoading) return;

        setIsLoading(true);
        setError(null);
        setDescriptions([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em SEO para YouTube e copywriter. Crie 3 descrições de vídeo otimizadas para o YouTube. Cada descrição deve ser única e separada por '---'.

                **Título do Vídeo:** ${videoTitle}
                **Palavras-chave:** ${keywords}
                **Tom da Descrição:** ${tone}

                **Instruções para cada descrição:**
                1.  **Hook Inicial:** Comece com 1-2 frases cativantes que resumam o vídeo e prendam a atenção.
                2.  **Detalhes e Valor:** Elabore sobre o conteúdo do vídeo, destacando os benefícios para o espectador.
                3.  **Links e CTAs (Chamada para Ação):** Inclua placeholders para links importantes (ex: [SEU LINK AQUI]) e incentive a inscrição e o like.
                4.  **Hashtags:** Adicione de 3 a 5 hashtags relevantes e otimizadas no final.
                5.  **Formatação:** Use parágrafos curtos e emojis para melhorar a legibilidade.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedDescriptions = response.text.split('---').map(d => d.trim()).filter(d => d);
            setDescriptions(generatedDescriptions);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar as descrições. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [videoTitle, keywords, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Descrição de Vídeo do YouTube</h2>
                        <p className="text-gray-400 mb-6">Faça seus vídeos se destacarem e terem boa classificação com ótimas descrições!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Título do Vídeo *</label>
                        <input
                            type="text"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            placeholder="Ex: O Guia Definitivo para Café Expresso em Casa"
                            className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Palavras-chave (Opcional)</label>
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="Ex: café, expresso, barista, como fazer café"
                            className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">3. Escolha um tom</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Amigável', 'Profissional', 'Engraçado', 'Informativo'] as DescriptionTone[]).map(t => (
                                 <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !videoTitle}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Descrições'}
                    </button>
                </div>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Descrições Sugeridas</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Escrevendo descrições otimizadas...</p>
                        </div>
                    </div>
                )}
                 {descriptions.length > 0 && !isLoading && (
                     <div className="space-y-4">
                        {descriptions.map((desc, i) => (
                             <div key={i} className="bg-base-300 p-4 rounded-lg animate-fade-in">
                                 <p className="text-gray-300 whitespace-pre-wrap mb-4">{desc}</p>
                                 <button onClick={() => handleCopy(desc, i)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm">
                                     {copiedIndex === i ? 'Copiado!' : 'Copiar'}
                                 </button>
                             </div>
                        ))}
                     </div>
                 )}
                {!descriptions.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <YoutubeIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas descrições de vídeo aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default YoutubeDescriptionGenerator;