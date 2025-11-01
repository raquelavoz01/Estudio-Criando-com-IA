import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MapIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type Genre = 'Fantasia' | 'Ficção Científica' | 'Mistério' | 'Aventura' | 'Drama';

const StoryPlotGenerator: React.FC = () => {
    const [idea, setIdea] = useState('');
    const [genre, setGenre] = useState<Genre>('Fantasia');
    const [plot, setPlot] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!idea || isLoading) return;

        setIsLoading(true);
        setError(null);
        setPlot('');
        setIsCopied(false);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um mestre roteirista. Crie um enredo de história detalhado e estruturado para o gênero ${genre}, baseado na seguinte ideia: "${idea}".

                **Estrutura do Enredo (Três Atos):**
                1.  **Ato I: A Apresentação:**
                    - **Incidente Incitante:** O evento que dá início à história.
                    - **Primeiro Ponto de Virada:** O momento em que o protagonista se compromete com a jornada.
                2.  **Ato II: A Confrontação:**
                    - **Ação Ascendente:** Os desafios e obstáculos que o protagonista enfrenta.
                    - **Ponto Médio:** Uma grande reviravolta ou revelação no meio da história.
                    - **Segundo Ponto de Virada:** O momento mais baixo do protagonista, onde tudo parece perdido.
                3.  **Ato III: A Resolução:**
                    - **Clímax:** A batalha final ou o confronto decisivo.
                    - **Ação Descendente:** As consequências imediatas do clímax.
                    - **Resolução:** O final da história e o novo normal do protagonista.

                **Formato de Saída:**
                Use formatação Markdown com títulos (##) para cada seção principal (ex: ## Ato I: A Apresentação) e subtítulos (###) para os pontos da estrutura (ex: ### Incidente Incitante).
                Comece diretamente com o primeiro título.
            `;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            // FIX: Safely access chunk.text
            for await (const chunk of resultStream) {
                setPlot(prev => prev + (chunk.text ?? ''));
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o enredo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [idea, genre, isLoading]);

    const handleCopy = () => {
        if (!plot) return;
        navigator.clipboard.writeText(plot);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Enredo de História</h2>
                        <p className="text-gray-400 mb-6">Gere enredos de histórias intrigantes com IA.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Qual é a ideia ou tema central?</label>
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="Ex: Uma bibliotecária descobre um livro que reescreve a realidade."
                            className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Escolha o gênero</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Fantasia', 'Ficção Científica', 'Mistério', 'Aventura', 'Drama'] as Genre[]).map(g => (
                                 <button key={g} onClick={() => setGenre(g)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${genre === g ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {g}
                                 </button>
                            ))}
                         </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !idea}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Enredo'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Seu Enredo Estruturado</h3>
                     {plot && !isLoading && (
                        <button onClick={handleCopy} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg text-sm">
                            {isCopied ? 'Copiado!' : 'Copiar Texto'}
                        </button>
                     )}
                </div>
                {isLoading && !plot && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Construindo a jornada do seu herói...</p>
                        </div>
                    </div>
                )}
                 {plot && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: plot.replace(/\n/g, '<br />').replace(/### (.*?)<br \/>/g, '<h3 class="text-lg font-bold text-brand-secondary mt-3 mb-1">$1</h3>').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-6 mb-2 border-b border-brand-primary/50 pb-1">$1</h2>') }}
                    />
                 )}
                {!plot && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <MapIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O enredo da sua história aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryPlotGenerator;
