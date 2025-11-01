import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
// FIX: Import AudioIcon to resolve 'Cannot find name' error.
import { AudioIcon } from './Icons';

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const AudioNarration: React.FC = () => {
    const [text, setText] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const handleGenerateAndPlay = useCallback(async () => {
        if (!text || isLoading) return;

        setIsLoading(true);
        setError(null);

        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) {
                throw new Error("Nenhum dado de áudio recebido.");
            }

            if (!audioContextRef.current) {
                 audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioContext = audioContextRef.current;
            
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContext,
                24000,
                1,
            );
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.onended = () => setIsPlaying(false);
            source.start();

            audioSourceRef.current = source;
            setIsPlaying(true);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o áudio. Tente novamente.');
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }
    }, [text, isLoading]);

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-brand-light">Estúdio de Narração</h2>
                <p className="text-gray-400 mb-4">Dê voz à sua história. Insira o texto que deseja narrar e ouça a magia acontecer.</p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Cole ou escreva o texto para narração aqui..."
                    className="w-full h-40 p-3 bg-base-300 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerateAndPlay}
                    disabled={isLoading || !text || isPlaying}
                    className="mt-4 w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                    {isLoading ? 'Gerando Áudio...' : isPlaying ? 'Reproduzindo...' : 'Gerar e Reproduzir'}
                </button>
            </div>

            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex justify-center items-center">
                 {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                 {!error && (
                    <div className="text-center text-gray-500">
                        <AudioIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                        {isPlaying ? (
                            <p className="font-semibold text-brand-light animate-pulse">Reproduzindo narração...</p>
                        ) : (
                            <p className="italic">A narração de áudio está pronta para começar.</p>
                        )}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default AudioNarration;