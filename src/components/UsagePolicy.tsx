import React from 'react';
import { ClipboardDocumentListIcon } from './Icons';

const UsagePolicy: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-base-200 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-2 text-brand-light flex items-center gap-3">
                    <ClipboardDocumentListIcon className="w-8 h-8" />
                    Política de Uso e Compromisso com a Originalidade
                </h2>
            </div>
            <div className="flex-1 bg-base-200 p-6 rounded-xl shadow-lg overflow-y-auto">
                <div className="prose prose-invert max-w-none text-gray-300">
                    <h3>1. Nosso Compromisso com a Originalidade</h3>
                    <p>Nossa principal missão é ser um parceiro confiável em sua jornada criativa. Entendemos que a originalidade e a exclusividade são fundamentais para qualquer escritor. Por isso, nosso aplicativo é construído com um forte compromisso para garantir que cada história e conteúdo gerado seja único.</p>
                    <ul>
                        <li><strong>Instruções Avançadas para a IA:</strong> Todas as nossas ferramentas de geração de texto são equipadas com diretrizes rigorosas para a inteligência artificial. A IA é instruída a criar conteúdo 100% original, evitando ativamente a repetição de enredos, personagens ou frases de obras existentes ou de gerações anteriores para outros usuários.</li>
                        <li><strong>Exclusividade por Solicitação:</strong> Mesmo que dois usuários insiram solicitações (prompts) semelhantes, a IA tem a responsabilidade de gerar uma narrativa completamente nova e distinta para cada um. Nós não permitimos que nossa ferramenta produza conteúdo duplicado.</li>
                        <li><strong>Backup e Verificação:</strong> Mantemos registros seguros e anônimos das criações para monitorar e aprimorar os mecanismos de originalidade da IA, garantindo que a plataforma evolua continuamente para proteger a integridade do seu trabalho.</li>
                    </ul>

                    <h3>2. Responsabilidade Compartilhada</h3>
                    <p>Acreditamos em uma parceria criativa. Nós fornecemos uma ferramenta poderosa e nos comprometemos a entregar uma base de trabalho genuinamente original. Em troca, pedimos que você, como criador, use o conteúdo gerado como um ponto de partida, infundindo-o com sua voz e visão únicas. Recomendamos que o autor faça uma verificação final como parte de seu processo criativo, garantindo que a obra final seja um reflexo perfeito de sua intenção.</p>

                    <h3>3. Propriedade Intelectual</h3>
                    <p>O conteúdo que você cria é seu. Você detém todos os direitos sobre as obras finais produzidas com a ajuda de nossa plataforma. Nosso papel é fornecer a ferramenta; a autoria e a propriedade da criação são inteiramente suas.</p>

                    <h3>4. Uso Aceitável da Plataforma</h3>
                    <p>Para manter um ambiente criativo e seguro, você concorda em não usar nosso serviço para:</p>
                    <ul>
                        <li>Gerar conteúdo que seja ilegal, difamatório, odioso ou que promova violência.</li>
                        <li>Infringir deliberadamente direitos autorais ou marcas registradas de terceiros.</li>
                        <li>Criar ou disseminar desinformação prejudicial.</li>
                        <li>Tentar manipular ou contornar nossos sistemas de segurança e originalidade.</li>
                    </ul>

                    <h3>5. Uso da API e Recursos</h3>
                    <p>O uso de ferramentas que consomem muitos recursos, como a geração de vídeo, está sujeito a limites de uso justo e às políticas de nossos provedores de API (Google). Para ferramentas que exigem uma chave de API do Google Cloud, você é responsável por todos os custos associados ao uso dessa chave em sua conta do Google Cloud.</p>

                    <h3>6. Modificações na Política</h3>
                    <p>Podemos revisar esta Política de Uso para refletir melhorias em nossa tecnologia e compromissos. A versão mais atual estará sempre disponível aqui. Ao continuar a usar o serviço, você concorda em ficar vinculado à política revisada.</p>
                </div>
            </div>
        </div>
    );
};

export default UsagePolicy;