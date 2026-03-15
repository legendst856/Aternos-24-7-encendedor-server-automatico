const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium');
const http = require('http');

puppeteer.use(StealthPlugin());

// Servidor minimalista para mantener el proceso activo en Render
http.createServer((req, res) => res.end('Encendedor Activo')).listen(process.env.PORT || 10000);

async function ejecutarEncendido() {
    console.log("--- Iniciando ciclo de encendido ---");
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--single-process'],
            executablePath: await chromium.executablePath(),
            headless: 'new'
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        console.log("Navegando a Aternos...");
        await page.goto('https://aternos.org/go/', { waitUntil: 'domcontentloaded', timeout: 90000 });

        // Login (Si aparece)
        if (await page.$('#user')) {
            console.log("Ingresando credenciales...");
            await page.type('#user', process.env.ATERNOS_USER);
            await page.type('#password', process.env.ATERNOS_PASS);
            await page.evaluate(() => document.querySelector('#login').click());
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 });
        }

        console.log("Entrando al panel...");
        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 90000 });

        // Lógica: Buscar botón de "Encender" o botón de "Anuncio/Confirmar"
        console.log("Detectando estado del servidor...");
        await page.waitForTimeout = (ms) => new Promise(res => setTimeout(res, ms));
        await page.waitForTimeout(5000); // Pequeña espera para cargar botones

        const accion = await page.evaluate(() => {
            const botones = Array.from(document.querySelectorAll('button, div, span'));
            
            // 1. Intentar buscar el botón de encender
            const btnEncender = botones.find(el => {
                const txt = el.innerText.toLowerCase();
                return (txt.includes('encender') || txt.includes('start') || txt.includes('iniciar'));
            });

            // 2. Intentar buscar el botón de anuncio o confirmar
            const btnAnuncio = botones.find(el => {
                const txt = el.innerText.toLowerCase();
                return (txt.includes('ver anuncio') || txt.includes('watch ad') || txt.includes('continuar') || txt.includes('confirmar'));
            });

            if (btnAnuncio) {
                btnAnuncio.click();
                return "ANUNCIO_PRESIONADO";
            } else if (btnEncender) {
                btnEncender.click();
                return "ENCENDER_PRESIONADO";
            }
            return "NADA";
        });

        console.log("Resultado de la acción:", accion);
        
        // Espera extra por si hay un video
        console.log("Esperando 20 segundos por confirmación...");
        await new Promise(r => setTimeout(r, 20000)); 

    } catch (error) {
        console.error("❌ Error durante el encendido:", error.message);
    } finally {
        if (browser) await browser.close();
        console.log("--- Ciclo finalizado ---");
    }
}

// Ejecutar ahora y luego cada 20 minutos
ejecutarEncendido();
setInterval(ejecutarEncendido, 1200000);
