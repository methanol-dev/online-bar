const { WebcastPushConnection } = require('tiktok-live-connector');

class TikTokService {
    constructor(io) {
        this.io = io;
        this.connection = null;
        this.currentUsername = null;
        this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'connected' | 'error'
    }

    getStatus() {
        return {
            status: this.status,
            username: this.currentUsername
        };
    }

    async connect(username) {
        if (!username) {
            throw new Error('TikTok Username is required');
        }

        // Disconnect existing session if any
        this.disconnect();

        this.currentUsername = username.trim().replace(/^@/, '');
        this.status = 'connecting';
        this.io.emit('status-update', this.getStatus());

        try {
            this.connection = new WebcastPushConnection(this.currentUsername, {
                processInitialData: false,
                enableExtendedGiftInfo: true,
                requestOptions: {
                    timeout: 10000
                }
            });

            const state = await this.connection.connect();
            this.status = 'connected';
            console.log(`[TikTokService] Connected to room ${state.roomId} (@${this.currentUsername})`);
            this.io.emit('status-update', this.getStatus());

            this._setupListeners();
            return { success: true, roomId: state.roomId };
        } catch (err) {
            this.status = 'error';
            console.error(`[TikTokService] Failed to connect to @${this.currentUsername}:`, err.message);
            this.io.emit('status-update', { ...this.getStatus(), error: err.message });
            throw err;
        }
    }

    disconnect() {
        if (this.connection) {
            try {
                this.connection.disconnect();
            } catch (e) {
                console.error('[TikTokService] Disconnect error:', e.message);
            }
            this.connection = null;
        }
        this.status = 'disconnected';
        this.currentUsername = null;
        this.io.emit('status-update', this.getStatus());
    }

    _setupListeners() {
        if (!this.connection) return;

        // Chat Event
        this.connection.on('chat', (data) => {
            const chatPayload = {
                userId: data.userId || data.uniqueId,
                uniqueId: data.uniqueId,
                nickname: data.nickname || data.uniqueId,
                avatarUrl: data.profilePictureUrl || null,
                comment: data.comment || '',
                timestamp: Date.now()
            };
            console.log(`[Chat] ${chatPayload.nickname}: ${chatPayload.comment}`);
            this.io.emit('tiktok-chat', chatPayload);
        });

        // Gift Event
        this.connection.on('gift', (data) => {
            // Repeat end means gift combo finished or single gift
            if (data.giftType === 1 && !data.repeatEnd) return;

            const giftPayload = {
                userId: data.userId || data.uniqueId,
                uniqueId: data.uniqueId,
                nickname: data.nickname || data.uniqueId,
                avatarUrl: data.profilePictureUrl || null,
                giftName: data.giftName || 'Gift',
                giftId: data.giftId,
                repeatCount: data.repeatCount || 1,
                diamondCount: (data.diamondCount || 1) * (data.repeatCount || 1),
                timestamp: Date.now()
            };
            console.log(`[Gift] ${giftPayload.nickname} sent ${giftPayload.repeatCount}x ${giftPayload.giftName}`);
            this.io.emit('tiktok-gift', giftPayload);
        });

        // Like Event
        this.connection.on('like', (data) => {
            this.io.emit('tiktok-like', {
                likeCount: data.likeCount,
                totalLikeCount: data.totalLikeCount,
                nickname: data.nickname || data.uniqueId
            });
        });

        // Member Join Event
        this.connection.on('member', (data) => {
            this.io.emit('tiktok-member', {
                uniqueId: data.uniqueId,
                nickname: data.nickname || data.uniqueId,
                avatarUrl: data.profilePictureUrl || null
            });
        });

        // Disconnected
        this.connection.on('streamEnd', () => {
            console.log('[TikTokService] Stream ended');
            this.disconnect();
        });

        this.connection.on('error', (err) => {
            console.error('[TikTokService] Connection error:', err);
            this.io.emit('tiktok-error', { error: err.message || 'Unknown TikTok connection error' });
        });
    }
}

module.exports = TikTokService;
