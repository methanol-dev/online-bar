const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../public/assets/characters');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const memeFiles = [
    'laughing_yao.png',
    'trolls_trollface.png',
    'happy_awwyeah.png',
    'happy_crying.png',
    'happy_all_the_things.png',
    'challenged_freddie.png',
    'happy_smile.png',
    'happy_epic_smiley.png',
    'laughing_lol.png',
    'cereal_guy.png',
    'happy_biggrin.png',
    'happy_whistling.png',
    'cereal_beer.png',
    'happy_youre_the_man.png',
    'horror_shocked.png'
];

const baseUrl = 'https://raw.githubusercontent.com/dlew/android-ragefaces/master/faces/';

let completed = 0;
memeFiles.forEach(fileName => {
    const destPath = path.join(targetDir, fileName);
    const file = fs.createWriteStream(destPath);

    https.get(baseUrl + fileName, res => {
        if (res.statusCode === 200) {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                completed++;
                console.log(`[${completed}/${memeFiles.length}] Downloaded ${fileName} (${fs.statSync(destPath).size} bytes)`);
            });
        } else {
            console.error(`Failed to download ${fileName}: Status ${res.statusCode}`);
        }
    }).on('error', err => {
        console.error(`Error downloading ${fileName}:`, err.message);
    });
});
