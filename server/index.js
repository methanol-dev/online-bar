const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const TikTokService = require('./tiktokService');
const Simulator = require('./simulator');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static(path.join(__dirname, '../public')));

const tiktokService = new TikTokService(io);
const simulator = new Simulator(io);

// Music Upload & Management APIs
const musicUploadDir = path.join(__dirname, '../public/uploads/music');
const fs = require('fs');
if (!fs.existsSync(musicUploadDir)) {
    fs.mkdirSync(musicUploadDir, { recursive: true });
}

app.get('/api/music/list', (req, res) => {
    try {
        const files = fs.readdirSync(musicUploadDir);
        const list = files.map(file => {
            const stat = fs.statSync(path.join(musicUploadDir, file));
            return {
                filename: file,
                url: `/uploads/music/${encodeURIComponent(file)}`,
                size: (stat.size / (1024 * 1024)).toFixed(2) + ' MB',
                time: stat.mtime
            };
        });
        res.json({ success: true, list });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/music/upload', (req, res) => {
    try {
        const { filename, base64Data } = req.body;
        if (!filename || !base64Data) {
            return res.status(400).json({ success: false, error: 'Thiếu dữ liệu tệp hoặc tên tệp' });
        }

        // Clean filename
        const safeName = Date.now() + '_' + filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = path.join(musicUploadDir, safeName);
        
        // Remove base64 header if present
        const base64Clean = base64Data.replace(/^data:audio\/\w+;base64,/, '');
        fs.writeFileSync(filePath, Buffer.from(base64Clean, 'base64'));

        const trackUrl = `/uploads/music/${encodeURIComponent(safeName)}`;
        console.log(`[Music] Uploaded track: ${safeName}`);
        res.json({
            success: true,
            track: {
                filename: safeName,
                url: trackUrl,
                title: filename
            }
        });
    } catch (err) {
        console.error('[Music Upload Error]', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/music/delete', (req, res) => {
    try {
        const { filename } = req.body;
        const filePath = path.join(musicUploadDir, path.basename(filename));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Endpoints
app.get('/api/status', (req, res) => {
    res.json({
        tiktok: tiktokService.getStatus(),
        simulator: { isRunning: simulator.isRunning }
    });
});

app.post('/api/tiktok/connect', async (req, res) => {
    const { username } = req.body;
    try {
        const result = await tiktokService.connect(username);
        res.json({ success: true, message: `Connecting to TikTok live: @${username}`, result });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.post('/api/tiktok/disconnect', (req, res) => {
    tiktokService.disconnect();
    res.json({ success: true, message: 'Disconnected from TikTok Live' });
});

app.post('/api/simulator/toggle', (req, res) => {
    const { start } = req.body;
    if (start) {
        simulator.start();
    } else {
        simulator.stop();
    }
    res.json({ success: true, isRunning: simulator.isRunning });
});

app.post('/api/simulator/trigger', (req, res) => {
    const { type, payload } = req.body;
    simulator.triggerManualEvent(type, payload || {});
    res.json({ success: true });
});

app.post('/api/simulator/bulk-spawn', (req, res) => {
    const count = parseInt(req.body.count || 1000, 10);
    const result = simulator.bulkSpawn(count);
    res.json(result);
});

app.post('/api/simulator/clear-crowd', (req, res) => {
    const result = simulator.clearCrowd();
    res.json(result);
});

// Current Music State
let currentMusicState = {
    source: 'synth', // 'youtube' | 'upload' | 'synth' | 'off'
    isPlaying: false,
    url: '',
    title: 'Vinahouse Nonstop Beat 135 BPM',
    volume: 80
};

// Socket.io Events & Control
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    
    // Send current status & music state immediately
    socket.emit('status-update', tiktokService.getStatus());
    socket.emit('simulator-status', { isRunning: simulator.isRunning });
    socket.emit('music-state-sync', currentMusicState);

    socket.on('trigger-sound', (data) => {
        io.emit('play-sound', data);
    });

    socket.on('music-control', (data) => {
        // Update global music state and broadcast to all (OBS stream & dashboard)
        currentMusicState = { ...currentMusicState, ...data };
        io.emit('music-state-sync', currentMusicState);
        console.log(`[Music] State updated:`, currentMusicState);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

// Default route -> redirect to stream scene or serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

const DEFAULT_PORT = process.env.PORT || 3000;

function startServer(port) {
    server.listen(port, () => {
        console.log(`====================================================`);
        console.log(`  🎧 BAR ONLINE - TIKTOK LIVE INTERACTIVE TOOL 🚀  `);
        console.log(`====================================================`);
        console.log(`  - Stream View (OBS 9:16) : http://localhost:${port}`);
        console.log(`  - Streamer Dashboard     : http://localhost:${port}/dashboard`);
        console.log(`====================================================`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`[Port] Port ${port} is busy, retrying on port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('[Server Error]', err);
        }
    });
}

startServer(DEFAULT_PORT);

