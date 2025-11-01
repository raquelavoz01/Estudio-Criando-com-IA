import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

const Disclaimer: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-2 text-brand-light flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                    Aviso Legal
                </h2>
            </div>
            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="prose prose-invert max-w-none text-gray-300">
                    <h3>Uso de Inteligência Artificial</h3>
                    <p>O "Estúdio: Criando com IA" utiliza modelos de inteligência artificial generativa de ponta (Gemini, do Google) para funcionar como seu co-piloto criativo. Embora a IA seja uma ferramenta poderosa, o conteúdo gerado (textos, imagens, etc.) é um ponto de partida para sua criatividade e pode, ocasionalmente, conter imprecisões ou necessitar de ajustes. Os resultados são fornecidos para inspirar e acelerar seu trabalho.</p>

                    <h3>Uma Parceria Criativa</h3>
                    <p>Encaramos a relação entre o escritor e nossa ferramenta como uma parceria. Você é o diretor criativo, e a IA é sua assistente. É sua responsabilidade final revisar, editar e validar todo o conteúdo gerado para garantir que ele atenda perfeitamente à sua visão e padrões de qualidade antes de publicá-lo. Juntos, criamos obras incríveis.</p>
                    
                    <h3>Nosso Compromisso com a Originalidade</h3>
                    <p>Estamos comprometidos em fornecer ferramentas que promovam a criação de conteúdo único. Nossas políticas e as instruções dadas à IA são projetadas para evitar a replicação e garantir a originalidade. Para mais detalhes, consulte nossa Política de Uso.</p>

                    <h3>Propriedade e Direitos</h3>
                    <p>As obras que você cria com a ajuda de nossas ferramentas são suas. Você detém os direitos sobre suas criações finais, sujeito aos termos de serviço do Google e às leis de propriedade intelectual vigentes. Não reivindicamos qualquer propriedade sobre seu trabalho.</p>

                    <h3>Limitação de Responsabilidade</h3>
                    <p>Nosso objetivo é fornecer a melhor ferramenta possível, mas não podemos ser responsabilizados por quaisquer danos diretos ou indiretos resultantes do uso ou da incapacidade de usar este serviço. Isso inclui, mas não se limita a, como você interpreta, modifica e utiliza o conteúdo gerado pela IA em seus projetos finais.</p>

                    <h3>Alterações nos Termos</h3>
                    <p>Reservamo-nos o direito de modificar este aviso legal a qualquer momento. É sua responsabilidade revisar esta página periodicamente para se manter informado sobre quaisquer alterações.</p>
                </div>
            </div>
        </div>
    );
};

export default Disclaimer;
