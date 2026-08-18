const fs = require('fs');
const path = require('path');
const https = require('https');

const propsDir = path.join(__dirname, '../public/assets/props');
if (!fs.existsSync(propsDir)) fs.mkdirSync(propsDir, { recursive: true });

const propList = [
    { name: 'crown', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f451.svg' },
    { name: 'beer', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f37a.svg' },
    { name: 'champagne', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f37e.svg' },
    { name: 'supercar', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f3ce.svg' },
    { name: 'helicopter', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f681.svg' },
    { name: 'diamond', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f48e.svg' },
    { name: 'sunglasses', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f576.svg' },
    { name: 'headphones', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f3a7.svg' },
    { name: 'vinyl', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4bf.svg' },
    { name: 'rocket', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f680.svg' },
    { name: 'lion', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f981.svg' },
    { name: 'rose', url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f339.svg' }
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
    console.log('Downloading vector props and gift models from internet...');
    for (const prop of propList) {
        const filePath = path.join(propsDir, `${prop.name}.svg`);
        try {
            await downloadFile(prop.url, filePath);
            console.log(`✓ Downloaded ${prop.name}.svg`);
        } catch (e) {
            console.error(`✗ Error downloading ${prop.name}:`, e.message);
        }
    }
    console.log('All vector props downloaded successfully!');
}

run();
