import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat as GenAIChat } from '@google/genai';
import { ChatIcon, PaperClipIcon, XCircleIcon } from './Icons';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface AttachedFile {
    name: string;
    content: string;
}

const systemInstruction = `Você é um assistente de IA versátil e poderoso no 'Estúdio: Criando com IA'. 
Sua principal função é gerar texto personalizado para qualquer finalidade solicitada pelo usuário e responder a perguntas com base no conteúdo de arquivos fornecidos. 
Seja preciso, criativo e prestativo.`;

const Chat: React.FC = () => {
    const [chat, setChat] = useState<GenAIChat | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Olá! Use-me para gerar qualquer tipo de texto ou para analisar seus documentos. O que vamos criar hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chatInstance = ai.chats.create({
                model: 'gemini-2.5-pro',
                config: {
                    systemInstruction: systemInstruction,
                },
            });
            setChat(chatInstance);
        } catch (err) {
            console.error(err);
            setError("Falha ao inicializar o assistente de IA. Verifique sua chave de API.");
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isLoading || !chat) return;

        const userMessageText = attachedFile 
            ? `Com base no arquivo "${attachedFile.name}", responda à seguinte pergunta:\n\n${input}\n\nConteúdo do arquivo:\n${attachedFile.content}`
            : input;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setAttachedFile(null);
        setIsLoading(true);
        setError(null);
        
        // Add a placeholder for the model's response
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        try {
            const result = await chat.sendMessageStream({ message: userMessageText });
            
            // FIX: Updated state immutably for streaming response.
            for await (const chunk of result) {
                const chunkText = chunk.text ?? '';
                setMessages(prevMessages => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    if (lastMessage && lastMessage.role === 'model') {
                        // Create a new array with the last message updated immutably
                        return [
                            ...prevMessages.slice(0, -1),
                            { ...lastMessage, text: lastMessage.text + chunkText },
                        ];
                    }
                    return prevMessages;
                });
            }

        } catch (err) {
            console.error(err);
            const errorMessage = "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.";
            setError(errorMessage);
            setMessages(prev => [...prev.slice(0, -1), { role: 'model', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, chat, attachedFile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setAttachedFile({ name: file.name, content });
            };
            reader.readAsText(file);
        } else {
            setError("Por favor, selecione um arquivo de texto (.txt).");
        }
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light">Gerador de Texto Personalizado</h2>
                <p className="text-gray-400 text-sm">Gere texto personalizado para qualquer finalidade. Carregue seus próprios arquivos e deixe a IA responder perguntas com base no conteúdo.</p>
            </div>
            
            <div className="flex-1 bg-base-200 rounded-xl shadow-lg flex flex-col overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-base-300 text-gray-200'}`}>
                                <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}/>
                                {isLoading && msg.role === 'model' && index === messages.length -1 && <div className="inline-block w-2 h-2 ml-1 bg-white rounded-full animate-pulse"></div>}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {error && <div className="text-red-400 bg-red-900/50 p-3 mx-6 mb-2 rounded-lg text-sm">{error}</div>}
                <div className="p-4 border-t border-gray-700">
                    {attachedFile && (
                        <div className="bg-base-300 p-2 rounded-lg mb-2 flex justify-between items-center animate-fade-in">
                           <div className="flex items-center gap-2">
                                <PaperClipIcon className="w-5 h-5 text-gray-400"/>
                                <span className="text-sm text-gray-300">{attachedFile.name}</span>
                           </div>
                           <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-red-400">
                                <XCircleIcon className="w-5 h-5"/>
                           </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                         <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-brand-light transition-colors">
                            <PaperClipIcon className="w-6 h-6"/>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt" className="hidden"/>
                         </button>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            placeholder="Digite sua mensagem ou anexe um arquivo..."
                            className="flex-1 bg-base-300 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-5 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
