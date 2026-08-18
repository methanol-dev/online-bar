const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('  🔍 AUDIT PROTOCOL: FULL PROJECT VERIFICATION  ');
console.log('====================================================\n');

const auditResults = {
    syntax: { passed: 0, failed: 0, errors: [] },
    security: { passed: true, issues: [] },
    assets: { passed: 0, missing: [] },
    endpoints: { passed: 0, failed: 0, errors: [] }
};

// 1. SYNTAX & LINT CHECK
console.log('--- 1. KIỂM TRA CÚ PHÁP TẤT CẢ FILE JAVASCRIPT ---');
const jsFiles = [
    'server/index.js',
    'server/tiktokService.js',
    'server/simulator.js',
    'server/downloadRealMemes.js',
    'public/js/soundboard.js',
    'public/js/musicManager.js',
    'public/js/cameraManager.js',
    'public/js/avatarManager.js',
    'public/js/effectsManager.js',
    'public/js/stageEngine.js',
    'public/js/dashboard.js'
];

jsFiles.forEach(f => {
    try {
        execSync(`node -c "${path.join(__dirname, '..', f)}"`);
        console.log(`  ✅ [SYNTAX OK] ${f}`);
        auditResults.syntax.passed++;
    } catch (e) {
        console.error(`  ❌ [SYNTAX ERROR] ${f}: ${e.message}`);
        auditResults.syntax.failed++;
        auditResults.syntax.errors.push(`${f}: ${e.message}`);
    }
});

// 2. SECURITY & SECRETS SCAN
console.log('\n--- 2. BẢO MẬT & QUÉT LỘ LỌT SECRET KEY ---');
const allTextFiles = [
    ...jsFiles,
    'public/index.html',
    'public/dashboard.html',
    'package.json'
];

const secretPatterns = [
    /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i,
    /secret\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i,
    /password\s*[:=]\s*['"][^'"]{8,}['"]/i,
    /bearer\s+[a-zA-Z0-9_\-\.]{20,}/i
];

allTextFiles.forEach(f => {
    const fullPath = path.join(__dirname, '..', f);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        secretPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                auditResults.security.passed = false;
                auditResults.security.issues.push(`Suspicious secret in ${f}`);
            }
        });
    }
});

if (auditResults.security.passed) {
    console.log('  ✅ [SECURITY OK] Không có Hardcoded Secret, API Key hoặc Password lộ lọt.');
} else {
    console.warn('  ⚠️ [SECURITY WARN]', auditResults.security.issues);
}

// 3. ASSET INTEGRITY CHECK
console.log('\n--- 3. KIỂM TRA TÍNH TOÀN VẸN ASSET / TÀI NGUYÊN ---');
const requiredAssets = [
    'public/assets/characters/laughing_yao.png',
    'public/assets/characters/troll_original.png',
    'public/assets/characters/happy_awwyeah.png',
    'public/assets/characters/happy_crying.png',
    'public/assets/characters/challenged_freddie.png',
    'public/assets/characters/cereal_beer.png',
    'public/assets/props/crown.svg',
    'public/assets/props/beer.svg',
    'public/assets/props/supercar.svg',
    'public/assets/props/helicopter.svg',
    'public/assets/props/rocket.svg'
];

requiredAssets.forEach(a => {
    const fullPath = path.join(__dirname, '..', a);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 0) {
        auditResults.assets.passed++;
        console.log(`  ✅ [ASSET OK] ${a} (${fs.statSync(fullPath).size} bytes)`);
    } else {
        auditResults.assets.missing.push(a);
        console.error(`  ❌ [ASSET MISSING] ${a}`);
    }
});

// 4. FUNCTIONAL ENDPOINT STRESS TEST
console.log('\n--- 4. KIỂM THỬ API ENDPOINTS REALTIME ---');
function testEndpoint(pathUrl) {
    return new Promise((resolve) => {
        http.get('http://localhost:3000' + pathUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`  ✅ [HTTP 200 OK] ${pathUrl}`);
                    auditResults.endpoints.passed++;
                } else {
                    console.error(`  ❌ [HTTP ${res.statusCode}] ${pathUrl}`);
                    auditResults.endpoints.failed++;
                }
                resolve();
            });
        }).on('error', (err) => {
            console.error(`  ❌ [HTTP ERROR] ${pathUrl}: ${err.message}`);
            auditResults.endpoints.failed++;
            resolve();
        });
    });
}

(async () => {
    await testEndpoint('/api/status');
    await testEndpoint('/api/music/list');
    await testEndpoint('/');
    await testEndpoint('/dashboard');

    console.log('\n====================================================');
    console.log('  🎯 TỔNG KẾT AUDIT:');
    console.log(`  - Cú pháp JS: ${auditResults.syntax.passed}/${jsFiles.length} file PASS`);
    console.log(`  - Bảo mật: ${auditResults.security.passed ? 'PASSED (100% An toàn)' : 'FAILED'}`);
    console.log(`  - Tài nguyên Asset: ${auditResults.assets.passed}/${requiredAssets.length} file PASS`);
    console.log(`  - API Endpoints: ${auditResults.endpoints.passed}/4 PASS`);
    console.log('====================================================');
})();
