'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Download, Share, Plus, Building2, Smartphone } from 'lucide-react';

// Extend the BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

type Platform = 'android' | 'ios' | 'none';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'none';
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isStandalone =
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone) return 'none'; // Already installed
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'none';
}

function isAlreadyInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>('none');
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isAlreadyInstalled()) return;

    // Check if user recently dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION_MS) return;

    const detected = detectPlatform();
    setPlatform(detected);

    // Show iOS prompt after a short delay
    if (detected === 'ios') {
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }

    // Listen for Chrome/Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setShowIOSGuide(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  const handleInstall = useCallback(async () => {
    if (platform === 'ios') {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setVisible(false);
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, platform]);

  if (!visible || platform === 'none') return null;

  return (
    <>
      {/* Backdrop (iOS guide only) */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
          onClick={() => setShowIOSGuide(false)}
        />
      )}

      {/* Main install banner */}
      {!showIOSGuide && (
        <div
          role="dialog"
          aria-label="Install Delphin Associates app"
          className="fixed bottom-4 left-1/2 z-[999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-500"
          style={{ filter: 'drop-shadow(0 0 24px rgba(212,175,55,0.2))' }}
        >
          <div
            style={{
              background: 'rgba(10,10,10,0.96)',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '20px',
              padding: '18px 20px',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* App icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(212,175,55,0.12)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={22} style={{ color: '#D4AF37' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA', letterSpacing: '0.02em' }}>
                    Delphin Associates
                  </p>
                  <p style={{ fontSize: 11, color: '#71717A', marginTop: 1 }}>
                    Install for offline access
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                aria-label="Dismiss install prompt"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#71717A',
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
              {['Works offline', 'Fast access', 'No browser UI'].map(f => (
                <span
                  key={f}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#D4AF37',
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: 6,
                    padding: '3px 8px',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              id="pwa-install-btn"
              onClick={handleInstall}
              disabled={installing}
              style={{
                width: '100%',
                background: '#D4AF37',
                color: '#000',
                border: 'none',
                borderRadius: 12,
                padding: '12px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: installing ? 'not-allowed' : 'pointer',
                opacity: installing ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'opacity 0.15s',
              }}
            >
              {platform === 'ios' ? (
                <><Share size={15} /> How to Install</>
              ) : (
                <><Download size={15} /> {installing ? 'Installing…' : 'Install App'}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* iOS step-by-step guide */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-label="iOS installation guide"
          className="fixed bottom-4 left-1/2 z-[999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-300"
        >
          <div
            style={{
              background: 'rgba(10,10,10,0.98)',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: 20,
              padding: '20px',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone size={16} style={{ color: '#D4AF37' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Add to Home Screen
                </span>
              </div>
              <button
                onClick={dismiss}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#71717A',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {[
              { icon: <Share size={16} style={{ color: '#007AFF' }} />, text: 'Tap the Share button in Safari\'s toolbar' },
              { icon: <Plus size={16} style={{ color: '#D4AF37' }} />, text: 'Scroll down and tap "Add to Home Screen"' },
              { icon: <Building2 size={16} style={{ color: '#D4AF37' }} />, text: 'Tap "Add" to install Delphin Associates' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </div>
                <p style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.5, paddingTop: 6 }}>
                  <span style={{ color: '#D4AF37', fontWeight: 700 }}>Step {i + 1}:</span>{' '}
                  {step.text}
                </p>
              </div>
            ))}

            <p style={{ fontSize: 11, color: '#52525B', textAlign: 'center', marginTop: 12, letterSpacing: '0.03em' }}>
              Safari only · Works on iOS 16.4+
            </p>
          </div>
        </div>
      )}
    </>
  );
}
