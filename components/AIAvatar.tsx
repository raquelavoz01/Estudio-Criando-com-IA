import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AIAvatarIcon, UploadIcon } from './Icons';

type AvatarState = 'training' | 'ready';

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
            Para usar o Avatar IA, você precisa selecionar uma chave de API do Google Cloud. O uso será associado à sua conta para cobrança e gerenciamento de cotas.
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


const AIAvatar: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [hasSelectedKey, setHasSelectedKey] = useState(false);

    const [avatarState, setAvatarState] = useState<AvatarState>('training');
    const [refPhoto, setRefPhoto] = useState<{ file: File, url: string, base64: string } | null>(null);
    const [refVideo, setRefVideo] = useState<{ file: File, url: string } | null>(null);
    const [script, setScript] = useState('');
    
    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setHasSelectedKey(true);
            }
        };
        checkApiKey();
        
        const savedAvatar = localStorage.getItem('my-ai-avatar-photo');
        if (savedAvatar) {
            setRefPhoto({ file: new File([], ""), url: savedAvatar, base64: savedAvatar.split(',')[1] });
            setAvatarState('ready');
        }
    }, []);
    
    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setHasSelectedKey(true);
            setError(null);
        }
    };
    
    const handlePhotoSelect = async (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            const base64 = await fileToBase64(file);
            const dataUrl = `data:${file.type};base64,${base64}`;
            setRefPhoto({ file, url: dataUrl, base64 });
        }
    };

    const handleVideoSelect = async (file: File | null) => {
        if (file && file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            setRefVideo({ file, url });
        }
    };

    const handleTrainAvatar = () => {
        if (refPhoto) {
            setIsLoading(true);
            setTimeout(() => { // Simulate training time
                localStorage.setItem('my-ai-avatar-photo', refPhoto.url);
                setAvatarState('ready');
                setIsLoading(false);
            }, 1500);
        }
    };

    const handleRetrain = () => {
        localStorage.removeItem('my-ai-avatar-photo');
        setAvatarState('training');
        setRefPhoto(null);
        setRefVideo(null);
        setVideoUrl(null);
    };

    const handleGenerateVideo = useCallback(async () => {
        if (!script || !refPhoto || isLoading) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const finalPrompt = `Crie um vídeo de um avatar de IA, também conhecido como gêmeo digital. 
            A pessoa na imagem de referência deve parecer estar falando o seguinte roteiro de forma natural: "${script}". 
            O vídeo deve focar no rosto da pessoa, com movimentos labiais e expressões faciais realistas sincronizados com o roteiro.
            O fundo deve ser neutro, como um escritório moderno ou um estúdio.`;

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: finalPrompt,
                image: { imageBytes: refPhoto.base64, mimeType: refPhoto.file.type || 'image/png' },
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
            if (err.message?.includes("Requested entity was not found")) {
                setError("A chave de API selecionada é inválida. Por favor, selecione uma chave de API válida.");
                setHasSelectedKey(false);
            } else {
                setError('Falha ao gerar o vídeo. Verifique se sua chave de API está configurada corretamente e tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [script, refPhoto, isLoading]);

    if (!hasSelectedKey) {
        return <KeySelectionScreen onKeySelect={handleSelectKey} error={error} />;
    }

    const renderTrainingView = () => (
        <div className="bg-base-200 p-6 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-xl font-bold mb-2 text-brand-light">Treine seu Avatar IA</h2>
            <p className="text-gray-400 mb-6">Envie seus materiais de referência para criar seu gêmeo digital.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-brand-light">1. Foto de Rosto (Obrigatório)</h3>
                    <p className="text-xs text-gray-500">Envie uma foto frontal clara do seu rosto.</p>
                    <label className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center text-gray-500 cursor-pointer hover:border-brand-primary bg-base-300">
                        {refPhoto ? <img src={refPhoto.url} className="h-full w-full object-cover rounded-xl"/> : <><UploadIcon className="w-10 h-10 mb-2"/><span>Carregar Foto</span></>}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect(e.target.files?.[0] || null)} />
                    </label>
                </div>
                 <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-brand-light">2. Vídeo de Referência (Opcional)</h3>
                    <p className="text-xs text-gray-500">Envie um vídeo curto (10-15s) falando para referência de maneirismos.</p>
                    <label className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center text-gray-500 cursor-pointer hover:border-brand-primary bg-base-300">
                         {refVideo ? <video src={refVideo.url} className="h-full w-full object-cover rounded-xl"/> : <><UploadIcon className="w-10 h-10 mb-2"/><span>Carregar Vídeo</span></>}
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoSelect(e.target.files?.[0] || null)} />
                    </label>
                </div>
            </div>
            <button onClick={handleTrainAvatar} disabled={!refPhoto || isLoading} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500">
                {isLoading ? "Treinando..." : "Treinar Avatar"}
            </button>
        </div>
    );

    const renderReadyView = () => (
         <div className="bg-base-200 p-6 rounded-xl shadow-lg animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-brand-light">Criar Vídeo com Avatar</h2>
                <button onClick={handleRetrain} className="text-sm text-brand-secondary hover:underline">Retreinar Avatar</button>
            </div>
             <p className="text-gray-400 mb-6">Seu avatar está pronto. Escreva o roteiro e gere seu vídeo.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center">
                    <h3 className="font-semibold text-brand-light mb-2">Avatar Treinado</h3>
                    {refPhoto && <img src={refPhoto.url} alt="Avatar" className="w-48 h-48 object-cover rounded-full shadow-lg border-4 border-brand-primary"/>}
                </div>
                <div className="md:col-span-2 flex flex-col gap-4">
                     <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder="Escreva o roteiro do seu avatar aqui..." className="w-full flex-1 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none" rows={8}/>
                     <button onClick={handleGenerateVideo} disabled={!script || isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500">
                        {isLoading ? "Gerando Vídeo..." : "Gerar Vídeo"}
                     </button>
                </div>
             </div>
        </div>
    );
    
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            {avatarState === 'training' ? renderTrainingView() : renderReadyView()}
            
             <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center min-h-0">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-pulse-fast rounded-full h-16 w-16 bg-brand-primary/50 mx-auto mb-4 flex items-center justify-center">
                           <AIAvatarIcon className="w-8 h-8 text-brand-light"/>
                        </div>
                        <p className="text-gray-300 font-semibold text-lg">Renderizando seu gêmeo digital...</p>
                        <p className="text-gray-500 text-sm mt-2">A criação do seu vídeo pode levar alguns minutos.</p>
                    </div>
                )}
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {videoUrl && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
                        <video src={videoUrl} controls autoPlay loop className="max-h-[85%] max-w-full object-contain rounded-lg shadow-2xl"/>
                        <a 
                            href={videoUrl} 
                            download="avatar-ia.mp4" 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Baixar Vídeo
                        </a>
                    </div>
                )}
                {!videoUrl && !isLoading && !error && (
                    <div className="text-center text-gray-500 italic">
                        <AIAvatarIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O vídeo do seu avatar aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIAvatar;