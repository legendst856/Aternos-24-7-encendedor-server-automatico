const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium');

// 1. ACTIVAMOS EL ESCUDO
puppeteer.use(StealthPlugin());

async function ejecutarEncendido() {
    const browser = await puppeteer.launch({
        args: [...chromium.args, '--no-sandbox'],
        executablePath: await chromium.executablePath(),
        headless: true // Ya no necesitas ponerlo en false
    });

    const page = await browser.newPage();

    // 2. CAMBIAMOS LA IDENTIDAD
    // Esto hace que Aternos crea que estás usando una PC real con Chrome
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    console.log("Entrando a Aternos como usuario humano...");
    await page.goto('https://aternos.org/go/');

    // 3. CAMBIAMOS EL COMPORTAMIENTO (Evitamos los clics de robot)
    // Usamos 'evaluate' para ejecutar el clic desde dentro del sitio
    await page.type('#user', process.env.ATERNOS_USER);
    await page.type('#password', process.env.ATERNOS_PASS);
    
    await page.evaluate(() => {
        document.querySelector('#login').click();
    });

    await page.waitForNavigation();
    await page.goto('https://aternos.org/server/');

    // El clic "invisible"
    await page.waitForSelector('#start');
    await page.evaluate(() => {
        document.querySelector('#start').click();
    });

    console.log("¡Hecho! Servidor en marcha.");
    await browser.close();
}
