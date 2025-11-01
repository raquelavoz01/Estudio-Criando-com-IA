import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UserCircleIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type CharacterRole = 'Protagonista' | 'Antagonista' | 'Secundário' | 'Mentor';

const CharacterDescriptionGenerator: React.FC = () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<CharacterRole>('Protagonista');
    const [traits, setTraits] = useState('');
    const [backstory, setBackstory] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!name || !traits || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um romancista e criador de personagens experiente. Crie uma descrição detalhada e profunda de um personagem para uma história.

                **Nome do Personagem:** ${name}
                **Papel na História:** ${role}
                **Principais Traços (aparência, personalidade):** ${traits}
                **Breve Histórico/Contexto (opcional):** ${backstory}

                **Estrutura da Descrição:**
                Crie um perfil completo do personagem, cobrindo as seguintes seções:
                1.  **Aparência Física:** Descrição vívida da aparência do personagem.
                2.  **Personalidade:** Detalhes sobre seus traços de personalidade, maneirismos e como ele interage com os outros.
                3.  **Motivações e Objetivos:** O que impulsiona o personagem? O que ele quer alcançar?
                4.  **Falhas e Conflitos Internos:** Suas fraquezas, medos e os conflitos que enfrenta.
                5.  **Histórico (Background):** Elabore sobre o breve histórico fornecido, dando mais profundidade e contexto.
                6.  **Arco do Personagem (Sugestão):** Sugira um possível arco de desenvolvimento para o personagem ao longo da história.

                **Instruções de Formatação:**
                - Use formatação Markdown com títulos (##) para cada seção.
                - Escreva de forma criativa e inspiradora para um autor.
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
            setError('Ocorreu um erro ao gerar a descrição do personagem. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [name, role, traits, backstory, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Descrição de Personagens</h2>
                        <p className="text-gray-400 mb-6">Gere descrições detalhadas para seus personagens.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome do Personagem *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Kaelen" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Papel na História</label>
                            <select value={role} onChange={(e) => setRole(e.target.value as CharacterRole)} className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg">
                                {(['Protagonista', 'Antagonista', 'Secundário', 'Mentor'] as CharacterRole[]).map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Principais Traços *</label>
                        <textarea value={traits} onChange={(e) => setTraits(e.target.value)} placeholder="Ex: Cabelos prateados, olhos violeta, sarcástico mas leal, habilidoso com espadas." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Breve Histórico (Opcional)</label>
                        <textarea value={backstory} onChange={(e) => setBackstory(e.target.value)} placeholder="Ex: Um ex-soldado que desertou após uma batalha traumática e agora vive como um mercenário." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !name || !traits}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Descrição'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Perfil do Personagem</h3>
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
                            <p className="text-gray-400">Dando vida ao seu personagem...</p>
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
                        <UserCircleIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        A descrição do seu personagem aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharacterDescriptionGenerator;