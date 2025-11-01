import React from 'react';
import { RocketLaunchIcon, CheckCircleIcon } from './Icons';

const freeTools = [
    'Escritor de Livros',
    'Gerador de Títulos de Livros',
    'Gerador de Esboços de Livros',
    'Editor de Formato Longo',
    'Escritor de Manuscritos (Básico)',
    'Fluxo de Trabalho de Blog',
    'YouTube para Artigo',
    'Gerador de Ideias de Conteúdo',
    'Gerador de Texto Personalizado (Chat)',
    'Humanizador de Texto',
    'Otimizador de SEO (Básico)',
    'Gerador de Palavras-chave',
    'Analisador de Tom',
    'Voz da Marca',
    'Estúdio de Imagens',
    'Estúdio Fotográfico',
    'Upscaler Mágico de Imagens',
    'Gerador de Fundo Virtual',
    'Designer de Interiores',
    'Estúdio de Vídeos (Básico)',
    'Estúdio de Narração',
    'Gerador de Efeitos Sonoros',
    'Gerenciador de Roteiros',
];

const plans = [
    {
        name: 'Criador',
        price: 'R$ 29',
        period: '/mês',
        description: 'Ideal para escritores e criadores de conteúdo que estão começando a explorar o poder da IA.',
        features: [
            'Todas as ferramentas gratuitas',
            'Gerador de Histórias de IA',
            'Descrição de Personagens',
            'Gerador de postagens de Mídia Social',
            'Postagens do Facebook',
            'Legendas de vídeos do TikTok',
            'Título do vídeo do YouTube',
            'Ideias para vídeos do YouTube',
            'Corretor Gramatical',
            'Gerador Sobre Mim',
            'Ideias para Músicas',
            'Letras de Músicas',
        ],
        highlight: false,
    },
    {
        name: 'Arquiteto',
        price: 'R$ 59',
        period: '/mês',
        description: 'Para profissionais e empresas que precisam de ferramentas avançadas de escrita e marketing.',
        features: [
            'Tudo do plano Criador, e mais:',
            'Gerador de Enredo',
            'História de Personagem',
            'Escritor de Manuscritos (Avançado)',
            'Títulos de anúncios do Facebook',
            'Gerador de hashtags do TikTok',
            'Descrição do vídeo do YouTube',
            'Títulos do Google Ads',
            'Explique como se eu tivesse 5',
            'Gerador de Plano de Negócios',
            'Bio da Empresa',
            'Gerador de Campanhas de Marketing',
        ],
        highlight: true,
    },
    {
        name: 'Mestre',
        price: 'R$ 99',
        period: '/mês',
        description: 'Acesso total e ilimitado a todas as ferramentas para dominar a criação de conteúdo com IA.',
        features: [
            'Tudo do plano Arquiteto, e mais:',
            'Gerador de Histórias de Romance',
            'Criador de Fanfics',
            'Gerador de Histórias de Séries',
            'Texto principal dos anúncios do Facebook',
            'Esboço do roteiro do vídeo do YouTube',
            'Descrições de anúncios do Google',
            'Postagem do Google Meu Negócio',
            'Descrição de Produto (GMN)',
            'Gerador de Página Sobre Nós',
            'Gerador de Perfil da Empresa',
            'Gerador de Políticas Empresariais',
        ],
        highlight: false,
    },
];

const Plans: React.FC = () => {
    return (
        <div className="animate-fade-in max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Nossos Planos</h1>
                <p className="text-lg text-gray-400">Escolha o plano que impulsionará sua criatividade ao próximo nível.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                    <div key={index} className={`bg-base-200 rounded-xl shadow-lg p-8 flex flex-col ${plan.highlight ? 'border-2 border-brand-primary transform scale-105 shadow-brand-primary/20' : 'border border-transparent'}`}>
                        {plan.highlight && (
                            <span className="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2">MAIS POPULAR</span>
                        )}
                        <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                        <p className="text-gray-400 mb-6 h-12">{plan.description}</p>
                        <div className="mb-8">
                            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                            <span className="text-gray-400 font-semibold">{plan.period}</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button className={`w-full font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 ${plan.highlight ? 'bg-brand-primary hover:bg-brand-dark text-white' : 'bg-base-300 hover:bg-brand-secondary text-white'}`}>
                            Assinar Agora
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Plans;
