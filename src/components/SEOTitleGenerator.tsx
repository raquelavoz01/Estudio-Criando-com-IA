
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TrendingUpIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

interface SEOResults {
    titles: string[];
    descriptions: string[];
}

const SEOTitleGenerator: React.FC = () => {
    const [businessName, setBusinessName] = useState('');
    const [keywords, setKeywords] = useState('');
    const [audience, setAudience] = useState('');
    const [results, setResults] = useState<SEOResults>({ titles: [], descriptions: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!businessName || !keywords || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResults({ titles: [], descriptions: [] });

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em SEO e copywriting com 10 anos de experiência.
                Gere 3 Títulos de SEO e 3 Meta Descrições otimizados para a seguinte empresa/site.

                **Nome da Empresa/Site:** ${businessName}
                **Palavras-chave Principais:** ${keywords}
                **Público-alvo:** ${audience || 'Geral'}

                **Requisitos para Títulos de SEO:**
                - Devem ter entre 50 e 60 caracteres.
                - Devem ser atraentes, claros e incluir as palavras-chave principais.
                - Cada título em uma nova linha.

                **Requisitos para Meta Descrições:**
                - Devem ter entre 140 e 160 caracteres.
                - Devem ser persuasivas, conter um call-to-action (CTA) e incluir as palavras-chave.
                - Cada descrição em uma nova linha.

                **Formato da Resposta:**
                Use EXATAMENTE este formato, sem nenhuma outra palavra ou explicação.
                [TÍTULOS]
                Título 1
                Título 2
                Título 3
                [DESCRIÇÕES]
                Descrição 1
                Descrição 2
                Descrição 3
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            // FIX: Safely access response.text
            const text = response.text ?? '';
            const titlesMatch = text.match(/\[TÍTULOS\]\n([\s\S]*?)\n\[DESCRIÇÕES\]/);
            const descriptionsMatch = text.match(/\[DESCRIÇÕES\]\n([\s\S]*)/);

            const titles = titlesMatch ? titlesMatch[1].split('\n').filter(t => t.trim()) : [];
            const descriptions = descriptionsMatch ? descriptionsMatch[1].split('\n').filter(d => d.trim()) : [];
            
            setResults({ titles, descriptions });

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o conteúdo de SEO. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [businessName, keywords, audience, isLoading]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Otimizador de SEO: Título e Meta Descrição</h2>
                <p className="text-gray-400 mb-6">Coloque seu site no topo dos mecanismos de busca! Gere títulos e descrições otimizados para atrair mais cliques.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome do Site ou Empresa *</label>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ex: Sapataria do Zé" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Palavras-chave Principais *</label>
                        <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ex: sapatos de couro, botas, sandálias" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Público-alvo (Opcional)</label>
                        <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex: Homens e mulheres que buscam calçados de qualidade" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !businessName || !keywords}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                >
                    {isLoading ? <LoadingSpinner /> : <><TrendingUpIcon/> Gerar Conteúdo de SEO</>}
                </button>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Otimizando para o topo...</p>
                        </div>
                    </div>
                )}
                 {results.titles.length > 0 && !isLoading && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div>
                            <h3 className="text-xl font-bold text-brand-light mb-4">Títulos SEO Sugeridos</h3>
                            <div className="space-y-4">
                                {results.titles.map((title, i) => (
                                    <div key={i} className="bg-base-300 p-4 rounded-lg">
                                        <p className="text-gray-300 mb-2">{title}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">{title.length} caracteres</span>
                                            <button onClick={() => handleCopy(title)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm">
                                                {copied === title ? 'Copiado!' : 'Copiar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-brand-light mb-4">Meta Descrições Sugeridas</h3>
                            <div className="space-y-4">
                                {results.descriptions.map((desc, i) => (
                                    <div key={i} className="bg-base-300 p-4 rounded-lg">
                                        <p className="text-gray-300 mb-2">{desc}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">{desc.length} caracteres</span>
                                            <button onClick={() => handleCopy(desc)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm">
                                                {copied === desc ? 'Copiado!' : 'Copiar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                 )}
                {!results.titles.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <TrendingUpIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Seus títulos e descrições otimizados aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default SEOTitleGenerator;