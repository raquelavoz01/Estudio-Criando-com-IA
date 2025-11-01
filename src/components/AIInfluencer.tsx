import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { InfluencerIcon, UploadIcon } from './Icons';

type VoiceStyle = 'masculine_professional' | 'feminine_friendly' | 'neutral_clear';
type CreationMode = 'generate' | 'upload';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
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
            Para usar o Influenciador IA, você precisa selecionar uma chave de API do Google Cloud. O uso será associado à sua conta para cobrança e gerenciamento de cotas.
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

const AIInfluencer: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [hasSelectedKey, setHasSelectedKey] = useState(false);
    
    const [creationMode, setCreationMode] = useState<CreationMode>('generate');
    const [imagePrompt, setImagePrompt] = useState('');
    const [influencerImageFile, setInfluencerImageFile] = useState<File | null>(null);
    const [influencerImageUrl, setInfluencerImageUrl] = useState<string | null>(null);
    const [influencerImageBase64, setInfluencerImageBase64] = useState<string | null>(null);
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

    const handleFileSelect = async (file: File | null) => {
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Por favor, selecione um arquivo de imagem.");
                return;
            }
            setError(null);
            setInfluencerImageFile(file);
            setInfluencerImageUrl(URL.createObjectURL(file));
            const base64 = await fileToBase64(file);
            setInfluencerImageBase64(base64);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files?.[0] || null);
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

    const handleGenerateImage = async () => {
        if (!imagePrompt) return;
        setIsGeneratingImage(true);
        setError(null);
        setInfluencerImageUrl(null);
        setInfluencerImageBase64(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: imagePrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            setInfluencerImageBase64(base64ImageBytes);
            setInfluencerImageUrl(`data:image/png;base64,${base64ImageBytes}`);
        } catch (err) {
            console.error(err);
            setError('Falha ao gerar imagem. Verifique se sua chave de API está configurada corretamente na Vercel e tente novamente.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleGenerateVideo = useCallback(async () => {
        if (!script || !influencerImageBase64 || isLoading) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const voiceDescription = {
                'masculine_professional': 'uma voz masculina profunda e profissional',
                'feminine_friendly': 'uma voz feminina amigável e calorosa',
                'neutral_clear': 'uma voz de gênero neutro, clara e informativa'
            }[selectedVoice];

            const finalPrompt = `Crie um vídeo de um influenciador de IA. A pessoa na imagem deve parecer estar falando o seguinte roteiro: "${script}". 
            A voz deve ser ${voiceDescription}. O vídeo deve ser focado no rosto da pessoa, com movimentos labiais e expressões faciais realistas.`;

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: finalPrompt,
                image: { imageBytes: influencerImageBase64, mimeType: influencerImageFile?.type || 'image/png' },
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
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
    }, [script, influencerImageBase64, influencerImageFile, selectedVoice, isLoading]);

    if (!hasSelectedKey) {
        return <KeySelectionScreen onKeySelect={handleSelectKey} error={error} />;
    }
    
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Influenciador IA</h2>
                <p className="text-gray-400 mb-6">Crie um influenciador virtual, escreva um roteiro e gere vídeos para suas redes sociais.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Step 1: Create Influencer */}
                    <div className="flex flex-col gap-4 bg-base-300/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-brand-light border-b-2 border-brand-primary/50 pb-2">1. Crie seu Influenciador</h3>
                        <div className="flex border border-base-300 rounded-lg p-1 bg-base-300/50">
                            <button onClick={() => setCreationMode('generate')} className={`w-1/2 py-2 rounded-md text-sm font-bold transition-colors ${creationMode === 'generate' ? 'bg-brand-primary text-white shadow' : 'text-gray-300'}`}>Gerar com IA</button>
                            <button onClick={() => setCreationMode('upload')} className={`w-1/2 py-2 rounded-md text-sm font-bold transition-colors ${creationMode === 'upload' ? 'bg-brand-primary text-white shadow' : 'text-gray-300'}`}>Carregar Foto</button>
                        </div>
                        {creationMode === 'generate' ? (
                            <div className="flex flex-col gap-2">
                                <input type="text" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="Ex: Influenciadora de moda, cabelo rosa..." className="w-full p-2 bg-base-300 border border-gray-600 rounded-lg" />
                                <button onClick={handleGenerateImage} disabled={isGeneratingImage || !imagePrompt} className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
                                    {isGeneratingImage ? 'Gerando Imagem...' : 'Gerar Imagem'}
                                </button>
                            </div>
                        ) : (
                             <label className="w-full h-24 border-2 border-dashed rounded-xl flex justify-center items-center text-center text-gray-500 cursor-pointer hover:border-brand-primary">
                                Carregar Imagem
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                        <div className="w-full h-48 bg-base-100 rounded-lg flex items-center justify-center">
                            {isGeneratingImage && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-light"></div>}
                            {influencerImageUrl && <img src={influencerImageUrl} alt="Influenciador" className="w-full h-full object-cover rounded-lg"/>}
                            {!influencerImageUrl && !isGeneratingImage && <p className="text-gray-500 text-sm">A imagem do influenciador aparecerá aqui</p>}
                        </div>
                    </div>

                     {/* Step 2: Create Content */}
                     <div className="flex flex-col gap-4 bg-base-300/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-brand-light border-b-2 border-brand-primary/50 pb-2">2. Crie o Conteúdo</h3>
                        <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder="Escreva o roteiro do vídeo aqui..." className="w-full flex-1 p-2 bg-base-300 border border-gray-600 rounded-lg resize-none" rows={4}/>
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-400">Selecione a Voz:</h4>
                            <button onClick={() => setSelectedVoice('feminine_friendly')} className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${selectedVoice === 'feminine_friendly' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>Voz Feminina Amigável</button>
                            <button onClick={() => setSelectedVoice('masculine_professional')} className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${selectedVoice === 'masculine_professional' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>Voz Masculina Profissional</button>
                        </div>
                        <button onClick={handleGenerateVideo} disabled={isLoading || !script || !influencerImageUrl} className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500">
                            {isLoading ? 'Gerando Vídeo...' : 'Gerar Vídeo do Influenciador'}
                        </button>
                    </div>
                </div>
            </div>

             <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center min-h-0">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-pulse-fast rounded-full h-16 w-16 bg-brand-primary/50 mx-auto mb-4 flex items-center justify-center">
                           <InfluencerIcon className="w-8 h-8 text-brand-light"/>
                        </div>
                        <p className="text-gray-300 font-semibold text-lg">Gravando o conteúdo viral...</p>
                        <p className="text-gray-500 text-sm mt-2">A criação do seu vídeo pode levar alguns minutos.</p>
                    </div>
                )}
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {videoUrl && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
                        <video src={videoUrl} controls autoPlay loop className="max-h-[85%] max-w-full object-contain rounded-lg shadow-2xl"/>
                        <a 
                            href={videoUrl} 
                            download="influenciador-ia.mp4" 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Baixar Vídeo
                        </a>
                    </div>
                )}
                {!videoUrl && !isLoading && !error && (
                    <div className="text-center text-gray-500 italic">
                        <InfluencerIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O vídeo do seu influenciador aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIInfluencer;
