import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: 'linear-gradient(135deg, #4a6fbf 0%, #2a4a8f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          letterSpacing: -1,
          borderRadius: 8,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Z
      </div>
    ),
    { ...size },
  );
}
