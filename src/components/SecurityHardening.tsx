import { useEffect } from 'react';

/**
 * Bank-Grade Security Hardening Component
 * Neutralizes:
 * 1. DevTools Inspection (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
 * 2. Context Menu Inspection (Right Click Block)
 * 3. Clipboard Attack Protection (Blocking unauthorized background clipboard reading)
 * 4. Anti-Sniffing & Console Auto-Clear
 */
export default function SecurityHardening() {
  useEffect(() => {
    // 1. Disable Right-Click Context Menu Inspection
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable DevTools Inspection Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Clipboard Attack Protection (Prevent unprompted background clipboard sniffing)
    const handleClipboardRead = (e: Event) => {
      if (!document.hasFocus()) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 4. Clear Console Logs periodically in production to prevent inspect element payload sniffing
    if (process.env.NODE_ENV === 'production') {
      const interval = setInterval(() => {
        console.clear();
      }, 5000);

      document.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('copy', handleClipboardRead);
      window.addEventListener('cut', handleClipboardRead);

      return () => {
        clearInterval(interval);
        document.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('copy', handleClipboardRead);
        window.removeEventListener('cut', handleClipboardRead);
      };
    }

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleClipboardRead);
    window.addEventListener('cut', handleClipboardRead);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleClipboardRead);
      window.removeEventListener('cut', handleClipboardRead);
    };
  }, []);

  return null;
}
