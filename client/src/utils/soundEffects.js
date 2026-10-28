// SpeedClub - Arcade Menu Sound Effects (Web Audio API)
// Provides responsive, crisp arcade UI audio feedback (hover and select) with zero external assets.

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastHoverTime = 0;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(enable) {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    return this.enabled;
  }

  /**
   * Arcade Menu Hover Sound (Cursor Move / Button Hover)
   * Crisp, subtle high-frequency electronic chirp.
   */
  playHover() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Prevent buzzing if cursor triggers multiple hover events instantly
      if (now - this.lastHoverTime < 0.04) return;
      this.lastHoverTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Quick pitch drop: 960Hz -> 720Hz over 35ms (classic arcade menu pip)
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.035);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  /**
   * Arcade Menu Select Sound (Option Click / Confirmation)
   * Punchy, satisfying dual-tone arcade confirmation chime.
   */
  playSelect() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Note 1: 659.25 Hz (E5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.09, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.07);

      // Note 2: 987.77 Hz (B5) - crisp arcade octave leap
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, now + 0.04);
      gain2.gain.setValueAtTime(0.12, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.16);
    } catch (e) {}
  }

  // Alias for compatibility
  playClick() {
    this.playSelect();
  }

  /**
   * Reward Fanfare / Credits Sound (+100 CR Claim)
   */
  playReward() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Chord progression: C5 -> E5 -> G5 -> C6 (fanfare chime)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {}
  }

  /**
   * Authentic Realistic Book Page Turn Sound
   * Soft paper rustle + whoosh of air moving when turning a heavy collector album page.
   */
  playPageTurn() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.16);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.15);
      filter.Q.setValueAtTime(2.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      // Low frequency page flap air whoosh
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.14);

      oscGain.gain.setValueAtTime(0.04, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      noise.start(now);
      osc.start(now);
      noise.stop(now + 0.16);
      osc.stop(now + 0.16);
    } catch (e) {}
  }
}

export const sound = new SoundFX();
