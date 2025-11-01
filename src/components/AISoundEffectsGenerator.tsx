import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { SoundWaveIcon } from './Icons';

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// FIX: Added helper functions to correctly convert raw PCM audio data to a playable WAV file.
// Helper function to write strings to a DataView
function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Function to convert raw PCM data to a WAV file Blob
function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob {
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (1=PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    new Uint8Array(buffer, 44).set(pcmData);

    return new Blob([view], { type: 'audio/wav' });
}


const AISoundEffectsGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAudioUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const finalPrompt = `Gere o seguinte efeito sonoro: ${prompt}. Não diga as palavras, crie o som.`;

            const audioResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: finalPrompt }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                },
            });

            const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) {
                throw new Error("Nenhum dado de áudio recebido. Tente uma descrição diferente.");
            }
            
            const audioBytes = decode(base64Audio);
            // FIX: Convert raw PCM to a proper WAV Blob instead of an incorrect MPEG blob.
            const blob = pcmToWav(audioBytes, 24000, 1, 16);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o efeito sonoro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Efeitos Sonoros de IA</h2>
                <p className="text-gray-400 mb-4">Gere efeitos sonoros realistas usando IA com apenas um prompt de texto.</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                     <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Passos em uma floresta, chuva forte com trovões, laser futurista"
                        className="flex-grow p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <SoundWaveIcon />
                        {isLoading ? 'Gerando...' : 'Gerar Som'}
                    </button>
                </div>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex justify-center items-center overflow-hidden">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                        <p className="text-gray-400">A IA está criando seu efeito sonoro...</p>
                    </div>
                )}
                 {audioUrl && !isLoading && (
                     <div className="w-full max-w-md animate-fade-in">
                        <h3 className="text-xl font-bold text-brand-light mb-4 text-center">Seu Efeito Sonoro</h3>
                        <audio controls autoPlay src={audioUrl} className="w-full rounded-lg bg-base-300"></audio>
                     </div>
                 )}
                {!audioUrl && !isLoading && (
                    <div className="text-center text-gray-500 italic">
                        <SoundWaveIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Seu efeito sonoro aparecerá aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AISoundEffectsGenerator;
