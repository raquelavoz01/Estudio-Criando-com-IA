import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MetaDescriptionIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type DescriptionTone = 'Profissional' | 'Amigável' | 'Persuasivo' | 'Informativo';

const MetaDescriptionGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [tone, setTone] = useState<DescriptionTone>('Profissional');
    const [descriptions, setDescriptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!topic || !keywords || isLoading) return;

        setIsLoading(true);
        setError(null);
        setDescriptions([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em SEO. Gere 3 meta descrições otimizadas para uma página da web.

                **Tópico da Página:** ${topic}
                **Palavras-chave:** ${keywords}
                **Tom:** ${tone}

                **Requisitos para cada Meta Descrição:**
                - Deve ter entre 140 e 160 caracteres.
                - Deve ser persuasiva, única e incluir um call-to-action (CTA) claro.
                - Deve incorporar naturalmente as palavras-chave fornecidas.
                - Cada descrição deve ser separada por '---'.

                Retorne APENAS as descrições, sem nenhuma introdução ou texto adicional.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedDescriptions = response.text.split('---').map(d => d.trim()).filter(d => d);
            setDescriptions(generatedDescriptions);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar as meta descrições. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, keywords, tone, isLoading]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Meta Descrição</h2>
                <p className="text-gray-400 mb-6">Gere meta descrições atraentes para melhorar as taxas de cliques nos resultados de pesquisa.</p>
                
                <div className="space-y-4">
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Tópico da Página *</label>
                        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: Guia completo sobre jardinagem para iniciantes" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Palavras-chave *</label>
                        <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ex: jardinagem, como começar, dicas de plantas" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">Tom</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Profissional', 'Amigável', 'Persuasivo', 'Informativo'] as DescriptionTone[]).map(t => (
                                 <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic || !keywords}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                >
                    {isLoading ? <LoadingSpinner /> : 'Gerar Descrições'}
                </button>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <h3 className="text-xl font-bold text-brand-light mb-4">Resultados</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Gerando descrições que geram cliques...</p>
                        </div>
                    </div>
                )}
                 {descriptions.length > 0 && !isLoading && (
                     <div className="space-y-4 animate-fade-in">
                        {descriptions.map((desc, i) => (
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
                 )}
                {!descriptions.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <MetaDescriptionIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas meta descrições aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetaDescriptionGenerator;