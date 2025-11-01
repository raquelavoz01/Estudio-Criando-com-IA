import React from 'react';
import { CogIcon } from './Icons';

const Settings: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-brand-light flex items-center gap-2">
                    <CogIcon className="w-6 h-6" />
                    Configurações
                </h2>
                <p className="text-gray-400">Gerencie as configurações e preferências do seu aplicativo.</p>
            </div>
            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg flex justify-center items-center">
                <p className="text-gray-500 italic">A página de configurações está em desenvolvimento.</p>
            </div>
        </div>
    );
};

export default Settings;
