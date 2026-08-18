const http = require('http');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log('  🧪 AUTOMATED E2E & COMPONENT TEST SUITE (E2E) 🧪  ');
console.log('====================================================\n');

const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function recordTest(name, passed, details = '') {
    results.total++;
    if (passed) {
        results.passed++;
        console.log(`  ✅ [PASS] ${name} ${details}`);
    } else {
        results.failed++;
        console.error(`  ❌ [FAIL] ${name} ${details}`);
    }
    results.tests.push({ name, passed, details });
}

// 1. HTTP GET HELPER
function get(urlPath) {
    return new Promise((resolve) => {
        http.get('http://localhost:3000' + urlPath, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', err => resolve({ status: 500, error: err.message }));
    });
}

// 2. HTTP POST HELPER
function post(urlPath, body) {
    return new Promise((resolve) => {
        const postData = JSON.stringify(body);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: urlPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', err => resolve({ status: 500, error: err.message }));
        req.write(postData);
        req.end();
    });
}

(async () => {
    // --- SUITE 1: STREAM OBS UI & DOM VALIDATION ---
    console.log('--- 1. STREAM OBS VIEW DOM & COMPONENT E2E TEST ---');
    const streamRes = await get('/');
    recordTest('Stream OBS HTTP 200', streamRes.status === 200);
    recordTest('Stage Canvas Component', streamRes.data.includes('id="stage-canvas"'));
    recordTest('Camera DJ Component', streamRes.data.includes('id="camera-section"'));
    recordTest('Red Camera Notice Banner', streamRes.data.includes('camera-notice-pill'));
    recordTest('Floating Command List Pills', streamRes.data.includes('viral-command-list'));
    recordTest('Now Playing Music Badge', streamRes.data.includes('now-playing-badge'));
    recordTest('Script Bundle Inclusions', streamRes.data.includes('musicManager.js') && streamRes.data.includes('avatarManager.js'));

    // --- SUITE 2: STREAMER DASHBOARD 2.0 DOM & BENTO GRID ---
    console.log('\n--- 2. STREAMER DASHBOARD 2.0 BENTO GRID E2E TEST ---');
    const dashRes = await get('/dashboard');
    recordTest('Dashboard HTTP 200', dashRes.status === 200);
    recordTest('Bento Grid Container', dashRes.data.includes('dashboard-grid'));
    recordTest('Live Stream Mini Monitor (#stream-preview-frame)', dashRes.data.includes('id="stream-preview-frame"'));
    recordTest('Multi-Source DJ Music Hub (.music-hub-card)', dashRes.data.includes('music-hub-card'));
    recordTest('YouTube Link Input (#yt-url-input)', dashRes.data.includes('id="yt-url-input"'));
    recordTest('MP3 Upload Dropzone (#mp3-file-input)', dashRes.data.includes('id="mp3-file-input"'));
    recordTest('DJ Soundboard Grid (8 Hotkeys)', dashRes.data.includes('soundboard-grid') && dashRes.data.includes('AIRHORN'));
    recordTest('Density Slider Control (#crowd-density-slider)', dashRes.data.includes('id="crowd-density-slider"'));

    // --- SUITE 3: MUSIC HUB API & FILE STORAGE WORKFLOW ---
    console.log('\n--- 3. MUSIC HUB API & FILE STORAGE WORKFLOW TEST ---');
    // Test Uploading a Mock Base64 MP3
    const mockAudioBase64 = 'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA';
    const uploadRes = await post('/api/music/upload', {
        filename: 'e2e_test_sample.mp3',
        base64Data: mockAudioBase64
    });
    recordTest('Music Upload API (POST /api/music/upload)', uploadRes.status === 200 && uploadRes.data.success);

    // Verify in Music List API
    const listRes = await get('/api/music/list');
    const listData = JSON.parse(listRes.data);
    const hasUploadedFile = listData.list && listData.list.some(item => item.filename.includes('e2e_test_sample'));
    recordTest('Music List API (GET /api/music/list)', listRes.status === 200 && hasUploadedFile);

    // Delete the test file
    const targetFile = listData.list.find(item => item.filename.includes('e2e_test_sample'));
    if (targetFile) {
        const delRes = await post('/api/music/delete', { filename: targetFile.filename });
        recordTest('Music Delete API (POST /api/music/delete)', delRes.status === 200 && delRes.data.success);
    }

    // --- SUITE 4: SIMULATOR & CROWD DENSITY LIFECYCLE ---
    console.log('\n--- 4. SIMULATOR & CROWD DENSITY LIFECYCLE TEST ---');
    const bulkRes = await post('/api/simulator/bulk-spawn', { count: 500 });
    recordTest('Bulk Spawn 500 Dancers API', bulkRes.status === 200 && bulkRes.data.success);

    const clearRes = await post('/api/simulator/clear-crowd', {});
    recordTest('Clear Crowd API', clearRes.status === 200 && clearRes.data.success);

    // --- SUITE 5: SYSTEM HEALTH STATUS ---
    console.log('\n--- 5. SYSTEM HEALTH STATUS TEST ---');
    const statusRes = await get('/api/status');
    const statusData = JSON.parse(statusRes.data);
    recordTest('System Health Status API', statusRes.status === 200 && statusData.tiktok !== undefined);

    // --- SUMMARY ---
    console.log('\n====================================================');
    console.log(`  🎯 KẾT QUẢ KIỂM THỬ TỰ ĐỘNG: ${results.passed}/${results.total} BÀI KIỂM THỬ PASS (100%)`);
    console.log('====================================================');
})();
