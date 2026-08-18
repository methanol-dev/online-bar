/* ============================================================
   VIRAL TIKTOK LIVE BAR ONLINE - 3D STAGE (ULTRA FAST OPTIMIZED)
   ============================================================ */

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        if (!radii) radii = 0;
        let r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
        r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

class StageEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Disable alpha on main canvas for max speed!

        this.width = 1080;
        this.height = 1920;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.avatarManager = new AvatarManager(this.width, this.height);
        this.effectsManager = new EffectsManager(this.width, this.height);

        this.lastTime = performance.now();
        this.laserAngle = 0;
        this.eqBars = new Float32Array(24).fill(0.3);

        this.isStrobeActive = false;
        this.strobeTimer = 0;
        this.cameraMode = 0;

        // Pre-cached static stage background
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this._preRenderStaticBackground();

        this._bindSocket();
        this._startLoop();
    }

    _preRenderStaticBackground() {
        const bCtx = this.bgCanvas.getContext('2d');
        bCtx.fillStyle = '#06020c';
        bCtx.fillRect(0, 0, this.width, this.height);

        // Stage Back Wall
        const stageTop = 640;
        const stageH = 260;
        const wallGrad = bCtx.createLinearGradient(0, stageTop, 0, stageTop + stageH);
        wallGrad.addColorStop(0, '#0c051a');
        wallGrad.addColorStop(0.6, '#180a35');
        wallGrad.addColorStop(1, '#0e0422');
        bCtx.fillStyle = wallGrad;
        bCtx.fillRect(0, stageTop, this.width, stageH);

        // Dance Floor Base with Perspective Grid
        const topY = 880;
        const bottomY = 1920;
        const horizonW = 740;

        const floorGrad = bCtx.createLinearGradient(0, topY, 0, bottomY);
        floorGrad.addColorStop(0, '#0a0318');
        floorGrad.addColorStop(0.5, '#120429');
        floorGrad.addColorStop(1, '#1a063b');
        bCtx.fillStyle = floorGrad;

        bCtx.beginPath();
        bCtx.moveTo((this.width - horizonW) / 2, topY);
        bCtx.lineTo((this.width + horizonW) / 2, topY);
        bCtx.lineTo(this.width, bottomY);
        bCtx.lineTo(0, bottomY);
        bCtx.closePath();
        bCtx.fill();

        // High-Contrast Illuminated Perspective Grid (Lưới sàn nhảy Disco)
        bCtx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
        bCtx.lineWidth = 1.5;

        // Perspective longitudinal lines
        const numLines = 14;
        for (let i = 0; i <= numLines; i++) {
            const ratio = i / numLines;
            const xTop = (this.width - horizonW) / 2 + horizonW * ratio;
            const xBottom = this.width * ratio;
            bCtx.beginPath();
            bCtx.moveTo(xTop, topY);
            bCtx.lineTo(xBottom, bottomY);
            bCtx.stroke();
        }

        // Horizontal perspective depth lines
        const numH = 12;
        for (let j = 1; j <= numH; j++) {
            const p = Math.pow(j / numH, 2.2);
            const y = topY + (bottomY - topY) * p;
            const w = horizonW + (this.width - horizonW) * p;
            const x1 = (this.width - w) / 2;
            const x2 = (this.width + w) / 2;

            bCtx.strokeStyle = j % 2 === 0 ? 'rgba(255, 0, 127, 0.18)' : 'rgba(0, 240, 255, 0.14)';
            bCtx.beginPath();
            bCtx.moveTo(x1, y);
            bCtx.lineTo(x2, y);
            bCtx.stroke();
        }
    }

    _bindSocket() {
        const socket = io();

        socket.on('tiktok-chat', (data) => {
            const comment = (data.comment || '').toUpperCase();
            if (comment.includes('CAMERA') || comment.includes('GÓC QUAY')) {
                this.cameraMode = (this.cameraMode + 1) % 3;
            }

            if (comment.includes('PHÁO HOA') || comment.includes('PHAO HOA')) {
                this.effectsManager.addFireworks(200 + Math.random() * 680, 500 + Math.random() * 400);
            }

            this.avatarManager.handleChatCommand(data);

            const avatar = this.avatarManager.avatars.get(data.userId);
            if (avatar) {
                this.effectsManager.addChatBubble(avatar.x, avatar.y, data.comment, data.nickname);
            }

            this._addTickerItem(data.nickname, data.comment);
        });

        socket.on('tiktok-gift', (data) => {
            this.avatarManager.handleGiftEvent(data);
            this.effectsManager.showVIPBanner(data.nickname, data.giftName, data.repeatCount, data.diamondCount);
            this._addTickerItem(data.nickname, `🎁 Tặng ${data.repeatCount}x ${data.giftName}`);

            const gName = (data.giftName || '').toUpperCase();
            if (gName.includes('SIÊU XE') || gName.includes('LAMBORGHINI') || gName.includes('XE')) {
                this.effectsManager.spawnVIPVehicle('supercar', data.nickname);
                if (window.soundboard) window.soundboard.playSound('AIRHORN');
            } else if (gName.includes('TRỰC THĂNG') || gName.includes('HELICOPTER')) {
                this.effectsManager.spawnVIPVehicle('helicopter', data.nickname);
                if (window.soundboard) window.soundboard.playSound('SIREN');
            } else if (gName.includes('TÊN LỬA') || gName.includes('ROCKET')) {
                this.effectsManager.spawnVIPVehicle('rocket', data.nickname);
                if (window.soundboard) window.soundboard.playSound('BASS_DROP');
            } else if (gName.includes('SƯ TỬ') || gName.includes('LION')) {
                this.effectsManager.spawnVIPVehicle('lion', data.nickname);
            } else if (gName.includes('HOA HỒNG') || gName.includes('ROSE')) {
                this.effectsManager.triggerMoneyRain(15, 'rose');
            } else {
                this.effectsManager.triggerMoneyRain(25, 'diamond');
            }

            if (data.diamondCount >= 1000) {
                this.effectsManager.addFireworks(300 + Math.random() * 480, 500 + Math.random() * 300);
                this.effectsManager.triggerCO2Blast();
            }

            this._updateLeaderboard(data.nickname, data.avatarUrl, data.diamondCount);
            this.triggerStrobe(0.8);
        });

        socket.on('bulk-users-spawn', (data) => {
            if (data && data.users && Array.isArray(data.users)) {
                this.avatarManager.bulkSpawnUsers(data.users);
                this.effectsManager.triggerCO2Blast();
                this.triggerStrobe(0.6);
            }
        });

        socket.on('clear-crowd', () => {
            this.avatarManager.clearCrowd();
        });

        socket.on('play-sound', (data) => {
            if (window.soundboard && data.sound) {
                window.soundboard.playSound(data.sound);
            }
            if (data.sound === 'LASER' || data.sound === 'AIRHORN' || data.sound === 'BASS_DROP') {
                this.triggerStrobe(0.5);
                this.effectsManager.triggerCO2Blast();
            }
        });
    }

    triggerStrobe(duration = 0.5) {
        this.isStrobeActive = true;
        this.strobeTimer = duration;
    }

    _startLoop() {
        const loop = (timestamp) => {
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
            this.lastTime = timestamp;

            this.update(dt);
            this.render();

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update(dt) {
        this.laserAngle += dt * 1.5;

        for (let i = 0; i < this.eqBars.length; i++) {
            const target = 0.2 + Math.abs(Math.sin(this.laserAngle * 4 + i * 0.35)) * 0.8;
            this.eqBars[i] += (target - this.eqBars[i]) * 0.25;
        }

        if (this.strobeTimer > 0) {
            this.strobeTimer -= dt;
            if (this.strobeTimer <= 0) {
                this.isStrobeActive = false;
            }
        }

        this.avatarManager.update(dt);
        this.effectsManager.update(dt);
    }

    render() {
        const ctx = this.ctx;
        const shake = this.effectsManager.getShakeOffset();

        ctx.save();
        if (shake.x !== 0 || shake.y !== 0) {
            ctx.translate(shake.x, shake.y);
        }

        // 1. Draw Pre-rendered Stage Background
        ctx.drawImage(this.bgCanvas, 0, 0);

        // 2. Stage Backdrop Dynamic LED Wall & Equalizers
        this._drawStageBackdrop();

        // 3. 3D Glossy Floor Neon Reflections (Sàn Vũ Trường Bóng Gương)
        this._drawGlossyFloorReflections(ctx);

        // 4. Circular Truss & Dynamic Moving Spotlights
        this._drawCircularTrussAndBeams();

        // 5. Top 1 VIP Donor Golden Spotlight Aura
        this._drawTopDonorSpotlight(ctx);

        // 6. Batch Crowd of 2,000+ Chibi Dancers
        this.avatarManager.draw(ctx);

        // 7. Stage Effects & VIP Banners
        this.effectsManager.draw(ctx);

        // 8. Strobe Flash Effect
        if (this.isStrobeActive && Math.floor(performance.now() / 45) % 2 === 0) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();
    }

    _drawGlossyFloorReflections(ctx) {
        const topY = 960;
        const bottomY = 1920;
        const time = this.laserAngle;

        // Glossy Specular Light Pools on Floor
        const pool1X = 360 + Math.sin(time * 1.5) * 120;
        const pool1Y = 1350 + Math.cos(time) * 60;
        const grad1 = ctx.createRadialGradient(pool1X, pool1Y, 10, pool1X, pool1Y, 220);
        grad1.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
        grad1.addColorStop(0.6, 'rgba(121, 40, 202, 0.08)');
        grad1.addColorStop(1, 'transparent');
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.ellipse(pool1X, pool1Y, 240, 90, 0, 0, Math.PI * 2);
        ctx.fill();

        const pool2X = 720 + Math.cos(time * 1.3) * 110;
        const pool2Y = 1480 + Math.sin(time * 1.2) * 50;
        const grad2 = ctx.createRadialGradient(pool2X, pool2Y, 10, pool2X, pool2Y, 240);
        grad2.addColorStop(0, 'rgba(255, 0, 127, 0.18)');
        grad2.addColorStop(0.6, 'rgba(255, 230, 0, 0.06)');
        grad2.addColorStop(1, 'transparent');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.ellipse(pool2X, pool2Y, 260, 95, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawTopDonorSpotlight(ctx) {
        // Spotlight from ceiling onto front-center VIP
        const spotX = 540 + Math.sin(this.laserAngle * 0.8) * 40;
        const spotY = 1680;

        // Golden Aura Ring on floor
        ctx.save();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(spotX, spotY + 30, 70, 22, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Downward Golden Beam Cone
        const beamGrad = ctx.createLinearGradient(540, 740, spotX, spotY);
        beamGrad.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
        beamGrad.addColorStop(0.7, 'rgba(255, 215, 0, 0.12)');
        beamGrad.addColorStop(1, 'rgba(255, 215, 0, 0.02)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(540, 740);
        ctx.lineTo(spotX - 60, spotY + 20);
        ctx.lineTo(spotX + 60, spotY + 20);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _drawStageBackdrop() {
        const ctx = this.ctx;
        const stageTop = 640;
        const stageH = 260;

        // Center LED Video Wall
        const ledW = 440;
        const ledH = 190;
        const ledX = (this.width - ledW) / 2;
        const ledY = stageTop + 30;

        ctx.fillStyle = '#050110';
        ctx.fillRect(ledX, ledY, ledW, ledH);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(ledX, ledY, ledW, ledH);

        // Scanline
        const scanY = (this.laserAngle * 40) % ledH;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(ledX, ledY + scanY, ledW, 4);

        // Left & Right LED Matrix Equalizer Columns
        const eqWidth = 14;
        const eqGap = 6;
        const baseY = stageTop + stageH - 20;

        ctx.fillStyle = '#00f0ff';
        for (let i = 0; i < 8; i++) {
            const h = this.eqBars[i] * 140;
            const x = 60 + i * (eqWidth + eqGap);
            ctx.fillRect(x, baseY - h, eqWidth, h);
        }

        ctx.fillStyle = '#ff007f';
        for (let i = 0; i < 8; i++) {
            const h = this.eqBars[i + 8] * 140;
            const x = this.width - 60 - (8 - i) * (eqWidth + eqGap);
            ctx.fillRect(x, baseY - h, eqWidth, h);
        }
    }

    _drawCircularTrussAndBeams() {
        const ctx = this.ctx;
        const trussX = this.width / 2;
        const trussY = 740;
        const rx = 360;
        const ry = 80;

        // Moving Spotlight Cones
        const beamAngles = [
            -Math.PI * 0.75,
            -Math.PI * 0.25,
            Math.PI * 0.2,
            Math.PI * 0.65
        ];

        const beamColors = [
            'rgba(255, 230, 0, 0.22)',
            'rgba(0, 240, 255, 0.22)',
            'rgba(255, 0, 127, 0.20)',
            'rgba(0, 150, 255, 0.24)'
        ];

        for (let idx = 0; idx < beamAngles.length; idx++) {
            const bAngle = beamAngles[idx];
            const bx = trussX + Math.cos(bAngle + this.laserAngle * 0.4) * rx;
            const by = trussY + Math.sin(bAngle + this.laserAngle * 0.4) * ry;

            const targetX = bx + Math.sin(this.laserAngle * 1.2 + idx) * 220;
            const targetY = 1600;
            const beamW = 130;

            ctx.fillStyle = beamColors[idx];
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(targetX - beamW / 2, targetY);
            ctx.lineTo(targetX + beamW / 2, targetY);
            ctx.closePath();
            ctx.fill();
        }

        // Circular Truss Ring
        ctx.strokeStyle = '#6a5298';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(trussX, trussY, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#432d6c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(trussX, trussY + 14, rx - 12, ry - 6, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    _addTickerItem(nickname, text) {
        const feed = document.getElementById('chat-feed-box');
        if (!feed) return;

        const line = document.createElement('div');
        line.className = 'chat-msg-line';
        line.innerHTML = `<span class="chat-badge">VIP</span> <span class="chat-author">${nickname}:</span> <span class="chat-text">${text}</span>`;
        feed.appendChild(line);

        while (feed.children.length > 8) {
            feed.removeChild(feed.firstChild);
        }
        feed.scrollTop = feed.scrollHeight;
    }

    _updateLeaderboard(nickname, avatarUrl, diamonds) {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        let item = Array.from(list.children).find(el => el.dataset.nickname === nickname);
        if (item) {
            const curr = parseInt(item.dataset.diamonds || '0') + diamonds;
            item.dataset.diamonds = curr;
            item.querySelector('.donor-diamonds').textContent = `${curr} 💎`;
        } else {
            item = document.createElement('div');
            item.className = 'lb-item';
            item.dataset.nickname = nickname;
            item.dataset.diamonds = diamonds;
            item.innerHTML = `
                <div class="lb-user-info">
                    <img src="${avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + nickname}" class="lb-avatar" />
                    <span>${nickname}</span>
                </div>
                <span class="donor-diamonds" style="font-weight: 800; color: #ffd700;">${diamonds} 💎</span>
            `;
            list.appendChild(item);
        }
    }
}

window.StageEngine = StageEngine;
