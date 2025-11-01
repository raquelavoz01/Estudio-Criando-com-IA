import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BriefcaseIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const BusinessPlanGenerator: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [businessIdea, setBusinessIdea] = useState('');
    const [targetMarket, setTargetMarket] = useState('');
    const [productsServices, setProductsServices] = useState('');
    const [generatedPlan, setGeneratedPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!companyName || !businessIdea || !targetMarket || !productsServices || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedPlan('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um consultor de negócios sênior e especialista em redação de planos de negócios para startups. Crie um plano de negócios completo e profissional.

                **Nome da Empresa:** ${companyName}
                **Ideia/Resumo do Negócio:** ${businessIdea}
                **Mercado-Alvo:** ${targetMarket}
                **Principais Produtos/Serviços:** ${productsServices}

                **Estrutura do Plano de Negócios:**
                Crie um documento detalhado com as seguintes seções:
                1.  **Sumário Executivo:** Um resumo convincente de todo o plano.
                2.  **Descrição da Empresa:** Detalhes sobre a empresa, sua missão e visão.
                3.  **Análise de Mercado:** Análise do público-alvo, concorrência e tamanho do mercado.
                4.  **Organização e Gestão:** Estrutura da equipe e gestão.
                5.  **Produtos ou Serviços:** Descrição detalhada do que a empresa oferece.
                6.  **Estratégia de Marketing e Vendas:** Como a empresa atrairá e reterá clientes.
                7.  **Projeções Financeiras:** Uma visão geral das projeções financeiras (receita, custos, lucratividade).

                **Instruções de Formatação:**
                - Use formatação Markdown para títulos (##) e subtítulos (###).
                - Seja claro, profissional e persuasivo, como se estivesse apresentando a um investidor.
                - Comece diretamente com a primeira seção.
            `;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setGeneratedPlan(prev => prev + chunk.text);
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o plano de negócios. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [companyName, businessIdea, targetMarket, productsServices, isLoading]);

    const handleCopy = () => {
        if (!generatedPlan) return;
        navigator.clipboard.writeText(generatedPlan);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Plano de Negócios</h2>
                        <p className="text-gray-400 mb-6">Crie um plano de negócios para sua empresa que o ajudará a obter financiamento.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome da Empresa *</label>
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Café Astro" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Mercado-Alvo *</label>
                            <input type="text" value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Ex: Amantes de café e entusiastas do espaço" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Ideia/Resumo do Negócio *</label>
                        <textarea value={businessIdea} onChange={(e) => setBusinessIdea(e.target.value)} placeholder="Ex: Uma cafeteria temática que vende grãos de café especiais com nomes de planetas e constelações." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Principais Produtos/Serviços *</label>
                        <textarea value={productsServices} onChange={(e) => setProductsServices(e.target.value)} placeholder="Ex: Cafés especiais, lanches temáticos, workshops de degustação." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !companyName || !businessIdea || !targetMarket || !productsServices}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Plano de Negócios'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Seu Plano de Negócios</h3>
                     {generatedPlan && !isLoading && (
                        <button onClick={handleCopy} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm">
                            {isCopied ? 'Copiado!' : 'Copiar Texto'}
                        </button>
                     )}
                </div>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                         <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Elaborando seu plano para o sucesso...</p>
                        </div>
                    </div>
                )}
                 {generatedPlan && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedPlan.replace(/\n/g, '<br />').replace(/### (.*?)<br \/>/g, '<h3 class="text-lg font-bold text-brand-secondary mt-3 mb-1">$1</h3>').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-6 mb-2 border-b border-brand-primary/50 pb-1">$1</h2>') }}
                    />
                 )}
                {!generatedPlan && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <BriefcaseIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Seu plano de negócios aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessPlanGenerator;
