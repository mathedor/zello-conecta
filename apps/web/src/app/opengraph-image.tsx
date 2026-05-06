import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Zello Conecta — Marketplace de serviços profissionais';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a26a3 0%, #1d36f5 50%, #345aff 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 90,
              fontWeight: 800,
              color: 'white',
              letterSpacing: -3,
            }}
          >
            Z
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: 'white',
              letterSpacing: -2,
            }}
          >
            Zello Conecta
          </div>
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 1000,
            letterSpacing: -1,
          }}
        >
          O serviço certo, na hora certa.
        </div>

        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.85)',
            textAlign: 'center',
            marginTop: 28,
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Marketplace de serviços profissionais com pagamento seguro e agenda integrada.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 50,
            display: 'flex',
            gap: 12,
            fontSize: 22,
            color: 'rgba(255, 255, 255, 0.75)',
          }}
        >
          <span>zelloconecta.com.br</span>
          <span>•</span>
          <span>Em breve nas lojas iOS e Android</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
