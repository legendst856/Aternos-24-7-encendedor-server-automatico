const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium');
const http = require('http');

puppeteer.use(StealthPlugin());

http.createServer((req, res) => res.end('Encendedor Activo')).listen(process.env.PORT || 10000);

async function ejecutarEncendido() {
    console.log("Iniciando encendido...");
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-usage', '--disable-gpu'],
            executablePath: await chromium.executablePath(),
            headless: 'new'
        });

        const page = await browser.newPage();
        
        // 1. Ir a la página de login
        console.log("Navegando a Aternos...");
        await page.goto('https://aternos.org/go/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // 2. ESPERA INTELIGENTE: Asegurarnos de que el formulario existe
        console.log("Esperando formulario de login...");
        try {
            await page.waitForSelector('#user', { visible: true, timeout: 30000 });
        } catch (e) {
            console.log("¡No se encontró el campo de usuario! Revisando si estamos ya logueados...");
            // Si no está, quizás ya entramos directo
        }

        // 3. Escribir usuario y pass solo si el campo existe
        if (await page.$('#user')) {
            await page.type('#user', process.env.ATERNOS_USER);
            await page.type('#password', process.env.ATERNOS_PASS);
            await page.evaluate(() => document.querySelector('#login').click());
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
        }

        // 4. Ir directo al panel
        console.log("Entrando al panel...");
        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 60000 });

        // 5. Encender
        const startBtn = await page.$('#start');
        if (startBtn) {
            await page.evaluate(() => document.querySelector('#start').click());
            console.log("✅ ¡Botón presionado!");
        } else {
            console.log("⚠️ No se encontró el botón de inicio. ¿El servidor ya está encendido?");
        }

    } catch (error) {
        console.error("❌ Error durante el encendido:", error.message);
    } finally {
        if (browser) await browser.close();
    }
}

ejecutarEncendido();
setInterval(ejecutarEncendido, 1200000);
