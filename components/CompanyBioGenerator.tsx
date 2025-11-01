import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { IdentificationIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type BioTone = 'Profissional' | 'Entusiasmado' | 'Confiável' | 'Casual';

const CompanyBioGenerator: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [achievements, setAchievements] = useState('');
    const [tone, setTone] = useState<BioTone>('Profissional');
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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um copywriter sênior, especialista em comunicação corporativa. Crie uma biografia de empresa (company bio) concisa e atraente, ideal para perfis de redes sociais (LinkedIn, Twitter), seções 'sobre' de websites ou materiais de marketing.

                **Nome da Empresa:** ${companyName}
                **Descrição da Empresa:** ${description}
                **Principais Conquistas/Diferenciais (opcional):** ${achievements}
                **Tom de Voz:** ${tone}

                **Instruções:**
                - A biografia deve ter entre 2 a 4 parágrafos curtos.
                - Destaque o valor principal da empresa e o que a torna única.
                - Incorpore as conquistas/diferenciais de forma natural.
                - A linguagem deve ser clara, impactante e alinhada com o tom de voz solicitado.
                - Comece diretamente com o texto da biografia, sem introduções.
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
            setError('Ocorreu um erro ao gerar a biografia. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [companyName, description, achievements, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Bio da Empresa</h2>
                        <p className="text-gray-400 mb-6">Crie uma biografia empresarial atraente para o seu negócio.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome da Empresa *</label>
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Soluções Sustentáveis Ltda." className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Descreva sua empresa *</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Desenvolvemos soluções de energia renovável para residências e empresas." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Principais Conquistas ou Diferenciais (Opcional)</label>
                        <input type="text" value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="Ex: Vencedora do prêmio de inovação 2023, 99% de satisfação do cliente." className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                     <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">Tom de Voz</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Profissional', 'Entusiasmado', 'Confiável', 'Casual'] as BioTone[]).map(t => (
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
                        {isLoading ? <LoadingSpinner /> : 'Gerar Bio da Empresa'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-light">Sua Bio de Empresa</h3>
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
                            <p className="text-gray-400">Criando sua biografia...</p>
                        </div>
                    </div>
                )}
                 {generatedText && !isLoading && (
                     <div
                        className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: generatedText.replace(/\n/g, '<br />') }}
                    />
                 )}
                {!generatedText && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <IdentificationIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        A biografia da sua empresa aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyBioGenerator;