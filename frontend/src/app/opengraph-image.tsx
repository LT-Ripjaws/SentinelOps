import { ImageResponse } from 'next/og';

export const alt = 'SentinelOps security incident management';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F2F3EF',
          color: '#111311',
          padding: '62px 68px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 28, fontWeight: 700 }}>
          <div style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #111311' }}>
            <div style={{ width: 7, height: 26, background: '#2559F6' }} />
          </div>
          SentinelOps
        </div>
        <div style={{ display: 'flex', maxWidth: 960, fontSize: 82, lineHeight: 0.94, letterSpacing: '-5px', fontWeight: 600 }}>
          Track the incident. Preserve the truth.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CDD1CB', paddingTop: 24, fontSize: 19, color: '#676D68' }}>
          <span>Security incident management</span>
          <span>Timeline · Evidence · Analytics</span>
        </div>
      </div>
    ),
    size,
  );
}
