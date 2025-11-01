import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { StorefrontIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const GoogleMyBusinessProductGenerator: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [features, setFeatures] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!productName || !features || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em SEO local e marketing. Crie uma descrição otimizada para um produto ou serviço a ser listado no Google Meu Negócio (Google My Business).

                **Nome do Produto/Serviço:** ${productName}
                **Principais Características e Benefícios:** ${features}

                **Instruções:**
                - A descrição deve ser clara, informativa e persuasiva, com no máximo 1000 caracteres.
                - Destaque os benefícios mais importantes para o cliente.
                - Use uma linguagem que incentive o cliente a entrar em contato ou visitar a loja.
                - Incorpore palavras-chave que um cliente local usaria para encontrar este produto/serviço.
                - Retorne APENAS o texto da descrição, sem títulos ou introduções.
            `;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            for await (const chunk of resultStream) {
                setGeneratedText(prev => prev + chunk.text);
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a descrição. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [productName, features, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Google Meu Negócio - Descrição do Produto</h2>
                        <p className="text-gray-400 mb-6">Gere descrições de produtos ou serviços para o seu Google Meu Negócio.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome do Produto ou Serviço *</label>
                        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Café Expresso Duplo, Serviço de Alinhamento de Carro" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Principais Características e Benefícios *</label>
                        <textarea value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Ex: Grãos 100% arábica, torra média, notas de chocolate. Para um dia com mais energia e sabor." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !productName || !features}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Descrição'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Descrição Gerada</h3>
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
                            <p className="text-gray-400">Criando a descrição perfeita...</p>
                        </div>
                    </div>
                )}
                {generatedText && !isLoading && (
                    <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"/>
                )}
                 {!generatedText && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <StorefrontIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Sua descrição de produto do GMN aparecerá aqui...
                    </div>
                )}
                 {generatedText && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedText.replace(/\n/g, '<br />') }}
                    />
                 )}
            </div>
        </div>
    );
};

export default GoogleMyBusinessProductGenerator;