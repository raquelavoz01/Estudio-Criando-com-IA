import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { HyperRealisticIcon, UploadIcon } from './Icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the header `data:image/png;base64,`
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const loadingMessages = [
    "Aprimorando para qualidade 4K...",
    "Calculando cada fóton de luz...",
    "Aplicando texturas de alta fidelidade...",
    "Renderizando em resolução ultra-alta...",
    "Polindo para perfeição cristalina...",
];

const AIHyperRealisticPhotos: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
    const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

     React.useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleFileSelect = (file: File | null) => {
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Por favor, selecione um arquivo de imagem.");
                return;
            }
            setError(null);
            setSourceImageFile(file);
            setSourceImageUrl(URL.createObjectURL(file));
            setResultImageUrl(null); // Clear previous result
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files?.[0] || null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files?.[0] || null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleGenerate = useCallback(async () => {
        if (!sourceImageFile) {
            setError('Por favor, carregue uma imagem para transformar.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImageUrl(null);
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await fileToBase64(sourceImageFile);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: sourceImageFile.type } },
                        { text: "Transforme esta imagem em uma obra-prima hiper-realista com qualidade de fotografia 4K. Foque em detalhes extremos: texturas de pele, reflexos de luz, nitidez de bordas e profundidade de campo. O resultado deve ser indistinguível de uma foto tirada com uma câmera DSLR de ponta e uma lente prime. Mantenha a composição e o sujeito originais, mas eleve o realismo ao nível máximo." },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const part = response.candidates?.[0]?.content?.parts?.[0];
            if (part?.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const url = `data:image/png;base64,${base64ImageBytes}`;
                setResultImageUrl(url);
            } else {
                 throw new Error("Não foi possível gerar a imagem. Tente novamente com uma foto diferente.");
            }
    
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao processar a imagem. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [sourceImageFile]);

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Fotos Hiper-realistas 4K</h2>
                <p className="text-gray-400 mb-4">Eleve suas fotos a um novo patamar. Transforme imagens comuns em obras-primas 4K ultra-realistas com detalhes impressionantes.</p>
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !sourceImageFile} 
                    className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    <HyperRealisticIcon className="w-5 h-5"/>
                    {isLoading ? 'Aprimorando...' : 'Aprimorar para 4K'}
                </button>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex justify-center items-center overflow-hidden">
                {!sourceImageUrl && (
                    <div 
                        onDrop={handleDrop} 
                        onDragOver={handleDragOver} 
                        onDragLeave={handleDragLeave}
                        className={`w-full h-full border-4 border-dashed rounded-xl flex flex-col justify-center items-center text-center text-gray-500 transition-colors ${dragOver ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600'}`}
                    >
                        <UploadIcon className="w-24 h-24 mx-auto text-gray-600 mb-4"/>
                        <p className="font-semibold text-lg">Arraste e solte uma foto aqui</p>
                        <p className="mb-4">ou</p>
                        <label className="bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                            Selecione um Arquivo
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                )}
                {sourceImageUrl && (
                    <div className="flex flex-col md:flex-row gap-4 w-full h-full justify-center items-center">
                        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-2 bg-base-300/50 rounded-lg h-full">
                            <h4 className="text-lg font-semibold text-gray-400 mb-2">Original</h4>
                            <img src={sourceImageUrl} alt="Imagem original" className="max-h-full max-w-full object-contain rounded-lg shadow-lg"/>
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-2 bg-base-300/50 rounded-lg h-full">
                             <h4 className="text-lg font-semibold text-gray-400 mb-2">Resultado 4K</h4>
                             <div className="w-full h-full flex items-center justify-center">
                                {isLoading && (
                                    <div className="text-center">
                                        <div className="animate-pulse-fast rounded-full h-16 w-16 bg-brand-primary/50 mx-auto mb-4 flex items-center justify-center">
                                           <HyperRealisticIcon className="w-8 h-8 text-brand-light"/>
                                        </div>
                                        <p className="text-gray-300 font-semibold text-lg">{loadingMessage}</p>
                                    </div>
                                )}
                                {resultImageUrl && <img src={resultImageUrl} alt="Imagem hiper-realista" className="max-h-full max-w-full object-contain rounded-lg shadow-lg animate-fade-in"/>}
                                {!resultImageUrl && !isLoading && <p className="text-gray-500 italic">O resultado aparecerá aqui...</p>}
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIHyperRealisticPhotos;
