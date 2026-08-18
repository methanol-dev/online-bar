/* ============================================================
   DJ CAMERA & WEBCAM MANAGER (EXACT MONKEY SHOULDER & DJ SCENE)
   ============================================================ */

class CameraManager {
    constructor(videoElemId, canvasElemId) {
        this.videoElem = document.getElementById(videoElemId);
        this.canvasElem = document.getElementById(canvasElemId);
        this.ctx = this.canvasElem ? this.canvasElem.getContext('2d') : null;

        this.width = 1080;
        this.height = 640;

        if (this.canvasElem) {
            this.canvasElem.width = this.width;
            this.canvasElem.height = this.height;
        }

        this.isWebcamActive = false;
        this.stream = null;
        this.djAngle = 0;

        this._initLoop();
    }

    async enableWebcam() {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                    audio: false
                });
                this.videoElem.srcObject = this.stream;
                this.videoElem.play();
                this.isWebcamActive = true;
                this.canvasElem.style.display = 'none';
                this.videoElem.style.display = 'block';
                return true;
            }
        } catch (err) {
            console.warn('[CameraManager] Webcam error or permission denied:', err);
            this.disableWebcam();
            return false;
        }
    }

    disableWebcam() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.isWebcamActive = false;
        if (this.videoElem) this.videoElem.style.display = 'none';
        if (this.canvasElem) this.canvasElem.style.display = 'block';
    }

    toggleWebcam() {
        if (this.isWebcamActive) {
            this.disableWebcam();
            return false;
        } else {
            return this.enableWebcam();
        }
    }

    _initLoop() {
        let lastT = performance.now();
        const render = (now) => {
            const dt = (now - lastT) / 1000;
            lastT = now;

            if (!this.isWebcamActive && this.ctx) {
                this.djAngle += dt * 4.5;
                this._drawDemoDJScene();
            }

            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    _drawDemoDJScene() {
        const ctx = this.ctx;
        ctx.save();

        // 1. Studio Room Background with Day/Night Skyline View
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#7895b2');
        bgGrad.addColorStop(0.5, '#aebdca');
        bgGrad.addColorStop(0.85, '#e8dfca');
        bgGrad.addColorStop(1, '#f5efe6');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Window Glass Divider Frames (Like in the photo)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 20, this.width - 60, 480);
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 20);
        ctx.lineTo(this.width / 2, 500);
        ctx.stroke();

        // 2. Monkey Shoulder Logo on Left Side (Exact match with photo!)
        this._drawMonkeyShoulderLogo(ctx, 80, 110);

        // 3. Monkey Shoulder Whiskey Bottles on Desk
        this._drawBottle(ctx, 200, 360);
        this._drawBottle(ctx, 270, 380);
        this._drawBottle(ctx, 750, 380);
        this._drawBottle(ctx, 820, 360);

        // 4. DJ Host Girl in Center (White Puff Top, Dark Skirt, Headphones)
        const djX = this.width / 2;
        const djY = 270 + Math.sin(this.djAngle) * 6;

        // Long Brown Hair (Back)
        ctx.fillStyle = '#6d4c41';
        ctx.beginPath();
        ctx.ellipse(djX, djY + 10, 52, 65, 0, 0, Math.PI * 2);
        ctx.fill();

        // White Blouse / Top with Puff Shoulders
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(djX, djY + 115, 80, 70, 0, 0, Math.PI * 2);
        ctx.fill();

        // Black High-waisted Skirt
        ctx.fillStyle = '#1e1e24';
        ctx.fillRect(djX - 70, djY + 160, 140, 120);

        // Arms Dancing / Hands on Mixer
        ctx.strokeStyle = '#f5cba7';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        
        // Left Arm waving
        const leftArmY = djY + 100 + Math.sin(this.djAngle * 1.5) * 20;
        ctx.beginPath();
        ctx.moveTo(djX - 60, djY + 90);
        ctx.lineTo(djX - 100, leftArmY);
        ctx.stroke();

        // Right Arm on DJ mixer
        const rightArmX = djX + 90 + Math.cos(this.djAngle * 2) * 15;
        ctx.beginPath();
        ctx.moveTo(djX + 60, djY + 90);
        ctx.lineTo(rightArmX, djY + 140);
        ctx.stroke();

        // Face & Cute Features
        ctx.fillStyle = '#fbeee6';
        ctx.beginPath();
        ctx.arc(djX, djY, 40, 0, Math.PI * 2);
        ctx.fill();

        // Front Hair Bangs
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.arc(djX, djY - 14, 44, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();

        // Eyes & Smile
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(djX - 14, djY - 2, 4, 0, Math.PI * 2);
        ctx.arc(djX + 14, djY - 2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.arc(djX, djY + 15, 6, 0, Math.PI);
        ctx.fill();

        // Headphones on Head
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(djX, djY - 10, 44, Math.PI * 0.9, Math.PI * 2.1);
        ctx.stroke();

        // 5. White DJ Mixer Deck & Pioneer Tables in Foreground
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(80, 480, 920, 160);
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 3;
        ctx.strokeRect(80, 480, 920, 160);

        // Turntables
        this._drawPlatter(ctx, 300, 560, this.djAngle * 3);
        this._drawPlatter(ctx, 780, 560, -this.djAngle * 3);

        ctx.restore();
    }

    _drawMonkeyShoulderLogo(ctx, x, y) {
        ctx.save();
        // 3 Monkeys Graphic
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x + 40 + i * 26, y + 25 - i * 6, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Text Badge
        ctx.font = '900 24px Arial Black, sans-serif';
        ctx.fillStyle = '#d97706';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.fillText('MONKEY', x + 5, y + 72);
        ctx.fillText('SHOULDER', x + 5, y + 96);
        ctx.restore();
    }

    _drawBottle(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, 40, 90, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.fillRect(x + 12, y - 22, 16, 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MONKEY', x + 20, y + 42);
        ctx.fillText('SHOULDER', x + 20, y + 54);
        ctx.restore();
    }

    _drawPlatter(ctx, x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 56, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

window.CameraManager = CameraManager;
