const { execSync } = require('child_process');

const SERVICE = process.env.DB_SERVICE || 'postgres';
const USER = process.env.POSTGRES_USER || 'admin';
const DB = process.env.POSTGRES_DB || 'fieldmaster';
const MAX_RETRIES = 30;
const DELAY = 1000;

function check() {
    try {
        const out = execSync(`docker compose exec -T ${SERVICE} pg_isready -U ${USER} -d ${DB}`, { stdio: 'pipe', encoding: 'utf8' });
        return out.includes('accepting connections');
    } catch {
        return false;
    }
}

(async () => {
    process.stdout.write('Warte auf Datenbank');
    for (let i = 0; i < MAX_RETRIES; i++) {
        if (check()) {
            console.log(' ✓ bereit');
            process.exit(0);
        }
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, DELAY));
    }
    console.error('\\nDatenbank wurde nicht rechtzeitig bereit.');
    process.exit(1);
})();