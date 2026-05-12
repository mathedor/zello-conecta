/**
 * Seed: 50 profissionais na microrregião de Itajaí (SC) + clientes demo +
 * bookings históricos com payments e reviews para popular os relatórios admin.
 *
 * Uso: cd packages/db && npx tsx scripts/seed-pros-itajai.ts
 */
import {
  PrismaClient,
  type Weekday,
  type LocationMode,
  type PriceMode,
  type BookingStatus,
  type PaymentMethod,
  type PaymentStatus,
  type EscrowStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAYS: Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const PLATFORM_FEE = 0.2;

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

type CatSlug =
  | 'advocacia'
  | 'beleza-estetica'
  | 'reformas'
  | 'tecnologia'
  | 'saude-bem-estar'
  | 'aulas'
  | 'eventos'
  | 'limpeza'
  | 'consultoria'
  | 'design';

interface SvcSeed {
  title: string;
  description: string;
  priceMode: PriceMode;
  price: number;
  durationMin: number;
  locationMode: LocationMode;
  photos: string[];
}

const PHOTOS_BY_CAT: Record<CatSlug, string[]> = {
  advocacia: ['1589829085413-56de8ae18c73', '1521791136064-7986c2920216', '1450101499163-c8848c66ca85'],
  'beleza-estetica': ['1560066984-138dadb4c035', '1487412947147-5cebf100ffc2', '1522337360788-8b13dee7a37e'],
  reformas: ['1621905251189-08b45d6a269e', '1581094022024-6e3e8e39c39e', '1503387762-592deb58ef4e'],
  tecnologia: ['1517694712202-14dd9538aa97', '1488590528505-98d2b5aba04b', '1518709268805-4e9042af9f23'],
  'saude-bem-estar': ['1571019613454-1cb2f99b2d8b', '1599058917765-a780eda07a3e', '1534438327276-14e5300c3a48'],
  aulas: ['1503676260728-1c00da094a0b', '1456513080510-7bf3a84b82f8', '1571260899304-425eee4c7efc'],
  eventos: ['1530103862676-de8c9debad1d', '1492684223066-81342ee5ff30', '1467810563316-b5476525c0f9'],
  limpeza: ['1581578731548-c64695cc6952', '1527515637462-cff94eecc1ac', '1610557892470-55d9e80c0bce'],
  consultoria: ['1556761175-5973dc0f32e7', '1542744173-8e7e53415bb0', '1551836022-d5d88e9218df'],
  design: ['1561070791-2526d30994b8', '1626785774573-4b799315345d', '1498050108023-c5249f4df085'],
};

const SERVICES_BY_CAT: Record<CatSlug, SvcSeed[]> = {
  advocacia: [
    { title: 'Consultoria trabalhista preventiva', description: 'Atendimento online ou presencial para análise da relação de trabalho, orientação sobre direitos e deveres, com parecer escrito.', priceMode: 'HOURLY', price: 220, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Revisão de contrato', description: 'Análise integral de contrato (trabalho, locação, prestação de serviços) com parecer escrito e sugestões de cláusulas em até 5 dias úteis.', priceMode: 'FIXED', price: 750, durationMin: 240, locationMode: 'REMOTE', photos: [] },
    { title: 'Acompanhamento de audiência', description: 'Representação em audiências trabalhistas e cíveis em Itajaí e região, com preparação prévia e relatório.', priceMode: 'HOURLY', price: 320, durationMin: 60, locationMode: 'ON_SITE', photos: [] },
    { title: 'Inventário extrajudicial', description: 'Condução completa de inventário extrajudicial em cartório, incluindo levantamento de bens e cálculo de ITCMD.', priceMode: 'FIXED', price: 2800, durationMin: 480, locationMode: 'BOTH', photos: [] },
    { title: 'Divórcio consensual', description: 'Acompanhamento jurídico do divórcio consensual em cartório, com partilha de bens e guarda de filhos.', priceMode: 'FIXED', price: 1800, durationMin: 240, locationMode: 'BOTH', photos: [] },
    { title: 'Abertura de empresa MEI/ME', description: 'Assessoria completa para abertura de empresa: registro na Junta, CNPJ, alvará e enquadramento tributário.', priceMode: 'FIXED', price: 950, durationMin: 240, locationMode: 'REMOTE', photos: [] },
  ],
  'beleza-estetica': [
    { title: 'Corte feminino + escova', description: 'Corte personalizado conforme o formato do rosto e tipo de cabelo, com lavagem, hidratação rápida e finalização em escova.', priceMode: 'FIXED', price: 90, durationMin: 90, locationMode: 'BOTH', photos: [] },
    { title: 'Coloração + matização', description: 'Coloração completa com produtos profissionais e matização para neutralizar tons indesejados. Tonalidade alinhada na avaliação inicial.', priceMode: 'FIXED', price: 220, durationMin: 180, locationMode: 'ON_SITE', photos: [] },
    { title: 'Manicure e pedicure', description: 'Atendimento completo de manicure e pedicure com cutilagem, esfoliação dos pés e esmaltação. Inclui esmalte em gel sob consulta.', priceMode: 'FIXED', price: 65, durationMin: 75, locationMode: 'BOTH', photos: [] },
    { title: 'Maquiagem para eventos', description: 'Maquiagem profissional para casamentos, formaturas e festas. Inclui prova prévia opcional e cílios postiços.', priceMode: 'FIXED', price: 250, durationMin: 90, locationMode: 'BOTH', photos: [] },
    { title: 'Design de sobrancelhas', description: 'Design personalizado com henna ou natural, considerando formato do rosto e expressão.', priceMode: 'FIXED', price: 55, durationMin: 45, locationMode: 'ON_SITE', photos: [] },
    { title: 'Limpeza de pele profunda', description: 'Higienização profunda com vapor de ozônio, extração de cravos, máscara calmante e protetor solar.', priceMode: 'FIXED', price: 180, durationMin: 90, locationMode: 'ON_SITE', photos: [] },
    { title: 'Massagem modeladora', description: 'Sessão de massagem modeladora corporal com manobras intensas para definir contornos e ativar a circulação.', priceMode: 'HOURLY', price: 130, durationMin: 60, locationMode: 'ON_SITE', photos: [] },
  ],
  reformas: [
    { title: 'Instalação elétrica residencial', description: 'Instalação de tomadas, interruptores, luminárias e chuveiros. Troca de fios antigos quando necessário.', priceMode: 'HOURLY', price: 150, durationMin: 120, locationMode: 'ON_SITE', photos: [] },
    { title: 'Reparo hidráulico emergencial', description: 'Atendimento expresso para vazamentos, entupimentos e troca de torneiras/registros. Disponível 24h em Itajaí e região.', priceMode: 'FIXED', price: 280, durationMin: 90, locationMode: 'ON_SITE', photos: [] },
    { title: 'Pintura interna por m²', description: 'Pintura interna em paredes e tetos com massa corrida, lixa e duas demãos. Cobertura mínima 30m².', priceMode: 'FIXED', price: 28, durationMin: 60, locationMode: 'ON_SITE', photos: [] },
    { title: 'Instalação de ar-condicionado split', description: 'Instalação completa de ar split 9.000 a 24.000 BTUs com tubulação até 3m, dreno e testes. Suporte e infraestrutura inclusos.', priceMode: 'FIXED', price: 650, durationMin: 240, locationMode: 'ON_SITE', photos: [] },
    { title: 'Montagem de móveis planejados', description: 'Montagem profissional de móveis planejados (cozinha, dormitório, home office) com nivelamento e ajustes finais.', priceMode: 'HOURLY', price: 95, durationMin: 240, locationMode: 'ON_SITE', photos: [] },
    { title: 'Pequenos reparos / marido de aluguel', description: 'Furação, fixação de prateleiras, troca de fechaduras, instalação de cortinas e pequenos serviços do dia a dia.', priceMode: 'HOURLY', price: 80, durationMin: 60, locationMode: 'ON_SITE', photos: [] },
    { title: 'Reforma de banheiro completo', description: 'Reforma completa: demolição, hidráulica, elétrica, revestimentos, louças e metais. Prazo médio 15 dias úteis.', priceMode: 'FIXED', price: 8500, durationMin: 480, locationMode: 'ON_SITE', photos: [] },
  ],
  tecnologia: [
    { title: 'Manutenção de notebook/PC', description: 'Limpeza completa, troca de pasta térmica, diagnóstico de hardware e otimização do sistema operacional. Atendo em domicílio.', priceMode: 'FIXED', price: 180, durationMin: 90, locationMode: 'BOTH', photos: [] },
    { title: 'Criação de site institucional', description: 'Site responsivo com até 5 páginas, integrado a WhatsApp e Google Maps, com painel para edição de textos. Entrega em 15 dias.', priceMode: 'FIXED', price: 2200, durationMin: 480, locationMode: 'REMOTE', photos: [] },
    { title: 'Suporte técnico mensal para empresa', description: 'Pacote mensal com até 10h de suporte presencial/remoto, configuração de e-mails, antivírus e backups.', priceMode: 'FIXED', price: 850, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Configuração de rede Wi-Fi', description: 'Instalação e configuração de roteador e repetidores, criação de redes para convidados e otimização de cobertura.', priceMode: 'FIXED', price: 220, durationMin: 90, locationMode: 'ON_SITE', photos: [] },
    { title: 'Instalação de câmeras de segurança', description: 'Instalação de até 4 câmeras IP com gravação em nuvem, configuração de acesso remoto pelo celular.', priceMode: 'FIXED', price: 1400, durationMin: 240, locationMode: 'ON_SITE', photos: [] },
    { title: 'Recuperação de dados HD/SSD', description: 'Recuperação de arquivos de HD, SSD ou pen-drive corrompido. Diagnóstico gratuito e cobrança só em caso de sucesso.', priceMode: 'FIXED', price: 350, durationMin: 240, locationMode: 'REMOTE', photos: [] },
  ],
  'saude-bem-estar': [
    { title: 'Personal trainer presencial', description: 'Sessão personalizada com avaliação postural, treino e correção técnica. Atende em academia parceira ou na casa do cliente.', priceMode: 'HOURLY', price: 110, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Avaliação nutricional completa', description: 'Consulta de nutrição com anamnese, antropometria e plano alimentar personalizado de 30 dias. Retorno em 30 dias incluso.', priceMode: 'FIXED', price: 240, durationMin: 90, locationMode: 'BOTH', photos: [] },
    { title: 'Sessão de fisioterapia', description: 'Atendimento de fisioterapia ortopédica/RPG na clínica ou domicílio. Indicado para dores musculares e pós-cirúrgico.', priceMode: 'HOURLY', price: 150, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Massagem relaxante 60min', description: 'Massagem relaxante com óleos essenciais, ambiente preparado com aromaterapia. Atende em domicílio ou estúdio.', priceMode: 'FIXED', price: 160, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Aula particular de yoga', description: 'Aula individual ou para 2 pessoas. Pranayama, posturas básicas e relaxamento guiado. Tapetes inclusos.', priceMode: 'HOURLY', price: 130, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Acompanhamento psicológico online', description: 'Sessões de psicologia clínica online (CRP ativo), abordagem cognitivo-comportamental. Pacote 4 sessões com desconto.', priceMode: 'HOURLY', price: 180, durationMin: 50, locationMode: 'REMOTE', photos: [] },
  ],
  aulas: [
    { title: 'Aula particular de matemática', description: 'Reforço escolar do 6º ao 3º ano do ensino médio. Atendimento individual ou em dupla.', priceMode: 'HOURLY', price: 80, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Inglês conversação intermediário', description: 'Aulas de conversação para alunos com base, focadas em fluência e pronúncia. Material digital incluso.', priceMode: 'HOURLY', price: 95, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Aula de violão para iniciantes', description: 'Curso prático com acordes básicos e leitura de cifras. Pacote de 8 aulas com material digital.', priceMode: 'FIXED', price: 480, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Reforço escolar ensino fundamental', description: 'Acompanhamento escolar com plano semanal, correção de exercícios e preparação para provas.', priceMode: 'HOURLY', price: 70, durationMin: 60, locationMode: 'BOTH', photos: [] },
    { title: 'Pré-vestibular ENEM personalizado', description: 'Mentoria semanal para o ENEM com plano de estudos, simulados e correção de redação.', priceMode: 'HOURLY', price: 120, durationMin: 90, locationMode: 'REMOTE', photos: [] },
    { title: 'Aula de natação infantil', description: 'Aulas de natação para crianças de 4 a 12 anos em piscina parceira. Inclui adaptação, nado básico e segurança aquática.', priceMode: 'FIXED', price: 65, durationMin: 45, locationMode: 'ON_SITE', photos: [] },
  ],
  eventos: [
    { title: 'DJ para festas e eventos', description: 'DJ profissional com som, iluminação e máquina de fumaça. Até 6h de evento. Repertório personalizado.', priceMode: 'FIXED', price: 2400, durationMin: 360, locationMode: 'ON_SITE', photos: [] },
    { title: 'Cobertura fotográfica de evento', description: 'Cobertura fotográfica profissional com entrega de 200 fotos editadas em até 15 dias. Inclui álbum digital.', priceMode: 'FIXED', price: 1800, durationMin: 360, locationMode: 'ON_SITE', photos: [] },
    { title: 'Buffet para até 50 pessoas', description: 'Cardápio com 4 entradas, 2 pratos quentes, salada e sobremesa. Inclui louças e atendimento.', priceMode: 'FIXED', price: 4500, durationMin: 360, locationMode: 'ON_SITE', photos: [] },
    { title: 'Cerimonialista casamento', description: 'Planejamento e condução do casamento dia C. Inclui visitas técnicas, ensaio e suporte com fornecedores.', priceMode: 'FIXED', price: 3800, durationMin: 480, locationMode: 'BOTH', photos: [] },
    { title: 'Aluguel de estrutura para festa', description: 'Tendas, mesas, cadeiras e iluminação para eventos de até 100 pessoas. Instalação e retirada inclusas.', priceMode: 'FIXED', price: 1600, durationMin: 240, locationMode: 'ON_SITE', photos: [] },
    { title: 'Filmagem cinematográfica de casamento', description: 'Filmagem com 2 câmeras, drone e edição cinematográfica. Entrega de teaser 1min + filme 8 a 12min.', priceMode: 'FIXED', price: 3200, durationMin: 480, locationMode: 'ON_SITE', photos: [] },
  ],
  limpeza: [
    { title: 'Faxina completa residencial', description: 'Faxina completa: cozinha, banheiros, quartos, sala, áreas externas e lavanderia. Produtos inclusos.', priceMode: 'FIXED', price: 280, durationMin: 360, locationMode: 'ON_SITE', photos: [] },
    { title: 'Limpeza pós-obra', description: 'Remoção de respingos de tinta, cimento e poeira de obra. Indicado para imóveis novos ou reformados.', priceMode: 'FIXED', price: 420, durationMin: 480, locationMode: 'ON_SITE', photos: [] },
    { title: 'Limpeza de sofá e poltronas', description: 'Higienização profunda com extratora, eliminando ácaros, manchas e odores. Secagem em até 6h.', priceMode: 'FIXED', price: 220, durationMin: 120, locationMode: 'ON_SITE', photos: [] },
    { title: 'Diarista 6h', description: 'Atendimento de 6h em residência. Inclui limpeza geral, organização e roupa, mediante combinado.', priceMode: 'FIXED', price: 170, durationMin: 360, locationMode: 'ON_SITE', photos: [] },
    { title: 'Limpeza de vidros e fachada', description: 'Limpeza de vidros, esquadrias e fachadas até 2º andar. Atende apartamentos e comércios.', priceMode: 'HOURLY', price: 90, durationMin: 180, locationMode: 'ON_SITE', photos: [] },
    { title: 'Limpeza de estofados automotivos', description: 'Higienização completa de bancos e estofados do carro com extratora e produtos enzimáticos.', priceMode: 'FIXED', price: 260, durationMin: 180, locationMode: 'ON_SITE', photos: [] },
  ],
  consultoria: [
    { title: 'Diagnóstico financeiro PJ', description: 'Análise completa do fluxo de caixa, custos e margem da empresa, com plano de ação em até 7 dias.', priceMode: 'FIXED', price: 1200, durationMin: 240, locationMode: 'BOTH', photos: [] },
    { title: 'Plano de negócios profissional', description: 'Elaboração de plano de negócios completo com modelo Canvas, análise de mercado e projeção financeira 3 anos.', priceMode: 'FIXED', price: 2400, durationMin: 480, locationMode: 'REMOTE', photos: [] },
    { title: 'Mentoria mensal para empreendedor', description: 'Sessão de mentoria 1:1 + suporte por mensagem durante 30 dias. Foco em gestão, marketing e vendas.', priceMode: 'FIXED', price: 950, durationMin: 90, locationMode: 'BOTH', photos: [] },
    { title: 'Implantação de gestão por indicadores', description: 'Definição de KPIs, criação de dashboards e treinamento da equipe. Indicado para empresas com 5+ funcionários.', priceMode: 'FIXED', price: 3200, durationMin: 480, locationMode: 'BOTH', photos: [] },
    { title: 'Consultoria de marketing digital', description: 'Auditoria de presença digital, plano de conteúdo trimestral e definição de funil de vendas.', priceMode: 'FIXED', price: 1800, durationMin: 240, locationMode: 'REMOTE', photos: [] },
  ],
  design: [
    { title: 'Identidade visual completa', description: 'Logo, paleta, tipografia, manual de marca e aplicações em redes. Até 3 rodadas de ajustes.', priceMode: 'FIXED', price: 1500, durationMin: 240, locationMode: 'REMOTE', photos: [] },
    { title: 'Posts para redes sociais (pacote 12)', description: 'Pacote de 12 posts editáveis no Canva, com identidade da marca. Entrega em 7 dias.', priceMode: 'FIXED', price: 480, durationMin: 240, locationMode: 'REMOTE', photos: [] },
    { title: 'Design de cardápio digital', description: 'Cardápio digital responsivo com QR Code, integração com WhatsApp para pedidos. Inclui hospedagem 1 ano.', priceMode: 'FIXED', price: 750, durationMin: 240, locationMode: 'REMOTE', photos: [] },
    { title: 'Material gráfico para evento', description: 'Convites, programação, plaquinhas e identidade visual do evento. Entrega em arquivos prontos para gráfica.', priceMode: 'FIXED', price: 950, durationMin: 240, locationMode: 'REMOTE', photos: [] },
    { title: 'Diagramação de ebook/apostila', description: 'Diagramação de ebook ou apostila até 60 páginas, com imagens, índice e identidade visual.', priceMode: 'FIXED', price: 850, durationMin: 240, locationMode: 'REMOTE', photos: [] },
  ],
};

interface ProSeed {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
  city: string;
  cat: CatSlug;
  headline: string;
  bio: string;
}

const FEMALE_NAMES = [
  'Ana', 'Beatriz', 'Camila', 'Daniela', 'Eliane', 'Fernanda', 'Gabriela', 'Helena',
  'Isabela', 'Juliana', 'Karina', 'Larissa', 'Mariana', 'Natália', 'Patrícia', 'Renata',
  'Sabrina', 'Tatiane', 'Vanessa', 'Yasmin', 'Aline', 'Bruna', 'Carolina', 'Débora', 'Mônica',
];
const MALE_NAMES = [
  'André', 'Bruno', 'Caio', 'Diego', 'Eduardo', 'Felipe', 'Gabriel', 'Henrique',
  'Igor', 'João', 'Leonardo', 'Marcos', 'Nelson', 'Otávio', 'Paulo', 'Rafael',
  'Rodrigo', 'Sérgio', 'Thiago', 'Vinícius', 'Wesley', 'Marcelo', 'Anderson', 'Lucas', 'Daniel',
];
const SURNAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Ribeiro',
  'Alves', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Almeida', 'Costa', 'Barbosa',
  'Cardoso', 'Moraes', 'Schmitt', 'Müller', 'Krieger', 'Bittencourt', 'Pacheco', 'Fischer',
];

const CITIES: { name: string; count: number; phonePrefix: string }[] = [
  { name: 'Itajaí', count: 9, phonePrefix: '47991' },
  { name: 'Balneário Camboriú', count: 8, phonePrefix: '47992' },
  { name: 'Itapema', count: 6, phonePrefix: '47993' },
  { name: 'Camboriú', count: 5, phonePrefix: '47994' },
  { name: 'Navegantes', count: 5, phonePrefix: '47995' },
  { name: 'Penha', count: 4, phonePrefix: '47996' },
  { name: 'Balneário Piçarras', count: 4, phonePrefix: '47997' },
  { name: 'Bombinhas', count: 3, phonePrefix: '47998' },
  { name: 'Porto Belo', count: 3, phonePrefix: '47999' },
  { name: 'Ilhota', count: 2, phonePrefix: '47988' },
  { name: 'Luiz Alves', count: 1, phonePrefix: '47989' },
];

const CAT_ROTATION: CatSlug[] = [
  'beleza-estetica', 'reformas', 'saude-bem-estar', 'aulas', 'limpeza',
  'tecnologia', 'eventos', 'advocacia', 'consultoria', 'design',
  'reformas', 'beleza-estetica', 'saude-bem-estar', 'aulas', 'limpeza',
  'reformas', 'beleza-estetica', 'tecnologia', 'eventos', 'advocacia',
  'saude-bem-estar', 'reformas', 'beleza-estetica', 'aulas', 'limpeza',
  'consultoria', 'design', 'tecnologia', 'eventos', 'beleza-estetica',
  'saude-bem-estar', 'reformas', 'limpeza', 'aulas', 'tecnologia',
  'beleza-estetica', 'reformas', 'saude-bem-estar', 'eventos', 'advocacia',
  'consultoria', 'limpeza', 'tecnologia', 'beleza-estetica', 'reformas',
  'aulas', 'saude-bem-estar', 'design', 'eventos', 'advocacia',
];

const HEADLINES: Record<CatSlug, string[]> = {
  advocacia: ['Advogado(a) — Trabalhista e Cível', 'Direito de Família e Sucessões', 'Advocacia Empresarial e Tributária'],
  'beleza-estetica': ['Cabeleireiro(a) e colorista', 'Esteticista facial e corporal', 'Designer de sobrancelhas e maquiadora', 'Manicure e pedicure especializada'],
  reformas: ['Eletricista predial e residencial', 'Encanador e bombeiro hidráulico', 'Pintor residencial', 'Marido de aluguel — pequenos reparos', 'Reformas em geral com equipe'],
  tecnologia: ['Técnico em informática e redes', 'Desenvolvedor web e suporte', 'Instalador de câmeras e automação'],
  'saude-bem-estar': ['Personal trainer — CREF ativo', 'Nutricionista clínico(a)', 'Fisioterapeuta ortopédico(a)', 'Massoterapeuta e terapeuta integrativo(a)', 'Psicólogo(a) clínico(a)'],
  aulas: ['Professor(a) particular ENEM e vestibular', 'Aulas de inglês — Cambridge', 'Reforço escolar e alfabetização', 'Professor(a) de música'],
  eventos: ['Cerimonialista e wedding planner', 'DJ e produtor(a) de eventos', 'Fotógrafo(a) e videomaker', 'Buffet e produção gastronômica'],
  limpeza: ['Diarista experiente — sem fiador', 'Limpeza pós-obra e técnica', 'Higienização de estofados e sofás'],
  consultoria: ['Consultor(a) financeiro PJ', 'Mentor(a) de negócios e marketing'],
  design: ['Designer gráfico — branding e social', 'Designer e ilustrador(a) digital'],
};

const CAT_LABEL: Record<CatSlug, string> = {
  advocacia: 'advocacia',
  'beleza-estetica': 'beleza e estética',
  reformas: 'reformas e construção',
  tecnologia: 'tecnologia',
  'saude-bem-estar': 'saúde e bem-estar',
  aulas: 'aulas e cursos',
  eventos: 'eventos e festas',
  limpeza: 'limpeza',
  consultoria: 'consultoria',
  design: 'design e criação',
};

function makeBio(cat: CatSlug, cityLabel: string, yrs: number) {
  const label = CAT_LABEL[cat];
  return `Profissional de ${label} com ${yrs} anos de experiência atuando em ${cityLabel} e região. Atendimento humanizado, agenda flexível e orçamento sem compromisso. Trabalho com seriedade, pontualidade e total transparência. Garanto qualidade nos materiais e suporte pós-atendimento. Já atendi famílias, empresas e turistas em toda a microrregião de Itajaí.`;
}

function rand<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function buildPros(): ProSeed[] {
  const pros: ProSeed[] = [];
  let i = 0;
  for (const c of CITIES) {
    for (let k = 0; k < c.count; k++) {
      const cat = CAT_ROTATION[i] ?? 'reformas';
      const useFemale = i % 2 === 0;
      const fn = useFemale ? rand(FEMALE_NAMES, i + 3) : rand(MALE_NAMES, i + 7);
      const ln = rand(SURNAMES, i * 3 + 1);
      const fullName = `${fn} ${ln}`;
      const slug = `${fn}-${ln}-${i + 1}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const email = `${slug}@demo.zelloconecta.com.br`;
      const cpf = String(10000000000 + (i + 1) * 70123).slice(0, 11);
      const phone = `+55${c.phonePrefix}${String(10000 + i * 7).slice(0, 5)}`;
      const yrs = 3 + (i % 12);
      const headlines = HEADLINES[cat];
      pros.push({
        firstName: fn,
        lastName: ln,
        email,
        cpf,
        phone,
        city: c.name,
        cat,
        headline: rand(headlines, i),
        bio: makeBio(cat, c.name, yrs),
      });
      void fullName;
      i++;
    }
  }
  return pros;
}

function pickServices(cat: CatSlug, idx: number): SvcSeed[] {
  const all = SERVICES_BY_CAT[cat];
  const count = 4 + (idx % 2);
  const start = idx % all.length;
  const out: SvcSeed[] = [];
  for (let j = 0; j < count; j++) {
    const s = all[(start + j) % all.length];
    out.push(s);
  }
  return out;
}

const REVIEW_COMMENTS = [
  'Atendimento impecável, super pontual e atencioso. Recomendo demais!',
  'Excelente profissional, entregou tudo no prazo combinado e com qualidade.',
  'Adorei o serviço, voltarei a contratar com certeza. Muito atencioso.',
  'Cumpriu o prometido, comunicação ótima e resultado acima da expectativa.',
  'Profissional muito caprichoso e simpático, indiquei pra várias pessoas.',
  'Resolveu rapidinho o que eu precisava, preço justo e bom atendimento.',
  'Cheguei nervoso e saí super tranquilo. Atendimento humano e técnico.',
  'Faço questão de marcar de novo. Vale cada centavo.',
  'Pontual, educado e trouxe todo o material necessário. Top.',
  'Resultado ficou perfeito, exatamente como combinado. Indico!',
];

async function ensureCategories(): Promise<Map<CatSlug, string>> {
  const map = new Map<CatSlug, string>();
  const all = (Object.keys(SERVICES_BY_CAT) as CatSlug[]);
  for (const slug of all) {
    const c = await prisma.category.findUnique({ where: { slug } });
    if (!c) throw new Error(`Categoria ${slug} não existe. Rode o seed base primeiro.`);
    map.set(slug, c.id);
  }
  return map;
}

const CLIENTS_DATA = [
  { name: 'Mariana Cliente', email: 'mariana.cliente@demo.zelloconecta.com.br', cpf: '90011122233', phone: '+5547991110001' },
  { name: 'Rafael Cliente', email: 'rafael.cliente@demo.zelloconecta.com.br', cpf: '90011122244', phone: '+5547991110002' },
  { name: 'Beatriz Cliente', email: 'beatriz.cliente@demo.zelloconecta.com.br', cpf: '90011122255', phone: '+5547991110003' },
  { name: 'Felipe Cliente', email: 'felipe.cliente@demo.zelloconecta.com.br', cpf: '90011122266', phone: '+5547991110004' },
  { name: 'Carla Cliente', email: 'carla.cliente@demo.zelloconecta.com.br', cpf: '90011122277', phone: '+5547991110005' },
  { name: 'Lucas Cliente', email: 'lucas.cliente@demo.zelloconecta.com.br', cpf: '90011122288', phone: '+5547991110006' },
  { name: 'Patrícia Cliente', email: 'patricia.cliente@demo.zelloconecta.com.br', cpf: '90011122299', phone: '+5547991110007' },
  { name: 'Eduardo Cliente', email: 'eduardo.cliente@demo.zelloconecta.com.br', cpf: '90011122300', phone: '+5547991110008' },
];

async function ensureClients(passwordHash: string): Promise<string[]> {
  const ids: string[] = [];
  for (const c of CLIENTS_DATA) {
    const existing = await prisma.user.findUnique({ where: { email: c.email } });
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const u = await prisma.user.create({
      data: {
        email: c.email,
        name: c.name,
        phone: c.phone,
        cpf: c.cpf,
        passwordHash,
        role: 'CLIENT',
        kycStatus: 'APPROVED',
        status: 'ACTIVE',
      },
    });
    ids.push(u.id);
  }
  return ids;
}

interface SeededService {
  id: string;
  price: number;
  durationMin: number;
  locationMode: LocationMode;
  categoryId: string;
}

interface SeededPro {
  professionalId: string;
  totalCompleted: number;
  totalReviews: number;
  averageRating: number;
  services: SeededService[];
}

async function seedPro(p: ProSeed, idx: number, passwordHash: string, catMap: Map<CatSlug, string>): Promise<SeededPro> {
  let user = await prisma.user.findUnique({ where: { email: p.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: p.email,
        name: `${p.firstName} ${p.lastName}`,
        phone: p.phone,
        cpf: p.cpf,
        passwordHash,
        role: 'PROFESSIONAL',
        kycStatus: 'APPROVED',
        status: 'ACTIVE',
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { kycStatus: 'APPROVED', status: 'ACTIVE', passwordHash },
    });
  }

  const totalCompleted = 12 + ((idx * 7) % 80);
  const totalReviews = Math.max(3, Math.floor(totalCompleted * (0.4 + (idx % 5) * 0.1)));
  const averageRating = 4.0 + ((idx % 11) * 0.1);
  const totalEarned = totalCompleted * (220 + (idx % 9) * 60);
  const balanceAvailable = totalEarned * 0.15;
  const balancePending = totalEarned * 0.05;

  const baseSlug = `${p.firstName}-${p.lastName}-${idx + 1}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const professional = await prisma.professional.upsert({
    where: { userId: user.id },
    update: {
      slug: baseSlug,
      headline: p.headline,
      bio: p.bio,
      city: p.city,
      state: 'SC',
      averageRating,
      totalReviews,
      totalCompleted,
      totalBookings: totalCompleted + Math.floor(totalCompleted * 0.15),
      totalEarned,
      balanceAvailable,
      balancePending,
    },
    create: {
      userId: user.id,
      slug: baseSlug,
      headline: p.headline,
      bio: p.bio,
      city: p.city,
      state: 'SC',
      averageRating,
      totalReviews,
      totalCompleted,
      totalBookings: totalCompleted + Math.floor(totalCompleted * 0.15),
      totalEarned,
      balanceAvailable,
      balancePending,
    },
  });

  // Wipe and recreate services
  await prisma.servicePhoto.deleteMany({ where: { service: { professionalId: professional.id } } });
  await prisma.service.deleteMany({ where: { professionalId: professional.id } });

  const services = pickServices(p.cat, idx);
  const seededServices: SeededService[] = [];
  const photosPool = PHOTOS_BY_CAT[p.cat];

  for (let s = 0; s < services.length; s++) {
    const svc = services[s];
    const catId = catMap.get(p.cat)!;
    const slug = `${svc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${baseSlug}`.slice(0, 80);
    const created = await prisma.service.create({
      data: {
        professionalId: professional.id,
        categoryId: catId,
        title: svc.title,
        slug,
        description: svc.description,
        priceMode: svc.priceMode,
        price: svc.price,
        durationMin: svc.durationMin,
        locationMode: svc.locationMode,
        active: true,
        photos: {
          create: [photosPool[(s) % photosPool.length], photosPool[(s + 1) % photosPool.length]].map((id, ord) => ({
            url: u(id),
            order: ord,
          })),
        },
      },
    });
    seededServices.push({
      id: created.id,
      price: svc.price,
      durationMin: svc.durationMin,
      locationMode: svc.locationMode,
      categoryId: catId,
    });
  }

  // Schedule MON-FRI 8-12 / 14-18
  await prisma.schedule.deleteMany({ where: { professionalId: professional.id } });
  for (const day of DAYS) {
    await prisma.schedule.createMany({
      data: [
        { professionalId: professional.id, weekday: day, startTime: '08:00', endTime: '12:00' },
        { professionalId: professional.id, weekday: day, startTime: '14:00', endTime: '18:00' },
      ],
    });
  }

  return {
    professionalId: professional.id,
    totalCompleted,
    totalReviews,
    averageRating,
    services: seededServices,
  };
}

async function seedBookings(seeded: SeededPro[], clientIds: string[]) {
  console.log('\nGerando bookings históricos…');
  const now = new Date();
  let bookingCount = 0;
  let reviewCount = 0;

  // Limpa bookings demo prévios para evitar acumulação ao reodar
  const demoEmails = CLIENTS_DATA.map((c) => c.email);
  const demoClients = await prisma.user.findMany({ where: { email: { in: demoEmails } }, select: { id: true } });
  const demoClientIds = demoClients.map((c) => c.id);
  if (demoClientIds.length) {
    const oldBookings = await prisma.booking.findMany({ where: { clientId: { in: demoClientIds } }, select: { id: true } });
    const ids = oldBookings.map((b) => b.id);
    if (ids.length) {
      await prisma.review.deleteMany({ where: { bookingId: { in: ids } } });
      await prisma.payment.deleteMany({ where: { bookingId: { in: ids } } });
      await prisma.booking.deleteMany({ where: { id: { in: ids } } });
      console.log(`  (limpou ${ids.length} bookings demo antigos)`);
    }
  }

  for (let i = 0; i < seeded.length; i++) {
    const pro = seeded[i];
    // 3 a 6 bookings por pro, distribuídos nos últimos 60 dias
    const n = 3 + (i % 4);
    for (let b = 0; b < n; b++) {
      const svc = pro.services[(b + i) % pro.services.length];
      const clientId = clientIds[(i * 3 + b) % clientIds.length];

      const daysAgo = Math.floor(((i * 11 + b * 7) % 58)) + 1; // 1 a 58 dias atrás
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 3600 * 1000);
      const scheduledAt = new Date(createdAt.getTime() + 2 * 24 * 3600 * 1000);
      scheduledAt.setHours(9 + ((i + b) % 8), 0, 0, 0);
      const scheduledEnd = new Date(scheduledAt.getTime() + svc.durationMin * 60 * 1000);

      // Status distribution: most COMPLETED, some CONFIRMED, some CANCELLED, some PENDING
      const statusRoll = (i * 13 + b * 5) % 100;
      let status: BookingStatus;
      let paymentStatus: PaymentStatus = 'PAID';
      let escrowStatus: EscrowStatus = 'RELEASED';
      let completedAt: Date | null = null;
      let releasedAt: Date | null = null;
      if (statusRoll < 70) {
        status = 'COMPLETED';
        completedAt = new Date(scheduledEnd.getTime() + 3600 * 1000);
        releasedAt = new Date(completedAt.getTime() + 48 * 3600 * 1000);
      } else if (statusRoll < 85) {
        // Booking futuro confirmado
        status = 'CONFIRMED';
        const futureAt = new Date(now.getTime() + ((b + 1) * 24 * 3600 * 1000));
        futureAt.setHours(10 + ((i + b) % 6), 0, 0, 0);
        scheduledAt.setTime(futureAt.getTime());
        scheduledEnd.setTime(futureAt.getTime() + svc.durationMin * 60 * 1000);
        paymentStatus = 'PAID';
        escrowStatus = 'HELD';
      } else if (statusRoll < 92) {
        status = 'CANCELLED';
        paymentStatus = 'REFUNDED';
        escrowStatus = 'REFUNDED';
      } else if (statusRoll < 97) {
        status = 'PENDING_PAYMENT';
        paymentStatus = 'PENDING';
        escrowStatus = 'HELD';
      } else {
        status = 'DISPUTED';
        paymentStatus = 'PAID';
        escrowStatus = 'HELD';
      }

      const total = svc.price;
      const platformFee = Math.round(total * PLATFORM_FEE * 100) / 100;
      const net = Math.round((total - platformFee) * 100) / 100;

      const method: PaymentMethod = (i + b) % 2 === 0 ? 'PIX' : 'CARD';

      const booking = await prisma.booking.create({
        data: {
          clientId,
          professionalId: pro.professionalId,
          serviceId: svc.id,
          scheduledAt,
          scheduledEnd,
          durationMin: svc.durationMin,
          locationMode: svc.locationMode,
          servicePrice: total,
          travelFee: 0,
          platformFee,
          totalAmount: total,
          netToProvider: net,
          status,
          completedByClient: status === 'COMPLETED',
          completedAt,
          releasedAt,
          createdAt,
          updatedAt: createdAt,
          payment: {
            create: {
              method,
              status: paymentStatus,
              amount: total,
              escrowStatus,
              paidAt: paymentStatus === 'PAID' ? createdAt : null,
            },
          },
        },
      });
      bookingCount++;

      // Para uma fração dos completed, adicionar review
      if (status === 'COMPLETED' && (i + b) % 3 !== 2) {
        const rating = 4 + ((i + b) % 2);
        const comment = REVIEW_COMMENTS[(i * 7 + b) % REVIEW_COMMENTS.length];
        await prisma.review.create({
          data: {
            bookingId: booking.id,
            authorId: clientId,
            rating,
            comment,
            createdAt: completedAt ?? scheduledEnd,
          },
        });
        reviewCount++;
      }
    }
  }

  console.log(`  ✓ ${bookingCount} bookings + ${reviewCount} reviews criados`);
}

async function main() {
  console.log('Seed Itajaí — 50 profissionais + dados de relatório\n');
  const passwordHash = await bcrypt.hash('demo12345', 10);

  const catMap = await ensureCategories();
  const pros = buildPros();
  console.log(`Total a criar: ${pros.length} profissionais`);

  const seeded: SeededPro[] = [];
  for (let i = 0; i < pros.length; i++) {
    const p = pros[i];
    const res = await seedPro(p, i, passwordHash, catMap);
    seeded.push(res);
    console.log(`  ✓ [${i + 1}/${pros.length}] ${p.firstName} ${p.lastName} — ${p.city} — ${p.cat} (${res.services.length} serviços)`);
  }

  console.log('\nGarantindo clientes demo…');
  const clientIds = await ensureClients(passwordHash);
  console.log(`  ✓ ${clientIds.length} clientes prontos`);

  await seedBookings(seeded, clientIds);

  console.log('\nPronto! Logins (senha: demo12345)');
  console.log('  Profissional exemplo:', pros[0].email);
  console.log('  Cliente exemplo:', CLIENTS_DATA[0].email);
  console.log('\nAcesse /admin para ver os relatórios e /buscar?uf=SC para a vitrine.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
