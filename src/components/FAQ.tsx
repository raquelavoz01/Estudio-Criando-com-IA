import React from 'react';
import { QuestionMarkCircleIcon } from './Icons';

const faqs = [
    {
        question: 'Como funciona a geração de vídeo e avatar?',
        answer: 'Nossas ferramentas de vídeo utilizam modelos de IA avançados da Google. Para vídeos com apresentador ou avatar, você fornece uma imagem e um roteiro, e a IA anima a imagem para que ela pareça estar falando o texto de forma realista. Este é um processo que consome muitos recursos e pode levar alguns minutos.'
    },
    {
        question: 'Meus dados e criações estão seguros?',
        answer: 'Sim, a segurança dos seus dados é uma prioridade. Seus projetos de roteiro e imagens de avatar são salvos localmente no seu navegador. As informações enviadas para a IA da Google são processadas de acordo com as políticas de privacidade da Google. Não armazenamos seus prompts ou criações em nossos servidores.'
    },
    {
        question: 'Por que preciso de uma chave de API do Google Cloud para algumas ferramentas de vídeo?',
        answer: 'A geração de vídeo com modelos como o Veo é um serviço premium oferecido diretamente pelo Google Cloud. A seleção da sua própria chave de API permite que o uso seja associado à sua conta para fins de cobrança e gerenciamento de cotas, dando a você controle total sobre seus custos.'
    },
    {
        question: 'Como funcionam os planos de assinatura?',
        answer: 'Oferecemos várias ferramentas gratuitas e ferramentas "Pro" mais avançadas. Os planos de assinatura (Criador, Arquiteto, Mestre) desbloqueiam diferentes níveis de acesso a essas ferramentas Pro, permitindo que você escolha o plano que melhor se adapta às suas necessidades criativas e profissionais.'
    },
    {
        question: 'Posso usar as imagens e vídeos gerados comercialmente?',
        answer: 'Sim, as criações geradas são suas para usar, inclusive para fins comerciais. No entanto, é sua responsabilidade garantir que seus prompts e o conteúdo gerado não infrinjam direitos autorais ou marcas registradas de terceiros.'
    }
];

const FAQ: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-2 text-brand-light flex items-center gap-3">
                    <QuestionMarkCircleIcon className="w-8 h-8" />
                    Perguntas Frequentes (FAQ)
                </h2>
                <p className="text-gray-400">Encontre respostas para as dúvidas mais comuns sobre o Estúdio de Criação com IA.</p>
            </div>
            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <details key={index} className="bg-base-300 p-4 rounded-lg group">
                            <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                                {faq.question}
                                <span className="text-brand-light transition-transform duration-300 group-open:rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="text-gray-300 mt-3 pt-3 border-t border-gray-600">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ;