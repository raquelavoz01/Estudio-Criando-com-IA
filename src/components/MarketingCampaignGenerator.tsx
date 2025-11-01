import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MegaphoneIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type CampaignTone = 'Criativo' | 'Profissional' | 'Urgente' | 'Informativo';

const MarketingCampaignGenerator: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [campaignObjective, setCampaignObjective] = useState('');
    const [tone, setTone] = useState<CampaignTone>('Criativo');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!productName || !productDescription || !targetAudience || !campaignObjective || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um diretor de marketing estratégico com vasta experiência em campanhas de sucesso. Crie um plano de campanha de marketing completo e detalhado.

                **Nome do Produto/Serviço:** ${productName}
                **Descrição do Produto/Serviço:** ${productDescription}
                **Público-Alvo:** ${targetAudience}
                **Objetivo Principal da Campanha:** ${campaignObjective}
                **Tom de Voz da Campanha:** ${tone}

                **Estrutura do Plano de Campanha:**
                1.  **Nome da Campanha e Slogan:** Crie um nome criativo e um slogan memorável.
                2.  **Análise do Público-Alvo:** Detalhe o público-alvo, incluindo seus interesses, dores e onde encontrá-los online.
                3.  **Canais de Marketing Sugeridos:** Recomende os melhores canais (ex: Instagram, Google Ads, Email Marketing) e justifique a escolha.
                4.  **Mensagens-Chave:** Defina as 3 principais mensagens que a campanha deve comunicar.
                5.  **Exemplos de Conteúdo:** Forneça exemplos práticos de conteúdo para 2 dos canais sugeridos (ex: um post para Instagram, um texto para email).
                6.  **Métricas de Sucesso (KPIs):** Liste os principais indicadores de desempenho para medir o sucesso da campanha com base no objetivo.

                **Instruções de Formatação:**
                - Use formatação Markdown para títulos e subtítulos (ex: # Título, ## Subtítulo).
                - Use listas para facilitar a leitura.
                - Comece diretamente com o primeiro título, sem introduções.
            `;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            // FIX: Safely access chunk.text
            for await (const chunk of resultStream) {
                setGeneratedText(prev => prev + (chunk.text ?? ''));
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a campanha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [productName, productDescription, targetAudience, campaignObjective, tone, isLoading]);

    const handleCopy = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Campanhas de Marketing</h2>
                        <p className="text-gray-400 mb-6">Crie campanhas de marketing personalizadas e adaptadas ao seu público-alvo e aos seus objetivos.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome do Produto/Serviço *</label>
                            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Tênis de corrida 'Veloz'" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Público-Alvo *</label>
                            <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Ex: Corredores amadores e profissionais" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Descrição do Produto/Serviço *</label>
                        <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Ex: Tênis ultraleve com tecnologia de amortecimento responsivo." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Objetivo da Campanha *</label>
                            <input type="text" value={campaignObjective} onChange={(e) => setCampaignObjective(e.target.value)} placeholder="Ex: Aumentar as vendas online em 20%" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Tom de Voz</label>
                             <div className="flex flex-wrap gap-2">
                                {(['Criativo', 'Profissional', 'Urgente', 'Informativo'] as CampaignTone[]).map(t => (
                                     <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                        {t}
                                     </button>
                                ))}
                             </div>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !productName || !productDescription || !targetAudience || !campaignObjective}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Campanha'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Seu Plano de Campanha</h3>
                     {generatedText && !isLoading && (
                        <button onClick={handleCopy} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm">
                            {isCopied ? 'Copiado!' : 'Copiar Texto'}
                        </button>
                     )}
                </div>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                         <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Criando sua estratégia...</p>
                        </div>
                    </div>
                )}
                 {generatedText && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedText.replace(/\n/g, '<br />').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-4 mb-2">$1</h2>').replace(/# (.*?)<br \/>/g, '<h1 class="text-2xl font-bold text-white mt-2 mb-4">$1</h1>') }}
                    />
                 )}
                {!generatedText && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <MegaphoneIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O plano da sua campanha de marketing aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketingCampaignGenerator;
