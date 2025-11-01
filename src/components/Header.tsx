import React, { useState, useRef, useEffect } from 'react';
import { StudioView } from '../types';
import { 
    BookIcon, ImageIcon, VideoIcon, AudioIcon, ChatIcon, 
    PresenterIcon, InfluencerIcon, AIAvatarIcon, PhotoStudioIcon, 
    HyperRealisticIcon, ConversationalAvatarIcon, HeadshotIcon, 
    VirtualBackgroundIcon, DesignerIcon, MusicIcon, LogoIcon, ChevronDownIcon,
    SoundWaveIcon, MagicWandIcon, BrandVoiceIcon, BlogPostIcon, FeatherIcon,
    InstagramIcon, FingerprintIcon, TrendingUpIcon, MetaDescriptionIcon, KeyIcon,
    FacebookIcon, LightbulbIcon, YoutubeIcon, OfficeBuildingIcon, BriefcaseIcon, IdentificationIcon,
    CheckCircleIcon, ShieldCheckIcon, MegaphoneIcon, CubeIcon, ClapperboardIcon, TikTokIcon, UserCircleIcon,
    GoogleIcon, StorefrontIcon, SparklesIcon, QuillIcon,
    HeartIcon, MapIcon, UsersIcon, DocumentTextIcon, ScrollIcon, ChatBubbleBottomCenterTextIcon, DocumentDuplicateIcon,
    CogIcon, QuestionMarkCircleIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, RocketLaunchIcon,
    LogoutIcon
} from './Icons';

interface User {
    username: string;
}

interface HeaderProps {
    activeView: StudioView;
    setActiveView: (view: StudioView) => void;
    user: User;
    onLogout: () => void;
}

const navGroups = [
    {
        title: 'Criação Essencial',
        items: [
            // General Writing & Content
            { view: StudioView.Book, label: 'Escritor', icon: <BookIcon /> },
            { view: StudioView.BookTitleGenerator, label: 'Títulos de Livros', icon: <BookIcon /> },
            { view: StudioView.BookOutlineGenerator, label: 'Esboços de Livros', icon: <BookIcon /> },
            { view: StudioView.AIStoryGenerator, label: 'Gerador de Histórias', icon: <MagicWandIcon />, isPremium: true },
            { view: StudioView.RomanceStoryGenerator, label: 'Histórias de Romance', icon: <HeartIcon />, isPremium: true },
            { view: StudioView.StoryPlotGenerator, label: 'Gerador de Enredo', icon: <MapIcon />, isPremium: true },
            { view: StudioView.FanficCreator, label: 'Criador de Fanfics', icon: <UsersIcon />, isPremium: true },
            { view: StudioView.SeriesStoryGenerator, label: 'Gerador de Séries', icon: <ClapperboardIcon />, isPremium: true },
            { view: StudioView.CharacterDescriptionGenerator, label: 'Descrição de Personagens', icon: <UserCircleIcon />, isPremium: true },
            { view: StudioView.CharacterBackstoryGenerator, label: 'História de Personagem', icon: <ScrollIcon />, isPremium: true },
            { view: StudioView.LongFormEditor, label: 'Editor de Formato Longo', icon: <FeatherIcon /> },
            { view: StudioView.ManuscriptWriter, label: 'Escritor de Manuscritos', icon: <DocumentTextIcon />, isPremium: true },
            { view: StudioView.ShakespeareGenerator, label: 'Escreva como Shakespeare', icon: <QuillIcon /> },
            { view: StudioView.BlogPostWorkflow, label: 'Fluxo de Trabalho de Blog', icon: <BlogPostIcon /> },
            { view: StudioView.YoutubeToArticle, label: 'YouTube para Artigo', icon: <YoutubeIcon /> },
            { view: StudioView.ContentIdeaGenerator, label: 'Gerador de Ideias', icon: <LightbulbIcon /> },
            { view: StudioView.Chat, label: 'Gerador Personalizado', icon: <ChatIcon /> },

            // Social Media & Ads
            { view: StudioView.SocialMediaPostGenerator, label: 'Gerador de postagens', icon: <SparklesIcon />, isPremium: true },
            { view: StudioView.InstagramCaption, label: 'Legenda do Instagram', icon: <InstagramIcon /> },
            { view: StudioView.FacebookPostGenerator, label: 'Postagens do Facebook', icon: <FacebookIcon />, isPremium: true },
            { view: StudioView.FacebookAdsTitleGenerator, label: 'Títulos de anúncios do Facebook', icon: <FacebookIcon />, isPremium: true },
            { view: StudioView.FacebookAdsPrimaryTextGenerator, label: 'Texto principal dos anúncios do Facebook', icon: <FacebookIcon />, isPremium: true },
            { view: StudioView.TikTokCaptionGenerator, label: 'Legendas de vídeos do TikTok', icon: <TikTokIcon />, isPremium: true },
            { view: StudioView.TikTokHashtagGenerator, label: 'Gerador de hashtags do TikTok', icon: <KeyIcon />, isPremium: true },
            
            // YouTube Specific
            { view: StudioView.YoutubeTitleGenerator, label: 'Título do vídeo do YouTube', icon: <YoutubeIcon />, isPremium: true },
            { view: StudioView.YoutubeDescriptionGenerator, label: 'Descrição do vídeo do YouTube', icon: <YoutubeIcon />, isPremium: true },
            { view: StudioView.YoutubeIdeaGenerator, label: 'Ideias para vídeos do YouTube', icon: <LightbulbIcon />, isPremium: true },
            { view: StudioView.YoutubeScriptOutlineGenerator, label: 'Esboço do roteiro do vídeo', icon: <ClapperboardIcon />, isPremium: true },
            
            // SEO & Google Tools
            { view: StudioView.SEOTitleGenerator, label: 'Otimizador de SEO', icon: <TrendingUpIcon /> },
            { view: StudioView.MetaDescriptionGenerator, label: 'Gerador de Meta Descrição', icon: <MetaDescriptionIcon /> },
            { view: StudioView.KeywordGenerator, label: 'Gerador de palavras-chave', icon: <KeyIcon /> },
            { view: StudioView.GoogleAdsTitleGenerator, label: 'Títulos do Google Ads', icon: <GoogleIcon />, isPremium: true },
            { view: StudioView.GoogleAdsDescriptionGenerator, label: 'Descrições de anúncios do Google', icon: <GoogleIcon />, isPremium: true },
            { view: StudioView.GoogleMyBusinessPostGenerator, label: 'Postagem do Google Meu Negócio', icon: <StorefrontIcon />, isPremium: true },
            { view: StudioView.GoogleMyBusinessProductGenerator, label: 'Descrição de Produto (GMN)', icon: <StorefrontIcon />, isPremium: true },

            // Text Utilities & Tools
            { view: StudioView.GrammarChecker, label: 'Corretor Gramatical', icon: <CheckCircleIcon />, isPremium: true },
            { view: StudioView.AITextHumanizer, label: 'Humanizador de Texto', icon: <FingerprintIcon /> },
            { view: StudioView.TextToneAnalyzer, label: 'Analisador de Tom', icon: <ChatBubbleBottomCenterTextIcon /> },
            { view: StudioView.ExplainLikeImFive, label: 'Explique como se eu tivesse 5', icon: <CubeIcon />, isPremium: true },

            // Business & Corporate
            { view: StudioView.BusinessPlanGenerator, label: 'Plano de Negócios', icon: <BriefcaseIcon />, isPremium: true },
            { view: StudioView.BrandVoice, label: 'Voz da Marca', icon: <BrandVoiceIcon /> },
            { view: StudioView.AboutUsPageGenerator, label: 'Página Sobre Nós', icon: <OfficeBuildingIcon />, isPremium: true },
            { view: StudioView.CompanyProfileGenerator, label: 'Perfil da Empresa', icon: <BriefcaseIcon />, isPremium: true },
            { view: StudioView.CompanyBioGenerator, label: 'Bio da Empresa', icon: <IdentificationIcon />, isPremium: true },
            { view: StudioView.AboutMeGenerator, label: 'Gerador Sobre Mim', icon: <UserCircleIcon />, isPremium: true },
            { view: StudioView.PolicyGenerator, label: 'Gerador de Políticas', icon: <ShieldCheckIcon />, isPremium: true },
            { view: StudioView.MarketingCampaignGenerator, label: 'Campanhas de Marketing', icon: <MegaphoneIcon />, isPremium: true },
        ],
    },
    {
        title: 'Estúdio Visual',
        items: [
            { view: StudioView.Image, label: 'Imagens', icon: <ImageIcon /> },
            { view: StudioView.AIPhotoStudio, label: 'Estúdio Fotográfico', icon: <PhotoStudioIcon /> },
            { view: StudioView.AIHyperRealisticPhotos, label: 'Fotos Realistas', icon: <HyperRealisticIcon /> },
            { view: StudioView.MagicUpscaler, label: 'Upscaler Mágico', icon: <MagicWandIcon /> },
            { view: StudioView.AIHeadshotGenerator, label: 'Gerador de Headshots', icon: <HeadshotIcon /> },
            { view: StudioView.AIVirtualBackground, label: 'Fundo Virtual', icon: <VirtualBackgroundIcon /> },
            { view: StudioView.AIDesigner, label: 'Designer de Interiores', icon: <DesignerIcon /> },
        ],
    },
    {
        title: 'Estúdio de Vídeo',
        items: [
            { view: StudioView.Video, label: 'Vídeos', icon: <VideoIcon /> },
            { view: StudioView.AIPresenter, label: 'Apresentador IA', icon: <PresenterIcon /> },
            { view: StudioView.AIInfluencer, label: 'Influenciador IA', icon: <InfluencerIcon /> },
            { view: StudioView.AIAvatar, label: 'Avatar IA', icon: <AIAvatarIcon /> },
            { view: StudioView.AIConversationalAvatar, label: 'Avatar Falante', icon: <ConversationalAvatarIcon /> },
        ],
    },
    {
        title: 'Estúdio de Áudio',
        items: [
            { view: StudioView.Audio, label: 'Narração', icon: <AudioIcon /> },
            { view: StudioView.MusicIdeaGenerator, label: 'Ideias para Músicas', icon: <LightbulbIcon />, isPremium: true },
            { view: StudioView.SongLyricsGenerator, label: 'Letras de Músicas', icon: <FeatherIcon />, isPremium: true },
            { view: StudioView.AIMusicGenerator, label: 'Música Completa (Letra+Voz)', icon: <MusicIcon /> },
            { view: StudioView.AISoundEffectsGenerator, label: 'Efeitos Sonoros', icon: <SoundWaveIcon /> },
        ],
    },
    {
        title: 'Recursos',
        items: [
            { view: StudioView.Library, label: 'Roteiros', icon: <DocumentDuplicateIcon /> },
        ]
    },
    {
        title: 'Sistema',
        items: [
            { view: StudioView.Settings, label: 'Configurações', icon: <CogIcon /> },
            { view: StudioView.FAQ, label: 'FAQ', icon: <QuestionMarkCircleIcon /> },
            { view: StudioView.Disclaimer, label: 'Aviso Legal', icon: <ExclamationTriangleIcon /> },
            { view: StudioView.UsagePolicy, label: 'Política de Uso', icon: <ClipboardDocumentListIcon /> },
        ]
    }
];

const NavDropdown: React.FC<{
    group: typeof navGroups[0];
    activeView: StudioView;
    setActiveView: (view: StudioView) => void;
}> = ({ group, activeView, setActiveView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = (view: StudioView) => {
        setActiveView(view);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-300 rounded-md hover:bg-base-300 hover:text-white transition-colors"
            >
                {group.title}
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 max-h-[70vh] overflow-y-auto bg-base-300 border border-gray-600 rounded-lg shadow-xl z-50 animate-fade-in-fast">
                    <ul className="p-2 space-y-1">
                        {group.items.map(item => (
                             <li key={item.view}>
                                <button
                                    onClick={() => handleItemClick(item.view)}
                                    className={`w-full flex items-center p-2 rounded-md text-left transition-colors ${
                                        activeView === item.view
                                            ? 'bg-brand-primary text-white'
                                            : 'text-gray-300 hover:bg-base-100 hover:text-white'
                                    }`}
                                >
                                    <div className="w-5 h-5 mr-3 shrink-0">{item.icon}</div>
                                    <span className="flex-grow">{item.label}</span>
                                    {(item as any).isPremium && <span className="ml-2 text-xs font-bold text-yellow-400 bg-yellow-900/50 px-1.5 py-0.5 rounded-full">PRO</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const UserMenu: React.FC<{ user: User; onLogout: () => void; }> = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-300 rounded-md hover:bg-base-300 hover:text-white transition-colors"
            >
                <UserCircleIcon className="w-5 h-5" />
                <span>Olá, {user.username}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                 <div className="absolute top-full right-0 mt-2 w-48 bg-base-300 border border-gray-600 rounded-lg shadow-xl z-50 animate-fade-in-fast">
                     <button
                        onClick={onLogout}
                        className="w-full flex items-center p-3 text-left text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5 mr-3" />
                        Sair
                    </button>
                 </div>
            )}
        </div>
    )
}


const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, user, onLogout }) => {
    return (
        <header className="w-full bg-base-200 shadow-md p-2 sm:p-3 flex items-center justify-between z-10 flex-wrap gap-2">
            <div className="flex items-center gap-3">
                <div className="bg-brand-primary p-2 rounded-lg">
                    <LogoIcon className="h-6 w-6 text-white"/>
                </div>
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-white hidden sm:block">Estúdio: Criando com IA</h1>
                </div>
            </div>
            <nav className="flex items-center gap-1 flex-grow justify-end">
                {navGroups.map(group => (
                    <NavDropdown key={group.title} group={group} activeView={activeView} setActiveView={setActiveView} />
                ))}
                 <button 
                    onClick={() => setActiveView(StudioView.Plans)}
                    className="flex items-center gap-2 ml-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                    <RocketLaunchIcon className="w-5 h-5"/>
                    Planos
                </button>
                <div className="border-l border-gray-600 h-8 ml-2 pl-2">
                   <UserMenu user={user} onLogout={onLogout} />
                </div>
            </nav>
        </header>
    );
};

export default Header;