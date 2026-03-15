const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    // Navegamos directo a la página de login
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });

    console.log("Esperando a que cargue el formulario de login...");
    
    // Esperamos hasta 30 segundos a que aparezca el campo de usuario
    // A veces el ID no es '#user', probamos con varios selectores comunes
    await page.waitForSelector('input[name="user"], #user', { timeout: 30000 });

    console.log("Formulario detectado, escribiendo credenciales...");
    await page.type('input[name="user"], #user', process.env.ATERNOS_USER);
    await page.type('input[name="password"], #password', process.env.ATERNOS_PASS);
    
    await page.click('button[type="submit"], #login');
    
    console.log("Login enviado, esperando panel...");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Aquí esperamos el botón de encendido
    await page.waitForSelector('.btn-success', { timeout: 15000 });
    await page.click('.btn-success');
    
    console.log("✅ ¡Botón presionado!");
  } catch (error) {
    console.error("❌ Error grave:", error.message);
    // Tomar una captura de pantalla si falla para depurar
    await page.screenshot({ path: 'error.png' });
  } finally {
    await browser.close();
  }
})();
