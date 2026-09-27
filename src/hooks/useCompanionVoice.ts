import { useState, useEffect, useCallback } from 'react';
import { speechService } from '../services/speech.js';

interface UseCompanionVoiceOptions {
  enabled: boolean;
  isMuted: boolean;
  voiceURI?: string;
  speed?: number;
  pitch?: number;
}

export function useCompanionVoice(options: UseCompanionVoiceOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setAvailableVoices(speechService.getVoices());
  }, []);

  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      if (!options.enabled || options.isMuted || !text.trim()) {
        onDone?.();
        return;
      }

      setIsSpeaking(true);

      speechService.speak(text, {
        voiceURI: options.voiceURI,
        rate: options.speed ?? 1.05,
        pitch: options.pitch ?? 1.1,
        onEnd: () => {
          setIsSpeaking(false);
          onDone?.();
        },
        onError: () => {
          setIsSpeaking(false);
          onDone?.();
        },
      });
    },
    [options]
  );

  const stop = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    availableVoices,
    speak,
    stop,
  };
}
