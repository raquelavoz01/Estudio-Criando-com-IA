import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UserCircleIcon } from './Icons';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

type BioTone = 'Profissional' | 'Criativo' | 'Amigável' | 'Inspirador';

const AboutMeGenerator: React.FC = () => {
    const [profession, setProfession] = useState('');
    const [skills, setSkills] = useState('');
    const [passions, setPassions] = useState('');
    const [tone, setTone] = useState<BioTone>('Profissional');
    const [bios, setBios] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!profession || !skills || isLoading) return;

        setIsLoading(true);
        setError(null);
        setBios([]);
        setCopiedIndex(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Aja como um especialista em personal branding e copywriter. Crie 3 biografias (bio) pessoais curtas e impactantes para um profissional criativo. Cada biografia deve ser única e separada por '---'.

                **Profissão/Área:** ${profession}
                **Pontos Fortes/Habilidades:** ${skills}
                **Paixões/Interesses (contexto adicional):** ${passions || 'Não informado'}
                **Tom de Voz:** ${tone}

                **Instruções:**
                - Crie biografias ideais para perfis de redes sociais (LinkedIn, Instagram) ou sites de portfólio.
                - As biografias devem ser concisas, autênticas e destacar o valor do profissional.
                - Incorpore as habilidades e paixões de forma natural e atraente.
                - Retorne APENAS as biografias, sem nenhuma introdução ou texto adicional.
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
    }, [profession, skills, passions, tone, isLoading]);

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
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Biografia Pessoal (Sobre Mim)</h2>
                        <p className="text-gray-400 mb-6">Como profissional criativo, sua biografia é uma das primeiras coisas que clientes em potencial verão.</p>
                    </div>
                    <span className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PRO</span>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Sua Profissão/Área de Atuação *</label>
                            <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ex: Fotógrafo, Designer Gráfico, Redator" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm font-semibold">Paixões e Interesses (Opcional)</label>
                            <input type="text" value={passions} onChange={(e) => setPassions(e.target.value)} placeholder="Ex: Viajar, café, natureza" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-semibold">Seus Pontos Fortes e Habilidades *</label>
                        <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Ex: Contar histórias visuais, criar marcas memoráveis, especialista em Adobe Creative Suite" className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"/>
                    </div>
                     <div>
                         <label className="block text-gray-400 mb-2 text-sm font-semibold">Tom de Voz</label>
                         <div className="flex flex-wrap gap-2">
                            {(['Profissional', 'Criativo', 'Amigável', 'Inspirador'] as BioTone[]).map(t => (
                                 <button key={t} onClick={() => setTone(t)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tone === t ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                    {t}
                                 </button>
                            ))}
                         </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !profession || !skills}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Gerar Biografia'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold text-brand-light mb-4">Suas Biografias Sugeridas</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">Criando sua bio perfeita...</p>
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
                        <UserCircleIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Suas biografias pessoais aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutMeGenerator;
