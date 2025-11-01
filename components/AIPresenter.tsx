import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { PresenterIcon, UploadIcon } from './Icons';

type VoiceStyle = 'masculine_professional' | 'feminine_friendly' | 'neutral_clear';

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

const KeySelectionScreen: React.FC<{ onKeySelect: () => void; error?: string | null }> = ({ onKeySelect, error }) => (
    <div className="h-full flex flex-col justify-center items-center text-center bg-base-200 p-6 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bold text-brand-light mb-4">Chave de API Necessária</h2>
        {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm mb-4 max-w-md">{error}</div>}
        <p className="text-gray-400 max-w-md mb-6">
            Para usar o Apresentador IA, você precisa selecionar uma chave de API do Google Cloud. O uso será associado à sua conta para cobrança e gerenciamento de cotas.
        </p>
        <button
            onClick={onKeySelect}
            className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
            Selecionar Chave de API
        </button>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-brand-light mt-4 underline">
            Saiba mais sobre a cobrança
        </a>
    </div>
);


const AIPresenter: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [hasSelectedKey, setHasSelectedKey] = useState(false);

    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
    const [script, setScript] = useState('');
    const [selectedVoice, setSelectedVoice] = useState<VoiceStyle>('feminine_friendly');
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setHasSelectedKey(true);
            }
        };
        checkApiKey();
    }, []);
    
    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setHasSelectedKey(true);
            setError(null);
        }
    };

    const handleFileSelect = (file: File | null) => {
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Por favor, selecione um arquivo de imagem.");
                return;
            }
            setError(null);
            setProductImageFile(file);
            setProductImageUrl(URL.createObjectURL(file));
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
        if (!script || !productImageFile || isLoading) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await fileToBase64(productImageFile);

            const voiceDescription = {
                'masculine_professional': 'uma voz masculina profunda e profissional',
                'feminine_friendly': 'uma voz feminina amigável e calorosa',
                'neutral_clear': 'uma voz de gênero neutro, clara e informativa'
            }[selectedVoice];

            const finalPrompt = `Crie um vídeo de marketing envolvente, ideal para anúncios no TikTok e Instagram. 
            Neste vídeo, um apresentador de IA carismático e com aparência humana apresenta o produto na imagem. 
            O roteiro do apresentador é: "${script}". 
            A voz do apresentador deve ser ${voiceDescription}.
            O vídeo deve ser dinâmico, moderno e focado no produto.`;

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: finalPrompt,
                image: { imageBytes: base64Data, mimeType: productImageFile.type },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '9:16' // Portrait for social media
                }
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
            if (err.message?.includes("Requested entity was not found")) {
                setError("A chave de API selecionada é inválida. Por favor, selecione uma chave de API válida.");
                setHasSelectedKey(false);
            } else {
                setError('Falha ao gerar o vídeo. Verifique se sua chave de API está configurada corretamente e tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [script, productImageFile, selectedVoice, isLoading]);

    if (!hasSelectedKey) {
        return <KeySelectionScreen onKeySelect={handleSelectKey} error={error} />;
    }
    
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Apresentador IA</h2>
                <p className="text-gray-400 mb-6">Transforme seus produtos em vídeos de marketing virais. Carregue uma imagem, escreva um roteiro e deixe a IA apresentar.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Step 1: Upload */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-brand-light mb-2 border-b-2 border-brand-primary/50 pb-2">1. Carregar Produto</h3>
                        {productImageUrl ? (
                             <div className="mt-2 relative">
                                <img src={productImageUrl} alt="Produto" className="w-full h-40 object-cover rounded-lg"/>
                                <button onClick={() => { setProductImageUrl(null); setProductImageFile(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">&times;</button>
                             </div>
                        ) : (
                            <div 
                                onDrop={handleDrop} 
                                onDragOver={handleDragOver} 
                                onDragLeave={handleDragLeave}
                                className={`mt-2 w-full h-40 border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center text-gray-500 transition-colors ${dragOver ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600'}`}
                            >
                                <UploadIcon className="w-12 h-12 text-gray-600 mb-2"/>
                                <p className="text-sm">Arraste e solte</p>
                                <p className="text-xs mb-2">ou</p>
                                <label className="bg-base-300 hover:bg-brand-dark text-white font-bold py-1 px-3 rounded-lg cursor-pointer text-sm">
                                    Selecione
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Script */}
                    <div className="flex flex-col">
                         <h3 className="text-lg font-semibold text-brand-light mb-2 border-b-2 border-brand-primary/50 pb-2">2. Escrever Roteiro</h3>
                         <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Ex: Descubra nosso novo produto incrível! Ele vai revolucionar sua rotina..."
                            className="mt-2 w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all resize-none"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Step 3: Voice & Generate */}
                     <div className="flex flex-col">
                         <h3 className="text-lg font-semibold text-brand-light mb-2 border-b-2 border-brand-primary/50 pb-2">3. Selecionar Voz</h3>
                         <div className="mt-2 space-y-2">
                            <button onClick={() => setSelectedVoice('feminine_friendly')} className={`w-full text-left p-2 rounded-lg text-sm font-semibold transition-colors ${selectedVoice === 'feminine_friendly' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>Voz Feminina Amigável</button>
                            <button onClick={() => setSelectedVoice('masculine_professional')} className={`w-full text-left p-2 rounded-lg text-sm font-semibold transition-colors ${selectedVoice === 'masculine_professional' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>Voz Masculina Profissional</button>
                            <button onClick={() => setSelectedVoice('neutral_clear')} className={`w-full text-left p-2 rounded-lg text-sm font-semibold transition-colors ${selectedVoice === 'neutral_clear' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>Voz Neutra e Clara</button>
                         </div>
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading || !script || !productImageFile}
                            className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                            {isLoading ? 'Gerando...' : 'Gerar Vídeo'}
                        </button>
                    </div>
                </div>
            </div>

             <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center min-h-0">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-pulse-fast rounded-full h-16 w-16 bg-brand-primary/50 mx-auto mb-4 flex items-center justify-center">
                           <PresenterIcon className="w-8 h-8 text-brand-light"/>
                        </div>
                        <p className="text-gray-300 font-semibold text-lg">Ajustando luzes, câmera, IA...</p>
                        <p className="text-gray-500 text-sm mt-2">A criação do seu vídeo pode levar alguns minutos.</p>
                    </div>
                )}
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {videoUrl && (
                     <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
                        <video src={videoUrl} controls autoPlay loop className="max-h-[85%] max-w-full object-contain rounded-lg shadow-2xl"/>
                        <a 
                            href={videoUrl} 
                            download="apresentador-ia.mp4" 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Baixar Vídeo
                        </a>
                    </div>
                )}
                {!videoUrl && !isLoading && !error && (
                    <div className="text-center text-gray-500 italic">
                        <PresenterIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Seu vídeo com apresentador IA aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIPresenter;