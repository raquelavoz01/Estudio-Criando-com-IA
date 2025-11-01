import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ScrollIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const CharacterBackstoryGenerator: React.FC = () => {
    const [name, setName] = useState('');
    const [traits, setTraits] = useState('');
    const [goal, setGoal] = useState('');
    const [setting, setSetting] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!name || !traits || !goal || !setting || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um mestre contador de histórias e criador de mundos. Crie uma história de fundo (backstory) rica e detalhada para um personagem.

                **Nome do Personagem:** ${name}
                **Traços Principais:** ${traits}
                **Objetivo/Motivação Principal:** ${goal}
                **Gênero/Cenário da História:** ${setting}

                **Estrutura da História de Fundo:**
                Crie uma narrativa coesa explorando as seguintes seções:
                1.  **Primeiros Anos:** Descreva a infância do personagem e o ambiente em que cresceu.
                2.  **O Momento Decisivo:** Narre um evento crucial que moldou a personalidade e o caminho do personagem.
                3.  **Relacionamentos Importantes:** Descreva um relacionamento (familiar, amizade, rivalidade) que teve um impacto profundo no personagem.
                4.  **Segredos e Medos:** Revele um segredo que o personagem guarda ou um medo profundo que ele enfrenta.
                5.  **Como o Passado Molda o Presente:** Conecte a história de fundo com o objetivo/motivação atual do personagem.

                **Instruções de Formatação:**
                - Use formatação Markdown com títulos (##) para cada seção.
                - Escreva de forma envolvente e literária.
                - Comece diretamente com a primeira seção.
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
            setError('Ocorreu um erro ao gerar a história do personagem. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [name, traits, goal, setting, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de História de Fundo de Personagem</h2>
                        <p className="text-gray-400 mb-6">Crie histórias de fundo ricas e envolventes para seus personagens.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome do Personagem *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Lyra" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Gênero/Cenário *</label>
                            <input type="text" value={setting} onChange={(e) => setSetting(e.target.value)} placeholder="Ex: Fantasia medieval, cyberpunk" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Traços Principais *</label>
                        <input type="text" value={traits} onChange={(e) => setTraits(e.target.value)} placeholder="Ex: Curiosa, teimosa, habilidosa com arco e flecha" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Objetivo/Motivação Principal *</label>
                        <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ex: Encontrar uma relíquia perdida para salvar sua vila da escuridão." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !name || !traits || !goal || !setting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar História de Fundo'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">História de Fundo de {name || 'Personagem'}</h3>
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
                            <p className="text-gray-400">Desvendando o passado do personagem...</p>
                        </div>
                    </div>
                )}
                 {generatedText && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedText.replace(/\n/g, '<br />').replace(/### (.*?)<br \/>/g, '<h3 class="text-lg font-bold text-brand-secondary mt-3 mb-1">$1</h3>').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-6 mb-2 border-b border-brand-primary/50 pb-1">$1</h2>') }}
                    />
                 )}
                {!generatedText && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <ScrollIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        A história de fundo do seu personagem aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharacterBackstoryGenerator;