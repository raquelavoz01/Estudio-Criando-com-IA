import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { PhotoStudioIcon, UploadIcon } from './Icons';

const loadingMessages = [
    "Ajustando o foco da IA...",
    "Configurando a iluminação do estúdio virtual...",
    "Revelando sua foto digital...",
    "Aguarde, a IA está dizendo 'xis'...",
    "Capturando o momento perfeito...",
];

type StudioState = 'training' | 'generation';
type Selfie = { file: File, url: string, base64: string };

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // remove the header
        };
        reader.onerror = error => reject(error);
    });
};

const AIPhotoStudio: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

    const [studioState, setStudioState] = useState<StudioState>('training');
    const [selfies, setSelfies] = useState<Array<Selfie | null>>(Array(4).fill(null));
    const [prompt, setPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        const savedSelfies = localStorage.getItem('my-ai-photo-studio-selfies');
        if (savedSelfies) {
            const parsedSelfies: Selfie[] = JSON.parse(savedSelfies);
            const newSelfies = [...parsedSelfies, ...Array(4 - parsedSelfies.length).fill(null)];
            setSelfies(newSelfies);
            setStudioState('generation');
        }
    }, []);

    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);
    
    const handleSelfieSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        setError(null);
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if(validFiles.length === 0) {
            setError("Nenhum arquivo de imagem válido selecionado.");
            return;
        }

        const newSelfies = [...selfies];
        let filledCount = 0;
        for (let i = 0; i < newSelfies.length && filledCount < validFiles.length; i++) {
            if(newSelfies[i] === null) {
                const file = validFiles[filledCount];
                const url = URL.createObjectURL(file);
                const base64 = await fileToBase64(file);
                newSelfies[i] = { file, url, base64 };
                filledCount++;
            }
        }
        setSelfies(newSelfies);
    };

    const handleCreateModel = () => {
        const uploadedSelfies = selfies.filter((s): s is Selfie => s !== null);
        if (uploadedSelfies.length < 2) {
            setError("Por favor, carregue pelo menos 2 selfies.");
            return;
        }
        localStorage.setItem('my-ai-photo-studio-selfies', JSON.stringify(uploadedSelfies));
        setStudioState('generation');
    };

    const handleRetrain = () => {
        localStorage.removeItem('my-ai-photo-studio-selfies');
        setStudioState('training');
        setSelfies(Array(4).fill(null));
        setGeneratedImageUrl(null);
        setError(null);
    };

    const handleGeneratePhoto = useCallback(async () => {
        const uploadedSelfies = selfies.filter((s): s is Selfie => s !== null);
        if (!prompt || uploadedSelfies.length === 0 || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const parts = [
                ...uploadedSelfies.map(selfie => ({
                    inlineData: { mimeType: selfie.file.type, data: selfie.base64 }
                })),
                { text: `Com base nas selfies fornecidas como referência de rosto, gere uma foto nova e fotorrealista. A foto deve corresponder a esta descrição: "${prompt}"` }
            ];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const part = response.candidates?.[0]?.content?.parts?.[0];
            if (part?.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const url = `data:image/png;base64,${base64ImageBytes}`;
                setGeneratedImageUrl(url);
            } else {
                 throw new Error("Nenhuma imagem foi gerada. Tente uma descrição diferente.");
            }

        } catch (err: any) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a foto. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, selfies, isLoading]);

    const renderTrainingView = () => (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold mb-2 text-brand-light">1. Crie seu Modelo de IA</h2>
            <p className="text-gray-400 mb-6">Carregue algumas selfies para ensinar à IA como você se parece. Dica: use fotos com boa iluminação e diferentes ângulos.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {selfies.map((selfie, index) => (
                    <div key={index} className="aspect-square bg-base-300 rounded-lg flex items-center justify-center">
                        <label className="w-full h-full cursor-pointer flex items-center justify-center">
                            {selfie ? (
                                <img src={selfie.url} alt={`Selfie ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <UploadIcon className="w-8 h-8 mx-auto mb-1" />
                                    <span className="text-sm">Carregar</span>
                                </div>
                            )}
                             <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleSelfieSelect(e.target.files)} />
                        </label>
                    </div>
                ))}
            </div>
            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm mb-4">{error}</div>}
            <button onClick={handleCreateModel} disabled={selfies.filter(s => s !== null).length < 2} className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-lg disabled:bg-gray-500 transition-colors">
                Criar Modelo
            </button>
        </div>
    );

    const renderGenerationView = () => (
         <div className="bg-base-200 p-6 rounded-xl shadow-lg animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-brand-light">2. Gere Fotos Incríveis</h2>
                <button onClick={handleRetrain} className="text-sm text-brand-secondary hover:underline">Retreinar Modelo</button>
            </div>
             <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                     <h3 className="font-semibold text-gray-400 mb-2">Seu Modelo</h3>
                     <div className="grid grid-cols-2 gap-2">
                        {selfies.filter((s): s is Selfie => s !== null).map((selfie, index) => (
                            <img key={index} src={selfie.url} alt={`Referência ${index}`} className="w-full aspect-square object-cover rounded-md"/>
                        ))}
                     </div>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                     <p className="text-gray-400 text-sm">Descreva a foto que você quer criar. Seja detalhado para melhores resultados!</p>
                     <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: foto de perfil profissional, terno, em um escritório moderno com plantas ao fundo" className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none" rows={4}/>
                     <button onClick={handleGeneratePhoto} disabled={!prompt || isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500">
                        {isLoading ? "Gerando..." : "Gerar Foto"}
                     </button>
                </div>
             </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            {studioState === 'training' ? renderTrainingView() : renderGenerationView()}
            
             <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex justify-center items-center overflow-hidden">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-pulse-fast rounded-full h-16 w-16 bg-brand-primary/50 mx-auto mb-4 flex items-center justify-center">
                           <PhotoStudioIcon className="w-8 h-8 text-brand-light"/>
                        </div>
                        <p className="text-gray-300 font-semibold text-lg">{loadingMessage}</p>
                    </div>
                )}
                {error && studioState === 'generation' && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {generatedImageUrl && (
                   <img src={generatedImageUrl} alt="Foto gerada por IA" className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-fade-in"/>
                )}
                {!generatedImageUrl && !isLoading && (
                    <div className="text-center text-gray-500 italic">
                        <PhotoStudioIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        A foto gerada aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIPhotoStudio;