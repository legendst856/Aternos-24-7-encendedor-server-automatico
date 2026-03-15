const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const http = require('http');

// Servidor básico para que Render no dé error de puerto
http.createServer((req, res) => res.end('Encendedor Activo')).listen(process.env.PORT || 10000);

async function ejecutarEncendido() {
    console.log("Iniciando navegador para encender el servidor...");
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: await chromium.executablePath(),
            headless: true
        });

        const page = await browser.newPage();
        
        // Ir al login
        await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

        // Introducir credenciales
        await page.type('#user', process.env.ATERNOS_USER);
        await page.type('#password', process.env.ATERNOS_PASS);
        await page.click('#login');

        // Esperar a que cargue el panel
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log("Sesión iniciada correctamente.");

        // Ir a la página del servidor específico
        await page.goto(`https://aternos.org/server/`, { waitUntil: 'networkidle2' });

        // Buscar y hacer clic en el botón de encender
        // Aternos usa a veces clases como .btn-success o IDs específicos
        const botonEncender = await page.waitForSelector('#start', { visible: true, timeout: 60000 });
        await botonEncender.click();

        console.log("¡Botón de encendido presionado!");
        
    } catch (error) {
        console.error("Hubo un error al intentar encender:", error.message);
    } finally {
        if (browser) {
            await browser.close();
            console.log("Navegador cerrado.");
        }
    }
}

// Lo ejecuta al iniciar
ejecutarEncendido();

// Lo repite cada 30 minutos por si se apaga solo
setInterval(ejecutarEncendido, 1800000);
