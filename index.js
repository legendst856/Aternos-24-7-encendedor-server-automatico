const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const http = require('http');

// Servidor para Render
http.createServer((req, res) => res.end('Encendedor Funcionando')).listen(process.env.PORT || 10000);

async function ejecutarEncendido() {
    console.log("Iniciando intento de encendido (Tolerancia: 3 minutos)...");
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            executablePath: await chromium.executablePath(),
            headless: false
        });

        const page = await browser.newPage();
        
        // --- CONFIGURACIÓN DE TIEMPOS (3 MINUTOS) ---
        const TRES_MINUTOS = 180000;
        await page.setDefaultNavigationTimeout(TRES_MINUTOS);
        await page.setDefaultTimeout(TRES_MINUTOS);

        // Bloquear imágenes para cargar más rápido y ahorrar RAM
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (req.resourceType() === 'image') req.abort();
            else req.continue();
        });

        console.log("Cargando página de login...");
        await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

        console.log("Escribiendo credenciales...");
        await page.type('#user', process.env.ATERNOS_USER);
        await page.type('#password', process.env.ATERNOS_PASS);
        
        // Clic en login y esperamos un momento
        await Promise.all([
            page.click('#login'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => console.log("Navegación lenta, continuando..."))
        ]);

        console.log("Entrando al panel del servidor...");
        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2' });

        // Buscamos el botón de encender (ID: start)
        console.log("Buscando el botón de encendido...");
        const botonEncender = await page.waitForSelector('#start', { visible: true, timeout: TRES_MINUTOS });
        
        await botonEncender.click();
        console.log("✅ ¡Botón presionado con éxito!");

    } catch (error) {
        console.error("❌ Error tras esperar 3 min:", error.message);
    } finally {
        if (browser) {
            await browser.close();
            console.log("Navegador cerrado.");
        }
    }
}

// Ejecutar al inicio y luego cada 20 minutos
ejecutarEncendido();
setInterval(ejecutarEncendido, 1200000);
