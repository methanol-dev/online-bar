/* ============================================================
   MULTI-SOURCE MUSIC MANAGER (YOUTUBE & MP3 UPLOAD & SYNTH)
   ============================================================ */

class MusicManager {
    constructor() {
        this.socket = window.io ? window.io() : null;
        this.audioPlayer = new Audio();
        this.audioPlayer.loop = true;
        
        this.ytPlayer = null;
        this.isYtReady = false;
        this.currentSource = 'synth'; // 'youtube' | 'upload' | 'synth' | 'off'
        this.currentTitle = 'Vinahouse Nonstop Beat 135 BPM';
        this.volume = 0.8;

        this._initYouTubeAPI();
        this._bindSocket();
    }

    _initYouTubeAPI() {
        // Load YouTube IFrame API if not already present
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            let container = document.getElementById('yt-player-hidden-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'yt-player-hidden-container';
                container.style.cssText = 'position:fixed;bottom:-999px;left:-999px;width:1px;height:1px;opacity:0;pointer-events:none;';
                document.body.appendChild(container);
            }

            this.ytPlayer = new YT.Player('yt-player-hidden-container', {
                height: '1',
                width: '1',
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    enablejsapi: 1,
                    origin: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        this.isYtReady = true;
                        console.log('[MusicManager] YouTube Player Ready!');
                    },
                    onError: (e) => {
                        console.warn('[MusicManager] YouTube Player Error:', e.data);
                    }
                }
            });
        };
    }

    _bindSocket() {
        if (!this.socket) return;

        this.socket.on('music-state-sync', (state) => {
            console.log('[MusicManager] Syncing state:', state);
            this.syncState(state);
        });
    }

    extractYouTubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    }

    syncState(state) {
        this.currentSource = state.source;
        this.currentTitle = state.title || 'Đang Phát Nhạc';
        this.volume = (state.volume !== undefined ? state.volume : 80) / 100;
        this.audioPlayer.volume = this.volume;

        this._updateNowPlayingUI(this.currentTitle, state.isPlaying);

        if (!state.isPlaying || state.source === 'off') {
            this.stopAll();
            return;
        }

        if (state.source === 'upload') {
            // Stop YouTube & Synth
            if (this.ytPlayer && this.ytPlayer.stopVideo) this.ytPlayer.stopVideo();
            if (window.soundboard) window.soundboard.stopBackgroundBeat();

            if (this.audioPlayer.src !== state.url) {
                this.audioPlayer.src = state.url;
            }
            this.audioPlayer.play().catch(e => console.log('Audio autoplay prevented:', e));

        } else if (state.source === 'youtube') {
            // Stop Upload audio & Synth
            this.audioPlayer.pause();
            if (window.soundboard) window.soundboard.stopBackgroundBeat();

            const videoId = this.extractYouTubeId(state.url);
            if (this.ytPlayer && this.ytPlayer.loadVideoById && videoId) {
                this.ytPlayer.loadVideoById(videoId);
                this.ytPlayer.setVolume(Math.floor(this.volume * 100));
                this.ytPlayer.playVideo();
            }

        } else if (state.source === 'synth') {
            // Stop Upload audio & YouTube
            this.audioPlayer.pause();
            if (this.ytPlayer && this.ytPlayer.stopVideo) this.ytPlayer.stopVideo();

            if (window.soundboard) {
                window.soundboard.startBackgroundBeat();
            }
        }
    }

    stopAll() {
        this.audioPlayer.pause();
        if (this.ytPlayer && this.ytPlayer.stopVideo) {
            try { this.ytPlayer.stopVideo(); } catch(e) {}
        }
        if (window.soundboard) {
            window.soundboard.stopBackgroundBeat();
        }
        this._updateNowPlayingUI('TẠM DỪNG NHẠC', false);
    }

    setVolume(volPercent) {
        this.volume = Math.max(0, Math.min(1, volPercent / 100));
        this.audioPlayer.volume = this.volume;
        if (this.ytPlayer && this.ytPlayer.setVolume) {
            this.ytPlayer.setVolume(Math.floor(this.volume * 100));
        }
    }

    _updateNowPlayingUI(title, isPlaying) {
        const badge = document.getElementById('now-playing-badge');
        if (badge) {
            badge.innerHTML = isPlaying 
                ? `<span>🎵</span> ĐANG PHÁT: <strong>${title}</strong>` 
                : `<span>⏸️</span> NHẠC ĐANG TẮT`;
            badge.style.display = isPlaying ? 'flex' : 'none';
        }
    }
}

window.MusicManager = new MusicManager();
