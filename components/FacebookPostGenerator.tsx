import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FacebookIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type PostTone = 'Divertido' | 'Profissional' | 'Inspirador' | 'Vendas';

const FacebookPostGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<PostTone>('Divertido');
    const [posts, setPosts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!topic || isLoading) return;

        setIsLoading(true);
        setError(null);
        setPosts([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um gerente de mídias sociais experiente. Crie 3 postagens envolventes para o Facebook com base nos seguintes detalhes. Cada postagem deve ser única e separada por '---'.

                **Tópico da Postagem:** ${topic}
                **Tom da Postagem:** ${tone}

                **Instruções:**
                - Crie postagens que incentivem a interação (perguntas, enquetes, etc.).
                - Inclua emojis relevantes que combinem com o tom.
                - Adicione de 2 a 4 hashtags relevantes e populares no final.
                - Formate o texto com parágrafos curtos para facilitar a leitura em dispositivos móveis.
                - Se o tom for de 'Vendas', inclua um call-to-action (CTA) claro.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedPosts = response.text.split('---').map(p => p.trim()).filter(p => p);
            setPosts(generatedPosts);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar as postagens. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [topic, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Postagens do Facebook</h2>
                        <p className="text-gray-400 mb-6">Crie facilmente postagens únicas e de alta qualidade para sua página do Facebook - com apenas um clique!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Qual é o tópico da sua postagem?</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Lançamento de um novo sabor de café orgânico da nossa marca."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Qual o tom da postagem?</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Divertido', 'Profissional', 'Inspirador', 'Vendas'] as PostTone[]).map(t => (
                                 <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !topic}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Postagens'}
                    </button>
                </div>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Postagens Sugeridas</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Criando postagens virais...</p>
                        </div>
                    </div>
                )}
                 {posts.length > 0 && !isLoading && (
                     <div className="space-y-4">
                        {posts.map((post, i) => (
                             <div key={i} className="bg-base-300 p-4 rounded-lg animate-fade-in">
                                 <p className="text-gray-300 whitespace-pre-wrap mb-4">{post}</p>
                                 <button onClick={() => handleCopy(post, i)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm">
                                     {copiedIndex === i ? 'Copiado!' : 'Copiar'}
                                 </button>
                             </div>
                        ))}
                     </div>
                 )}
                {!posts.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <FacebookIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas postagens do Facebook aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacebookPostGenerator;
