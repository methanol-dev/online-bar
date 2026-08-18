/* ============================================================
   HIGH-CONTRAST ANIMATED STICKMAN DANCE ENGINE (NO WINGS)
   ============================================================ */

const REAL_MEME_MODELS = [
    '/assets/characters/laughing_yao.png',
    '/assets/characters/troll_original.png',
    '/assets/characters/happy_awwyeah.png',
    '/assets/characters/happy_crying.png',
    '/assets/characters/happy_all_the_things.png',
    '/assets/characters/challenged_freddie.png',
    '/assets/characters/laughing_lol.png',
    '/assets/characters/cereal_beer.png',
    '/assets/characters/happy_youre_the_man.png',
    '/assets/characters/happy_epic_smiley.png',
    '/assets/characters/troll_excited.png',
    '/assets/characters/troll_lol.png'
];

const PROP_ASSETS = {
    crown: '/assets/props/crown.svg',
    beer: '/assets/props/beer.svg',
    sunglasses: '/assets/props/sunglasses.svg'
};

// Vibrant Party Shirt Colors for High Visual Contrast
const SHIRT_COLORS = [
    '#ffffff', // Pure Crisp White
    '#00f0ff', // Cyber Cyan
    '#ff007f', // Hot Neon Pink
    '#ffe600', // Electric Gold Yellow
    '#00ff66', // Acid Neon Green
    '#ffffff', // Classic White
    '#ff5500'  // Sunset Orange
];

// Global Preloaded Images with Keyed Transparency
const KeyedImageCache = {};
function preloadAndKeyImage(src) {
    if (!KeyedImageCache[src]) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;
        const entry = { img: img, canvas: null, isReady: false };
        KeyedImageCache[src] = entry;

        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth || 128;
            c.height = img.naturalHeight || 128;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);

            try {
                const imgData = ctx.getImageData(0, 0, c.width, c.height);
                const data = imgData.data;
                for (let i = 0; i < data.length; i += 4) {
                    // Remove light/white background pixels for 100% clean cutout
                    if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220) {
                        data[i + 3] = 0;
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                entry.canvas = c;
            } catch (e) {
                entry.canvas = img;
            }
            entry.isReady = true;
        };
    }
    return KeyedImageCache[src];
}

REAL_MEME_MODELS.forEach(preloadAndKeyImage);
Object.values(PROP_ASSETS).forEach(preloadAndKeyImage);

/* ============================================================
   LIVELY HIGH-CONTRAST STICKMAN DANCER
   ============================================================ */
class StickmanDancer {
    constructor(userId, nickname, avatarUrl, x, y, baseScale = 1.0, isForeground = false) {
        this.userId = userId;
        this.nickname = nickname;
        this.avatarUrl = avatarUrl;

        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;

        this.depthScale = baseScale;
        this.isForeground = isForeground;

        // Individual Dance Move Styles (0 to 4)
        this.danceStyle = Math.floor(Math.random() * 5);
        this.danceSpeed = 7.0 + Math.random() * 3.5;
        this.dancePhase = Math.random() * Math.PI * 2;

        this.modelIndex = isForeground ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * REAL_MEME_MODELS.length);
        this.shirtColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
        this.hasCrown = false;
        this.isVIP = false;

        this.offsetY = 0;
    }

    update(dt, globalTime) {
        if (Math.abs(this.targetX - this.x) > 1 || Math.abs(this.targetY - this.y) > 1) {
            this.x += (this.targetX - this.x) * 0.08;
            this.y += (this.targetY - this.y) * 0.08;
        }

        const t = globalTime * this.danceSpeed + this.dancePhase;
        this.offsetY = Math.sin(t * 2) * (8 * this.depthScale);
    }

    triggerJump() {
        this.offsetY = -24 * this.depthScale;
        this.danceStyle = (this.danceStyle + 1) % 5;
    }

    triggerSpin() {
        this.dancePhase += Math.PI;
    }

    triggerMove(stageW, floorTop, floorBottom) {
        this.targetX = 60 + Math.random() * (stageW - 120);
        this.targetY = floorTop + Math.random() * (floorBottom - floorTop);
    }

    switchSkin() {
        this.modelIndex = (this.modelIndex + 1) % REAL_MEME_MODELS.length;
        this.shirtColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
        this.danceStyle = (this.danceStyle + 1) % 5;
    }

    toggleVIPStatus() {
        this.hasCrown = !this.hasCrown;
        this.isVIP = this.hasCrown;
    }

    setScaleDelta(delta) {
        this.depthScale = Math.max(0.35, Math.min(2.5, this.depthScale + delta));
    }

    draw(ctx, globalTime) {
        const scale = this.depthScale;
        const drawX = this.x;
        const drawY = this.y + this.offsetY;
        const t = globalTime * this.danceSpeed + this.dancePhase;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.scale(scale, scale);

        // 1. Soft Elliptical Ground Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 52, 26, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // VIP Golden Aura Ring on floor (No bulky wings!)
        if (this.hasCrown) {
            ctx.save();
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(0, 52, 34, 11, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 2. ANIMATED STICKMAN BODY & LIMBS (Vibrant & High-Contrast)
        this._drawHighContrastLimbs(ctx, t);

        // 3. OPAQUE WHITE BASE + REAL MEME FACE PNG (Crystal Clear & Sharp!)
        const modelSrc = REAL_MEME_MODELS[this.modelIndex % REAL_MEME_MODELS.length];
        const memeEntry = preloadAndKeyImage(modelSrc);
        const headW = 56;
        const headH = 56;
        const headBob = Math.sin(t * 2) * 2;
        const headTilt = Math.sin(t) * 0.08;

        ctx.save();
        ctx.translate(0, -22 + headBob);
        ctx.rotate(headTilt);

        // Solid Pure White Circular Base (Ensures 100% Contrast against Dark Floor!)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Real Meme Expression on Top
        if (memeEntry && memeEntry.canvas) {
            ctx.drawImage(memeEntry.canvas, -headW / 2, -headH / 2, headW, headH);
        }

        // Sparkling Crown (If VIP)
        if (this.hasCrown) {
            const crownEntry = preloadAndKeyImage(PROP_ASSETS.crown);
            if (crownEntry && crownEntry.canvas) {
                ctx.drawImage(crownEntry.canvas, -16, -headH / 2 - 22, 32, 28);
            }
        }

        ctx.restore();
        ctx.restore();
    }

    _drawHighContrastLimbs(ctx, t) {
        const torsoSway = Math.sin(t) * 4;
        const hipX = torsoSway * 0.4;
        const hipY = 28;

        // 1. Shirt Torso (Vibrant Color with Crisp Border)
        ctx.fillStyle = this.shirtColor;
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-10, 4);
        ctx.lineTo(-14 + hipX, hipY);
        ctx.lineTo(14 + hipX, hipY);
        ctx.lineTo(10, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. High-Contrast Limbs (White with Black Outline for Maximum Legibility)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer Dark Shadow to make limbs pop on any background
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;

        if (this.danceStyle === 0) {
            // STYLE 0: MÚA QUẠT VINAHOUSE (Fan Dance)
            const fan1 = Math.sin(t * 3);
            const fan2 = Math.cos(t * 3);

            ctx.beginPath();
            ctx.moveTo(-8, 8);
            ctx.lineTo(-22 + fan1 * 8, 6 + fan2 * 10);
            ctx.lineTo(-34 + fan2 * 12, -14 + fan1 * 14);
            ctx.moveTo(8, 8);
            ctx.lineTo(22 - fan1 * 8, 6 - fan2 * 10);
            ctx.lineTo(34 - fan2 * 12, -14 - fan1 * 14);
            ctx.stroke();

            // Legs
            const legBob = Math.sin(t * 2) * 6;
            ctx.beginPath();
            ctx.moveTo(hipX - 6, hipY);
            ctx.lineTo(-12, 40 + legBob);
            ctx.lineTo(-18, 52);
            ctx.moveTo(hipX + 6, hipY);
            ctx.lineTo(12, 40 - legBob);
            ctx.lineTo(18, 52);
            ctx.stroke();

        } else if (this.danceStyle === 1) {
            // STYLE 1: QUẨY 2 TAY GIƠ CAO (Hands Up)
            const waveY = Math.sin(t * 2) * 8;
            const waveX = Math.cos(t) * 6;

            ctx.beginPath();
            ctx.moveTo(-8, 8);
            ctx.lineTo(-20 + waveX, -8 + waveY);
            ctx.lineTo(-30 + waveX, -28 + waveY * 1.4);
            ctx.moveTo(8, 8);
            ctx.lineTo(20 + waveX, -8 + waveY);
            ctx.lineTo(30 + waveX, -28 + waveY * 1.4);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(hipX - 6, hipY);
            ctx.lineTo(-10, 42);
            ctx.lineTo(-14, 52);
            ctx.moveTo(hipX + 6, hipY);
            ctx.lineTo(10, 42);
            ctx.lineTo(14, 52);
            ctx.stroke();

        } else if (this.danceStyle === 2) {
            // STYLE 2: BƠM TAY CHỈ TRỜI (Fist Pump)
            const pump = Math.abs(Math.sin(t * 2.5)) * 14;

            ctx.beginPath();
            ctx.moveTo(-8, 8);
            ctx.lineTo(-18, 16);
            ctx.lineTo(hipX - 8, hipY - 2);
            ctx.moveTo(8, 8);
            ctx.lineTo(20, -10 - pump * 0.5);
            ctx.lineTo(28, -30 - pump);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(hipX - 6, hipY);
            ctx.lineTo(-14, 40);
            ctx.lineTo(-16, 52);
            ctx.moveTo(hipX + 6, hipY);
            ctx.lineTo(8, 42);
            ctx.lineTo(14, 52);
            ctx.stroke();

        } else if (this.danceStyle === 3) {
            // STYLE 3: LẮC LƯ 2 BÊN (Side-to-Side Sway)
            const sway = Math.sin(t) * 16;

            ctx.beginPath();
            ctx.moveTo(-8, 8);
            ctx.lineTo(-18 + sway, 18);
            ctx.lineTo(-26 + sway * 1.3, 30);
            ctx.moveTo(8, 8);
            ctx.lineTo(18 + sway, 18);
            ctx.lineTo(26 + sway * 1.3, 30);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(hipX - 6, hipY);
            ctx.lineTo(-18, 40);
            ctx.lineTo(-22, 52);
            ctx.moveTo(hipX + 6, hipY);
            ctx.lineTo(18, 40);
            ctx.lineTo(22, 52);
            ctx.stroke();

        } else {
            // STYLE 4: ĐÁNH ĐÀN GUITAR (Air Guitar)
            const strum = Math.sin(t * 4) * 8;

            ctx.beginPath();
            ctx.moveTo(-8, 8);
            ctx.lineTo(-24, 10);
            ctx.lineTo(-36, -6);
            ctx.moveTo(8, 8);
            ctx.lineTo(14, 18 + strum);
            ctx.lineTo(4, 22 + strum);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(hipX - 6, hipY);
            ctx.lineTo(-16, 38);
            ctx.lineTo(-20, 52);
            ctx.moveTo(hipX + 6, hipY);
            ctx.lineTo(12, 42);
            ctx.lineTo(16, 52);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    }

    drawName(ctx) {
        const textY = this.y + this.offsetY - 48 * this.depthScale;
        ctx.fillText(this.nickname, this.x, textY);
    }
}

/* ============================================================
   AVATAR MANAGER
   ============================================================ */
class AvatarManager {
    constructor(stageWidth, stageHeight) {
        this.stageWidth = stageWidth;
        this.stageHeight = stageHeight;
        this.floorTop = 960;
        this.floorBottom = 1860;

        this.avatars = new Map();
        this.sortedArray = [];
        this.needsSort = false;
        this.maxAvatars = 3000;
        this.globalTime = 0;

        setTimeout(() => this._initPhotoCrowd(), 300);
    }

    _initPhotoCrowd() {
        const vietNames = [
            'Chương', 'Nguyễn', 'Hải', 'Tú', 'Bé Mèo', 'Quẩy Khét',
            'Dân Chơi 99', 'Hà Nội', 'Sài Gòn', 'Dubai', 'Phố Cổ',
            'Long', 'Hoàng', 'Minh', 'Trang', 'Huyền', 'Linh', 'Thảo'
        ];

        const initialUsers = [];
        for (let i = 0; i < 450; i++) {
            const name = vietNames[i % vietNames.length] + (i > 18 ? ` ${i}` : '');
            initialUsers.push({
                uniqueId: `init_user_${i}`,
                nickname: name,
                avatarUrl: null
            });
        }
        this.bulkSpawnUsers(initialUsers);

        // Foreground cluster on bottom-left and center (Like reference photo!)
        const fgPositions = [
            { x: 120, y: 1680, name: 'Yao Ming Quẩy' },
            { x: 180, y: 1720, name: 'Trollface VIP' },
            { x: 250, y: 1700, name: 'Aww Yeah Quẩy' },
            { x: 520, y: 1660, name: 'Crying Laugh' },
            { x: 590, y: 1690, name: 'Freddie Mercury' },
            { x: 670, y: 1670, name: 'Cereal Beer' }
        ];

        fgPositions.forEach((fg, idx) => {
            const fgAvatar = new StickmanDancer(`fg_${idx}`, fg.name, null, fg.x, fg.y, 1.25, true);
            this.avatars.set(fgAvatar.userId, fgAvatar);
            this.sortedArray.push(fgAvatar);
        });

        this.needsSort = true;
        this._updateUserCountUI();
    }

    getOrCreateAvatar(userId, nickname, avatarUrl, customX = null, customY = null) {
        if (this.avatars.has(userId)) {
            const avatar = this.avatars.get(userId);
            if (nickname) avatar.nickname = nickname;
            return avatar;
        }

        if (this.avatars.size >= this.maxAvatars) {
            const oldestKey = this.avatars.keys().next().value;
            this.avatars.delete(oldestKey);
        }

        const spawnY = customY !== null ? customY : (this.floorTop + Math.random() * (this.floorBottom - this.floorTop));
        const depthRatio = (spawnY - this.floorTop) / (this.floorBottom - this.floorTop);
        const horizonW = 740 + (1080 - 740) * depthRatio;
        const minX = (this.stageWidth - horizonW) / 2 + 30;
        const maxX = (this.stageWidth + horizonW) / 2 - 30;

        const spawnX = customX !== null ? customX : (minX + Math.random() * (maxX - minX));
        const baseScale = 0.44 + depthRatio * 0.70;

        const newAvatar = new StickmanDancer(userId, nickname || userId, avatarUrl, spawnX, spawnY, baseScale);
        this.avatars.set(userId, newAvatar);
        this.sortedArray.push(newAvatar);
        this.needsSort = true;

        this._updateUserCountUI();
        return newAvatar;
    }

    bulkSpawnUsers(users) {
        const count = users.length;
        const rows = Math.ceil(Math.sqrt(count * 1.6));
        const cols = Math.ceil(count / rows);

        users.forEach((u, idx) => {
            const r = Math.floor(idx / cols);
            const c = idx % cols;

            const depthRatio = (r + Math.random() * 0.5) / rows;
            const y = this.floorTop + depthRatio * (this.floorBottom - this.floorTop);

            const horizonW = 740 + (1080 - 740) * depthRatio;
            const minX = (this.stageWidth - horizonW) / 2 + 25;
            const maxX = (this.stageWidth + horizonW) / 2 - 25;

            const x = minX + ((c + Math.random() * 0.8) / cols) * (maxX - minX);
            const baseScale = 0.44 + depthRatio * 0.70;

            const newAvatar = new StickmanDancer(
                u.uniqueId || `user_${Date.now()}_${idx}`,
                u.nickname,
                u.avatarUrl,
                x,
                y,
                baseScale
            );

            this.avatars.set(newAvatar.userId, newAvatar);
            this.sortedArray.push(newAvatar);
        });

        this.needsSort = true;
        this._updateUserCountUI();
    }

    clearCrowd() {
        this.avatars.clear();
        this.sortedArray = [];
        this._updateUserCountUI();
    }

    _updateUserCountUI() {
        const counter = document.getElementById('dancer-count-badge');
        if (counter) {
            counter.textContent = `👥 ${this.avatars.size.toLocaleString('vi-VN')} DÂN CHƠI`;
        }
    }

    handleChatCommand(chatData) {
        const { userId, nickname, avatarUrl, comment } = chatData;
        const avatar = this.getOrCreateAvatar(userId, nickname, avatarUrl);
        const cmd = (comment || '').trim().toUpperCase();

        if (cmd === '1' || cmd.includes('VÀO') || cmd.includes('BAR')) {
            avatar.triggerJump();
        } else if (cmd.includes('NHẢY') || cmd.includes('QUẨY') || cmd.includes('NHAY')) {
            avatar.triggerJump();
        } else if (cmd.includes('XOAY')) {
            avatar.triggerSpin();
        } else if (cmd.includes('ĐỔI NV') || cmd.includes('DOI NV')) {
            avatar.switchSkin();
        } else if (cmd.includes('ĐI VÒNG') || cmd.includes('DI VONG')) {
            avatar.triggerMove(this.stageWidth, this.floorTop, this.floorBottom);
            this.needsSort = true;
        } else if (cmd.includes('VIP') || cmd.includes('HUY HIỆU') || cmd.includes('VƯƠNG MIỆN')) {
            avatar.toggleVIPStatus();
        } else if (cmd.includes('TO LÊN') || cmd.includes('TO')) {
            avatar.setScaleDelta(0.35);
        } else if (cmd.includes('NHỎ LẠI') || cmd.includes('NHỎ')) {
            avatar.setScaleDelta(-0.25);
        } else {
            avatar.triggerJump();
        }
    }

    handleGiftEvent(giftData) {
        const { userId, nickname, avatarUrl } = giftData;
        const avatar = this.getOrCreateAvatar(userId, nickname, avatarUrl);
        avatar.toggleVIPStatus();
        avatar.setScaleDelta(0.4);
        avatar.triggerJump();
    }

    update(dt) {
        this.globalTime += dt;

        if (this.needsSort) {
            this.sortedArray.sort((a, b) => a.y - b.y);
            this.needsSort = false;
        }

        const len = this.sortedArray.length;
        for (let i = 0; i < len; i++) {
            this.sortedArray[i].update(dt, this.globalTime);
        }
    }

    draw(ctx) {
        const len = this.sortedArray.length;
        if (len === 0) return;

        // 1. HIGH-CONTRAST ANIMATED STICKMAN DRAW
        for (let i = 0; i < len; i++) {
            this.sortedArray[i].draw(ctx, this.globalTime);
        }

        // 2. CLEAN HIGH-LEGIBILITY TIKTOK TEXT TAGS
        ctx.save();
        ctx.font = 'bold 12px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const step = len > 600 ? 3 : (len > 300 ? 2 : 1);
        for (let i = 0; i < len; i += step) {
            this.sortedArray[i].drawName(ctx);
        }
        ctx.restore();
    }
}

window.AvatarManager = AvatarManager;
