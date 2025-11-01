
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ImageIcon, UploadIcon } from './Icons';

type ImageType = 'concept' | 'cover';
type StudioMode = 'generate' | 'edit';

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

const ImageStudio: React.FC = () => {
    // Shared state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<StudioMode>('generate');
    
    // Generate mode state
    const [prompt, setPrompt] = useState('');
    const [title, setTitle] = useState('');
    const [imageType, setImageType] = useState<ImageType>('concept');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    // Edit mode state
    const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
    const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = (file: File | null) => {
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Por favor, selecione um arquivo de imagem.");
                return;
            }
            setError(null);
            setSourceImageFile(file);
            setSourceImageUrl(URL.createObjectURL(file));
            setEditedImageUrl(null); // Clear previous result
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

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (mode === 'generate') setImageUrl(null);
        if (mode === 'edit') setEditedImageUrl(null);
    
        try {
            // FIX: Use process.env.API_KEY as per the guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
            if (mode === 'generate') {
                if (!prompt) {
                     setError('A descrição da arte é obrigatória.');
                     setIsLoading(false);
                     return;
                }
                 if (imageType === 'cover' && !title) {
                    setError('O título é obrigatório para criar uma capa.');
                    setIsLoading(false);
                    return;
                }
                
                const finalPrompt = imageType === 'cover'
                    ? `Capa de livro para Wattpad com o título "${title}" em destaque e legível. Descrição da arte: ${prompt}. Resolução 512x800.`
                    : prompt;
                const aspectRatio = imageType === 'cover' ? '9:16' : '16:9';
    
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: finalPrompt,
                    config: {
                        numberOfImages: 1,
                        outputMimeType: 'image/png',
                        aspectRatio: aspectRatio,
                    },
                });
    
                if (response.generatedImages && response.generatedImages.length > 0) {
                    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                    const url = `data:image/png;base64,${base64ImageBytes}`;
                    setImageUrl(url);
                } else {
                    throw new Error("Nenhuma imagem foi gerada.");
                }
    
            } else if (mode === 'edit') {
                if (!sourceImageFile) {
                    setError('Por favor, carregue uma imagem para editar.');
                    setIsLoading(false);
                    return;
                }
                 if (!editPrompt) {
                    setError('A descrição da edição é obrigatória.');
                    setIsLoading(false);
                    return;
                }
    
                const base64Data = await fileToBase64(sourceImageFile);
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [
                            { inlineData: { data: base64Data, mimeType: sourceImageFile.type } },
                            { text: editPrompt },
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
                    setEditedImageUrl(url);
                } else {
                     throw new Error("Nenhuma imagem foi editada.");
                }
            }
    
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao processar a imagem. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [mode, prompt, title, imageType, sourceImageFile, editPrompt]);

    const renderGenerateControls = () => (
        <div className="animate-fade-in">
            <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-sm font-semibold">Tipo de Imagem:</label>
                <div className="flex gap-4">
                    <button onClick={() => setImageType('concept')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${imageType === 'concept' ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300'}`}>
                        Arte Conceitual
                    </button>
                    <button onClick={() => setImageType('cover')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${imageType === 'cover' ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300'}`}>
                        Capa de Livro
                    </button>
                </div>
            </div>
            {imageType === 'cover' && (
                <div className="mb-4">
                    <label className="block text-gray-400 mb-2 text-sm font-semibold">Título do Livro:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: O Dragão de Gelo"
                        className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg"
                    />
                </div>
            )}
            <div>
                <label className="block text-gray-400 mb-2 text-sm font-semibold">Descrição da Arte:</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Um castelo de cristal no topo de uma montanha nevada, ao pôr do sol."
                    className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"
                />
            </div>
        </div>
    );

    const renderEditControls = () => (
        <div className="animate-fade-in flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
                <label className="block text-gray-400 mb-2 text-sm font-semibold">Imagem Original:</label>
                {sourceImageUrl ? (
                    <div className="relative">
                        <img src={sourceImageUrl} alt="Imagem para editar" className="w-full h-48 object-cover rounded-lg"/>
                        <button onClick={() => { setSourceImageUrl(null); setSourceImageFile(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 leading-none text-xl">&times;</button>
                    </div>
                ) : (
                    <div 
                        onDrop={handleDrop} 
                        onDragOver={handleDragOver} 
                        onDragLeave={handleDragLeave}
                        className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col justify-center items-center text-center text-gray-500 transition-colors ${dragOver ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600'}`}
                    >
                        <UploadIcon className="w-12 h-12 text-gray-600 mb-2"/>
                        <p>Arraste e solte</p>
                        <p className="text-sm mb-2">ou</p>
                        <label className="bg-base-300 hover:bg-brand-dark text-white font-bold py-1 px-3 rounded-lg cursor-pointer text-sm">
                            Selecione um Arquivo
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                )}
            </div>
            <div className="w-full md:w-1/2">
                <label className="block text-gray-400 mb-2 text-sm font-semibold">O que você quer mudar?</label>
                <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Ex: Adicione um dragão voando sobre o castelo."
                    className="w-full h-full p-3 bg-base-300 border border-gray-600 rounded-lg resize-none"
                />
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-brand-light">Estúdio de Imagem</h2>
                        <p className="text-gray-400">Transforme suas palavras em arte visual ou edite imagens existentes.</p>
                    </div>
                    <div className="flex border border-gray-600 rounded-lg p-1 bg-base-300">
                        <button onClick={() => setMode('generate')} className={`px-3 py-1 rounded-md text-sm font-semibold ${mode === 'generate' ? 'bg-brand-primary text-white' : 'text-gray-300'}`}>Gerar</button>
                        <button onClick={() => setMode('edit')} className={`px-3 py-1 rounded-md text-sm font-semibold ${mode === 'edit' ? 'bg-brand-primary text-white' : 'text-gray-300'}`}>Editar</button>
                    </div>
                </div>

                {mode === 'generate' ? renderGenerateControls() : renderEditControls()}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500"
                >
                    {isLoading ? 'Processando...' : mode === 'generate' ? 'Gerar Imagem' : 'Editar Imagem'}
                </button>
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex justify-center items-center">
                {isLoading && <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>}
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {(mode === 'generate' && imageUrl) && <img src={imageUrl} alt="Imagem gerada" className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"/>}
                {(mode === 'edit' && editedImageUrl) && <img src={editedImageUrl} alt="Imagem editada" className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"/>}
                {!isLoading && !error && !imageUrl && !editedImageUrl && (
                    <div className="text-center text-gray-500 italic">
                        <ImageIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Sua imagem aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageStudio;
