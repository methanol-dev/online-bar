/* ============================================================
   CYBERPUNK DJ SOUNDBOARD & VINAHOUSE SYNTHESIZER
   ============================================================ */

class Soundboard {
    constructor() {
        this.ctx = null;
        this.isMusicPlaying = false;
        this.musicInterval = null;
        this.musicStep = 0;
        this.bpm = 135; // Standard Vinahouse / EDM tempo
    }

    _initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playSound(soundName) {
        this._initContext();
        if (!this.ctx) return;

        switch (soundName.toUpperCase()) {
            case 'AIRHORN':
                this.playAirhorn();
                break;
            case 'CHEER':
                this.playCrowdCheer();
                break;
            case 'LASER':
                this.playLaserZap();
                break;
            case 'EXPLOSION':
            case 'FIREWORKS':
                this.playExplosion();
                break;
            case 'BASS_DROP':
                this.playBassDrop();
                break;
            case 'SCRATCH':
                this.playScratch();
                break;
            case 'COUNTDOWN':
                this.playCountdown();
                break;
            case 'CHAMPAGNE':
                this.playChampagnePop();
                break;
            case 'SIREN':
                this.playSiren();
                break;
            default:
                this.playLaserZap();
                break;
        }
    }

    // Synthesize Club Airhorn (Còi Bar DJ Cực Cháy)
    playAirhorn() {
        const now = this.ctx.currentTime;
        const chords = [
            [370, 466, 554], // Horn burst 1
            [370, 466, 554], // Horn burst 2
            [370, 466, 554]  // Horn burst 3
        ];

        chords.forEach((chord, burstIdx) => {
            const burstTime = now + burstIdx * 0.18;
            chord.forEach(f => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(f, burstTime);
                osc.frequency.setValueAtTime(f * 1.04, burstTime + 0.05);

                gain.gain.setValueAtTime(0.18, burstTime);
                gain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.22);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(burstTime);
                osc.stop(burstTime + 0.22);
            });
        });
    }

    // Synthesize Crowd Cheer / Applause (Hò reo quẩy đêm)
    playCrowdCheer() {
        const now = this.ctx.currentTime;
        const duration = 2.2;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(1.8, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    // Synthesize Laser Zap (Tia Laser Đa Chiều)
    playLaserZap() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    // Synthesize Fireworks Explosion (Pháo Hoa & Pháo Sáng)
    playExplosion() {
        const now = this.ctx.currentTime;
        const duration = 1.5;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    // Synthesize EDM Bass Drop (Cú Rơi Bass Siêu Căng)
    playBassDrop() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

        gain.gain.setValueAtTime(0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
    }

    // Synthesize Vinyl Scratch FX (Tiếng Cào Đĩa DJ)
    playScratch() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.1);
        osc.frequency.linearRampToValueAtTime(200, now + 0.25);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Synthesize Club Siren (Còi Cứu Hộ / Báo Động Quẩy)
    playSiren() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.3);
        osc.frequency.linearRampToValueAtTime(600, now + 0.6);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.9);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.1);
    }

    // Synthesize Champagne Bottle Pop (Mở Sâm Panh)
    playChampagnePop() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);

        // Followed by fizz sound
        setTimeout(() => this.playCrowdCheer(), 90);
    }

    // Synthesize 3-2-1 Countdown Beeps
    playCountdown() {
        const beeps = [440, 440, 440, 880];
        beeps.forEach((freq, idx) => {
            setTimeout(() => {
                this._initContext();
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = idx === 3 ? 'sawtooth' : 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + (idx === 3 ? 0.6 : 0.2));

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + (idx === 3 ? 0.6 : 0.2));
            }, idx * 600);
        });
    }

    // Built-in Vinahouse / Nonstop Beat Loop Synthesizer
    toggleBackgroundBeat(callback) {
        this._initContext();
        if (this.isMusicPlaying) {
            this.stopBackgroundBeat();
            if (callback) callback(false);
            return false;
        } else {
            this.startBackgroundBeat();
            if (callback) callback(true);
            return true;
        }
    }

    startBackgroundBeat() {
        this._initContext();
        if (this.musicInterval) clearInterval(this.musicInterval);
        this.isMusicPlaying = true;
        const stepTime = (60 / this.bpm) / 4 * 1000; // 16th notes

        this.musicInterval = setInterval(() => {
            if (!this.ctx || this.ctx.state === 'suspended') return;
            const now = this.ctx.currentTime;
            const step = this.musicStep % 16;

            // 1. Kick on beat 0, 4, 8, 12 (4-on-the-floor)
            if (step % 4 === 0) {
                const kickOsc = this.ctx.createOscillator();
                const kickGain = this.ctx.createGain();
                kickOsc.type = 'sine';
                kickOsc.frequency.setValueAtTime(140, now);
                kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

                kickGain.gain.setValueAtTime(0.45, now);
                kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                kickOsc.connect(kickGain);
                kickGain.connect(this.ctx.destination);
                kickOsc.start(now);
                kickOsc.stop(now + 0.12);
            }

            // 2. Off-beat Bass on beat 2, 6, 10, 14 (Vinahouse style)
            if (step % 4 === 2) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.type = 'sawtooth';
                bassOsc.frequency.setValueAtTime(75, now);

                bassGain.gain.setValueAtTime(0.3, now);
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                const bassFilter = this.ctx.createBiquadFilter();
                bassFilter.type = 'lowpass';
                bassFilter.frequency.setValueAtTime(450, now);

                bassOsc.connect(bassFilter);
                bassFilter.connect(bassGain);
                bassGain.connect(this.ctx.destination);

                bassOsc.start(now);
                bassOsc.stop(now + 0.15);
            }

            // 3. Open Hi-hat on beat 2, 6, 10, 14
            if (step % 4 === 2) {
                const bufferSize = this.ctx.sampleRate * 0.06;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

                const hatSource = this.ctx.createBufferSource();
                hatSource.buffer = buffer;

                const hatFilter = this.ctx.createBiquadFilter();
                hatFilter.type = 'highpass';
                hatFilter.frequency.setValueAtTime(7000, now);

                const hatGain = this.ctx.createGain();
                hatGain.gain.setValueAtTime(0.12, now);
                hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

                hatSource.connect(hatFilter);
                hatFilter.connect(hatGain);
                hatGain.connect(this.ctx.destination);

                hatSource.start(now);
                hatSource.stop(now + 0.06);
            }

            // 4. Synth Stabs on specific 16th notes
            if (step === 0 || step === 3 || step === 8 || step === 11) {
                const notes = [220, 261.63, 329.63, 392.0]; // Am7 chord
                notes.forEach(f => {
                    const synthOsc = this.ctx.createOscillator();
                    const synthGain = this.ctx.createGain();
                    synthOsc.type = 'square';
                    synthOsc.frequency.setValueAtTime(f, now);

                    synthGain.gain.setValueAtTime(0.05, now);
                    synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

                    synthOsc.connect(synthGain);
                    synthGain.connect(this.ctx.destination);

                    synthOsc.start(now);
                    synthOsc.stop(now + 0.09);
                });
            }

            this.musicStep++;
        }, stepTime);
    }

    stopBackgroundBeat() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

// Global instance
window.soundboard = new Soundboard();
