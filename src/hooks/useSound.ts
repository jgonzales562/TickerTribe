// Custom hook for managing sound effects with localStorage preference

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { logger } from '../utils/logger';

/**
 * Custom hook for managing sound effects
 * @returns Object with soundEnabled state, toggle function, and play function
 */
export function useSound() {
  const [soundEnabled, setSoundEnabled] = useLocalStorage('soundEnabled', true);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, [setSoundEnabled]);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Pleasant notification sound: two-tone chime
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      logger.error('Error playing notification sound:', error);
    }
  }, [soundEnabled]);

  return {
    soundEnabled,
    toggleSound,
    playNotificationSound,
  };
}
