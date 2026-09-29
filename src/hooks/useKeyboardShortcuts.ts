import { useEffect } from 'react';

interface ShortcutHandlers {
  onToggleChat?: () => void;
  onOpenDownload?: () => void;
  onToggleMute?: () => void;
  onCloseModals?: () => void;
}

/**
 * Custom React hook for binding global companion keyboard shortcuts
 * Ensures shortcuts do not fire when typing into input fields or textareas.
 */
export const useKeyboardShortcuts = ({
  onToggleChat,
  onOpenDownload,
  onToggleMute,
  onCloseModals,
}: ShortcutHandlers): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape' && onCloseModals) {
          onCloseModals();
        }
        return;
      }

      // Check key combos
      if (e.key === 'Escape' && onCloseModals) {
        onCloseModals();
      } else if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
        if (onToggleChat) {
          e.preventDefault();
          onToggleChat();
        }
      } else if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey) {
        if (onOpenDownload) {
          e.preventDefault();
          onOpenDownload();
        }
      } else if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) {
        if (onToggleMute) {
          e.preventDefault();
          onToggleMute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleChat, onOpenDownload, onToggleMute, onCloseModals]);
};
