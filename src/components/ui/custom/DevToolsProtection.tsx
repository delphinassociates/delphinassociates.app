'use client';

import { useEffect } from 'react';

/**
 * Production-only component to deter access to developer tools.
 * While not a foolproof security measure, it discourages casual inspection.
 */
export function DevToolsProtection() {
  useEffect(() => {
    // Only enable in production
    if (process.env.NODE_ENV !== 'production') return;

    // 1. Disable Right-Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Common DevTool Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Element Selector)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl + S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    };

    // 3. Prevent Drag/Drop of content
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    // 4. Console Masking - Silences console in production
    const silenceConsole = () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && !window.__CONSOLE_MASKED__) {
        // @ts-ignore
        window.__CONSOLE_MASKED__ = true;
        
        const noop = () => {};
        // Preserve original console in case of emergency (hidden key)
        // @ts-ignore
        window.__DEBUG_CONSOLE__ = { ...console };
        
        console.log = noop;
        console.debug = noop;
        console.info = noop;
        console.warn = noop;
        // Keep console.error for critical runtime visibility but strip metadata
        const originalError = console.error;
        console.error = (...args) => {
          originalError("[Security] A runtime exception occurred. Inspection disabled.");
        };

        // Aggressive clearing
        setInterval(() => {
          console.clear();
        }, 1000);
      }
    };

    silenceConsole();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
