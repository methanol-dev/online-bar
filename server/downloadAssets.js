const fs = require('fs');
const path = require('path');
const https = require('https');

const assetsDir = path.join(__dirname, '../public/assets');
const charsDir = path.join(assetsDir, 'characters');
const propsDir = path.join(assetsDir, 'props');

[assetsDir, charsDir, propsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const characterList = [
    { name: 'pepe', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=pepe&backgroundColor=b6e3f4' },
    { name: 'doge', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=doge&backgroundColor=ffd5dc' },
    { name: 'popcat', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=popcat&backgroundColor=d1d4f9' },
    { name: 'cheems', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cheems&backgroundColor=c0aede' },
    { name: 'danchoi_vest', url: 'https://api.dicebear.com/7.x/personas/svg?seed=DanChoi&backgroundColor=ffd5dc' },
    { name: 'cyber_dancer', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber77&backgroundColor=b6e3f4' },
    { name: 'gai_xinh_bar', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bexinh&backgroundColor=ffdfbf' },
    { name: 'boy_pho_quay', url: 'https://api.dicebear.com/7.x/micah/svg?seed=BoyPho&backgroundColor=d1d4f9' },
    { name: 'luffy_chibi', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luffy&backgroundColor=ffd5dc' },
    { name: 'dj_master', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=DJMaster&backgroundColor=c0aede' },
    { name: 'capybara', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=capybara&backgroundColor=ffdfbf' },
    { name: 'tieu_thu', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Princess&backgroundColor=ffd5dc' }
];

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(destPath));
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => {});
            reject(err);
        });
    });
}

async function run() {
    console.log('Downloading real character models from internet...');
    for (const char of characterList) {
        const filePath = path.join(charsDir, `${char.name}.svg`);
        try {
            await downloadFile(char.url, filePath);
            console.log(`✓ Downloaded ${char.name}.svg`);
        } catch (e) {
            console.error(`✗ Error downloading ${char.name}:`, e.message);
        }
    }
    console.log('All character models downloaded successfully!');
}

run();
