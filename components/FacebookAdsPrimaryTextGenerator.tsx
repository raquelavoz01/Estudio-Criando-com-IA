import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FacebookIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const FacebookAdsPrimaryTextGenerator: React.FC = () => {
    const [product, setProduct] = useState('');
    const [audience, setAudience] = useState('');
    const [painPoint, setPainPoint] = useState('');
    const [texts, setTexts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!product || !audience || isLoading) return;

        setIsLoading(true);
        setError(null);
        setTexts([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um copywriter especialista em Facebook Ads. Crie 3 variações de texto principal (primary text) para um anúncio do Facebook. Cada variação deve ser separada por '---'.

                **Produto/Serviço:** ${product}
                **Público-alvo:** ${audience}
                **Ponto de Dor do Público:** ${painPoint || 'Não especificado'}

                **Instruções para cada variação:**
                - Comece com um gancho forte para chamar a atenção.
                - Use a fórmula AIDA (Atenção, Interesse, Desejo, Ação).
                - Destaque os benefícios, não apenas as características.
                - Use emojis para quebrar o texto e adicionar personalidade.
                - Termine com um Call-to-Action (CTA) claro e convincente.
                - Mantenha os parágrafos curtos.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            const generatedTexts = response.text.split('---').map(t => t.trim()).filter(t => t);
            setTexts(generatedTexts);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar os textos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [product, audience, painPoint, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Texto Principal dos Anúncios do Facebook</h2>
                        <p className="text-gray-400 mb-6">Gere textos primários para seus anúncios do Facebook que geram mais leads e vendas.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Produto/Serviço *</label>
                        <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex: Um aplicativo de meditação guiada" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Público-alvo *</label>
                            <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex: Profissionais ocupados e estressados" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Ponto de Dor (Opcional)</label>
                            <input type="text" value={painPoint} onChange={(e) => setPainPoint(e.target.value)} placeholder="Ex: Dificuldade para dormir, ansiedade" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !product || !audience}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Textos'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Textos Sugeridos</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Escrevendo textos que convertem...</p>
                        </div>
                    </div>
                )}
                 {texts.length > 0 && !isLoading && (
                     <div className="space-y-4">
                        {texts.map((text, i) => (
                             <div key={i} className="bg-base-300 p-4 rounded-lg animate-fade-in">
                                 <p className="text-gray-300 whitespace-pre-wrap mb-4">{text}</p>
                                 <button onClick={() => handleCopy(text, i)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm">
                                     {copiedIndex === i ? 'Copiado!' : 'Copiar'}
                                 </button>
                             </div>
                        ))}
                     </div>
                 )}
                {!texts.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <FacebookIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Os textos principais do seu anúncio aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacebookAdsPrimaryTextGenerator;