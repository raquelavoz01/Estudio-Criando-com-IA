import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GoogleIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const GoogleAdsTitleGenerator: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [titles, setTitles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!companyName || !description || isLoading) return;

        setIsLoading(true);
        setError(null);
        setTitles([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em Google Ads e copywriter. Crie 5 Títulos de Anúncio (headlines) para o Google Ads, com no máximo 30 caracteres cada.

                **Nome do Produto/Empresa:** ${companyName}
                **Descrição:** ${description}
                **Palavras-chave:** ${keywords}

                **Instruções:**
                - Os títulos devem ser curtos, impactantes e otimizados para cliques.
                - Incorpore as palavras-chave de forma natural.
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
    }, [companyName, description, keywords, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Títulos do Google Ads</h2>
                        <p className="text-gray-400 mb-6">Obtenha mais cliques com nosso gerador de títulos do Google Ads!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome do Produto/Empresa *</label>
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Loja de Calçados Conforto" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Palavras-chave (Opcional)</label>
                            <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ex: sapatos ortopédicos, calçados confortáveis" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Descrição do Produto/Serviço *</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Vendemos calçados ortopédicos elegantes para o dia a dia, focados no máximo conforto e saúde dos pés." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !companyName || !description}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
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
                            <p className="text-gray-400">Gerando títulos de alta conversão...</p>
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
                        <GoogleIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Seus títulos do Google Ads aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleAdsTitleGenerator;