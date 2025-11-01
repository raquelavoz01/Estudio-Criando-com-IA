import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { VirtualBackgroundIcon } from './Icons';

const loadingMessages = [
    "Procurando a localização perfeita...",
    "Configurando a iluminação virtual...",
    "Desenhando seu novo escritório...",
    "Renderizando sua paisagem dos sonhos...",
    "Adicionando os toques finais...",
];

const AIVirtualBackground: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

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

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;

        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const finalPrompt = `Crie um fundo virtual fotorrealista para videoconferências (Zoom, Google Meet). A imagem deve ter uma proporção de 16:9 (paisagem). O fundo deve ter uma aparência profissional, com boa iluminação e um leve desfoque de profundidade para parecer realista quando uma pessoa estiver na frente dele. A cena descrita é: "${prompt}".`;

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: finalPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '16:9',
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const url = `data:image/png;base64,${base64ImageBytes}`;
                setImageUrl(url);
            } else {
                throw new Error("Nenhuma imagem foi gerada. Tente uma descrição diferente.");
            }

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o fundo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Fundo Virtual IA</h2>
                <p className="text-gray-400 mb-4">Tenha uma aparência profissional em qualquer câmera. Descreva o seu fundo ideal e impressione seus colegas. Não é necessário *green screen*.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                     <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Um escritório em casa moderno e minimalista com uma planta e uma estante de livros"
                        className="flex-grow p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        {isLoading ? 'Gerando...' : 'Gerar Fundo'}
                    </button>
                </div>
                 {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex justify-center items-center overflow-hidden">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-pulse-fast rounded-full h-16 w-16 bg-brand-primary/50 mx-auto mb-4 flex items-center justify-center">
                           <VirtualBackgroundIcon className="w-8 h-8 text-brand-light"/>
                        </div>
                        <p className="text-gray-300 font-semibold text-lg">{loadingMessage}</p>
                    </div>
                )}
                {imageUrl && (
                    <img src={imageUrl} alt={prompt} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-fade-in"/>
                )}
                {!imageUrl && !isLoading && !error && (
                    <div className="text-center text-gray-500 italic">
                        <VirtualBackgroundIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Seu fundo virtual personalizado aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIVirtualBackground;
