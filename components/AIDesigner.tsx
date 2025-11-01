import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { DesignerIcon, UploadIcon, VideoIcon } from './Icons';

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

const designLoadingMessages = [
    "Consultando arquitetos de IA...",
    "Esboçando novas possibilidades...",
    "Aplicando texturas e materiais...",
    "Harmonizando cores e luzes...",
];

const videoLoadingMessages = [
    "Construindo a planta 3D...",
    "Aplicando texturas e iluminação fotorrealista...",
    "Renderizando sua tour virtual imersiva...",
    "Calculando os movimentos da câmera cinematográfica...",
    "Dando os toques finais na sua experiência 3D...",
];


const AIDesigner: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ file: File; url: string; base64: string } | null>(null);
    const [currentDesign, setCurrentDesign] = useState<{ url: string; base64: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const [isLoadingDesign, setIsLoadingDesign] = useState(false);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, []);
    
    useEffect(() => {
        let interval: number;
        if (isLoadingDesign) {
            setLoadingMessage(designLoadingMessages[0]);
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const messages = designLoadingMessages;
                    const nextIndex = (messages.indexOf(prev) + 1) % messages.length;
                    return messages[nextIndex];
                });
            }, 2500);
        } else if (isLoadingVideo) {
             setLoadingMessage(videoLoadingMessages[0]);
             interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const messages = videoLoadingMessages;
                    const nextIndex = (messages.indexOf(prev) + 1) % messages.length;
                    return messages[nextIndex];
                });
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isLoadingDesign, isLoadingVideo]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        } else {
            setError("A funcionalidade de seleção de chave de API não está disponível.");
        }
    };
    
    const handleFileSelect = async (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setError(null);
            const url = URL.createObjectURL(file);
            const base64 = await fileToBase64(file);
            setOriginalImage({ file, url, base64 });
            setCurrentDesign(null);
            setVideoUrl(null);
            setPrompt('');
        } else if (file) {
            setError("Por favor, selecione um arquivo de imagem válido.");
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setDragOver(false);
        handleFileSelect(e.dataTransfer.files?.[0] || null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setDragOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setDragOver(false);
    };

    const handleGenerateDesign = useCallback(async () => {
        const source = currentDesign ?? originalImage;
        if (!prompt || !source) return;

        setIsLoadingDesign(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: source.base64, mimeType: (source as any).file?.type || 'image/png' } },
                        { text: `Redesenhe este espaço de acordo com a seguinte instrução, mantendo a estrutura geral, mas alterando o estilo, móveis e decoração: "${prompt}"` },
                    ],
                },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const part = response.candidates?.[0]?.content?.parts?.[0];
            if (part?.inlineData) {
                const base64 = part.inlineData.data;
                const url = `data:image/png;base64,${base64}`;
                setCurrentDesign({ url, base64 });
            } else {
                 throw new Error("Não foi possível gerar o design. Tente uma descrição diferente.");
            }
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o design. Tente novamente.');
        } finally {
            setIsLoadingDesign(false);
        }
    }, [prompt, originalImage, currentDesign]);
    
     const handleGenerateVideo = useCallback(async () => {
        if (!currentDesign) return;
        
        if (!apiKeySelected) {
            handleSelectKey();
            return;
        }

        setIsLoadingVideo(true);
        setError(null);
        setVideoUrl(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const videoPrompt = `Crie uma tour virtual 3D cinematográfica e imersiva deste espaço interior. A câmera deve se mover suavemente pela sala, mostrando-a de diferentes ângulos para dar uma sensação de realidade virtual. A qualidade deve ser alta e a iluminação realista.`;

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: videoPrompt,
                image: { imageBytes: currentDesign.base64, mimeType: 'image/png' },
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                 const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                 const blob = await videoResponse.blob();
                 setVideoUrl(URL.createObjectURL(blob));
            } else {
                throw new Error("Falha ao obter o link de download do vídeo.");
            }

        } catch (err: any) {
            console.error(err);
            let errorMessage = 'Ocorreu um erro ao gerar o vídeo. Tente novamente.';
             if (err.message && err.message.includes("Requested entity was not found.")) {
                errorMessage = "Chave de API inválida. Por favor, selecione uma chave de API válida.";
                setApiKeySelected(false);
            }
            setError(errorMessage);
        } finally {
            setIsLoadingVideo(false);
        }
    }, [currentDesign, apiKeySelected]);

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Designer de Interiores com IA</h2>
                <p className="text-gray-400">Tire uma foto e redesenhe seu interior em segundos. Carregue uma foto do seu quarto, jardim ou qualquer espaço e deixe a IA fazer o resto.</p>
            </div>
            
            {!originalImage && (
                 <div 
                    onDrop={handleDrop} 
                    onDragOver={handleDragOver} 
                    onDragLeave={handleDragLeave}
                    className={`flex-1 bg-base-200 p-6 rounded-xl shadow-lg border-4 border-dashed flex flex-col justify-center items-center text-center text-gray-500 transition-colors ${dragOver ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600'}`}
                >
                    <UploadIcon className="w-24 h-24 mx-auto text-gray-600 mb-4"/>
                    <p className="font-semibold text-lg">Arraste e solte uma foto do seu espaço aqui</p>
                    <p className="mb-4">ou</p>
                    <label className="bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                        Selecione um Arquivo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} />
                    </label>
                </div>
            )}
            
            {originalImage && (
                <>
                <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <textarea 
                            value={prompt} 
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: Faça este quarto parecer moderno e minimalista com cores neutras e madeira clara"
                            className="w-full h-24 md:h-auto md:flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
                            disabled={isLoadingDesign || isLoadingVideo}
                        />
                         <button 
                            onClick={handleGenerateDesign} 
                            disabled={!prompt || isLoadingDesign || isLoadingVideo}
                            className="w-full md:w-auto bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-500 transition-all"
                        >
                            {currentDesign ? 'Refinar Design' : 'Gerar Design'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex flex-col overflow-hidden">
                    {videoUrl ? (
                         <div className="h-full flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-brand-light mb-4">Sua Tour Virtual 3D</h3>
                             <video src={videoUrl} controls autoPlay loop className="max-h-[80%] max-w-full object-contain rounded-lg shadow-2xl animate-fade-in"/>
                             <button onClick={() => setVideoUrl(null)} className="mt-4 bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg">Voltar ao Design</button>
                         </div>
                    ) : isLoadingVideo ? (
                         <div className="flex-1 flex flex-col justify-center items-center text-center">
                            <div className="animate-pulse-fast rounded-full h-16 w-16 bg-brand-primary/50 mx-auto mb-4 flex items-center justify-center">
                               <VideoIcon className="w-8 h-8 text-brand-light"/>
                            </div>
                            <p className="text-gray-300 font-semibold text-lg">{loadingMessage}</p>
                            <p className="text-gray-500 text-sm mt-2 max-w-md">Converta seus projetos de interiores gerados por IA em impressionantes vídeos 3D. Experimente seu espaço de todos os ângulos com tours virtuais dinâmicos que dão vida à sua visão.</p>
                         </div>
                    ) : (
                         <>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-brand-light">Visualização do Design</h3>
                            {currentDesign && (
                                <button onClick={handleGenerateVideo} disabled={isLoadingDesign} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 transition-all flex items-center gap-2">
                                    <VideoIcon className="w-5 h-5"/>
                                    Criar Vídeo 3D
                                </button>
                            )}
                         </div>
                         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                            <div className="flex flex-col items-center p-2 bg-base-300/50 rounded-lg overflow-hidden">
                                <h4 className="text-lg font-semibold text-gray-400 mb-2">Original</h4>
                                <img src={originalImage.url} alt="Original" className="w-full h-full object-contain rounded-lg"/>
                            </div>
                             <div className="flex flex-col items-center p-2 bg-base-300/50 rounded-lg overflow-hidden">
                                <h4 className="text-lg font-semibold text-gray-400 mb-2">Design da IA</h4>
                                <div className="w-full h-full flex items-center justify-center">
                                    {isLoadingDesign && (
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-light mx-auto"></div>
                                            <p className="text-gray-400 mt-2">{loadingMessage}</p>
                                        </div>
                                    )}
                                    {currentDesign && !isLoadingDesign && <img src={currentDesign.url} alt="Design da IA" className="w-full h-full object-contain rounded-lg animate-fade-in"/>}
                                    {!currentDesign && !isLoadingDesign && <p className="text-gray-500 italic text-center">Seu novo design aparecerá aqui...</p>}
                                </div>
                            </div>
                         </div>
                         </>
                    )}
                     {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm self-center">{error}</div>}
                </div>
                </>
            )}
        </div>
    )
}

export default AIDesigner;