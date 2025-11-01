import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const BlogPostWorkflow: React.FC = () => {
    const [step, setStep] = useState(1);
    const [topic, setTopic] = useState('');
    const [titles, setTitles] = useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [outline, setOutline] = useState<string[]>([]);
    const [fullPost, setFullPost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetWorkflow = () => {
        setStep(1);
        setTopic('');
        setTitles([]);
        setSelectedTitle('');
        setOutline([]);
        setFullPost('');
        setError(null);
    };

    const handleGenerateTitles = useCallback(async () => {
        if (!topic) return;
        setIsLoading(true);
        setError(null);
        setTitles([]);
        setSelectedTitle('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Gere 5 títulos de post de blog atraentes e otimizados para SEO sobre o seguinte tópico: "${topic}". Retorne apenas os títulos, um por linha, sem numeração ou marcadores.`,
            });
            const generatedTitles = response.text.split('\n').filter(t => t.trim() !== '');
            setTitles(generatedTitles);
            if (generatedTitles.length > 0) {
                setSelectedTitle(generatedTitles[0]);
            }
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar títulos. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    const handleGenerateOutline = useCallback(async () => {
        if (!selectedTitle) return;
        setIsLoading(true);
        setError(null);
        setOutline([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `Crie um esboço (outline) detalhado para um post de blog com o título: "${selectedTitle}". Inclua seções como Introdução, desenvolvimento dos tópicos principais e Conclusão. Retorne apenas os tópicos do esboço, um por linha. Comece cada linha com um hífen.`,
            });
            const generatedOutline = response.text.split('\n').filter(o => o.trim() !== '').map(o => o.replace(/^- /, '').trim());
            setOutline(generatedOutline);
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar o esboço. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedTitle]);

    const handleGeneratePost = useCallback(async () => {
        if (!selectedTitle || outline.length === 0) return;
        setIsLoading(true);
        setError(null);
        setFullPost('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Escreva um post de blog completo, detalhado e envolvente, otimizado para SEO.
            ---
            Título: "${selectedTitle}"
            ---
            Esboço a seguir:
            ${outline.map(o => `- ${o}`).join('\n')}
            ---
            Instruções:
            - Siga o esboço fornecido para estruturar o post.
            - Desenvolva cada ponto do esboço com informações ricas e exemplos, se aplicável.
            - Use um tom informativo, profissional e acessível.
            - Formate o texto com parágrafos claros e quebras de linha para facilitar a leitura.
            - Comece diretamente com o conteúdo do post, sem introduções como "Claro, aqui está...".`;
            
            const resultStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            setStep(3); // Move to the final step immediately

            for await (const chunk of resultStream) {
                setFullPost(prev => prev + chunk.text);
            }
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar o post do blog. Tente novamente.');
            setStep(2); // Go back if it fails
        } finally {
            setIsLoading(false);
        }
    }, [selectedTitle, outline]);
    
    const StepIndicator = () => (
        <ol className="flex items-center w-full text-sm font-medium text-center text-gray-400">
            {[1, 2, 3].map(s => (
                <li key={s} className={`flex md:w-full items-center ${s < 3 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-600 after:border-1 after:inline-block" : ""} ${s <= step ? 'text-brand-primary' : ''}`}>
                    <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:w-12 lg:h-12 text-lg shrink-0 ${s === step ? 'bg-brand-primary text-white animate-pulse-fast' : s < step ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>
                        {s}
                    </span>
                </li>
            ))}
        </ol>
    );

    const renderStepContent = () => {
        switch(step) {
            case 1: return (
                <div>
                    <h3 className="text-xl font-bold text-brand-light mb-2">Passo 1: Tópico e Título</h3>
                    <p className="text-gray-400 mb-4">Comece com o assunto principal do seu blog. A IA irá sugerir títulos atraentes.</p>
                    <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Os benefícios da inteligência artificial para pequenas empresas" className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                    <button onClick={handleGenerateTitles} disabled={isLoading || !topic} className="mt-4 w-full bg-brand-primary hover:bg-brand-dark font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                        {isLoading ? <LoadingSpinner /> : 'Gerar Títulos'}
                    </button>
                    {titles.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-300 mb-2">Escolha um título ou edite o seu favorito:</h4>
                            <div className="space-y-2">
                                {titles.map((title, i) => (
                                    <button key={i} onClick={() => setSelectedTitle(title)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedTitle === title ? 'border-brand-primary bg-brand-primary/10' : 'border-transparent bg-base-300 hover:bg-base-300/50'}`}>
                                        {title}
                                    </button>
                                ))}
                            </div>
                            <input type="text" value={selectedTitle} onChange={e => setSelectedTitle(e.target.value)} className="mt-4 w-full p-3 bg-base-300 border border-gray-600 rounded-lg"/>
                            <button onClick={() => setStep(2)} disabled={!selectedTitle} className="mt-4 float-right bg-green-600 hover:bg-green-700 font-bold py-2 px-6 rounded-lg disabled:bg-gray-500">Próximo</button>
                        </div>
                    )}
                </div>
            );
            case 2: return (
                <div>
                    <h3 className="text-xl font-bold text-brand-light mb-2">Passo 2: Esboço do Conteúdo</h3>
                    <p className="text-gray-400 mb-4">Aqui está uma estrutura sugerida para o seu post. Sinta-se à vontade para ajustá-la.</p>
                    <div className="p-4 bg-base-300 rounded-lg mb-4">
                        <p className="text-sm text-gray-400">Título:</p>
                        <p className="font-semibold text-white">{selectedTitle}</p>
                    </div>
                    <button onClick={handleGenerateOutline} disabled={isLoading || outline.length > 0} className="mb-4 w-full bg-brand-primary hover:bg-brand-dark font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                        {isLoading ? <LoadingSpinner /> : 'Gerar Esboço'}
                    </button>
                    {outline.length > 0 && (
                        <div className="space-y-2 mb-6">
                            {outline.map((item, i) => (
                                <input key={i} type="text" value={item} onChange={(e) => {
                                    const newOutline = [...outline];
                                    newOutline[i] = e.target.value;
                                    setOutline(newOutline);
                                }} className="w-full p-2 bg-base-300 border border-gray-600 rounded-lg"/>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between">
                        <button onClick={() => setStep(1)} className="bg-gray-600 hover:bg-gray-700 font-bold py-2 px-6 rounded-lg">Voltar</button>
                        <button onClick={handleGeneratePost} disabled={isLoading || outline.length === 0} className="bg-green-600 hover:bg-green-700 font-bold py-3 px-6 rounded-lg disabled:bg-gray-500 flex items-center justify-center gap-2">
                             {isLoading ? <LoadingSpinner /> : 'Gerar Post Completo'}
                        </button>
                    </div>
                </div>
            );
            case 3: return (
                <div>
                    <h3 className="text-xl font-bold text-brand-light mb-2">Passo 3: Seu Post de Blog</h3>
                    <p className="text-gray-400 mb-4">Aqui está seu artigo completo. Revise, edite e copie quando estiver pronto.</p>
                     <div className="p-4 bg-base-300 rounded-lg mb-4">
                        <h4 className="text-2xl font-bold text-white mb-4">{selectedTitle}</h4>
                        {isLoading && !fullPost && <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}
                        <textarea value={fullPost} onChange={(e) => setFullPost(e.target.value)} className="w-full h-[50vh] p-3 bg-base-100 border border-gray-600 rounded-lg resize-y"/>
                    </div>
                    <div className="flex justify-between">
                        <button onClick={resetWorkflow} className="bg-gray-600 hover:bg-gray-700 font-bold py-2 px-6 rounded-lg">Começar de Novo</button>
                        <button onClick={() => navigator.clipboard.writeText(fullPost)} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-6 rounded-lg">Copiar Texto</button>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Fluxo de Trabalho de Postagem de Blog</h2>
                <p className="text-gray-400">Fluxo de trabalho passo a passo para gerar uma postagem de blog inteira, do título ao conteúdo final.</p>
            </div>
            
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="mb-8">
                    <StepIndicator />
                </div>
                {error && <div className="my-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
                {renderStepContent()}
            </div>
        </div>
    );
};

export default BlogPostWorkflow;
