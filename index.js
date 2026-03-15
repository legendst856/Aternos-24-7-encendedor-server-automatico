const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium');
const http = require('http');

// Configuración Stealth para ser invisible ante Cloudflare
puppeteer.use(StealthPlugin());

// Servidor minimalista para mantener el proceso vivo
http.createServer((req, res) => res.end('Encendedor Activo')).listen(process.env.PORT || 10000);

async function ejecutarEncendido() {
    console.log("Iniciando navegador minimizado...");
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process',
                '--no-zygote'
            ],
            executablePath: await chromium.executablePath(),
            headless: 'new' // Modo headless eficiente
        });

        const page = await browser.newPage();
        
        // Simular navegador real
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        console.log("Navegando a Aternos...");
        await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2', timeout: 60000 });

        // Login
        console.log("Ingresando credenciales...");
        await page.type('#user', process.env.ATERNOS_USER);
        await page.type('#password', process.env.ATERNOS_PASS);
        await page.evaluate(() => document.querySelector('#login').click());

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 60000 });

        // Clic en encender
        console.log("Activando servidor...");
        await page.waitForSelector('#start', { visible: true, timeout: 60000 });
        await page.evaluate(() => document.querySelector('#start').click());
        
        console.log("✅ Encendido exitoso.");

    } catch (error) {
        console.error("❌ Error durante el encendido:", error.message);
    } finally {
        if (browser) await browser.close();
    }
}

// Ejecutar ahora y luego cada 20 minutos
ejecutarEncendido();
setInterval(ejecutarEncendido, 1200000);
