/**
 * Web Speech API & Web Audio Visualizer Service
 * 100% tovushsiz (Silent) - Faqat mikrofonni qabul qiladi, hech qachon dinamikka ovoz chiqarmaydi!
 */

export class SpeechService {
  constructor({ onTranscript, onError, onStateChange, onAudioLevel }) {
    this.onTranscript = onTranscript || (() => {});
    this.onError = onError || (() => {});
    this.onStateChange = onStateChange || (() => {});
    this.onAudioLevel = onAudioLevel || (() => {});

    this.recognition = null;
    this.isListening = false;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.animFrameId = null;
    this.language = 'ru-RU'; // Standart til
    this.isSupported = false;

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = this.language;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange(true);
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        this.onTranscript(finalTranscript.trim(), interimTranscript.trim());
      };

      this.recognition.onerror = (event) => {
        console.warn('SpeechRecognition xatosi:', event.error);
        if (event.error === 'not-allowed') {
          this.onError('Mikrofonga ruxsat berilmadi. Iltimos brauzer sozlamalaridan ruxsat bering.');
        } else if (event.error === 'no-speech') {
          // Oddiy jimjitlik - xato deb ko'rsatmaymiz
        } else {
          this.onError(`Ovoz tanish xatosi: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // Agar foydalanuvchi hali to'xtatmagan bo'lsa, avtomatik qayta yoqish
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            this.onStateChange(false);
          }
        } else {
          this.onStateChange(false);
        }
      };
    } else {
      this.isSupported = false;
    }
  }

  setLanguage(langCode) {
    this.language = langCode;
    if (this.recognition) {
      const wasListening = this.isListening;
      if (wasListening) {
        this.stop();
      }
      this.recognition.lang = langCode;
      if (wasListening) {
        setTimeout(() => this.start(), 200);
      }
    }
  }

  async start() {
    this.isListening = true;
    this.onStateChange(true);

    // 1. Audio vizualizatsiyani ishga tushirish (Web Audio API orqali, DIKTOFONSIZ / TOVUSHSIZ)
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);
      // DIQQAT: analyser.connect(audioContext.destination) qilinmadi!
      // Bu ovozni dinamikka mutlaqo chiqarmaslik (100% silent) talabini ta'minlaydi!

      this.trackAudioLevel();
    } catch (err) {
      console.warn('Audio vizualizator mikrofoni ulanmadi:', err);
    }

    // 2. Nutqni tanishni boshlash
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // Allaqachon ishlayotgan bo'lsa qayta chaqirish e'tiborsiz qoldiriladi
      }
    }
  }

  stop() {
    this.isListening = false;
    this.onStateChange(false);

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.onAudioLevel(0);
  }

  trackAudioLevel() {
    if (!this.analyser || !this.isListening) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      if (!this.isListening || !this.analyser) {
        this.onAudioLevel(0);
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const normalized = Math.min(1.0, average / 128.0); // 0.0 dan 1.0 gacha
      this.onAudioLevel(normalized);

      this.animFrameId = requestAnimationFrame(update);
    };

    update();
  }
}

