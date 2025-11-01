import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ShieldCheckIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type PolicyTone = 'Formal' | 'Direto' | 'Abrangente' | 'Amigável';

const PolicyGenerator: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [policyTopic, setPolicyTopic] = useState('');
    const [keyPoints, setKeyPoints] = useState('');
    const [tone, setTone] = useState<PolicyTone>('Formal');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!companyName || !policyTopic || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um consultor de RH e especialista em conformidade. Crie uma política empresarial profissional e abrangente.

                **Nome da Empresa:** ${companyName}
                **Tópico da Política:** ${policyTopic}
                **Pontos-chave a incluir (opcional):** ${keyPoints || 'Nenhum ponto específico fornecido.'}
                **Tom de Voz:** ${tone}

                **Estrutura da Política:**
                Crie um documento bem estruturado com seções claras, como:
                1.  **Objetivo:** O propósito da política.
                2.  **Âmbito de Aplicação:** A quem a política se aplica.
                3.  **Diretrizes/Procedimentos:** As regras e procedimentos específicos.
                4.  **Responsabilidades:** As responsabilidades dos funcionários e da empresa.
                5.  **Consequências da Violação:** As medidas disciplinares em caso de não conformidade.
                6.  **Confirmação de Recebimento:** Uma breve declaração para o funcionário assinar.

                **Instruções de Formatação:**
                - Use formatação Markdown para títulos e subtítulos (ex: # Título, ## Subtítulo).
                - Use listas com marcadores ou numeradas para maior clareza.
                - A linguagem deve ser clara, inequívoca e alinhada com o tom solicitado.
                - Comece diretamente com o título da política.
            `;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            // FIX: Safely access chunk.text
            for await (const chunk of resultStream) {
                setGeneratedText(prev => prev + (chunk.text ?? ''));
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a política. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [companyName, policyTopic, keyPoints, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Políticas</h2>
                        <p className="text-gray-400 mb-6">Gere políticas e diretrizes profissionais para sua organização.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome da Empresa *</label>
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Acme Corporation" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Tópico da Política *</label>
                            <input type="text" value={policyTopic} onChange={(e) => setPolicyTopic(e.target.value)} placeholder="Ex: Política de Trabalho Remoto, Código de Conduta" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Pontos-chave a incluir (Opcional)</label>
                        <textarea value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} placeholder="Ex: Horário de trabalho flexível, segurança de dados em casa, subsídio para home office." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">Tom de Voz</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Formal', 'Direto', 'Abrangente', 'Amigável'] as PolicyTone[]).map(t => (
                                 <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !companyName || !policyTopic}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Política'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Sua Política Gerada</h3>
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
                            <p className="text-gray-400">Elaborando sua política...</p>
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
                        <ShieldCheckIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        A política da sua empresa aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyGenerator;
