/**
 * Dados canônicos do relatório "Custos & Desenvolvimento" (/admin/custos).
 *
 * Tudo aqui é estático e versionado em código — o que muda no dia a dia
 * (marcações de "pago", overrides de valor e custos avulsos registrados pelo
 * dono) fica no localStorage sob a chave STORAGE_KEY.
 */

export const STORAGE_KEY = 'zello-custos-v1';

/** Câmbio de referência usado para converter as contas em dólar. */
export const USD_RATE = 5.45;

/** Mês em que a primeira versão entrou no ar (YYYY-MM). */
export const FIRST_MONTH = '2026-05';

/* ------------------------------------------------------------------ *
 * Setup inicial
 * ------------------------------------------------------------------ */

export const SETUP = {
  value: 71883,
  date: '06/05/2026',
  title: 'Desenvolvimento e entrega da versão 1',
  description:
    'Marketplace completo no ar: site institucional, cadastro de clientes e ' +
    'profissionais, verificação de documentos, catálogo de serviços, agenda, ' +
    'busca pública, agendamento com pagamento retido, avaliações, saques e ' +
    'painel administrativo.',
} as const;

/* ------------------------------------------------------------------ *
 * Contas fixas mensais
 * ------------------------------------------------------------------ */

export interface MonthlyItem {
  id: string;
  label: string;
  value: number;
  /** Valor em dólar, quando a conta é cobrada em USD. */
  usd?: number;
  /** true = valor aproximado, ainda a confirmar. */
  estimated?: boolean;
  note: string;
}

export const MONTHLY_ITEMS: MonthlyItem[] = [
  {
    id: 'vercel',
    label: 'Vercel (hospedagem)',
    value: 109,
    usd: 20,
    estimated: true,
    note: 'Site, painéis e APIs no ar, com armazenamento de fotos e documentos.',
  },
  {
    id: 'banco',
    label: 'Banco de dados (Neon)',
    value: 136.25,
    usd: 25,
    estimated: true,
    note: 'Onde ficam usuários, serviços, agenda, reservas e pagamentos.',
  },
  {
    id: 'backup',
    label: 'Backup',
    value: 440,
    note: 'Cópia diária de tudo, com retenção — proteção contra perda de dados.',
  },
  {
    id: 'resend',
    label: 'Resend (e-mail)',
    value: 109,
    usd: 20,
    estimated: true,
    note: 'E-mails de boas-vindas, KYC, pagamento, saque e avaliação.',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    value: 99,
    estimated: true,
    note: 'Canal oficial de WhatsApp para avisos e atendimento.',
  },
  {
    id: 'firewall',
    label: 'Firewall',
    value: 125.35,
    usd: 23,
    note: 'Bloqueio de ataques e tráfego malicioso antes de chegar no sistema.',
  },
  {
    id: 'proxies',
    label: 'Proxies',
    value: 103.55,
    usd: 19,
    note: 'Saída de rede dedicada para integrações externas.',
  },
  {
    id: 'vps-agentes',
    label: 'VPS de agentes',
    value: 590,
    note: 'Servidor das rotinas automáticas (liberação de escrow, monitoramento, relatórios).',
  },
];

export const MONTHLY_TOTAL = MONTHLY_ITEMS.reduce((s, i) => s + i.value, 0);

/* ------------------------------------------------------------------ *
 * Desenvolvimento pós-entrega
 * ------------------------------------------------------------------ */

export type TierKey = 'P' | 'M' | 'G' | 'X';

/** tokens em milhões · valor em R$ (base Opus, câmbio 5,45) */
export const TIERS: Record<TierKey, { tokens: number; value: number; label: string }> = {
  P: { tokens: 1.6, value: 65.4, label: 'Ajuste pontual' },
  M: { tokens: 4.4, value: 163.5, label: 'Funcionalidade' },
  G: { tokens: 8.8, value: 327, label: 'Sprint' },
  X: { tokens: 16.5, value: 599.5, label: 'Megasprint' },
};

/* House margin (owner's rule, 2026-08-25): development remuneration gains 20%
   starting with the SEPTEMBER/2026 competence month ("YYYY-MM") — closed months
   stay exactly as they were. The tier table above stays at the base rate: Ana
   (the central aggregator) reads this file raw and applies the same margin on
   her side — the margin here is for local display/calculation only. */
export const DEV_MARGIN = 1.2;
export const MARGIN_SINCE = '2026-09';
export function tierPrice(ym: string, tier: TierKey): number {
  const c = TIERS[tier].value;
  return ym >= MARGIN_SINCE ? Math.round(c * DEV_MARGIN) : c;
}

export interface DevEntry {
  /** dia/mês, ex.: "06/05" */
  date: string;
  title: string;
  description: string;
  tier: TierKey;
}

export interface DevMonth {
  /** identificador no padrão CX_DEV_MM */
  key: string;
  /** YYYY-MM */
  ym: string;
  label: string;
  entries: DevEntry[];
}

export const DEV_MONTHS: DevMonth[] = [
  {
    key: 'CX_DEV_08',
    ym: '2026-08',
    label: 'Agosto / 2026',
    entries: [
      {
        date: '04/08',
        title: 'Relatório de Custos & Desenvolvimento',
        description:
          'Esta página: quanto o projeto custou, quanto custa por mês para ficar no ar e o que foi entregue em cada trabalho, com controle de pagamento.',
        tier: 'M',
      },
      {
        date: '03/08',
        title: 'Central de chamados conectada à assistente',
        description:
          'Os chamados abertos na plataforma podem ser lidos e baixados de fora, um a um, pela assistente que acompanha a operação.',
        tier: 'M',
      },
    ],
  },
  {
    key: 'CX_DEV_07',
    ym: '2026-07',
    label: 'Julho / 2026',
    entries: [
      {
        date: '28/07',
        title: 'Assinatura da Diretório Web no rodapé',
        description: 'Crédito de desenvolvimento com link, em todas as páginas públicas.',
        tier: 'P',
      },
      {
        date: '27/07',
        title: 'Modo manutenção com um clique',
        description:
          'Dá para colocar a plataforma em manutenção à distância, sem mexer no código — e se o comando falhar, o site continua no ar.',
        tier: 'P',
      },
      {
        date: '27/07',
        title: 'Números da operação em tempo real',
        description:
          'Cadastros separados por tipo (cliente, profissional, admin), quem está online agora e registro de acessos página a página.',
        tier: 'M',
      },
      {
        date: '22/07',
        title: 'Canal seguro de leitura dos indicadores',
        description:
          'Endereço protegido por senha que entrega os números da Zello para painéis externos.',
        tier: 'P',
      },
      {
        date: '14/07',
        title: 'Ícone oficial da marca no navegador',
        description: 'Símbolo da Zello na aba do navegador e no atalho do celular.',
        tier: 'P',
      },
      {
        date: '07/07',
        title: 'Apresentação legível no celular',
        description: 'Deck comercial ajustado para leitura em tela vertical.',
        tier: 'P',
      },
      {
        date: '03/07',
        title: 'Apresentação comercial da Zello',
        description:
          'Deck de slides em duas versões (curta e completa) para levar a plataforma a investidores, parceiros e grandes clientes.',
        tier: 'M',
      },
    ],
  },
  {
    key: 'CX_DEV_05',
    ym: '2026-05',
    label: 'Maio / 2026',
    entries: [
      {
        date: '27/05',
        title: 'Tabelas do admin viram cards no celular',
        description:
          'Todas as listagens do painel administrativo ficam legíveis no celular, sem rolagem lateral.',
        tier: 'P',
      },
      {
        date: '13/05',
        title: 'Contratar sem precisar entrar antes',
        description:
          'O cliente escolhe dia e horário livremente e só faz login na hora de fechar — menos desistência no meio do caminho.',
        tier: 'M',
      },
      {
        date: '13/05',
        title: 'Busca com data, hora e filtros em uma linha',
        description:
          'Filtro único com "disponíveis hoje", horário e botão de buscar do lado, e cada perfil vai para o painel certo depois do login.',
        tier: 'M',
      },
      {
        date: '12/05',
        title: 'Atalhos de busca no painel do cliente',
        description: 'A lupa e os botões do painel levam direto para a busca de profissionais.',
        tier: 'P',
      },
      {
        date: '11/05',
        title: 'Base de demonstração da região de Itajaí',
        description:
          '50 profissionais com serviços, fotos e histórico de contratações para apresentar a plataforma cheia a parceiros e investidores.',
        tier: 'P',
      },
      {
        date: '06/05',
        title: 'Novas telas do admin e digitação sem erro',
        description:
          'Painel de profissionais, gestão de categorias e resolução de disputas; telefone, CPF/CNPJ e CEP se formatam sozinhos e o endereço preenche pelo CEP.',
        tier: 'G',
      },
      {
        date: '06/05',
        title: 'Painéis com menu lateral e ações rápidas',
        description:
          'Menu fixo por tipo de conta com contadores reais e, na lista de usuários, WhatsApp, notificar, editar e excluir sem sair da tela.',
        tier: 'G',
      },
      {
        date: '06/05',
        title: 'Agenda integrada ao Google e ao iPhone',
        description:
          'Reserva confirmada entra sozinha na agenda do profissional, com link assinável para Google Calendar e iCal.',
        tier: 'M',
      },
      {
        date: '06/05',
        title: 'Conversa entre cliente e profissional',
        description:
          'Chat dentro da plataforma, com contador de mensagens não lidas e botão de contato no perfil público.',
        tier: 'M',
      },
      {
        date: '06/05',
        title: 'Avisos dentro da plataforma',
        description:
          'Sininho com alertas de pagamento recebido, documento aprovado, saque processado e nova avaliação.',
        tier: 'M',
      },
      {
        date: '06/05',
        title: 'Painel administrativo com indicadores',
        description:
          'Faturamento, reservas concluídas, profissionais ativos e comissão da plataforma, com gráficos, ranking de categorias e visão 360° de cada usuário.',
        tier: 'G',
      },
      {
        date: '06/05',
        title: 'Avaliações, saldo e saques do profissional',
        description:
          'Nota de 1 a 5 após o serviço, saldo disponível e em retenção, pedido de saque com chave PIX e aprovação do admin com comprovante.',
        tier: 'G',
      },
      {
        date: '06/05',
        title: 'Agendamento com pagamento e dinheiro retido',
        description:
          'Cliente escolhe o horário, paga por PIX ou cartão e o valor fica retido até o serviço ser concluído — liberação automática 48h depois do prazo se não houver reclamação.',
        tier: 'X',
      },
      {
        date: '06/05',
        title: 'Busca pública e perfil do profissional',
        description:
          'Cliente encontra profissionais por cidade, categoria, preço e nota, e abre um perfil com galeria, catálogo de serviços, avaliações e disponibilidade.',
        tier: 'G',
      },
      {
        date: '06/05',
        title: 'Catálogo de serviços e agenda do profissional',
        description:
          'Profissional cadastra serviços com fotos, preço por hora ou empreitada e define os horários e bloqueios em que atende.',
        tier: 'G',
      },
      {
        date: '06/05',
        title: 'Cadastro, login e verificação de documentos',
        description:
          'Três tipos de conta (cliente, profissional e admin), envio de CPF/CNPJ e documento com foto, e aprovação ou recusa pelo admin com e-mail automático.',
        tier: 'G',
      },
      {
        date: '06/05',
        title: 'Site institucional completo',
        description:
          'Home com busca, como funciona, quem somos, tutoriais, contato e páginas legais de LGPD — pronto para receber tráfego e aparecer no Google.',
        tier: 'G',
      },
      {
        date: '06/05',
        title: 'Fundação da plataforma',
        description:
          'Estrutura do projeto, banco de dados, hospedagem e ambiente de publicação — a base sobre a qual tudo foi construído.',
        tier: 'P',
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * APIs & serviços (informativo — não entra na soma)
 * ------------------------------------------------------------------ */

export interface ApiItem {
  label: string;
  fee: string;
  note: string;
}

export const API_ITEMS: ApiItem[] = [
  {
    label: 'Efí Bank — PIX',
    fee: '1,19% por transação',
    note: 'Cobrança PIX do checkout. Descontado no recebimento, não é boleto mensal.',
  },
  {
    label: 'Stripe — cartão de crédito',
    fee: '3,99% + R$ 0,39',
    note: 'Pagamento com cartão e parcelamento. Descontado em cada venda.',
  },
  {
    label: 'Vercel Blob — arquivos',
    fee: 'por GB armazenado',
    note: 'Documentos de KYC, comprovantes de saque e fotos dos serviços.',
  },
  {
    label: 'Resend — e-mail transacional',
    fee: 'por volume enviado',
    note: 'Incluído na conta mensal até o limite do plano.',
  },
  {
    label: 'Google Calendar API',
    fee: 'sem custo',
    note: 'Sincronização da agenda do profissional.',
  },
  {
    label: 'ViaCEP e geolocalização',
    fee: 'sem custo',
    note: 'Preenchimento de endereço por CEP e cidade sugerida pela localização.',
  },
];

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function monthLabel(ym: string): string {
  const y = ym.slice(0, 4);
  const m = Number(ym.slice(5, 7));
  return `${MONTH_NAMES[m - 1] ?? ym} / ${y}`;
}

/** Lista de meses (YYYY-MM) do mês de entrega até o mês informado, do mais recente ao mais antigo. */
export function monthsUntil(current: string, from = FIRST_MONTH): string[] {
  const out: string[] = [];
  let y = Number(from.slice(0, 4));
  let m = Number(from.slice(5, 7));
  const cy = Number(current.slice(0, 4));
  const cm = Number(current.slice(5, 7));
  while (y < cy || (y === cy && m <= cm)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out.reverse();
}

export function devMonthTotal(month: DevMonth) {
  return month.entries.reduce(
    (acc, e) => {
      // delivery price always goes through tierPrice (house margin by competence month)
      acc.value += tierPrice(month.ym, e.tier);
      acc.tokens += TIERS[e.tier].tokens;
      return acc;
    },
    { value: 0, tokens: 0 },
  );
}

export const DEV_TOTAL = DEV_MONTHS.reduce(
  (acc, m) => {
    const t = devMonthTotal(m);
    acc.value += t.value;
    acc.tokens += t.tokens;
    acc.count += m.entries.length;
    return acc;
  },
  { value: 0, tokens: 0, count: 0 },
);

export function formatTokens(millions: number): string {
  return `${millions.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} M tokens`;
}
