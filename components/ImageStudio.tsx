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
                    <button onClick={() => setImageType('concept')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${imageType === 'concept' ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300'}`}>Arte Conceitual (16:9)</button>
                    <button onClick={() => setImageType('cover')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${imageType === 'cover' ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300'}`}>Capa Wattpad (512x800)</button>
                </div>
            </div>

            {imageType === 'cover' && (
                <div className="mb-4 animate-fade-in">
                     <label className="block text-gray-400 mb-2 text-sm font-semibold">Título do Livro:</label>
                     <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: A Lenda do Dragão Órfão" className="w-full p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all" disabled={isLoading}/>
                </div>
            )}
            
            <div>
                <label className="block text-gray-400 mb-2 text-sm font-semibold">Descrição da Arte:</label>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Um castelo de cristal flutuando em um céu roxo com duas luas" className="flex-grow p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all" disabled={isLoading}/>
                    <button onClick={handleSubmit} disabled={isLoading || !prompt} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                        {isLoading ? 'Criando...' : 'Criar Imagem'}
                    </button>
                </div>
            </div>
        </div>
    );
    
    const renderEditControls = () => (
        <div className="animate-fade-in">
             <p className="text-gray-400 mb-4 text-sm">Carregue sua foto e descreva a transformação desejada para criar retratos profissionais, avatares e muito mais.</p>
             <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Ex: Transforme em um retrato profissional de estúdio" className="flex-grow p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all" disabled={isLoading}/>
                <button onClick={handleSubmit} disabled={isLoading || !editPrompt || !sourceImageFile} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                    {isLoading ? 'Transformando...' : 'Transformar Foto'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-brand-light">Estúdio de Imagem</h2>
                <div className="flex border border-base-300 rounded-lg p-1 bg-base-300/50 mb-6 max-w-md">
                    <button onClick={() => setMode('generate')} className={`w-1/2 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'generate' ? 'bg-brand-primary text-white shadow' : 'text-gray-300 hover:bg-base-300'}`}>
                        Gerar com IA
                    </button>
                    <button onClick={() => setMode('edit')} className={`w-1/2 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'edit' ? 'bg-brand-primary text-white shadow' : 'text-gray-300 hover:bg-base-300'}`}>
                        Editar Foto com IA
                    </button>
                </div>
                {mode === 'generate' ? renderGenerateControls() : renderEditControls()}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex justify-center items-center overflow-hidden">
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                
                {!error && (
                     <>
                        {mode === 'generate' && (
                            <>
                                {isLoading && <div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div><p className="text-gray-400">Criando sua obra-prima...</p></div>}
                                {imageUrl && <img src={imageUrl} alt={prompt} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-fade-in"/>}
                                {!imageUrl && !isLoading && <div className="text-center text-gray-500 italic"><ImageIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />Sua imagem aparecerá aqui...</div>}
                            </>
                        )}
                        {mode === 'edit' && (
                             <>
                                {!sourceImageUrl && !isLoading && (
                                    <div 
                                        onDrop={handleDrop} 
                                        onDragOver={handleDragOver} 
                                        onDragLeave={handleDragLeave}
                                        className={`w-full h-full border-4 border-dashed rounded-xl flex flex-col justify-center items-center text-center text-gray-500 transition-colors ${dragOver ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600'}`}
                                    >
                                        <UploadIcon className="w-24 h-24 mx-auto text-gray-600 mb-4"/>
                                        <p className="font-semibold text-lg">Arraste e solte uma imagem aqui</p>
                                        <p className="mb-4">ou</p>
                                        <label className="bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                                            Selecione um Arquivo
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                )}
                                {(sourceImageUrl || isLoading) && (
                                    <div className="flex flex-col md:flex-row gap-4 w-full h-full justify-center items-center">
                                        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-2 bg-base-300/50 rounded-lg">
                                            <h4 className="text-lg font-semibold text-gray-400 mb-2">Original</h4>
                                            {sourceImageUrl && <img src={sourceImageUrl} alt="Imagem original" className="max-h-full max-w-full object-contain rounded-lg shadow-lg"/>}
                                        </div>
                                        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-2 bg-base-300/50 rounded-lg h-full">
                                             <h4 className="text-lg font-semibold text-gray-400 mb-2">Resultado</h4>
                                             <div className="w-full h-full flex items-center justify-center">
                                                {isLoading && <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>}
                                                {editedImageUrl && <img src={editedImageUrl} alt="Imagem editada" className="max-h-full max-w-full object-contain rounded-lg shadow-lg animate-fade-in"/>}
                                                {!editedImageUrl && !isLoading && <p className="text-gray-500 italic">O resultado aparecerá aqui...</p>}
                                             </div>
                                        </div>
                                    </div>
                                )}
                             </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageStudio;
