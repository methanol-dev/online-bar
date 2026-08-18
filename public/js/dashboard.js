/* ============================================================
   STREAMER DASHBOARD CONTROLLER JS 2.0 (HOTKEYS & MUSIC HUB)
   ============================================================ */

const socket = io();

// DOM Elements
const usernameInput = document.getElementById('tiktok-username-input');
const btnConnect = document.getElementById('btn-connect');
const btnDisconnect = document.getElementById('btn-disconnect');
const statusDot = document.getElementById('status-dot');
const statusLabel = document.getElementById('status-label');
const btnToggleSim = document.getElementById('btn-toggle-sim');
const eventLogList = document.getElementById('event-log-list');
const btnToggleMusic = document.getElementById('btn-toggle-music');
const dashMusicLabel = document.getElementById('dash-music-label');
const previewFrame = document.getElementById('stream-preview-frame');
const densityLabel = document.getElementById('density-value-label');
const densitySlider = document.getElementById('crowd-density-slider');

let isSimRunning = false;
let sliderDebounceTimer = null;

// Load uploaded tracks on startup
document.addEventListener('DOMContentLoaded', () => {
    loadUploadedMusicList();
});

// Socket Listener
socket.on('status-update', (data) => {
    updateStatusUI(data);
});

socket.on('simulator-status', (data) => {
    isSimRunning = data.isRunning;
    if (isSimRunning) {
        btnToggleSim.innerHTML = '<span>⏹️</span> TẮT GIẢ LẬP TỰ ĐỘNG';
        btnToggleSim.style.background = '#ff3366';
    } else {
        btnToggleSim.innerHTML = '<span>▶️</span> BẬT GIẢ LẬP TỰ ĐỘNG CHÁY BAR';
        btnToggleSim.style.background = 'linear-gradient(90deg, var(--neon-purple), var(--neon-pink))';
    }
});

socket.on('tiktok-chat', (data) => {
    addLog(`[Chat] ${data.nickname}: ${data.comment}`, 'chat');
});

socket.on('tiktok-gift', (data) => {
    addLog(`[Gift] ${data.nickname} tặng ${data.repeatCount}x ${data.giftName} (${data.diamondCount}💎)`, 'gift');
});

// Event Handlers
btnConnect.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Vui lòng nhập Username TikTok!');
        return;
    }

    try {
        addLog(`Đang gửi yêu cầu kết nối tới @${username}...`, 'info');
        const res = await fetch('/api/tiktok/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const result = await res.json();
        if (!result.success) {
            alert('Lỗi kết nối: ' + result.error);
        }
    } catch (err) {
        alert('Lỗi kết nối Server: ' + err.message);
    }
});

btnDisconnect.addEventListener('click', async () => {
    await fetch('/api/tiktok/disconnect', { method: 'POST' });
    addLog('Đã ngắt kết nối TikTok Live.', 'info');
});

btnToggleSim.addEventListener('click', async () => {
    await fetch('/api/simulator/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: !isSimRunning })
    });
});

function triggerSound(soundName) {
    socket.emit('trigger-sound', { sound: soundName });
    if (window.soundboard) {
        window.soundboard.playSound(soundName);
    }
    addLog(`[Soundboard] Đã phát tiếng: ${soundName}`, 'info');
}

/* ============================================================
   MULTI-SOURCE MUSIC HUB LOGIC
   ============================================================ */

function switchMusicTab(tabName) {
    document.querySelectorAll('.music-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.music-tab-pane').forEach(p => p.style.display = 'none');

    if (tabName === 'yt') {
        event.target.classList.add('active');
        document.getElementById('tab-content-yt').style.display = 'block';
    } else if (tabName === 'upload') {
        event.target.classList.add('active');
        document.getElementById('tab-content-upload').style.display = 'block';
        loadUploadedMusicList();
    } else if (tabName === 'synth') {
        event.target.classList.add('active');
        document.getElementById('tab-content-synth').style.display = 'block';
    }
}

function setYTUrl(url, title) {
    document.getElementById('yt-url-input').value = url;
    playYouTubeTrack(title);
}

function playYouTubeTrack(customTitle) {
    const url = document.getElementById('yt-url-input').value.trim();
    if (!url) {
        alert('Vui lòng dán link video hoặc live YouTube!');
        return;
    }

    const title = customTitle || 'YouTube Music Stream';
    socket.emit('music-control', {
        source: 'youtube',
        isPlaying: true,
        url: url,
        title: title
    });
    addLog(`[Music] Đang phát YouTube: ${title}`, 'info');
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    addLog(`Đang tải lên bài hát: ${file.name}...`, 'info');
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const res = await fetch('/api/music/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    base64Data: reader.result
                })
            });
            const data = await res.json();
            if (data.success) {
                addLog(`Đã tải lên thành công: ${file.name} 🎉`, 'info');
                loadUploadedMusicList();
                playUploadedTrack(data.track.url, file.name);
            } else {
                alert('Lỗi tải file: ' + data.error);
            }
        } catch (e) {
            alert('Lỗi kết nối upload: ' + e.message);
        }
    };
    reader.readAsDataURL(file);
}

async function loadUploadedMusicList() {
    const listContainer = document.getElementById('uploaded-track-list');
    if (!listContainer) return;

    try {
        const res = await fetch('/api/music/list');
        const data = await res.json();
        if (data.success && data.list.length > 0) {
            listContainer.innerHTML = '';
            data.list.forEach(t => {
                const item = document.createElement('div');
                item.className = 'track-item';
                item.innerHTML = `
                    <span class="track-name" title="${t.filename}">🎵 ${t.filename} (${t.size})</span>
                    <div class="track-actions">
                        <button class="btn-chip" onclick="playUploadedTrack('${t.url}', '${t.filename}')">▶️ Phát</button>
                        <button class="btn-chip" style="color: #ff5555;" onclick="deleteUploadedTrack('${t.filename}')">🗑️</button>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        } else {
            listContainer.innerHTML = '<div style="font-size: 12px; color: #888; text-align: center; padding: 10px;">Chưa có bài hát nào được tải lên</div>';
        }
    } catch (e) {
        console.error('Error loading tracks:', e);
    }
}

function playUploadedTrack(url, title) {
    socket.emit('music-control', {
        source: 'upload',
        isPlaying: true,
        url: url,
        title: title
    });
    addLog(`[Music] Đang phát file nhạc: ${title}`, 'info');
}

async function deleteUploadedTrack(filename) {
    if (!confirm(`Bạn có chắc muốn xóa bài ${filename}?`)) return;
    await fetch('/api/music/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
    });
    loadUploadedMusicList();
    addLog(`Đã xóa bài hát ${filename}`, 'info');
}

function toggleVinahouseMusic() {
    socket.emit('music-control', {
        source: 'synth',
        isPlaying: true,
        title: 'Vinahouse Nonstop Beat 135 BPM'
    });
    addLog('[Music] Đã bật beat Vinahouse nonstop!', 'info');
}

function stopAllMusic() {
    socket.emit('music-control', {
        source: 'off',
        isPlaying: false,
        title: 'Tạm dừng nhạc'
    });
    addLog('[Music] Đã tắt toàn bộ nhạc.', 'info');
}

function onMusicVolumeChange(val) {
    const label = document.getElementById('vol-label');
    if (label) label.textContent = `🔊 ${val}%`;
    socket.emit('music-control', { volume: parseInt(val, 10) });
}

/* ============================================================
   SIMULATION & CROWD CONTROLS
   ============================================================ */

function triggerSimChat(comment) {
    fetch('/api/simulator/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', payload: { comment } })
    });
}

function triggerSimGift(giftName, count = 1, diamond = 10) {
    fetch('/api/simulator/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gift', payload: { gift: { name: giftName, diamond }, count } })
    });
}

function triggerBulkSpawn(count) {
    addLog(`Đang nạp ${count} dân chơi lên sàn nhảy...`, 'info');
    fetch('/api/simulator/bulk-spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
    }).then(res => res.json()).then(data => {
        addLog(`Đã nạp thành công ${data.count} dân chơi vào vũ trường! 🔥`, 'info');
        if (densitySlider) {
            densitySlider.value = Math.min(2500, count);
            densityLabel.textContent = `${count} DÂN CHƠI`;
        }
    });
}

function triggerClearCrowd() {
    fetch('/api/simulator/clear-crowd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }).then(() => {
        addLog('Đã dọn dẹp sàn nhảy.', 'info');
        if (densitySlider) {
            densitySlider.value = 0;
            densityLabel.textContent = '0 DÂN CHƠI';
        }
    });
}

function onSliderChange(val) {
    if (densityLabel) {
        densityLabel.textContent = `${parseInt(val).toLocaleString('vi-VN')} DÂN CHƠI`;
    }
    clearTimeout(sliderDebounceTimer);
    sliderDebounceTimer = setTimeout(() => {
        triggerClearCrowd();
        setTimeout(() => triggerBulkSpawn(parseInt(val)), 100);
    }, 400);
}

function reloadPreview() {
    if (previewFrame) {
        previewFrame.src = '/' + '?t=' + Date.now();
        addLog('Đã tải lại màn hình Live Preview.', 'info');
    }
}

function updateStatusUI(data) {
    statusDot.className = 'status-indicator ' + data.status;
    if (data.status === 'connected') {
        statusLabel.textContent = `Trạng thái: ĐÃ KẾT NỐI LIVE (@${data.username})`;
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'inline-flex';
    } else if (data.status === 'connecting') {
        statusLabel.textContent = `Trạng thái: Đang kết nối tới @${data.username}...`;
    } else {
        statusLabel.textContent = 'Trạng thái: Chưa kết nối TikTok Live';
        btnConnect.style.display = 'inline-flex';
        btnDisconnect.style.display = 'none';
    }
}

function addLog(text, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const timeStr = new Date().toLocaleTimeString();
    entry.textContent = `[${timeStr}] ${text}`;
    eventLogList.appendChild(entry);

    while (eventLogList.children.length > 60) {
        eventLogList.removeChild(eventLogList.firstChild);
    }
    eventLogList.scrollTop = eventLogList.scrollHeight;
}

/* ============================================================
   GLOBAL STREAMER KEYBOARD HOTKEYS (1-8, Space, M)
   ============================================================ */
const SOUND_KEYS = {
    '1': 'AIRHORN',
    '2': 'CHEER',
    '3': 'SCRATCH',
    '4': 'COUNTDOWN',
    '5': 'BASS_DROP',
    '6': 'EXPLOSION',
    '7': 'CHAMPAGNE',
    '8': 'SIREN'
};

window.addEventListener('keydown', (e) => {
    // Avoid triggering hotkeys when typing in input fields
    if (document.activeElement === usernameInput || (document.activeElement && document.activeElement.tagName === 'INPUT')) return;

    if (SOUND_KEYS[e.key]) {
        triggerSound(SOUND_KEYS[e.key]);
    } else if (e.code === 'Space') {
        e.preventDefault();
        triggerSound('EXPLOSION');
        triggerSimGift('Hoa Hồng 🌹', 10, 10);
    } else if (e.key === 'm' || e.key === 'M') {
        toggleVinahouseMusic();
    }
});
