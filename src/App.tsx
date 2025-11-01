import React, { useState, useCallback, useEffect } from 'react';
import { StudioView } from './types';
import Header from './components/Header';
import Auth from './components/Auth';
import BookWriter from './components/BookWriter';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import AudioNarration from './components/AudioNarration';
import Library from './components/Library';
import Chat from './components/Chat';
import AIPresenter from './components/AIPresenter';
import AIInfluencer from './components/AIInfluencer';
import AIAvatar from './components/AIAvatar';
import AIPhotoStudio from './components/AIPhotoStudio';
import AIHyperRealisticPhotos from './components/AIHyperRealisticPhotos';
import AIConversationalAvatar from './components/AIConversationalAvatar';
import AIHeadshotGenerator from './components/AIHeadshotGenerator';
import AIVirtualBackground from './components/AIVirtualBackground';
import AIDesigner from './components/AIDesigner';
import AIMusicGenerator from './components/AIMusicGenerator';
import AISoundEffectsGenerator from './components/AISoundEffectsGenerator';
import MagicUpscaler from './components/MagicUpscaler';
import BrandVoice from './components/BrandVoice';
import BlogPostWorkflow from './components/BlogPostWorkflow';
import LongFormEditor from './components/LongFormEditor';
import InstagramCaptionGenerator from './components/InstagramCaptionGenerator';
import AITextHumanizer from './components/AITextHumanizer';
import SEOTitleGenerator from './components/SEOTitleGenerator';
import MetaDescriptionGenerator from './components/MetaDescriptionGenerator';
import KeywordGenerator from './components/KeywordGenerator';
import FacebookPostGenerator from './components/FacebookPostGenerator';
import ContentIdeaGenerator from './components/ContentIdeaGenerator';
import YoutubeToArticleGenerator from './components/YoutubeToArticleGenerator';
import YoutubeTitleGenerator from './components/YoutubeTitleGenerator';
import YoutubeDescriptionGenerator from './components/YoutubeDescriptionGenerator';
import YoutubeIdeaGenerator from './components/YoutubeIdeaGenerator';
import YoutubeScriptOutlineGenerator from './components/YoutubeScriptOutlineGenerator';
import AboutUsPageGenerator from './components/AboutUsPageGenerator';
import CompanyProfileGenerator from './components/CompanyProfileGenerator';
import CompanyBioGenerator from './components/CompanyBioGenerator';
import GrammarChecker from './components/GrammarChecker';
import PolicyGenerator from './components/PolicyGenerator';
import MarketingCampaignGenerator from './components/MarketingCampaignGenerator';
import ExplainLikeImFive from './components/ExplainLikeImFive';
import SeriesStoryGenerator from './components/SeriesStoryGenerator';
import TikTokCaptionGenerator from './components/TikTokCaptionGenerator';
import TikTokHashtagGenerator from './components/TikTokHashtagGenerator';
import AboutMeGenerator from './components/AboutMeGenerator';
import GoogleAdsTitleGenerator from './components/GoogleAdsTitleGenerator';
import GoogleAdsDescriptionGenerator from './components/GoogleAdsDescriptionGenerator';
import GoogleMyBusinessProductGenerator from './components/GoogleMyBusinessProductGenerator';
import GoogleMyBusinessPostGenerator from './components/GoogleMyBusinessPostGenerator';
import FacebookAdsTitleGenerator from './components/FacebookAdsTitleGenerator';
import FacebookAdsPrimaryTextGenerator from './components/FacebookAdsPrimaryTextGenerator';
import SocialMediaPostGenerator from './components/SocialMediaPostGenerator';
import MusicIdeaGenerator from './components/MusicIdeaGenerator';
import SongLyricsGenerator from './components/SongLyricsGenerator';
import BookTitleGenerator from './components/BookTitleGenerator';
import BookOutlineGenerator from './components/BookOutlineGenerator';
import ShakespeareGenerator from './components/ShakespeareGenerator';
import AIStoryGenerator from './components/AIStoryGenerator';
import RomanceStoryGenerator from './components/RomanceStoryGenerator';
import StoryPlotGenerator from './components/StoryPlotGenerator';
import FanficCreator from './components/FanficCreator';
import ManuscriptWriter from './components/ManuscriptWriter';
import BusinessPlanGenerator from './components/BusinessPlanGenerator';
import CharacterDescriptionGenerator from './components/CharacterDescriptionGenerator';
import CharacterBackstoryGenerator from './components/CharacterBackstoryGenerator';
import TextToneAnalyzer from './components/TextToneAnalyzer';
import Settings from './components/Settings';
import FAQ from './components/FAQ';
import Disclaimer from './components/Disclaimer';
import UsagePolicy from './components/UsagePolicy';
import Plans from './components/Plans';

interface User {
    username: string;
}

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<StudioView>(StudioView.Chat);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('currentUser');
        }
    }, []);

    const handleLoginSuccess = (loggedInUser: User) => {
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
        // Reset to a default view after logout
        setActiveView(StudioView.Chat);
    };

    const renderActiveView = useCallback(() => {
        switch (activeView) {
            case StudioView.Book:
                return <BookWriter />;
            case StudioView.Chat:
                return <Chat />;
            case StudioView.Image:
                return <ImageStudio />;
            case StudioView.Video:
                return <VideoStudio />;
            case StudioView.AIPresenter:
                return <AIPresenter />;
            case StudioView.AIInfluencer:
                return <AIInfluencer />;
            case StudioView.AIAvatar:
                return <AIAvatar />;
            case StudioView.AIPhotoStudio:
                return <AIPhotoStudio />;
            case StudioView.AIHyperRealisticPhotos:
                return <AIHyperRealisticPhotos />;
            case StudioView.MagicUpscaler:
                return <MagicUpscaler />;
            case StudioView.AIConversationalAvatar:
                return <AIConversationalAvatar />;
            case StudioView.AIHeadshotGenerator:
                return <AIHeadshotGenerator />;
            case StudioView.AIVirtualBackground:
                return <AIVirtualBackground />;
            case StudioView.AIDesigner:
                return <AIDesigner />;
            case StudioView.Audio:
                return <AudioNarration />;
            case StudioView.AIMusicGenerator:
                return <AIMusicGenerator />;
            case StudioView.MusicIdeaGenerator:
                return <MusicIdeaGenerator />;
            case StudioView.SongLyricsGenerator:
                return <SongLyricsGenerator />;
            case StudioView.AISoundEffectsGenerator:
                return <AISoundEffectsGenerator />;
            case StudioView.BrandVoice:
                return <BrandVoice />;
            case StudioView.BlogPostWorkflow:
                return <BlogPostWorkflow />;
            case StudioView.LongFormEditor:
                return <LongFormEditor />;
            case StudioView.InstagramCaption:
                return <InstagramCaptionGenerator />;
            case StudioView.AITextHumanizer:
                return <AITextHumanizer />;
            case StudioView.SEOTitleGenerator:
                return <SEOTitleGenerator />;
            case StudioView.MetaDescriptionGenerator:
                return <MetaDescriptionGenerator />;
            case StudioView.KeywordGenerator:
                return <KeywordGenerator />;
            case StudioView.FacebookPostGenerator:
                return <FacebookPostGenerator />;
            case StudioView.ContentIdeaGenerator:
                return <ContentIdeaGenerator />;
            case StudioView.YoutubeToArticle:
                return <YoutubeToArticleGenerator />;
            case StudioView.YoutubeTitleGenerator:
                return <YoutubeTitleGenerator />;
            case StudioView.YoutubeDescriptionGenerator:
                return <YoutubeDescriptionGenerator />;
            case StudioView.YoutubeIdeaGenerator:
                return <YoutubeIdeaGenerator />;
            case StudioView.YoutubeScriptOutlineGenerator:
                return <YoutubeScriptOutlineGenerator />;
            case StudioView.TikTokCaptionGenerator:
                return <TikTokCaptionGenerator />;
            case StudioView.TikTokHashtagGenerator:
                return <TikTokHashtagGenerator />;
            case StudioView.AboutUsPageGenerator:
                return <AboutUsPageGenerator />;
            case StudioView.CompanyProfileGenerator:
                return <CompanyProfileGenerator />;
            case StudioView.CompanyBioGenerator:
                return <CompanyBioGenerator />;
            case StudioView.AboutMeGenerator:
                return <AboutMeGenerator />;
            case StudioView.GrammarChecker:
                return <GrammarChecker />;
            case StudioView.PolicyGenerator:
                return <PolicyGenerator />;
            case StudioView.MarketingCampaignGenerator:
                return <MarketingCampaignGenerator />;
            case StudioView.ExplainLikeImFive:
                return <ExplainLikeImFive />;
            case StudioView.SeriesStoryGenerator:
                return <SeriesStoryGenerator />;
            case StudioView.GoogleAdsTitleGenerator:
                return <GoogleAdsTitleGenerator />;
            case StudioView.GoogleAdsDescriptionGenerator:
                return <GoogleAdsDescriptionGenerator />;
            case StudioView.GoogleMyBusinessProductGenerator:
                return <GoogleMyBusinessProductGenerator />;
            case StudioView.GoogleMyBusinessPostGenerator:
                return <GoogleMyBusinessPostGenerator />;
            case StudioView.FacebookAdsTitleGenerator:
                return <FacebookAdsTitleGenerator />;
            case StudioView.FacebookAdsPrimaryTextGenerator:
                return <FacebookAdsPrimaryTextGenerator />;
            case StudioView.SocialMediaPostGenerator:
                return <SocialMediaPostGenerator />;
            case StudioView.BookTitleGenerator:
                return <BookTitleGenerator />;
            case StudioView.BookOutlineGenerator:
                return <BookOutlineGenerator />;
            case StudioView.ShakespeareGenerator:
                return <ShakespeareGenerator />;
            case StudioView.AIStoryGenerator:
                return <AIStoryGenerator />;
            case StudioView.RomanceStoryGenerator:
                return <RomanceStoryGenerator />;
            case StudioView.StoryPlotGenerator:
                return <StoryPlotGenerator />;
            case StudioView.FanficCreator:
                return <FanficCreator />;
            case StudioView.ManuscriptWriter:
                return <ManuscriptWriter />;
            case StudioView.BusinessPlanGenerator:
                return <BusinessPlanGenerator />;
            case StudioView.CharacterDescriptionGenerator:
                return <CharacterDescriptionGenerator />;
            case StudioView.CharacterBackstoryGenerator:
                return <CharacterBackstoryGenerator />;
            case StudioView.TextToneAnalyzer:
                return <TextToneAnalyzer />;
            case StudioView.Library:
                return <Library />;
            case StudioView.Settings:
                return <Settings />;
            case StudioView.FAQ:
                return <FAQ />;
            case StudioView.Disclaimer:
                return <Disclaimer />;
            case StudioView.UsagePolicy:
                return <UsagePolicy />;
            case StudioView.Plans:
                return <Plans />;
            default:
                return <Chat />;
        }
    }, [activeView]);

    if (!user) {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="flex flex-col h-screen bg-base-100 text-base-content font-sans">
            <Header
                activeView={activeView}
                setActiveView={setActiveView}
                user={user}
                onLogout={handleLogout}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                {renderActiveView()}
            </main>
        </div>
    );
};

export default App;