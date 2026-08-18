/* ============================================================
   VIRAL EFFECTS MANAGER - REAL VECTOR MODELS & LUXURY GIFT ASSETS
   ============================================================ */

const EFFECT_PROPS = {
    supercar: '/assets/props/supercar.svg',
    helicopter: '/assets/props/helicopter.svg',
    rocket: '/assets/props/rocket.svg',
    lion: '/assets/props/lion.svg',
    diamond: '/assets/props/diamond.svg',
    rose: '/assets/props/rose.svg',
    crown: '/assets/props/crown.svg'
};

const EffectImageCache = {};
function getEffectImage(src) {
    if (!EffectImageCache[src]) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;
        EffectImageCache[src] = img;
    }
    return EffectImageCache[src];
}

Object.values(EFFECT_PROPS).forEach(getEffectImage);

class Particle {
    constructor(x, y, vx, vy, color, size, life, isRibbon = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxLife = life;
        this.life = life;
        this.isRibbon = isRibbon;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() - 0.5) * 8;
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.18; // Gravity
        this.vx *= 0.98; // Air resistance
        this.angle += this.angularSpeed * dt;
        this.life -= dt;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        if (this.isRibbon) {
            ctx.fillRect(-this.size, -this.size / 3, this.size * 2, this.size / 1.5);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class MoneyDrop {
    constructor(x, y, type = 'diamond') {
        this.x = x;
        this.y = y;
        this.vy = Math.random() * 3 + 2.5;
        this.vx = (Math.random() - 0.5) * 2;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() - 0.5) * 4;
        this.type = type; // 'diamond' | 'rose' | 'coin'
        this.life = 4.5;
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angularSpeed * dt;
        this.life -= dt;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        let imgSrc = null;
        if (this.type === 'diamond') imgSrc = EFFECT_PROPS.diamond;
        else if (this.type === 'rose') imgSrc = EFFECT_PROPS.rose;

        if (imgSrc) {
            const img = getEffectImage(imgSrc);
            if (img && img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, -14, -14, 28, 28);
            } else {
                ctx.font = '22px sans-serif';
                ctx.fillText(this.type === 'diamond' ? '💎' : '🌹', -11, 11);
            }
        } else {
            ctx.fillStyle = '#ffd700';
            ctx.font = '22px sans-serif';
            ctx.fillText('🪙', -11, 11);
        }

        ctx.restore();
    }
}

class CO2Jet {
    constructor(x, y, direction = 1) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.timer = 1.2;
        this.direction = direction;
    }

    update(dt) {
        this.timer -= dt;
        if (this.timer > 0) {
            for (let i = 0; i < 4; i++) {
                this.particles.push({
                    x: this.x + (Math.random() - 0.5) * 20,
                    y: this.y,
                    vx: (Math.random() - 0.5) * 4 + this.direction * 2.5,
                    vy: -Math.random() * 18 - 14,
                    size: Math.random() * 15 + 10,
                    alpha: 0.8,
                    maxLife: 1.0,
                    life: 1.0
                });
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.size += 0.8;
            p.life -= dt;
            p.alpha = (p.life / p.maxLife) * 0.7;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    isDone() {
        return this.timer <= 0 && this.particles.length === 0;
    }
}

class LuxuryVehicle {
    constructor(type, nickname, giftName) {
        this.type = type; // 'supercar' | 'helicopter' | 'rocket' | 'lion'
        this.nickname = nickname;
        this.giftName = giftName;
        this.x = -450;
        this.y = type === 'supercar' ? 1420 : (type === 'rocket' ? 800 : 420);
        this.targetX = 1450;
        this.speed = type === 'rocket' ? 650 : 480;
        this.active = true;
    }

    update(dt) {
        this.x += this.speed * dt;
        if (this.x > this.targetX) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const imgSrc = EFFECT_PROPS[this.type] || EFFECT_PROPS.supercar;
        const img = getEffectImage(imgSrc);

        const w = 180;
        const h = 120;

        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 30;
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }

        // Trailing VIP Banner
        ctx.save();
        ctx.translate(-160, -50);
        ctx.fillStyle = 'rgba(10, 5, 20, 0.92)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(-200, -22, 190, 44, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`👑 ${this.nickname}`, -105, -2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.fillText(`SIÊU QUÀ: ${this.giftName}`, -105, 15);
        ctx.restore();

        ctx.restore();
    }
}

class ChatBubble {
    constructor(x, y, text, nickname) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.nickname = nickname;
        this.life = 3.8;
        this.maxLife = 3.8;
    }

    update(dt) {
        this.life -= dt;
        this.y -= 0.6;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = Math.min(1, this.life);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 15px Segoe UI, sans-serif';
        const textWidth = ctx.measureText(this.text).width;
        const padding = 14;
        const width = Math.max(80, textWidth + padding * 2);
        const height = 34;

        ctx.fillStyle = 'rgba(14, 8, 30, 0.92)';
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.roundRect(this.x - width / 2, this.y - height - 12, width, height, 12);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x - 7, this.y - 12);
        ctx.lineTo(this.x + 7, this.y - 12);
        ctx.lineTo(this.x, this.y - 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y - height / 2 - 12);

        ctx.restore();
    }
}

class EffectsManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.particles = [];
        this.moneyDrops = [];
        this.co2Jets = [];
        this.vehicles = [];
        this.chatBubbles = [];

        this.shakeTimer = 0;
        this.shakeIntensity = 0;
    }

    addFireworks(x, y) {
        const colors = ['#ff007f', '#00f0ff', '#ffe600', '#00ff66', '#ffffff', '#ff0055', '#7928ca'];
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 10;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const isRibbon = Math.random() < 0.4;
            this.particles.push(new Particle(x, y, vx, vy, color, Math.random() * 4 + 2, 1.8, isRibbon));
        }

        this.shakeTimer = 0.4;
        this.shakeIntensity = 14;

        if (window.soundboard) {
            window.soundboard.playSound('EXPLOSION');
        }
    }

    addMoneyRain(type = 'diamond') {
        for (let i = 0; i < 25; i++) {
            const x = Math.random() * this.width;
            const y = -20 - Math.random() * 200;
            this.moneyDrops.push(new MoneyDrop(x, y, type));
        }
    }

    triggerCO2Blast() {
        this.co2Jets.push(new CO2Jet(120, this.height * 0.90, 1));
        this.co2Jets.push(new CO2Jet(this.width - 120, this.height * 0.90, -1));
        if (window.soundboard) {
            window.soundboard.playSound('AIRHORN');
        }
    }

    addLuxuryVehicle(type, nickname, giftName) {
        this.vehicles.push(new LuxuryVehicle(type, nickname, giftName));
        this.addMoneyRain(type === 'rose' ? 'rose' : 'diamond');
        if (window.soundboard) {
            window.soundboard.playSound('SIREN');
        }
    }

    addChatBubble(x, y, text, nickname) {
        this.chatBubbles.push(new ChatBubble(x, y - 85, text, nickname));
    }

    showVIPBanner(nickname, giftName, repeatCount, diamondCount = 10) {
        const container = document.getElementById('banner-container');
        if (!container) return;

        const banner = document.createElement('div');
        banner.className = 'vip-banner';
        banner.innerHTML = `
            <div class="vip-banner-icon">👑</div>
            <div>
                <div class="vip-banner-text">${nickname}</div>
                <div class="vip-banner-sub">TẶNG ${repeatCount}x ${giftName} 🔥 ĐẠI GIA VŨ TRƯỜNG!</div>
            </div>
        `;

        container.appendChild(banner);

        if (diamondCount >= 5000) {
            this.addLuxuryVehicle('supercar', nickname, giftName);
        } else if (diamondCount >= 2000) {
            this.addLuxuryVehicle('rocket', nickname, giftName);
        } else if (diamondCount >= 1000) {
            this.addLuxuryVehicle('helicopter', nickname, giftName);
        } else if (diamondCount >= 500) {
            this.addLuxuryVehicle('lion', nickname, giftName);
        } else {
            this.triggerCO2Blast();
            this.addFireworks(this.width / 2, this.height * 0.35);
        }

        if (window.soundboard) {
            window.soundboard.playSound('AIRHORN');
            setTimeout(() => window.soundboard.playSound('CHEER'), 300);
        }

        setTimeout(() => {
            banner.remove();
        }, 5500);
    }

    update(dt) {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }

        this.particles = this.particles.filter(p => { p.update(dt); return p.life > 0; });
        this.moneyDrops = this.moneyDrops.filter(m => { m.update(dt); return m.life > 0 && m.y < this.height + 50; });
        this.chatBubbles = this.chatBubbles.filter(b => { b.update(dt); return b.life > 0; });
        this.vehicles = this.vehicles.filter(v => { v.update(dt); return v.active; });

        for (let i = this.co2Jets.length - 1; i >= 0; i--) {
            this.co2Jets[i].update(dt);
            if (this.co2Jets[i].isDone()) this.co2Jets.splice(i, 1);
        }
    }

    getShakeOffset() {
        if (this.shakeTimer <= 0) return { x: 0, y: 0 };
        return {
            x: (Math.random() - 0.5) * this.shakeIntensity,
            y: (Math.random() - 0.5) * this.shakeIntensity
        };
    }

    draw(ctx) {
        for (const co2 of this.co2Jets) {
            co2.draw(ctx);
        }

        for (const p of this.particles) {
            p.draw(ctx);
        }

        for (const m of this.moneyDrops) {
            m.draw(ctx);
        }

        for (const v of this.vehicles) {
            v.draw(ctx);
        }

        for (const bubble of this.chatBubbles) {
            bubble.draw(ctx);
        }
    }
}

window.EffectsManager = EffectsManager;
