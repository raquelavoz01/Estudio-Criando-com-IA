import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { KeyIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const TikTokHashtagGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!topic || isLoading) return;

        setIsLoading(true);
        setError(null);
        setHashtags([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em crescimento de TikTok. Analise o seguinte tópico de vídeo e gere uma lista de 15 hashtags do TikTok, misturando hashtags populares, de nicho e em ascensão para maximizar o alcance e o engajamento.

                **Tópico do Vídeo:**
                ---
                ${topic}
                ---
                
                **Instruções:**
                - Retorne as hashtags como uma lista separada por vírgulas, começando com #.
                - Exemplo: #fyp, #tiktokfashion, #fashionhacks
                - Não inclua nenhum outro texto, explicação ou numeração.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedHashtags = response.text.split(',').map(h => h.trim()).filter(h => h.startsWith('#'));
            setHashtags(generatedHashtags);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar as hashtags. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, isLoading]);

    const handleCopy = (hashtag: string) => {
        navigator.clipboard.writeText(hashtag);
        setCopiedKeyword(hashtag);
        setTimeout(() => setCopiedKeyword(null), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Hashtags do TikTok</h2>
                        <p className="text-gray-400 mb-6">Obtenha mais seguidores e curtidas no TikTok com as hashtags certas!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Descreva o seu vídeo do TikTok</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Um vídeo tutorial rápido mostrando como estilizar uma jaqueta jeans de três maneiras diferentes."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                >
                    {isLoading ? <LoadingSpinner /> : 'Gerar Hashtags'}
                </button>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <h3 className="text-xl font-bold text-brand-light mb-4">Hashtags Sugeridas</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Procurando as melhores hashtags...</p>
                        </div>
                    </div>
                )}
                 {hashtags.length > 0 && !isLoading && (
                     <div className="flex flex-wrap gap-3 animate-fade-in">
                        {hashtags.map((hashtag, i) => (
                           <button 
                                key={i}
                                onClick={() => handleCopy(hashtag)}
                                className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm cursor-pointer"
                            >
                                {copiedKeyword === hashtag ? 'Copiado!' : hashtag}
                           </button>
                        ))}
                     </div>
                 )}
                {!hashtags.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <KeyIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas hashtags do TikTok aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default TikTokHashtagGenerator;
