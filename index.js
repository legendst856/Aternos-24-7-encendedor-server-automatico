const puppeteer = require('puppeteer');

(async () => {
  console.log("Iniciando portal tamcpoco...");
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=375,667'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Fingir que somos un iPhone para pasar desapercibido por Cloudflare
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    
    // Eliminar la marca de "web driver" que nos delata como bots
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    console.log("Navegando a Aternos...");
    // Intentamos ir directo al panel de control
    await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2', timeout: 60000 });

    // Si nos manda a la página de login, es que no estamos autenticados
    if (page.url().includes('go')) {
        console.log("Redirigido a login, ingresando credenciales...");
        await page.waitForSelector('input[name="user"]', { timeout: 20000 });
        await page.type('input[name="user"]', process.env.ATERNOS_USER, { delay: 150 });
        await page.type('input[name="password"]', process.env.ATERNOS_PASS, { delay: 150 });
        await page.click('#login');
        
        console.log("Esperando carga tras login...");
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
    }

    console.log("Buscando botón de encendido...");
    // Aternos tiene un botón verde muy específico, intentamos localizarlo
    await page.waitForSelector('.btn-success', { timeout: 20000 });
    await page.click('.btn-success');
    
    console.log("✅ ¡Acción completada!");
  } catch (error) {
    console.error("❌ Error definitivo:", error.message);
  } finally {
    await browser.close();
    console.log("Portal cerrado.");
  }
})();
