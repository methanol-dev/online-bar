const http = require('http');
const { exec, spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('  🤖 AI LIVE PILOT AGENT - TỰ ĐỘNG BẬT BAR ONLINE 🚀  ');
console.log('====================================================\n');

const PORT = 3000;
const STREAM_URL = `http://localhost:${PORT}`;
const DASHBOARD_URL = `http://localhost:${PORT}/dashboard`;

// 1. Kiểm tra Server có đang chạy không
function checkServer() {
    return new Promise((resolve) => {
        http.get(`http://localhost:${PORT}/api/status`, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        });
    });
}

// 2. Khởi động Server nếu chưa chạy
async function ensureServerRunning() {
    const isRunning = await checkServer();
    if (isRunning) {
        console.log('  ✅ [1/4] Máy chủ đã sẵn sàng tại port ' + PORT);
        return;
    }

    console.log('  ⚡ [1/4] Đang tự động khởi động máy chủ Node.js...');
    const serverProcess = spawn('node', ['server/index.js'], {
        cwd: path.join(__dirname, '..'),
        detached: true,
        stdio: 'ignore'
    });
    serverProcess.unref();

    // Đợi server khởi động
    for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 600));
        if (await checkServer()) {
            console.log('  ✅ [1/4] Máy chủ đã khởi động thành công!');
            return;
        }
    }
    console.log('  ⚠️ Máy chủ mất nhiều thời gian khởi động, đang tiếp tục...');
}

// 3. Tự động mở trình duyệt (Màn hình Stream OBS & Dashboard)
function openBrowser() {
    console.log('  🌐 [2/4] Đang tự động mở trình duyệt Chrome / Edge...');
    
    // Mở màn hình Stream OBS 9:16
    exec(`start "" "${STREAM_URL}"`, (err) => {
        if (err) console.error('  ❌ Lỗi mở Stream URL:', err.message);
    });

    // Mở Bảng điều khiển Streamer Dashboard
    setTimeout(() => {
        exec(`start "" "${DASHBOARD_URL}"`, (err) => {
            if (err) console.error('  ❌ Lỗi mở Dashboard URL:', err.message);
        });
    }, 1000);
}

// 4. Tự động setup sàn nhảy ban đầu (Spawn dân chơi khởi động + Bật nhạc)
function autoSetupStage() {
    console.log('  🎉 [3/4] Đang tự động nạp 100 dân chơi khởi động sàn nhảy...');
    
    const postData = JSON.stringify({ count: 100 });
    const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/api/simulator/bulk-spawn',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    }, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
            console.log('  ✅ [3/4] Đã nạp 100 dân chơi lên quẩy sẵn!');
        });
    });
    req.on('error', () => {});
    req.write(postData);
    req.end();
}

// 5. Khởi chạy toàn bộ quy trình
(async () => {
    await ensureServerRunning();
    openBrowser();
    setTimeout(autoSetupStage, 2500);

    console.log('\n====================================================');
    console.log('  🎯 HOÀN TẤT SETUP TỰ ĐỘNG TOÀN BỘ PHÒNG LIVE BAR!');
    console.log(`  - 📺 Màn hình Stream OBS : ${STREAM_URL}`);
    console.log(`  - 🎛️ Bảng điều khiển DJ  : ${DASHBOARD_URL}`);
    console.log('====================================================\n');
})();
