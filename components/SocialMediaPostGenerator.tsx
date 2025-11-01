import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type Platform = 'Facebook' | 'Instagram' | 'Twitter (X)' | 'LinkedIn';
// FIX: Changed 'Divertido' to 'Amigável' to match component state and UI, resolving TypeScript error.
type PostTone = 'Amigável' | 'Profissional' | 'Inspirador' | 'Informativo';

const SocialMediaPostGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState<Platform>('Facebook');
    const [tone, setTone] = useState<PostTone>('Amigável');
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
            // FIX: Use process.env.API_KEY as per the guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um gerente de mídias sociais especialista. Crie 3 postagens de mídia social únicas para a plataforma "${platform}".

                **Tópico da Postagem:** ${topic}
                **Tom da Postagem:** ${tone}

                **Instruções Específicas da Plataforma:**
                - **${platform}:** Adapte o comprimento, estilo, formatação (quebras de linha, emojis) e tipo de hashtags para as melhores práticas desta plataforma.
                - Incentive a interação do usuário de uma forma que seja natural para a plataforma.
                - Cada variação deve ser separada por '---'.

                Retorne APENAS o texto das postagens.
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
    }, [topic, platform, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Postagens para Mídias Sociais</h2>
                        <p className="text-gray-400 mb-6">Crie facilmente postagens exclusivas e de alta qualidade para suas páginas de mídia social - com apenas um clique!</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Qual é o tópico da sua postagem?</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Os benefícios de uma rotina matinal produtiva."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Plataforma</label>
                             <div className="flex flex-wrap gap-2">
                                {(['Facebook', 'Instagram', 'Twitter (X)', 'LinkedIn'] as Platform[]).map(p => (
                                     <button key={p} onClick={() => setPlatform(p)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${platform === p ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                        {p}
                                     </button>
                                ))}
                             </div>
                        </div>
                        <div>
                             <label className="block text-gray-400 mb-2 text-sm font-semibold">3. Tom de Voz</label>
                             <div className="flex flex-wrap gap-2">
                                {(['Amigável', 'Profissional', 'Inspirador', 'Informativo'] as PostTone[]).map(t => (
                                     <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                        {t}
                                     </button>
                                ))}
                             </div>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !topic}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Postagens'}
                    </button>
                </div>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Postagens Sugeridas para {platform}</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Criando postagens incríveis...</p>
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
                        <SparklesIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas postagens de mídia social aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialMediaPostGenerator;