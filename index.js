const puppeteer = require('puppeteer');

(async () => {
  console.log("Iniciando navegador...");
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    // Establecer un tamaño de pantalla realista
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log("Entrando a Aternos...");
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

    // Escribir usuario y contraseña desde las variables de entorno
    console.log("Iniciando sesión...");
    await page.type('#user', process.env.ATERNOS_USER);
    await page.type('#password', process.env.ATERNOS_PASS);
    
    // Clic en login
    await page.click('#login');
    
    // Esperar a que cargue el dashboard del servidor
    console.log("Esperando carga de panel...");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Clic en el botón de encender (se asegura de que sea el botón de iniciar)
    console.log("Buscando botón de encendido...");
    await page.waitForSelector('.btn-success');
    await page.click('.btn-success');
    
    console.log("✅ ¡Botón presionado correctamente!");
    
  } catch (error) {
    console.error("❌ Error durante la ejecución:", error.message);
  } finally {
    await browser.close();
    console.log("Navegador cerrado.");
  }
})();
