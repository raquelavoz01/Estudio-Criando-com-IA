
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BriefcaseIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type ProfileTone = 'Corporativo' | 'Inovador' | 'Confiável' | 'Amigável';

const CompanyProfileGenerator: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [products, setProducts] = useState('');
    const [audience, setAudience] = useState('');
    const [values, setValues] = useState('');
    const [tone, setTone] = useState<ProfileTone>('Corporativo');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!companyName || !industry || !products || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um consultor de negócios e copywriter sênior. Crie um perfil de empresa completo e profissional.

                **Nome da Empresa:** ${companyName}
                **Indústria/Setor:** ${industry}
                **Principais Produtos/Serviços:** ${products}
                **Público-alvo:** ${audience || 'Não especificado'}
                **Valores da Empresa:** ${values || 'Não especificado'}
                **Tom de Voz:** ${tone}

                **Estrutura do Perfil da Empresa:**
                1.  **Resumo Executivo:** Um parágrafo conciso sobre a empresa.
                2.  **Visão Geral da Empresa:** Detalhes sobre o que a empresa faz.
                3.  **Missão e Visão:** O propósito e as aspirações futuras da empresa.
                4.  **Produtos e Serviços:** Uma descrição dos principais produtos/serviços.
                5.  **Mercado-alvo:** Descrição do público-alvo.
                6.  **Valores Fundamentais:** Os princípios que guiam a empresa.

                **Instruções de Formatação:**
                - Use formatação Markdown para títulos e subtítulos (ex: ## Título).
                - Escreva em um estilo claro, profissional e alinhado com o tom solicitado.
                - Comece diretamente com o primeiro título, sem introduções.
            `;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setGeneratedText(prev => prev + (chunk.text ?? ''));
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o perfil. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [companyName, industry, products, audience, values, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Perfil de Empresa</h2>
                        <p className="text-gray-400 mb-6">Crie um perfil profissional da empresa para apresentações, websites e muito mais.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome da Empresa *</label>
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: InovaTech Soluções" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Indústria/Setor *</label>
                            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Ex: Tecnologia, Software como Serviço (SaaS)" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Principais Produtos/Serviços *</label>
                        <textarea value={products} onChange={(e) => setProducts(e.target.value)} placeholder="Ex: Software de gestão de projetos, consultoria em nuvem" className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Público-alvo (Opcional)</label>
                            <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex: Pequenas e médias empresas" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                         <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Valores da Empresa (Opcional)</label>
                            <input type="text" value={values} onChange={(e) => setValues(e.target.value)} placeholder="Ex: Inovação, integridade, foco no cliente" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                     <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">Tom de Voz</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Corporativo', 'Inovador', 'Confiável', 'Amigável'] as ProfileTone[]).map(t => (
                                 <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !companyName || !industry || !products}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Perfil da Empresa'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Seu Perfil de Empresa</h3>
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
                            <p className="text-gray-400">Construindo seu perfil...</p>
                        </div>
                    </div>
                )}
                 {generatedText && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedText.replace(/\n/g, '<br />').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-4 mb-2">$1</h2>') }}
                    />
                 )}
                {!generatedText && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <BriefcaseIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O perfil da sua empresa aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyProfileGenerator;
