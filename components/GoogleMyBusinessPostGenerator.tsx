import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { StorefrontIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type PostType = 'Novidade' | 'Oferta' | 'Evento';

const GoogleMyBusinessPostGenerator: React.FC = () => {
    const [update, setUpdate] = useState('');
    const [postType, setPostType] = useState<PostType>('Novidade');
    const [posts, setPosts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!update || isLoading) return;

        setIsLoading(true);
        setError(null);
        setPosts([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um gerente de marketing local. Crie 2 variações para uma postagem do tipo "${postType}" para o Google Meu Negócio.

                **Informações para a postagem:** ${update}

                **Instruções:**
                - As postagens devem ser curtas, diretas e ideais para um público local.
                - Inclua um Call-to-Action (CTA) claro e direto (ex: "Ligue agora!", "Saiba mais", "Reserve seu horário").
                - Use emojis para chamar a atenção.
                - Cada variação deve ser separada por '---'.
                - Retorne APENAS o texto das postagens.
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
    }, [update, postType, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Postagem do Google Meu Negócio</h2>
                        <p className="text-gray-400 mb-6">Gerar atualizações de postagens de novidades para o Google Meu Negócio.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Tipo de Postagem</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Novidade', 'Oferta', 'Evento'] as PostType[]).map(t => (
                                 <button key={t} onClick={() => setPostType(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${postType === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">2. O que você quer anunciar?</label>
                        <textarea
                            value={update}
                            onChange={(e) => setUpdate(e.target.value)}
                            placeholder="Ex: Estamos com 20% de desconto em todos os cafés essa semana. / Chegou nosso novo pão de fermentação natural. / Show de jazz ao vivo nesta sexta-feira."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !update}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Postagem'}
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
                            <p className="text-gray-400">Criando postagens locais...</p>
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
                        <StorefrontIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas postagens do Google Meu Negócio aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleMyBusinessPostGenerator;