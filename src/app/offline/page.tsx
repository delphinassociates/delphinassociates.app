'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Building2 } from 'lucide-react';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Small delay for UX
    await new Promise(r => setTimeout(r, 1200));
    window.location.reload();
  };

  return (
    <html lang="en">
      <head>
        <title>Offline | Delphin Associates</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --gold: #D4AF37;
            --gold-dim: rgba(212,175,55,0.15);
            --gold-border: rgba(212,175,55,0.3);
            --bg: #000000;
            --surface: #0A0A0A;
            --text: #FAFAFA;
            --muted: #71717A;
          }
          body {
            background: var(--bg);
            color: var(--text);
            font-family: system-ui, -apple-system, sans-serif;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .bg-grid {
            position: fixed;
            inset: 0;
            background-image:
              linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
          }
          .glow {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -60%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%);
            pointer-events: none;
          }
          .card {
            position: relative;
            background: var(--surface);
            border: 1px solid var(--gold-border);
            border-radius: 24px;
            padding: 48px 40px;
            max-width: 440px;
            width: calc(100% - 32px);
            text-align: center;
            box-shadow: 0 0 60px rgba(212,175,55,0.08), 0 24px 64px rgba(0,0,0,0.6);
          }
          .icon-ring {
            width: 80px;
            height: 80px;
            background: var(--gold-dim);
            border: 1px solid var(--gold-border);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          .icon-ring svg {
            color: var(--gold);
          }
          .logo-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 32px;
            opacity: 0.5;
          }
          .logo-row svg { color: var(--gold); }
          .logo-row span {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--gold);
          }
          h1 {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin-bottom: 12px;
          }
          p {
            color: var(--muted);
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 36px;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: var(--gold);
            color: #000;
            border: none;
            border-radius: 12px;
            padding: 14px 28px;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            cursor: pointer;
            transition: opacity 0.15s, transform 0.15s;
            width: 100%;
          }
          .btn:hover { opacity: 0.88; transform: translateY(-1px); }
          .btn:active { transform: translateY(0); }
          .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .status {
            margin-top: 24px;
            font-size: 12px;
            color: var(--muted);
            letter-spacing: 0.05em;
          }
        `}</style>
      </head>
      <body>
        <div className="bg-grid" />
        <div className="glow" />
        <div className="card">
          <div className="logo-row">
            <Building2 size={14} />
            <span>Delphin Associates</span>
          </div>

          <div className="icon-ring">
            <WifiOff size={32} />
          </div>

          <h1>You're Offline</h1>
          <p>
            No internet connection detected. Please check your network and try again.
            Cached data may still be available.
          </p>

          <button
            className="btn"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw size={16} className="spin" />
                Reconnecting{dots}
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Try Again
              </>
            )}
          </button>

          <p className="status">CDSMS · Construction Site Management</p>
        </div>
      </body>
    </html>
  );
}
