const puppeteer = require('puppeteer');

(async () => {
  console.log("Iniciando portal tamcpoco...");
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled', // Esconde que es un bot
      '--window-size=1280,800'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Suplantar el User-Agent para que parezca un Chrome real en Windows
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    
    // Eliminar la propiedad 'navigator.webdriver' que delata a los bots
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    console.log("Navegando a Aternos...");
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2', timeout: 60000 });

    // Esperar a que el formulario sea visible
    console.log("Buscando formulario...");
    await page.waitForSelector('#user', { timeout: 30000 });

    console.log("Escribiendo credenciales...");
    await page.type('#user', process.env.ATERNOS_USER, { delay: 100 });
    await page.type('#password', process.env.ATERNOS_PASS, { delay: 100 });
    
    await page.click('#login');
    
    console.log("Esperando carga del panel...");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Hacer clic en el botón de encendido
    console.log("Activando servidor...");
    await page.waitForSelector('.btn-success', { timeout: 15000 });
    await page.click('.btn-success');
    
    console.log("✅ ¡Servidor encendido con éxito!");
    
  } catch (error) {
    console.error("❌ Error durante la ejecución:", error.message);
    // Guardar captura para depurar
    await page.screenshot({ path: 'debug_error.png' });
  } finally {
    await browser.close();
    console.log("Portal cerrado.");
  }
})();
