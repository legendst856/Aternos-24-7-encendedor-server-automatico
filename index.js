const http = require('http');

// Servidor de vida para Render
http.createServer((req, res) => res.end('Encendedor Activo')).listen(process.env.PORT || 10000);

async function ejecutarEncendido() {
    console.log("--- Iniciando ciclo de encendido ---");
    // Cargamos puppeteer SOLO dentro de la función para ahorrar RAM al inicio
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    const chromium = require('@sparticuz/chromium');
    
    puppeteer.use(StealthPlugin());

    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process', '--no-zygote'],
            executablePath: await chromium.executablePath(),
            headless: 'new'
        });

        const page = await browser.newPage();
        await page.goto('https://aternos.org/go/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Login
        if (await page.$('#user')) {
            await page.type('#user', process.env.ATERNOS_USER);
            await page.type('#password', process.env.ATERNOS_PASS);
            await page.evaluate(() => document.querySelector('#login').click());
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
        }

        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Clic simple y efectivo
        await page.evaluate(() => {
            const btn = document.querySelector('#start') || document.querySelector('.btn-success');
            if (btn) btn.click();
        });

        console.log("✅ Ciclo ejecutado.");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        if (browser) await browser.close();
    }
}

// Ejecutar
ejecutarEncendido();
setInterval(ejecutarEncendido, 1200000);
