const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('@sparticuz/chromium');
const http = require('http');

puppeteer.use(StealthPlugin());

// Mantener vivo el proceso para Render
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
        await page.goto('https://aternos.org/go/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Login (Si aparece)
        if (await page.$('#user')) {
            console.log("Ingresando credenciales...");
            await page.type('#user', process.env.ATERNOS_USER);
            await page.type('#password', process.env.ATERNOS_PASS);
            await page.evaluate(() => document.querySelector('#login').click());
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
        }

        console.log("Entrando al panel...");
        await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 60000 });

        // Lógica maestra: buscar por texto
        console.log("Buscando botón de 'Encender'...");
        const presionado = await page.evaluate(() => {
            // Busca botones o divs que contengan palabras clave de inicio
            const elementos = Array.from(document.querySelectorAll('button, div, span'));
            const boton = elementos.find(el => {
                const txt = el.innerText.toLowerCase();
                return (txt.includes('encender') || txt.includes('start') || txt.includes('iniciar'));
            });

            if (boton) {
                boton.click();
                return true;
            }
            return false;
        });

        if (presionado) {
            console.log("✅ ¡Botón presionado con éxito!");
        } else {
            console.log("⚠️ No se encontró botón de encendido. ¿Ya estará prendido?");
        }

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
