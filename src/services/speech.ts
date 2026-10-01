// Web Speech API Service for Speech-to-Text and Text-to-Speech

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private keepAliveTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (!this.synth || !this.synth.speaking) {
        this.stopKeepAlive();
        return;
      }
      this.synth.pause();
      this.synth.resume();
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices();
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.availableVoices.length === 0) {
      this.availableVoices = this.synth.getVoices();
    }
    return this.availableVoices;
  }

  speak(
    text: string,
    options?: {
      voiceURI?: string;
      pitch?: number;
      rate?: number;
      volume?: number;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (!this.synth) return;

    // Cancel current speaking and clear any existing keep-alive
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = options?.pitch ?? 1.1; // Slightly friendly higher pitch
    utterance.rate = options?.rate ?? 1.05;
    utterance.volume = options?.volume ?? 1.0;

    const voices = this.getVoices();
    if (options?.voiceURI) {
      const selected = voices.find((v) => v.voiceURI === options.voiceURI);
      if (selected) utterance.voice = selected;
    } else {
      // Find a natural English voice if possible
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Jenny') ||
            v.name.includes('Zira') ||
            v.name.includes('David'))
      );
      if (preferred) utterance.voice = preferred;
    }

    utterance.onend = () => {
      this.stopKeepAlive();
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      this.stopKeepAlive();
      if (options?.onError) options.onError();
    };

    this.startKeepAlive();
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    this.stopKeepAlive();
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSpeechRecognitionSupported(): boolean {
    return Boolean(this.recognition);
  }

  startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: any) => void;
    onEnd: () => void;
  }) {
    if (!this.recognition) {
      callbacks.onError(new Error('Speech recognition is not supported in this browser.'));
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    }

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      callbacks.onResult(final || interim, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      callbacks.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      this.isListening = false;
      callbacks.onError(err);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
