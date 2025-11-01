
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { IdentificationIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type BioTone = 'Profissional' | 'Amigável' | 'Inovador' | 'Inspirador';

const CompanyBioGenerator: React.FC = () => {
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [tone, setTone] = useState<BioTone>('Profissional');
    const [bios, setBios] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!companyName || !description || isLoading) return;

        setIsLoading(true);
        setError(null);
        setBios([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em branding e copywriter. Crie 3 biografias curtas e impactantes para uma empresa, ideais para redes sociais como LinkedIn ou Instagram.

                **Nome da Empresa:** ${companyName}
                **O que a empresa faz:** ${description}
                **Tom de Voz:** ${tone}

                **Instruções:**
                - Cada biografia deve ser concisa, clara e destacar o valor principal da empresa.
                - Adapte a linguagem ao tom de voz solicitado.
                - Inclua um call-to-action sutil ou uma declaração de missão.
                - Cada biografia deve ser separada por '---'.
                - Retorne APENAS as biografias.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedBios = response.text.split('---').map(b => b.trim()).filter(b => b);
            setBios(generatedBios);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar as biografias. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [companyName, description, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Biografia da Empresa</h2>
                        <p className="text-gray-400 mb-6">Crie biografias curtas e profissionais para suas redes sociais e perfis online.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Nome da Empresa *</label>
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Soluções Criativas Acme" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">O que sua empresa faz? *</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Ajudamos pequenas empresas a crescer com estratégias de marketing digital inovadoras." className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">Tom de Voz</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Profissional', 'Amigável', 'Inovador', 'Inspirador'] as BioTone[]).map(t => (
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
                        {isLoading ? <LoadingSpinner /> : 'Gerar Biografias'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Biografias Sugeridas</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Criando a identidade da sua empresa...</p>
                        </div>
                    </div>
                )}
                 {bios.length > 0 && !isLoading && (
                     <div className="space-y-4">
                        {bios.map((bio, i) => (
                             <div key={i} className="bg-base-300 p-4 rounded-lg animate-fade-in">
                                 <p className="text-gray-300 whitespace-pre-wrap mb-4">{bio}</p>
                                 <button onClick={() => handleCopy(bio, i)} className="bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm">
                                     {copiedIndex === i ? 'Copiado!' : 'Copiar'}
                                 </button>
                             </div>
                        ))}
                     </div>
                 )}
                {!bios.length && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <IdentificationIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        As biografias da sua empresa aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyBioGenerator;
