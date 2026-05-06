import { nanoid } from 'nanoid';

export interface EfiCustomer {
  name: string;
  cpf?: string | null;
  email?: string | null;
}

export interface PixChargeInput {
  amount: number;
  description: string;
  externalId: string;
  customer: EfiCustomer;
  expiresInSeconds?: number;
  webhookUrl?: string;
}

export interface PixChargeResult {
  txId: string;
  qrCode: string;
  qrCodeImageUrl: string;
  copyPaste: string;
  expiresAt: Date;
  raw?: unknown;
}

export interface CardChargeInput {
  amount: number;
  description: string;
  externalId: string;
  customer: EfiCustomer;
  paymentToken: string;
  installments?: number;
}

export interface CardChargeResult {
  txId: string;
  status: 'PAID' | 'PROCESSING' | 'FAILED';
  message?: string;
  raw?: unknown;
}

export type ChargeStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface EfiClient {
  isMock: boolean;
  createPixCharge(input: PixChargeInput): Promise<PixChargeResult>;
  createCardCharge(input: CardChargeInput): Promise<CardChargeResult>;
  getChargeStatus(txId: string): Promise<ChargeStatus>;
  cancelCharge(txId: string): Promise<void>;
}

const EFI_BASE_URL_PROD = 'https://pix.api.efipay.com.br';
const EFI_BASE_URL_SANDBOX = 'https://pix-h.api.efipay.com.br';

class MockEfiClient implements EfiClient {
  isMock = true;

  async createPixCharge(input: PixChargeInput): Promise<PixChargeResult> {
    const txId = `MOCK${nanoid(20).replace(/[^A-Za-z0-9]/g, 'x').toUpperCase().slice(0, 22)}`;
    const expiresAt = new Date(Date.now() + (input.expiresInSeconds ?? 3600) * 1000);
    const fake = `00020101021226930014BR.GOV.BCB.PIX0114+5511999999999${txId.slice(0, 20)}5204000053039865802BR5912ZELLO MOCK6009SAO PAULO62070503***6304ABCD`;
    return {
      txId,
      qrCode: fake,
      qrCodeImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(fake)}`,
      copyPaste: fake,
      expiresAt,
      raw: { mock: true, input },
    };
  }

  async createCardCharge(input: CardChargeInput): Promise<CardChargeResult> {
    const txId = `MOCK-CARD-${nanoid(16)}`;
    const lastDigit = (input.paymentToken.match(/\d/g)?.pop() ?? '0') as string;
    const fail = lastDigit === '1';
    return {
      txId,
      status: fail ? 'FAILED' : 'PAID',
      message: fail ? 'Cartão recusado (mock — token termina em 1)' : 'Aprovado em ambiente mock',
      raw: { mock: true, input: { ...input, paymentToken: '***redacted***' } },
    };
  }

  async getChargeStatus(_txId: string): Promise<ChargeStatus> {
    return 'PAID';
  }

  async cancelCharge(_txId: string): Promise<void> {
    return;
  }
}

class RealEfiClient implements EfiClient {
  isMock = false;
  private clientId: string;
  private clientSecret: string;
  private certBase64: string;
  private sandbox: boolean;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(opts: { clientId: string; clientSecret: string; certBase64: string; sandbox: boolean }) {
    this.clientId = opts.clientId;
    this.clientSecret = opts.clientSecret;
    this.certBase64 = opts.certBase64;
    this.sandbox = opts.sandbox;
  }

  private get baseUrl() {
    return this.sandbox ? EFI_BASE_URL_SANDBOX : EFI_BASE_URL_PROD;
  }

  private async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 30_000) return this.accessToken;
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials' }),
    });
    if (!res.ok) throw new Error(`Efí auth falhou: ${res.status}`);
    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return this.accessToken;
  }

  async createPixCharge(_input: PixChargeInput): Promise<PixChargeResult> {
    throw new Error(
      'Efí real client ainda não está pronto: cobrança PIX precisa do mTLS via certificado P12 e endpoint /v2/cob. Implementar após receber credenciais.',
    );
  }

  async createCardCharge(_input: CardChargeInput): Promise<CardChargeResult> {
    throw new Error('Efí real client de cartão pendente — implementar após credenciais.');
  }

  async getChargeStatus(_txId: string): Promise<ChargeStatus> {
    throw new Error('Efí real getChargeStatus pendente.');
  }

  async cancelCharge(_txId: string): Promise<void> {
    throw new Error('Efí real cancelCharge pendente.');
  }
}

let cached: EfiClient | null = null;

export function getEfiClient(): EfiClient {
  if (cached) return cached;
  const clientId = process.env.EFI_CLIENT_ID;
  const clientSecret = process.env.EFI_CLIENT_SECRET;
  const certBase64 = process.env.EFI_CERT_BASE64;
  const sandbox = process.env.EFI_SANDBOX !== 'false';

  if (!clientId || !clientSecret || !certBase64) {
    cached = new MockEfiClient();
    return cached;
  }

  cached = new RealEfiClient({ clientId, clientSecret, certBase64, sandbox });
  return cached;
}
