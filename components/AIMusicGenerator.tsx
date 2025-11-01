
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { MusicIcon } from './Icons';

type Genre = 'Pop' | 'Rock' | 'Eletrônica' | 'Hip Hop' | 'Acústico';

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

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


const AIMusicGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [genre, setGenre] = useState<Genre>('Pop');
    const [lyrics, setLyrics] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;

        setIsLoading(true);
        setError(null);
        setLyrics('');
        setAudioUrl(null);

        try {
            // FIX: Use process.env.API_KEY as per the guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // 1. Generate Lyrics
            const lyricsResponse = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `Aja como um compositor profissional. Escreva uma letra de música completa, com versos, refrão e ponte, para uma canção do gênero ${genre} sobre o seguinte tema: "${prompt}"`,
            });
            const generatedLyrics = lyricsResponse.text;
            setLyrics(generatedLyrics);

            if (!generatedLyrics) {
                throw new Error("Não foi possível gerar a letra da música.");
            }

            // 2. Generate Audio from Lyrics
            const audioResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: generatedLyrics }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                },
            });

            const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) {
                throw new Error("Nenhum dado de áudio recebido.");
            }
            
            const audioBytes = decode(base64Audio);
            // Convert raw PCM to a proper WAV Blob
            const blob = pcmToWav(audioBytes, 24000, 1, 16);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar a música. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, genre, isLoading]);

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Músicas de IA 2.0</h2>
                <p className="text-gray-400 mb-4">Gere músicas originais com letras usando IA. Descreva o tema, escolha o gênero e dê vida à sua próxima canção.</p>
                
                <div className="mb-4">
                    <label className="block text-gray-400 mb-2 text-sm font-semibold">1. Descreva o tema da música</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Uma balada sobre um amor perdido em uma noite chuvosa de outono"
                        className="w-full h-24 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="mb-6">
                     <label className="block text-gray-400 mb-2 text-sm font-semibold">2. Escolha o gênero</label>
                     <div className="flex flex-wrap gap-2">
                        {(['Pop', 'Rock', 'Eletrônica', 'Hip Hop', 'Acústico'] as Genre[]).map(g => (
                             <button key={g} onClick={() => setGenre(g)} disabled={isLoading} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${genre === g ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-300 hover:bg-base-300/50'}`}>
                                {g}
                             </button>
                        ))}
                     </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    <MusicIcon />
                    {isLoading ? 'Compondo...' : 'Gerar Música'}
                </button>
                {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-gray-400">A IA está compondo sua música...</p>
                        </div>
                    </div>
                )}
                 {lyrics && !isLoading && (
                     <div className="animate-fade-in">
                        <h3 className="text-xl font-bold text-brand-light mb-4">Sua Música</h3>
                        {audioUrl && (
                             <div className="mb-6">
                                <audio controls src={audioUrl} className="w-full rounded-lg bg-base-300"></audio>
                             </div>
                        )}
                        <div>
                             <h4 className="font-semibold text-lg text-brand-secondary mb-2">Letra da Música</h4>
                             <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap p-4 bg-base-300 rounded-lg">
                                 {lyrics}
                             </div>
                        </div>
                     </div>
                 )}
                {!lyrics && !isLoading && (
                    <div className="text-center text-gray-500 italic mt-10">
                        <MusicIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        Sua música e letra aparecerão aqui...
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIMusicGenerator;
