
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { OfficeBuildingIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type PageTone = 'Profissional' | 'Amigável' | 'Inspirador' | 'Apaixonado';

const AboutUsPageGenerator: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [mission, setMission] = useState('');
    const [audience, setAudience] = useState('');
    const [tone, setTone] = useState<PageTone>('Profissional');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!companyName || !description || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedText('');

        try {
            // FIX: Use process.env.API_KEY as per the guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um copywriter sênior especializado em branding e storytelling. Crie uma página "Sobre Nós" completa e envolvente para o seguinte negócio.

                **Nome da Empresa:** ${companyName}
                **O que a empresa faz:** ${description}
                **Missão/Visão (opcional):** ${mission || 'Não fornecido'}
                **Público-alvo (opcional):** ${audience || 'Geral'}
                **Tom de Voz:** ${tone}

                **Estrutura da Página "Sobre Nós":**
                1.  **Título:** Crie um título cativante.
                2.  **Introdução:** Comece com um parágrafo que capture a atenção e apresente a empresa de forma concisa.
                3.  **Nossa História/Jornada:** Conte a história da fundação da empresa ou sua jornada de forma interessante.
                4.  **Nossa Missão e Visão:** Explique o propósito da empresa e para onde ela está indo. Se não fornecido, crie uma com base na descrição.
                5.  **O que Fazemos/Nossos Valores:** Detalhe os produtos/serviços e os princípios que guiam a empresa.
                6.  **Chamada para Ação (CTA):** Termine com um convite para o leitor (ex: conhecer nossos produtos, entrar em contato, etc.).

                **Instruções de Formatação:**
                - Use formatação Markdown para títulos e subtítulos (ex: # Título, ## Subtítulo).
                - Escreva em parágrafos curtos e de fácil leitura.
                - O texto deve ser autêntico e refletir o tom de voz solicitado.
                - Comece diretamente com o título, sem introduções como "Aqui está a página...".
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
            setError('Ocorreu um erro ao gerar a página. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [companyName, description, mission, audience, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Páginas Sobre Nós</h2>
                        <p className="text-gray-400 mb-6">Crie uma página Sobre nós para seu site que conte sua história e conecte-se com seu público.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome da Empresa *</label>
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Café Astro" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Público-alvo (Opcional)</label>
                            <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex: Amantes de café e entusiastas do espaço" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">O que sua empresa faz? *</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Vendemos grãos de café especiais de origem única com tema espacial." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Missão/Visão (Opcional)</label>
                        <textarea value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Ex: Nossa missão é levar uma experiência de outro mundo a cada xícara de café." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">Tom de Voz</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Profissional', 'Amigável', 'Inspirador', 'Apaixonado'] as PageTone[]).map(t => (
                                 <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !companyName || !description}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Página Sobre Nós'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Sua Página "Sobre Nós"</h3>
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
                            <p className="text-gray-400">Contando sua história...</p>
                        </div>
                    </div>
                )}
                 {generatedText && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedText.replace(/\n/g, '<br />').replace(/## (.*?)<br \/>/g, '<h2 class="text-xl font-bold text-brand-light mt-4 mb-2">$1</h2>').replace(/# (.*?)<br \/>/g, '<h1 class="text-2xl font-bold text-white mt-2 mb-4">$1</h1>') }}
                    />
                 )}
                {!generatedText && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <OfficeBuildingIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O conteúdo da sua página "Sobre Nós" aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutUsPageGenerator;