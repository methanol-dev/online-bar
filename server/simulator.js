/* ============================================================
   VIRAL TIKTOK LIVE EVENT SIMULATOR (MOCK ENGINE)
   ============================================================ */

class Simulator {
    constructor(io) {
        this.io = io;
        this.isRunning = false;
        this.timer = null;

        this.prefixes = [
            'Quẩy Thủ', 'Dân Chơi', 'Bé Mèo', 'Tiểu Thư', 'Boy Phố',
            'Hot Girl', 'Đại Gia', 'Chủ Tịch', 'Pepe', 'Popcat',
            'VIP', 'Chiến Thần', 'King', 'Queen', 'Anh Ba',
            'Em Gái', 'Doge', 'Cheems', 'Capybara', 'Luffy',
            'Vinahouse', 'Bảo Kê Bar', 'Tay Chơi', 'Bé Xinh'
        ];

        this.suffixes = [
            'Hà Nội', 'Sài Gòn', 'Đà Nẵng', 'Hải Phòng', 'Dubai',
            'Phố Cổ', 'Vinahouse', 'Quẩy Đêm', 'Bao Cả Bar', 'Nonstop',
            'EDM', 'Bất Tử', 'Khét Tiếng', 'Tia Chớp', 'Sành Điệu',
            'Hảo Hán', 'Bùng Nổ', 'Cháy Phố', 'Vũ Trường', 'Hồng Kông'
        ];

        this.mockUsers = [
            { uniqueId: 'pepe_fan_99', nickname: 'Pepe Quẩy Đêm', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pepe' },
            { uniqueId: 'doge_master', nickname: 'Doge Vua Vũ Trường', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=doge' },
            { uniqueId: 'cat_dancer_viet', nickname: 'Popcat Sài Gòn', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cat' },
            { uniqueId: 'cheems_dubaibar', nickname: 'Cheems Dân Chơi', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cheems' },
            { uniqueId: 'dj_remix_88', nickname: 'Quẩy Thủ Phố Cổ', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=remix' },
            { uniqueId: 'vip_dai_gia', nickname: 'Đại Gia Bao Cả Bar', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=vip' },
            { uniqueId: 'gai_xinh_quay', nickname: 'Bé Mèo Dễ Thương', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=catgirl' },
            { uniqueId: 'cyber_hacker_x', nickname: 'Cyber Dancer 2077', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber' },
            { uniqueId: 'hotboy_vinahouse', nickname: 'Boy Phố Quẩy Khét', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=vinahouse' },
            { uniqueId: 'tieu_thu_bar', nickname: 'Tiểu Thư Quẩy Đêm', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=princess' }
        ];

        this.mockCommands = [
            'NHẢY', 'NHẢY', 'QUẨY',
            'ĐỔI NV', 'ĐỔI ÁO',
            'ĐI VÒNG', 'ĐI VÒNG',
            'CỤNG LY', 'BIA',
            'XOAY', 'VIP',
            'PHÁO HOA', 'CAMERA',
            'Nhạc cháy quá DJ ơi!',
            'Quẩy lên anh em ơi!',
            'Bao cả bar đêm nay!'
        ];

        this.mockGifts = [
            { name: 'Hoa Hồng 🌹', diamond: 1, count: 10 },
            { name: 'Mũ TikTok 🧢', diamond: 99, count: 1 },
            { name: 'Vương Miện VIP 👑', diamond: 1999, count: 1 },
            { name: 'Siêu Xe Lamborghini 🏎️', diamond: 5000, count: 1 },
            { name: 'Trực Thăng VIP 🚁', diamond: 7000, count: 1 }
        ];
    }

    bulkSpawn(count = 1000) {
        const users = [];
        for (let i = 0; i < count; i++) {
            const pre = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
            const suf = this.suffixes[Math.floor(Math.random() * this.suffixes.length)];
            const num = Math.floor(Math.random() * 99) + 1;
            const nickname = `${pre} ${suf} ${num}`;
            const uniqueId = `user_${Date.now()}_${i}`;
            const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${uniqueId}`;

            users.push({
                uniqueId,
                nickname,
                avatarUrl
            });
        }

        console.log(`[Simulator] Bulk spawned ${count} users`);
        this.io.emit('bulk-users-spawn', { users, count });
        return { success: true, count };
    }

    clearCrowd() {
        console.log('[Simulator] Cleared crowd');
        this.io.emit('clear-crowd');
        return { success: true };
    }

    start(intervalMs = 2000) {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[Simulator] Started mock event stream');
        this.io.emit('simulator-status', { isRunning: true });

        this.timer = setInterval(() => {
            this._generateRandomEvent();
        }, intervalMs);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        console.log('[Simulator] Stopped mock event stream');
        this.io.emit('simulator-status', { isRunning: false });
    }

    triggerManualEvent(type, payload) {
        const user = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];

        if (type === 'chat') {
            this.io.emit('tiktok-chat', {
                userId: user.uniqueId,
                uniqueId: user.uniqueId,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                comment: payload.comment || 'NHẢY',
                timestamp: Date.now()
            });
        } else if (type === 'gift') {
            const gift = payload.gift || this.mockGifts[0];
            const repeatCount = payload.count || gift.count || 1;
            const diamondCount = (gift.diamond || 10) * repeatCount;
            this.io.emit('tiktok-gift', {
                userId: user.uniqueId,
                uniqueId: user.uniqueId,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                giftName: gift.name,
                giftId: 1001,
                repeatCount: repeatCount,
                diamondCount: diamondCount,
                timestamp: Date.now()
            });
        }
    }

    _generateRandomEvent() {
        const rand = Math.random();
        const user = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];

        if (rand < 0.22) {
            // 22% Chance of Gift
            const gift = this.mockGifts[Math.floor(Math.random() * this.mockGifts.length)];
            const count = gift.diamond === 1 ? Math.floor(Math.random() * 15) + 1 : 1;
            this.io.emit('tiktok-gift', {
                userId: user.uniqueId,
                uniqueId: user.uniqueId,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                giftName: gift.name,
                giftId: Math.floor(Math.random() * 9000) + 1000,
                repeatCount: count,
                diamondCount: gift.diamond * count,
                timestamp: Date.now()
            });
        } else if (rand < 0.35) {
            // 13% Chance of Member Join
            this.io.emit('tiktok-member', {
                uniqueId: user.uniqueId,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl
            });
        } else {
            // 65% Chance of Chat / Command
            const comment = this.mockCommands[Math.floor(Math.random() * this.mockCommands.length)];
            this.io.emit('tiktok-chat', {
                userId: user.uniqueId,
                uniqueId: user.uniqueId,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                comment: comment,
                timestamp: Date.now()
            });
        }
    }
}

module.exports = Simulator;
