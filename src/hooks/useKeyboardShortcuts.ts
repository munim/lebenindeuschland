'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  onSelectAnswer?: (answerKey: '1' | '2' | '3' | '4') => void;
  onToggleTranslation?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onNavigatePrevious,
  onNavigateNext,
  onSelectAnswer,
  onToggleTranslation,
  disabled = false
}: KeyboardShortcutsConfig) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts if disabled or if focused on an input element
    if (disabled) return;
    
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Don't handle if modifiers are pressed (except for navigation)
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
      case 'k':
      case 'K':
        event.preventDefault();
        onNavigatePrevious?.();
        break;

      case 'ArrowRight':
      case 'j':
      case 'J':
        event.preventDefault();
        onNavigateNext?.();
        break;

      case '1':
        event.preventDefault();
        onSelectAnswer?.('1');
        break;

      case '2':
        event.preventDefault();
        onSelectAnswer?.('2');
        break;

      case '3':
        event.preventDefault();
        onSelectAnswer?.('3');
        break;

      case '4':
        event.preventDefault();
        onSelectAnswer?.('4');
        break;

      case 't':
      case 'T':
        event.preventDefault();
        onToggleTranslation?.();
        break;
    }
  }, [disabled, onNavigatePrevious, onNavigateNext, onSelectAnswer, onToggleTranslation]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, disabled]);
}