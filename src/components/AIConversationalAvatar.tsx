import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ConversationalAvatarIcon, UploadIcon } from './Icons';

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

type VoiceStyle = 'masculine_professional' | 'feminine_friendly' | 'neutral_clear';

const KeySelectionScreen: React.FC<{ onKeySelect: () => void; error?: string | null }> = ({ onKeySelect, error }) => (
    <div className="h-full flex flex-col justify-center items-center text-center bg-base-200 p-6 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bold text-brand-light mb-4">Chave de API Necessária</h2>
        {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm mb-4 max-w-md">{error}</div>}
        <p className="text-gray-400 max-w-md mb-6">
            Para usar o Avatar Falante IA, você precisa selecionar uma chave de API do Google Cloud. O uso será associado à sua conta para cobrança e gerenciamento de cotas.
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

const AIConversationalAvatar: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [hasSelectedKey, setHasSelectedKey] = useState(false);

    const [avatarPhoto, setAvatarPhoto] = useState<{ file: File, url: string, base64: string } | null>(null);
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
    
    const handlePhotoSelect = async (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setError(null);
            const url = URL.createObjectURL(file);
            const base64 = await fileToBase64(file);
            setAvatarPhoto({ file, url, base64 });
        } else if (file) {
            setError("Por favor, selecione um arquivo de imagem válido.");
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setDragOver(false);
        handlePhotoSelect(e.dataTransfer.files?.[0] || null);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setDragOver(false);
    };

    const handleGenerateVideo = useCallback(async () => {
        if (!script || !avatarPhoto || isLoading) return;

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

            const finalPrompt = `Crie um vídeo de um "talking head" (cabeça falante). A pessoa na imagem fornecida deve parecer estar falando o seguinte roteiro: "${script}". A voz do avatar deve ser ${voiceDescription}. Sincronize os movimentos labiais e as expressões faciais com o roteiro. O vídeo deve ser focado no rosto da pessoa, com um fundo neutro.`;

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: finalPrompt,
                image: { imageBytes: avatarPhoto.base64, mimeType: avatarPhoto.file.type },
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
    }, [script, avatarPhoto, selectedVoice, isLoading]);
    
    if (!hasSelectedKey) {
        return <KeySelectionScreen onKeySelect={handleSelectKey} error={error} />;
    }

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
             <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Avatar Falante IA</h2>
                <p className="text-gray-400 mb-6">Dê vida a qualquer retrato. Carregue uma foto, escreva um roteiro e crie um vídeo de um avatar falante.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left Column: Image Upload */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg text-brand-light">1. Carregue o Rosto do Avatar</h3>
                        <div 
                            onDrop={handleDrop} 
                            onDragOver={handleDragOver} 
                            onDragLeave={handleDragLeave}
                            className={`w-full aspect-square border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center text-gray-500 transition-colors relative ${dragOver ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600'}`}
                        >
                            {avatarPhoto ? (
                                <>
                                    <img src={avatarPhoto.url} alt="Avatar" className="w-full h-full object-cover rounded-xl"/>
                                    <button onClick={() => setAvatarPhoto(null)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 leading-none text-xl">&times;</button>
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="w-16 h-16 text-gray-600 mb-2"/>
                                    <p className="font-semibold">Arraste e solte uma foto</p>
                                    <p className="text-sm">ou</p>
                                    <label className="mt-2 bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors text-sm">
                                        Selecione um Arquivo
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect(e.target.files?.[0] || null)} />
                                    </label>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Right Column: Script and Generate */}
                    <div className="flex flex-col gap-4 h-full">
                         <div>
                             <h3 className="font-semibold text-lg text-brand-light mb-2">2. Escreva o Roteiro</h3>
                             <textarea 
                                value={script} 
                                onChange={(e) => setScript(e.target.value)} 
                                placeholder="Escreva aqui o que seu avatar vai dizer..."
                                className="w-full h-32 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
                            />
                         </div>
                         <div>
                            <h3 className="font-semibold text-lg text-brand-light mb-2">3. Selecione uma Voz</h3>
                             <div className="space-y-2">
                                <button onClick={() => setSelectedVoice('feminine_friendly')} className={`w-full text-left p-2 rounded-lg text-sm font-semibold transition-colors ${selectedVoice === 'feminine_friendly' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>Voz Feminina Amigável</button>
                                <button onClick={() => setSelectedVoice('masculine_professional')} className={`w-full text-left p-2 rounded-lg text-sm font-semibold transition-colors ${selectedVoice === 'masculine_professional' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>Voz Masculina Profissional</button>
                                <button onClick={() => setSelectedVoice('neutral_clear')} className={`w-full text-left p-2 rounded-lg text-sm font-semibold transition-colors ${selectedVoice === 'neutral_clear' ? 'bg-brand-primary text-white' : 'bg-base-300'}`}>Voz Neutra e Clara</button>
                             </div>
                         </div>
                         <button onClick={handleGenerateVideo} disabled={!script || !avatarPhoto || isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-500 transition-transform transform hover:scale-105 mt-auto">
                            {isLoading ? "Gerando Vídeo..." : "Gerar Vídeo"}
                         </button>
                    </div>
                </div>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>
            
             <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center min-h-0">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-pulse-fast rounded-full h-16 w-16 bg-brand-primary/50 mx-auto mb-4 flex items-center justify-center">
                           <ConversationalAvatarIcon className="w-8 h-8 text-brand-light"/>
                        </div>
                        <p className="text-gray-300 font-semibold text-lg">Ensinando seu avatar a falar...</p>
                        <p className="text-gray-500 text-sm mt-2">A criação do seu vídeo pode levar alguns minutos.</p>
                    </div>
                )}
                 {error && !isLoading && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {videoUrl && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
                        <video src={videoUrl} controls autoPlay loop className="max-h-[85%] max-w-full object-contain rounded-lg shadow-2xl"/>
                        <a 
                            href={videoUrl} 
                            download="avatar-falante-ia.mp4" 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Baixar Vídeo
                        </a>
                    </div>
                )}
                {!videoUrl && !isLoading && !error && (
                    <div className="text-center text-gray-500 italic">
                        <ConversationalAvatarIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        O vídeo do seu avatar falante aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIConversationalAvatar;
